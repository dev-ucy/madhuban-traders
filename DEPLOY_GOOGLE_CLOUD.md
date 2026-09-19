# Deploying Everything on Google Cloud (Low Cost, High Security)

Everything runs inside one Google Cloud project: the website, the API, the database, the secrets, the backups and the monitoring. No Supabase, no Cloudflare, no third-party accounts to secure.

Madhuban Traders holds customer PII (names, phones, addresses, GSTINs) and tax invoices, so security comes first and cost second. Prices and free-tier limits change, so confirm them on Google's pricing pages before you commit. Commands and flags are from my knowledge of the `gcloud` CLI; if one is rejected, check `gcloud <command> --help`.

**Expected cost: about $0-5 per month at one shop's traffic**, plus the domain.

---

## 1. Architecture

| Part | Google service | Region | Why | Approx. cost |
|------|----------------|--------|-----|--------------|
| Website | **Firebase Hosting** | Global CDN | Free HTTPS, free custom domain, single-page-app routing | Free within quota |
| API (FastAPI) | **Cloud Run** | `asia-south1` (Mumbai) | Scales to zero, instance cap, managed HTTPS | Free tier, then cents |
| Database | **Firestore (Native mode)** | `asia-south1` | Encrypted at rest, IAM login (no password or key), built-in backups | Free tier covers a small shop |
| Secrets | **Secret Manager** | - | Only for app secrets, if you add any | Free at this size |
| Backups | **Firestore scheduled backups + export to Cloud Storage** | Mumbai + separate project | Managed backups plus an independent copy | Cents |
| Monitoring | **Cloud Monitoring + Logging** | - | Uptime checks, alerts | Free at this size |
| CI/CD (optional) | **GitHub Actions + Workload Identity Federation** | - | Deploy with no stored key | Free |

```
Customer browser
      |  HTTPS
      v
Firebase Hosting (React files)  --  https://www.yourdomain.in
      |  /api/**  rewrite (same address, so no CORS)
      v
Cloud Run: madhuban-api (FastAPI)
      |  runs as its own service account, IAM role "Datastore User" only
      v
Firestore, Mumbai, encrypted at rest, delete protection, daily backups + PITR
      |
      +--> scheduled backup (7+ days)   +--> weekly export to a bucket in a SECOND project
```

Two properties do most of the security work:

- **The API has no database password or key.** On Cloud Run it signs in with its service account through IAM. There is no secret to steal, paste or commit.
- **The browser never talks to the database.** Only the API does.

### Honest trade-offs of "all Google"

| Gain | Cost |
|------|------|
| One vendor, one bill, one place to secure and audit | Lose Cloudflare's free web firewall and rate limiting. Google's equivalent (Cloud Armor) needs a load balancer, roughly $20+/month, so at this size you rate-limit inside the API instead (section 5.4) |
| No database secret, IAM-based access | Firestore is not SQL: no unique constraints, no joins, and the analytics views in `sql/database_extra_setup.sql` do not carry over |
| Managed backups and point-in-time recovery | **The data layer of `backend/app.py` must be rewritten** (section 3), roughly 2-4 developer-days including tests |
| Same-origin API through Firebase Hosting (no CORS problems) | Firebase Hosting to Cloud Run rewrites are limited to certain regions and may need the pay-as-you-go plan (section 6.1) |

If you would rather keep SQL, use **Cloud SQL for PostgreSQL** instead (section 12). It costs more per month and needs a different rewrite (Postgres driver instead of Firestore), but it keeps your existing SQL files.

---

## 2. Before you start

### 2.1 Accounts and one-time hygiene

1. A **Google account dedicated to the business** (not personal). Turn on **2-Step Verification**, and store the recovery codes on paper.
2. A Google Cloud **billing account** (needs a card).
3. A **domain** (registrar of your choice).
4. A **private** GitHub repository (only if you use CI/CD).
5. Two-step login on the registrar and GitHub as well.

Create a **new Google Cloud project just for production**, for example `madhuban-prod`. Do not share it with experiments.

```powershell
gcloud auth login
gcloud projects create madhuban-prod --name "Madhuban Prod"
gcloud config set project madhuban-prod
gcloud billing projects link madhuban-prod --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### 2.2 Cost guards (do these first)

```powershell
gcloud services enable billingbudgets.googleapis.com
```

In the console: **Billing, Budgets & alerts, Create budget**, set **$5 with email alerts at 50%, 90% and 100%**.

**A budget only sends warnings. It does not stop spending.** The real caps are:

- Cloud Run `--max-instances` (section 5.3)
- Firestore's small free quota and the fact that your traffic is small
- Optionally, a Pub/Sub-triggered function that disables billing at a hard limit. Google documents this pattern under "Disable billing usage with notifications". Consider it if a surprise bill would hurt.

### 2.3 Enable the services

```powershell
gcloud services enable `
  run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com `
  firestore.googleapis.com secretmanager.googleapis.com `
  monitoring.googleapis.com logging.googleapis.com `
  firebase.googleapis.com firebasehosting.googleapis.com `
  iamcredentials.googleapis.com cloudresourcemanager.googleapis.com
```

---

## 3. Required code changes (before you deploy)

Deploying the current code would put customer data at risk on any host. These come from [PROJECT_REVIEW.md](PROJECT_REVIEW.md). Items A-F are non-negotiable.

| # | Change | Why |
|---|--------|-----|
| A | Require a valid token on the submissions list, read, update and delete endpoints ([backend/app.py:666-695](backend/app.py#L666-L695)) and send it from [Submissions.jsx](frontend/src/pages/Submissions.jsx). Guard the `/submissions` route ([App.jsx:96](frontend/src/App.jsx#L96)) | Today anyone can read or delete every customer record |
| B | Delete the `shop1` / `shop123` seed ([app.py:133-155](backend/app.py#L133-L155)) and create your own manager with a strong password | Default password is public |
| C | Replace SHA-256 with argon2 or bcrypt, add token expiry, and enforce `role` | A database leak must not become a password leak |
| D | Remove the in-memory fallback; return HTTP 503 when the database is unreachable ([app.py:29-45](backend/app.py#L29-L45)) | Otherwise bills silently vanish |
| E | Add `Cache-Control: no-store` to **every** `/api` response | Firebase Hosting's CDN can cache responses from Cloud Run; PII must never be cached at the edge |
| F | Add login and contact-form rate limiting in the API (section 5.4) | Replaces the firewall you gave up |
| G | Fix the bill-ID overwrite, and read billing settings from the database (review items 6 and 9) | Lost invoices, placeholder GSTIN on live bills |
| H | Add a consent line to [InquiryForm.jsx](frontend/src/components/InquiryForm.jsx) and update `/privacy` | India's DPDP Act 2023 |

### 3.1 Move the data layer to Firestore

The Supabase client is used in only **11 places** ([app.py:44](backend/app.py#L44), [:136-138](backend/app.py#L136-L138), [:430-467](backend/app.py#L430-L467), [:525](backend/app.py#L525), [:548-582](backend/app.py#L548-L582)), mostly inside four helper functions. The old Firestore version, `backend/app-f.py`, is a rough starting point, but it predates products, billing settings and the GST validation, so do not just revive it.

**Data model**

| Collection | Document id | Notes |
|------------|-------------|-------|
| `workers` | username | argon2 hash, role, token hash (store a hash of the token, not the token), expiry |
| `products` | product id | Public read through the API |
| `bills` | invoice number | Immutable once issued; corrections through credit notes; a `status` field for cancel |
| `submissions` | uuid | Add `expireAt` and a Firestore TTL policy to delete old inquiries automatically |
| `settings` | `billing` | Real GSTIN and FSSAI |
| `counters` | `invoice-<financial-year>` | Sequence number, updated inside a transaction |
| `audit_log` | auto id | Who viewed, exported or deleted PII, and when |

**Design rules that keep the bill low and the data correct**

1. **Never load a whole collection.** Today's `list_documents("bills")` runs on every bill creation and every history view. On Firestore every document read is billed and counted against the free daily quota. Use `order_by` + `limit` + a cursor for pagination.
2. **Generate invoice numbers in a transaction**, which also fixes the race condition in the review:

   ```python
   from google.cloud import firestore

   db = firestore.Client()          # no key: uses the Cloud Run service account

   @firestore.transactional
   def _next(tx, ref):
       snap = ref.get(transaction=tx)
       n = (snap.get("last") if snap.exists else 0) + 1
       tx.set(ref, {"last": n})
       return n

   def next_invoice_number(financial_year: str) -> str:   # e.g. "2026-27"
       ref = db.collection("counters").document(f"invoice-{financial_year}")
       n = _next(db.transaction(), ref)
       return f"MT/{financial_year}/{n:05d}"               # 16 chars, matches the API's validator
   ```

   Use the Indian **financial year** (April to March), and let the sequence restart each year.
3. **Create bills with `create()`, not `set()`**, so a duplicate id fails instead of overwriting an invoice.
4. **Composite indexes:** a query filtering on one field and ordering on another needs an index. Firestore prints a link to create it the first time the query runs; keep those definitions in a `firestore.indexes.json` file in the repo.
5. **Do the money maths on the server** from the product's stored price and GST rate. Do not trust `totalAmount` from the browser.

Add `google-cloud-firestore` back to `requirements.txt`, remove `supabase`, and delete `backend/app-f.py` once the new code is in.

---

## 4. Database: Firestore

### 4.1 Create it in Mumbai with delete protection

```powershell
gcloud firestore databases create --database="(default)" `
  --location=asia-south1 --type=firestore-native

gcloud firestore databases update --database="(default)" --delete-protection
```

The location **cannot be changed later**, so confirm `asia-south1` before running it.

### 4.2 Lock out everything except your API

The API uses server-side IAM, which ignores Firestore security rules. Still, deploy deny-all rules so that no browser SDK could ever reach the data if someone enabled one. Create `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy it with the Firebase CLI (`firebase deploy --only firestore:rules`) after `firebase init` links the project (section 6).

### 4.3 A service account with the minimum access

```powershell
gcloud iam service-accounts create madhuban-api --display-name "Madhuban API"

gcloud projects add-iam-policy-binding madhuban-prod `
  --member "serviceAccount:madhuban-api@madhuban-prod.iam.gserviceaccount.com" `
  --role roles/datastore.user
```

`roles/datastore.user` lets the API read and write documents, and nothing else. It cannot export, delete the database, or change IAM.

**Never create a key file for this account.** Cloud Run provides its credentials automatically.

### 4.4 Point-in-time recovery, TTL and indexes

```powershell
# Keeps 7 days of history so you can recover to any minute (small storage cost)
gcloud firestore databases update --database="(default)" --enable-pitr

# Delete old contact inquiries automatically (retention rule); needs an "expireAt" timestamp field
gcloud firestore fields ttls update expireAt --collection-group=submissions --enable-ttl --database="(default)"

# Deploy your indexes
firebase deploy --only firestore:indexes
```

**Do not put a TTL on `bills`.** GST law requires keeping tax invoices for years. Confirm the exact period with your accountant.

---

## 5. API: Cloud Run

### 5.1 Fix the Dockerfile

`backend/Dockerfile` hardcodes port 5656, but Cloud Run chooses the port through `$PORT`. Replace it with:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -m appuser
USER appuser
CMD exec gunicorn -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:${PORT:-8080} --workers 2 --timeout 60
```

### 5.2 Deploy

```powershell
gcloud run deploy madhuban-api `
  --source backend `
  --region asia-south1 `
  --service-account madhuban-api@madhuban-prod.iam.gserviceaccount.com `
  --allow-unauthenticated `
  --min-instances 0 --max-instances 3 `
  --memory 512Mi --concurrency 40 `
  --set-env-vars GOOGLE_CLOUD_PROJECT=madhuban-prod
```

Notes:

- **Never put `PORT` in `--set-env-vars`.** Cloud Run reserves it and the deploy fails. The existing files in `.github/workflows/` do this and need correcting.
- `--allow-unauthenticated` is required because the public website calls the API. Your own token checks protect the private endpoints, which is why item A in section 3 matters.
- `--max-instances 3` is your real spending cap.
- `--min-instances 0` costs nothing when idle, with a few seconds' delay on the first request after a quiet spell. If billing staff notice, use `--min-instances 1` (a few dollars a month).
- The URL printed at the end is `https://madhuban-api-xxxxx-el.a.run.app`.

### 5.3 Check it

```powershell
curl https://madhuban-api-xxxxx-el.a.run.app/api/health
```

It should return `"status": "ok"`. Then confirm the protection:

```powershell
curl -i https://madhuban-api-xxxxx-el.a.run.app/api/submissions    # must be 401
curl -i https://madhuban-api-xxxxx-el.a.run.app/api/bills          # must be 401
```

If either returns data, **stop**.

### 5.4 Rate limiting inside the API

Cloud Run has no built-in per-IP limit. Add it in code with a library such as `slowapi`:

- `/api/auth/login`: about 5 attempts per minute per IP, plus a lockout after repeated failures on one username.
- `POST /api/submissions` (public contact form): about 5 per minute per IP.

Behind Firebase Hosting, read the client IP from the `X-Forwarded-For` header, not the connection address. Check that your proxy-header handling is correct before relying on the limits.

---

## 6. Website: Firebase Hosting

Firebase Hosting is part of Google's platform, uses the same project and billing, and serves static files from a CDN with free HTTPS.

### 6.1 Check two things first

- **Region support:** Firebase Hosting can rewrite `/api/**` to Cloud Run only for certain Cloud Run regions. Check the current list in the Firebase docs under "Serve dynamic content and host microservices with Cloud Run". If `asia-south1` is not supported, use one of the fallbacks in 6.4.
- **Plan:** rewrites to Cloud Run may require the pay-as-you-go (Blaze) plan. You are already on a billing account, and usage inside the free quota costs nothing.

### 6.2 Set up

```powershell
npm install -g firebase-tools
firebase login
cd "F:\New folder\Madhuban Traders"
firebase init hosting        # choose the existing project "madhuban-prod"; public directory: frontend/dist; single-page app: No (we set rewrites ourselves)
```

Replace the generated `firebase.json` with:

```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "/api/**", "run": { "serviceId": "madhuban-api", "region": "asia-south1" } },
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
          { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
        ]
      },
      {
        "source": "/api/**",
        "headers": [
          { "key": "Cache-Control", "value": "private, no-store" }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

The `/api/**` rewrite must come **before** the catch-all, or the API calls would return the web page.

### 6.3 Build and deploy

The frontend already defaults to `/api`, so leave `VITE_API_BASE_URL` unset. That keeps everything on one address:

```powershell
cd frontend
npm ci
npm run build
cd ..
firebase deploy --only hosting
```

In the Firebase console, **Hosting, Add custom domain**, and add `www.yourdomain.in`. Follow the DNS records it shows. HTTPS is issued automatically.

Because the site and API now share one address, browsers never make cross-origin requests, so **set CORS to none** in the API (or to your domain only). The `*` wildcard in `app.py` should go.

### 6.4 Fallbacks if the Cloud Run rewrite is not available

1. **Call the Cloud Run URL directly.** Build with `VITE_API_BASE_URL=https://madhuban-api-xxxxx-el.a.run.app/api` and restrict CORS to your website's domain. Simplest, but no shared address.
2. **Put both behind a Google Cloud external HTTP(S) load balancer** with a serverless network endpoint group. This is the fully Google route and unlocks Cloud Armor and Cloud CDN, but the load balancer costs roughly $18-20+ a month even when idle. Choose it only if you need Cloud Armor's firewall.

---

## 7. Secrets

With Firestore and IAM, **the API needs no database secret at all.** Keep it that way.

If you add any secret later (for example a token-signing key or an email API key), store it in Secret Manager, never in code or plain env vars:

```powershell
"the-secret-value" | gcloud secrets create TOKEN_SIGNING_KEY --data-file=-

gcloud secrets add-iam-policy-binding TOKEN_SIGNING_KEY `
  --member "serviceAccount:madhuban-api@madhuban-prod.iam.gserviceaccount.com" `
  --role roles/secretmanager.secretAccessor

# add to the deploy command:
#   --set-secrets TOKEN_SIGNING_KEY=TOKEN_SIGNING_KEY:latest
```

---

## 8. Backups (Google-native, no third-party tools)

Losing customer data is the biggest risk, so keep three layers.

### 8.1 Layer 1: managed daily backups

```powershell
gcloud firestore backups schedules create --database="(default)" `
  --recurrence=daily --retention=14d
```

Confirm with `gcloud firestore backups schedules list --database="(default)"`. Retention counts in days or weeks; check `--help` for the longest allowed.

### 8.2 Layer 2: point-in-time recovery

Already enabled in section 4.4. It lets you recover to any minute in the last 7 days, which is what protects you from "someone deleted things at 3 pm".

### 8.3 Layer 3: an independent copy in a **second project**

Layers 1 and 2 live in the same project. If that project or account were compromised or locked, they would go with it. Keep a copy elsewhere.

```powershell
# One-time: a second project with a locked, private bucket
gcloud projects create madhuban-backups --name "Madhuban Backups"
gcloud billing projects link madhuban-backups --billing-account=YOUR_BILLING_ACCOUNT_ID
gcloud storage buckets create gs://madhuban-backups-mumbai `
  --project=madhuban-backups --location=asia-south1 `
  --uniform-bucket-level-access --public-access-prevention
gcloud storage buckets update gs://madhuban-backups-mumbai --versioning
# Optional: lock deletion for 30 days so a compromised account cannot wipe the backups
gcloud storage buckets update gs://madhuban-backups-mumbai --retention-period=30d
```

Give a dedicated service account the right to export from prod and to write to that bucket:

```powershell
gcloud iam service-accounts create db-exporter --project=madhuban-prod
gcloud projects add-iam-policy-binding madhuban-prod `
  --member "serviceAccount:db-exporter@madhuban-prod.iam.gserviceaccount.com" `
  --role roles/datastore.importExportAdmin
gcloud storage buckets add-iam-policy-binding gs://madhuban-backups-mumbai `
  --member "serviceAccount:db-exporter@madhuban-prod.iam.gserviceaccount.com" `
  --role roles/storage.objectAdmin
```

Run the export weekly (a Cloud Scheduler job calling a small Cloud Run job, or by hand while you are starting out):

```powershell
gcloud firestore export gs://madhuban-backups-mumbai/$(Get-Date -Format yyyy-MM-dd) --project=madhuban-prod
```

The exports are encrypted at rest by Google. For a higher standard, encrypt with your own key using Cloud KMS (customer-managed encryption keys).

### 8.4 Layer 4: an offline copy

Once a month, download the newest export to an external drive kept at home or the shop. That covers the account-locked-out case.

### 8.5 Test a restore before going live

```powershell
gcloud firestore backups list --location=asia-south1
gcloud firestore databases restore --source-backup=projects/madhuban-prod/locations/asia-south1/backups/BACKUP_ID `
  --destination-database=restore-test
```

Open `restore-test` in the console and check the bills and products arrived, then delete it. **A backup you have never restored is a guess.** Check the current `gcloud firestore` documentation for the exact restore and point-in-time recovery commands, as they have changed between releases.

---

## 9. Security hardening

### 9.1 Identity and access

- [ ] 2-Step Verification on the Google account (prefer a security key or passkey), on the registrar and on GitHub
- [ ] Use the **Owner** role only when needed; do daily work with a lower role
- [ ] No service account keys anywhere. Confirm with `gcloud iam service-accounts keys list --iam-account=...` (only Google-managed keys should appear)
- [ ] Each service account has one job and one role: `madhuban-api` = Datastore User; `db-exporter` = export only
- [ ] Anyone who only needs to look at data gets `roles/datastore.viewer`, never Owner or Editor
- [ ] Review who has access every quarter (IAM, then Principals)

### 9.2 Audit logging

Admin actions are logged by default. Data reads and writes are **not**. Turn on **Data Read/Write audit logs for Cloud Datastore/Firestore** (IAM, Audit Logs) so that every access to PII by a person or service account is recorded. It adds a small logging cost. Together with your own `audit_log` collection, it tells you exactly what was accessed if something goes wrong.

### 9.3 Cloud Run

- [ ] `--max-instances` set
- [ ] Runs as `madhuban-api`, not the default Compute account (which is Editor by default)
- [ ] Container runs as a non-root user (done in the Dockerfile above)
- [ ] No PII in logs. The current code prints exception text ([app.py:429-437](backend/app.py#L429-L437)), which can include row data
- [ ] `Cache-Control: no-store` on every API response

### 9.4 Application

- [ ] All items A-H in section 3 done
- [ ] Argon2 passwords, expiring tokens, per-worker roles enforced
- [ ] CORS restricted or unnecessary
- [ ] Dependencies scanned: turn on GitHub Dependabot and Artifact Registry vulnerability scanning

### 9.5 PII practice (DPDP Act 2023)

- Ask only for what a bill needs. Every extra field is more to lose.
- Delete contact inquiries after 12-24 months (the TTL policy in 4.4). Keep tax invoices for the legally required period.
- Consent line on the forms and an accurate `/privacy` page, including that WhatsApp is used for orders ([Cart.jsx:85](frontend/src/pages/Cart.jsx#L85) sends customer details to Meta).
- A way for customers to request their data or its deletion, even if it is just a monitored email address.
- One account per staff member. Remove access the day someone leaves.
- Do not paste customer lists into spreadsheets on personal laptops or chat tools.

---

## 10. Monitoring and upkeep

```powershell
# Uptime check (or create it in the console: Monitoring, Uptime checks)
# Target: https://www.yourdomain.in/api/health   every 5 minutes
```

In **Monitoring, Alerting**, create alert policies that notify your email and the Google Cloud mobile app for:

- Uptime check failing for 5 minutes
- Cloud Run 5xx error rate above a small threshold
- Cloud Run request count far above normal (possible abuse)
- Firestore daily reads or writes approaching the free quota

Routine:

| When | Task |
|------|------|
| First month, weekly | Look at Cloud Run logs for repeated errors; confirm the backup schedule and PITR are active |
| Monthly | Billing report; Firestore usage; update dependencies (`npm audit`, `pip list --outdated`); download an offline backup |
| Quarterly | IAM review; restore test; review `workers` and delete unused accounts |

---

## 11. Optional: deploy with GitHub Actions (no keys)

The existing workflows use a stored service-account **JSON key** (`GCP_SERVICE_ACCOUNT_KEY`). A leaked key is a permanent way into your project. Use **Workload Identity Federation** instead, so GitHub proves who it is with a short-lived token:

```powershell
gcloud iam workload-identity-pools create github --location=global --display-name="GitHub"
gcloud iam workload-identity-pools providers create-oidc github-provider `
  --location=global --workload-identity-pool=github `
  --issuer-uri="https://token.actions.githubusercontent.com" `
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" `
  --attribute-condition="assertion.repository=='YOUR_GITHUB_USER/YOUR_REPO'"
```

Then create a `github-deployer` service account with only `roles/run.admin`, `roles/iam.serviceAccountUser` on `madhuban-api`, and Cloud Build/Artifact Registry roles; allow the pool to impersonate it; and use `google-github-actions/auth@v2` with `workload_identity_provider` and `service_account` instead of `credentials_json`. See Google's "Enabling keyless authentication from GitHub Actions" guide for the exact bindings.

Also rewrite the two existing workflows: they set `PORT`, target the Firestore project name from the old setup, and build a frontend image you no longer need (Firebase Hosting replaces it). A simple pipeline is: run tests, build the frontend, `firebase deploy --only hosting`, `gcloud run deploy --source backend`.

Until then, deploying by hand from your PC with the commands in sections 5 and 6 is perfectly fine.

---

## 12. Alternative: Cloud SQL for PostgreSQL instead of Firestore

Choose this if you want to keep SQL, unique constraints and reporting views.

| | Firestore | Cloud SQL Postgres |
|---|-----------|--------------------|
| Monthly | About $0 at your size | Roughly $10-30 for the smallest sensible instance, plus storage and backups |
| Code change | Data layer to Firestore | Data layer to a Postgres driver (`psycopg`); SQL files reused, with the Supabase-specific policies edited |
| Credentials | None (IAM) | A database user, or IAM database authentication (Cloud SQL supports it; use it to avoid a stored password) |
| Backups | Scheduled backups + PITR | Automated backups + PITR |
| Best for | Lowest cost, simplest security | Relational reporting, GST summaries, strict constraints |

If you go this way, connect from Cloud Run through the **Cloud SQL connector** (`--add-cloudsql-instances`), keep the instance on a private IP or with authorised networks disabled, and enable automated backups and PITR at creation.

---

## 13. Go-live order

1. Create `madhuban-prod`, link billing, set the **$5 budget alert** (section 2).
2. Enable the APIs.
3. Finish the code work in section 3, and test locally (see [howtorun.md](howtorun.md)).
4. Create Firestore in Mumbai with delete protection, PITR, TTL and deny-all rules (section 4).
5. Create the `madhuban-api` service account; deploy Cloud Run; run the health and **401 checks** (section 5).
6. Create your real manager account; set the real GSTIN and FSSAI in `settings`.
7. Deploy Firebase Hosting; connect the domain (section 6).
8. Turn on the backup schedule; create the second project and bucket; **test a restore** (section 8).
9. Turn on Firestore data-access audit logs, the uptime check and the alert policies (sections 9-10).
10. Full live test: browse, send an inquiry, log in, create a bill, print it, view history.
11. **Protection test:** in a private browser window while logged out, open `/api/submissions` and `/api/bills`. Both must return **401**.
12. Issue each staff member their own login; delete every shared or test account.

---

## 14. If something goes wrong

**Suspected compromise (account, staff login or code)**

1. Disable the affected user or staff login; set `token` fields empty or revoke sessions in the `workers` collection.
2. If a person's Google account is suspected: remove their IAM access, change their password, and check **Logging, Audit logs** for unfamiliar activity.
3. If the API's service account is suspected: disable it or remove its role (`gcloud projects remove-iam-policy-binding`). There is no key to rotate, which is the point of the IAM approach.
4. Scale the API down (`gcloud run services update madhuban-api --max-instances 0`) while you investigate.
5. **If customer data was exposed**, note what, when and how many people, and get legal advice promptly. The DPDP Act carries breach-notification duties.

**The site is down**

1. Check the [Google Cloud status](https://status.cloud.google.com) page and your uptime alert.
2. Read the Cloud Run logs.
3. Roll back: Cloud Run, Revisions, send 100% of traffic to the last good revision. Firebase Hosting, Release history, roll back.

**Data deleted or corrupted**

1. Stop writes: `gcloud run services update madhuban-api --max-instances 0`.
2. Restore to a **new** database from PITR or a scheduled backup (section 8.5), verify it, then repoint the API by changing the database id it uses.
3. If the whole project is unusable, import the latest export from the second project's bucket into a new project.

---

## 15. Cost summary

| Item | Monthly |
|------|---------|
| Firebase Hosting (small site) | Free within quota |
| Cloud Run (`--max-instances 3`) | Free to a few hundred rupees |
| Firestore (free daily quota, plus PITR and backup storage) | Free to a few dollars |
| Secret Manager, Logging, Monitoring (low volume) | Free to under a dollar |
| Cloud Storage for the exports | Cents |
| Domain | About Rs 60-85 (yearly cost spread out) |
| **Total** | **About $0-5, plus domain** |

Costs rise if you: keep `--min-instances 1` (a few dollars), load whole collections instead of paging (read charges), turn on heavy audit logging, or add a load balancer and Cloud Armor (about $20+).

The developer time for section 3, roughly 2-4 days plus tests, is the real cost of this setup, and it is required on any platform.

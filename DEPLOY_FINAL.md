# Madhuban Traders: Final Deployment Plan

**The best combination of services for low cost, no lost data and strong protection of customer PII.**

This is the single deployment guide to follow. It supersedes `DEPLOY_LIVE.md`, `DEPLOY_LOW_COST.md` and `DEPLOY_GOOGLE_CLOUD.md` (which describe earlier options), and you may delete those once you have read this. It builds on the findings in [PROJECT_REVIEW.md](PROJECT_REVIEW.md).

Prices, free-tier limits and some `gcloud` flags come from my knowledge of these services and change over time. Section 15 lists the exact things to verify before you rely on them.

---

## 1. The decision

| Layer | Service | Why this one | Approx. monthly |
|-------|---------|--------------|-----------------|
| **Edge security and website** | **Cloudflare** (Pages + proxy, free plan) | Free firewall, bot protection, rate limiting and DDoS absorption in front of everything. Static site hosting free for commercial use | Free |
| **API** | **Google Cloud Run**, Mumbai | Scales to zero, hard instance cap, runs as its own identity | Free to a few hundred rupees |
| **Database** | **Google Firestore**, Mumbai | Login by IAM, so **no database password or key exists to steal**. Encrypted at rest. Managed backups and point-in-time recovery. Delete protection | Free to a few dollars |
| **Backups** | Firestore backups + point-in-time recovery + export to a **second Google project** + weekly encrypted copy to **Cloudflare R2** | Four copies across two companies, so no single account failure loses the data | Cents |
| **Secrets** | Google Secret Manager | One shared secret only (section 7.3) | Free |
| **Monitoring** | Google Cloud Monitoring + Logging | Uptime checks and alerts | Free at this size |
| **Deploy pipeline** | GitHub Actions with keyless Workload Identity Federation | No long-lived key that could leak | Free |

**Expected total: about $0-8 per month, plus the domain (about Rs 700-1,000 a year).**

### Why this combination

The two goals pull in different directions, so each layer was chosen to be strong at one job:

- **Cloudflare is the front door.** The most likely attacks on a small business holding PII are password guessing on the manager login, bots hammering forms, and scans for open endpoints. Cloudflare's free plan stops much of that before it reaches your code, and Google Cloud alone cannot do it for free (its firewall, Cloud Armor, needs a load balancer at roughly $20+ a month).
- **Google Cloud holds everything valuable.** The database, the API and the secrets stay inside one account you can audit, in India, with IAM instead of passwords.
- **Backups span two companies.** If one account is locked, hacked or billed out of service, the other still has your data. That is the difference between an inconvenience and losing the business.

### Trade-offs you are accepting

| You accept | Because |
|------------|---------|
| Cloudflare sees API traffic in transit, so it is a **data processor** for PII (name, phone, address in form submissions) | The site's static files carry no PII. Attack protection on the login and forms is worth more than the risk of a large, audited vendor. State it in your privacy policy. If you cannot accept this, drop Cloudflare and use Firebase Hosting as in `DEPLOY_GOOGLE_CLOUD.md`, then rate-limit in the API only |
| A database rewrite (about 2-4 developer-days) | Any move off the current Supabase client needs it, and Firestore gives the strongest security per rupee |
| Two vendors to secure instead of one | Two-step login on every account (section 9), and the weekly off-site backup makes a vendor problem survivable |

### Why not the other options

| Option | Reason it lost |
|--------|----------------|
| Supabase Free | No backups, pauses after inactivity, no uptime guarantee. Fine for testing, weak for real customer data |
| Supabase Pro (~$25) | Solid, but costs more than Firestore and still holds a powerful key (`service_role`) that must never leak |
| Neon | Good Postgres, but no Mumbai region that I know of, and free-plan restore window is short |
| Cloud SQL Postgres (~$10-30) | Strong and relational, but costs more; a good upgrade if you later need SQL reporting (section 14) |
| A cheap VPS | Cheapest on paper, but you become the security team: OS patches, firewall, TLS, backups. One missed patch exposes the PII |
| Vercel Hobby | Not permitted for commercial use |

---

## 2. Architecture

```
Customer or staff browser
        |  HTTPS
        v
+------------------------------------------------------------+
| Cloudflare (free plan)                                     |
|   DNS + proxy, WAF managed rules, bot protection,          |
|   rate limit on /api/auth/login, Turnstile on the form     |
|                                                            |
|   Pages:  static React site (no secrets, no PII)           |
|   Pages Function on /api/*  -->  adds X-Origin-Auth secret |
+------------------------------------------------------------+
        |  HTTPS, only requests carrying the secret are answered
        v
+------------------------------------------------------------+
| Google Cloud project "madhuban-prod" (Mumbai)              |
|                                                            |
|   Cloud Run "madhuban-api"  (max 3 instances)              |
|     runs as service account "madhuban-api"                 |
|     role: Datastore User only, no keys                     |
|        |                                                   |
|        v                                                   |
|   Firestore  (delete protection, PITR, daily backups)      |
+------------------------------------------------------------+
        |  weekly export
        v
+------------------------------------------------------------+
| Project "madhuban-backups": locked bucket, 30-day hold     |
+------------------------------------------------------------+
        |  weekly, encrypted with your passphrase
        v
Cloudflare R2 bucket (a different company from Google)
        |  monthly, by hand
        v
An external drive at home (offline)
```

Four properties carry the security:

1. **The browser never talks to the database.** Only the API does.
2. **The API has no database credential.** It signs in through IAM. There is nothing to leak, paste into chat or commit to git.
3. **The API only answers requests that came through Cloudflare.** Anyone who finds the raw `run.app` address gets `403`, so the firewall and rate limits cannot be bypassed.
4. **Backups exist outside the account that holds the live data.**

---

## 3. Roadmap

Do not try to do everything before launch. Phase 0 is mandatory. The rest can follow.

| Phase | Goal | Contents |
|-------|------|----------|
| **0. Blockers** | Nothing exposes or loses customer data | Section 5, items A-H |
| **1. Launch** | Live, protected, backed up | Sections 6-11 |
| **2. Harden (first 1-2 months)** | Staff access needs more than a password | Cloudflare Access in front of staff routes, or Firebase Authentication with multi-factor sign-in (section 12) |
| **3. Grow** | Scale without losing safety | Section 14 triggers |

---

## 4. Accounts and one-time hygiene

You need: a **dedicated business Google account**, a Google Cloud **billing account**, a **Cloudflare** account, a **GitHub** account (private repository), a **domain**, and a password manager.

**Before anything else:**

- Turn on **two-step login on every one of them**, preferably with a passkey or security key. Also on the email account they all recover to, because whoever controls that email controls everything.
- Store recovery codes on paper, in two places.
- Give every staff member their own login. Never share one.
- Registrar: turn on the **transfer lock**, and turn on **DNSSEC** in Cloudflare.

Create a **production project used for nothing else**:

```powershell
gcloud auth login
gcloud projects create madhuban-prod --name "Madhuban Prod"
gcloud config set project madhuban-prod
gcloud billing projects link madhuban-prod --billing-account=YOUR_BILLING_ACCOUNT_ID
gcloud services enable billingbudgets.googleapis.com
```

**Cost guard first:** in the console, Billing, Budgets & alerts, create a **$5 budget** with email alerts at 50%, 90% and 100%. A budget only sends warnings. It does not stop spending. Your real cap is Cloud Run's instance limit (section 7).

```powershell
gcloud services enable `
  run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com `
  firestore.googleapis.com secretmanager.googleapis.com `
  monitoring.googleapis.com logging.googleapis.com `
  iamcredentials.googleapis.com cloudresourcemanager.googleapis.com
```

---

## 5. Phase 0: code changes that must be done before launch

Deploying today's code on any host would expose customer data. Line references are to the current code.

| # | Change | Why |
|---|--------|-----|
| **A** | Require a valid token on the submissions list, read, update and delete endpoints ([backend/app.py:666-695](backend/app.py#L666-L695)), and send it from [Submissions.jsx](frontend/src/pages/Submissions.jsx). Guard the `/submissions` route ([App.jsx:96](frontend/src/App.jsx#L96)) | **Today anyone can read or delete every customer record with no password** |
| **B** | Delete the `shop1` / `shop123` seed ([app.py:133-155](backend/app.py#L133-L155)) and create your own manager with a strong password | The default password is published in this repo |
| **C** | Replace SHA-256 with argon2 or bcrypt, give tokens an expiry, store only a hash of the token, and enforce `role` ([app.py:129-131](backend/app.py#L129-L131), [:542-575](backend/app.py#L542-L575)) | A database leak must not become a password leak |
| **D** | Remove the in-memory fallback; return HTTP 503 when the database is unreachable ([app.py:29-45](backend/app.py#L29-L45), [:395-437](backend/app.py#L395-L437)) | Otherwise bills silently vanish on restart |
| **E** | Add the shared-secret check and `Cache-Control: no-store` to every API response (section 7.3) | Makes the API answer only Cloudflare, and stops any edge cache from keeping PII |
| **F** | Rate-limit login and the public form inside the API too (section 7.4) | Second layer behind Cloudflare's |
| **G** | Fix the bill-ID overwrite; read billing settings from the database; compute totals on the server from stored prices; make issued bills immutable (review items 6, 7, 9, 10) | Lost invoices, wrong totals, placeholder GSTIN on live bills |
| **H** | Add a consent line to [InquiryForm.jsx](frontend/src/components/InquiryForm.jsx), update `/privacy` (name Cloudflare, Google and WhatsApp as processors), and add a deletion-request contact | India's DPDP Act 2023 |

Also: remove all logging of names, phones, addresses and GSTINs (the code prints exception text at [app.py:429-437](backend/app.py#L429-L437), which can contain row data), and delete `backend/app-f.py` and the `* copy.*` files.

### 5.1 Moving the data layer to Firestore

The Supabase client appears in only **11 places** ([app.py:44](backend/app.py#L44), [:136-138](backend/app.py#L136-L138), [:430-467](backend/app.py#L430-L467), [:525](backend/app.py#L525), [:548-582](backend/app.py#L548-L582)), mostly inside four helper functions. Replace `supabase` with `google-cloud-firestore` in `requirements.txt`.

| Collection | Document id | Notes |
|------------|-------------|-------|
| `workers` | username | Argon2 hash, role, token hash and expiry |
| `products` | product id | Public read through the API |
| `bills` | invoice number | Created with `create()` so a duplicate fails rather than overwriting; never edited after issue, corrected by credit note; `status` for cancel |
| `submissions` | uuid | Has an `expireAt` field with a TTL policy, so old inquiries delete themselves |
| `settings` | `billing` | Real GSTIN and FSSAI |
| `counters` | `invoice-<financial-year>` | Sequence, updated in a transaction |
| `audit_log` | auto id | Who viewed, exported or deleted PII, and when |

Rules that keep cost low and data correct:

1. **Never load a whole collection.** The current `list_documents("bills")` runs on every bill creation and history view. Firestore bills per document read, so use `order_by` + `limit` + a cursor.
2. **Generate invoice numbers in a transaction** (also fixes the race condition in the review):

   ```python
   from google.cloud import firestore

   db = firestore.Client()          # no key: uses the Cloud Run service account

   @firestore.transactional
   def _next(tx, ref):
       snap = ref.get(transaction=tx)
       n = (snap.get("last") if snap.exists else 0) + 1
       tx.set(ref, {"last": n})
       return n

   def next_invoice_number(financial_year: str) -> str:       # e.g. "2026-27"
       ref = db.collection("counters").document(f"invoice-{financial_year}")
       return f"MT/{financial_year}/{_next(db.transaction(), ref):05d}"   # 16 chars, fits the validator
   ```

   Use the Indian **financial year** (April to March) and restart the sequence each year.
3. **Do the money maths on the server** from stored price and GST rate, never from `totalAmount` sent by the browser.
4. Keep composite index definitions in a `firestore.indexes.json` file in the repo.
5. **Never put a TTL on `bills`.** Tax invoices must be kept for years; confirm the period with your accountant.

Budget for tests on the invoice numbering, GST maths and login code in particular, since errors there are legal and financial.

---

## 6. Phase 1, step 1: the database (Firestore)

```powershell
# Location cannot be changed later. Confirm asia-south1 (Mumbai) first.
gcloud firestore databases create --database="(default)" --location=asia-south1 --type=firestore-native
gcloud firestore databases update --database="(default)" --delete-protection
gcloud firestore databases update --database="(default)" --enable-pitr

# Auto-delete old contact inquiries (needs an "expireAt" timestamp on each submission)
gcloud firestore fields ttls update expireAt --collection-group=submissions --enable-ttl --database="(default)"
```

Deny-all rules, so that no browser SDK could ever reach the data even if someone enabled one. Create `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

Deploy it with the Firebase CLI (`firebase deploy --only firestore:rules`), together with your indexes.

**A service account with exactly one job:**

```powershell
gcloud iam service-accounts create madhuban-api --display-name "Madhuban API"
gcloud projects add-iam-policy-binding madhuban-prod `
  --member "serviceAccount:madhuban-api@madhuban-prod.iam.gserviceaccount.com" `
  --role roles/datastore.user
```

`datastore.user` lets the API read and write documents. It cannot export data, delete the database or change permissions. **Never create a key file for it.**

---

## 7. Phase 1, step 2: the API (Cloud Run)

### 7.1 Dockerfile

`backend/Dockerfile` hardcodes port 5656, but Cloud Run assigns the port through `$PORT`. Replace it:

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

### 7.2 Create the shared secret and deploy

```powershell
# A long random secret that Cloudflare will send and the API will require
$secret = -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | % {[char]$_})
$secret | gcloud secrets create ORIGIN_SECRET --data-file=-
gcloud secrets add-iam-policy-binding ORIGIN_SECRET `
  --member "serviceAccount:madhuban-api@madhuban-prod.iam.gserviceaccount.com" `
  --role roles/secretmanager.secretAccessor
# Keep $secret for section 8, then close the window. Do not save it in a file or chat.

gcloud run deploy madhuban-api `
  --source backend `
  --region asia-south1 `
  --service-account madhuban-api@madhuban-prod.iam.gserviceaccount.com `
  --set-secrets ORIGIN_SECRET=ORIGIN_SECRET:latest `
  --set-env-vars GOOGLE_CLOUD_PROJECT=madhuban-prod `
  --allow-unauthenticated `
  --min-instances 0 --max-instances 3 `
  --memory 512Mi --concurrency 40
```

- **Never set `PORT` yourself.** Cloud Run reserves it. The current files in `.github/workflows/` do this, so do not use them as they are.
- `--allow-unauthenticated` is needed because Cloudflare calls the API without a Google login. The shared secret and your own token checks protect it (next section).
- `--max-instances 3` is your real spending cap, and it limits damage if anyone floods the raw address.
- `--min-instances 0` is free when idle, with a few seconds' delay on the first request after a quiet spell. If billing staff notice, use `--min-instances 1` (a few dollars a month).

### 7.3 Make the API answer only Cloudflare

Add this once in `backend/app.py` (change E):

```python
import hmac, os
from fastapi import Request
from fastapi.responses import JSONResponse

ORIGIN_SECRET = os.environ["ORIGIN_SECRET"].encode()   # the app refuses to start without it

@app.middleware("http")
async def edge_only(request: Request, call_next):
    supplied = request.headers.get("x-origin-auth", "").encode()
    if not hmac.compare_digest(supplied, ORIGIN_SECRET):
        return JSONResponse({"detail": "Forbidden"}, status_code=403)
    response = await call_next(request)
    response.headers["Cache-Control"] = "private, no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response
```

Requests to the raw `run.app` address return **403**. Only requests that passed through Cloudflare (which adds the header) are answered. Also set CORS to your own domain only, or remove it, since the browser and the API now share one address.

**Rotate the secret** every six months, or immediately if it may have leaked: add a new secret version, update the Cloudflare variable, redeploy.

### 7.4 Rate limiting and the real client address

Behind Cloudflare, the connection address is Cloudflare's. The Pages Function (section 8) passes the visitor's real address in `X-Client-IP`. Trust that header **only** because the shared secret already proved the request came from your Function. Limits to apply in the API (for example with `slowapi`), keyed on that address:

- `/api/auth/login`: about 5 attempts a minute, and a lockout after repeated failures on one username
- `POST /api/submissions`: about 5 a minute

---

## 8. Phase 1, step 3: Cloudflare (site, proxy and firewall)

### 8.1 Site on Cloudflare Pages

Cloudflare, **Workers & Pages, Create, Pages, Connect to Git**, pick this repository.

| Setting | Value |
|---------|-------|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable (encrypted) | `API_ORIGIN` = `https://madhuban-api-xxxxx-el.a.run.app` |
| Environment variable (encrypted) | `ORIGIN_SECRET` = the value from section 7.2 |

Leave `VITE_API_BASE_URL` **unset**. The frontend then calls `/api` on its own address.

**Remove the `postbuild` step** in `frontend/package.json` that copies `index.html` to `404.html` (`node ./scripts/copy404.js`). With no `404.html`, Cloudflare Pages treats the project as a single-page app and serves `index.html` for direct links such as `/catalog`. With a `404.html` present, that automatic behaviour turns off.

### 8.2 The proxy function

Create `frontend/functions/api/[[path]].js`. Cloudflare runs it for every `/api/*` request:

```javascript
export async function onRequest({ request, env }) {
  const incoming = new URL(request.url);
  const target = new URL(env.API_ORIGIN + incoming.pathname + incoming.search);

  const headers = new Headers(request.headers);
  headers.set("X-Origin-Auth", env.ORIGIN_SECRET);
  headers.set("X-Client-IP", request.headers.get("CF-Connecting-IP") || "");
  headers.delete("Host");

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual",
  });

  const response = new Response(upstream.body, upstream);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
```

The browser sees one address, so there are no cross-origin (CORS) problems. Add a `frontend/public/_headers` file for the static site:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 8.3 Domain and firewall

1. Pages, **Custom domains**, add `www.yourdomain.in`. HTTPS is automatic. Set SSL/TLS mode to **Full (strict)** and turn on **Always Use HTTPS**.
2. **Security, WAF:** enable the free managed rules. **Bot Fight Mode:** on.
3. **Security, Rate limiting rules:** limit `/api/auth/login` to about 5 requests a minute per IP. The free plan allows only a small number of rules, so spend them on the login first.
4. **Turnstile** (free CAPTCHA) on the public inquiry form, verified on the server. It stops spam from filling your database with junk.
5. **Test that the API path returns JSON, not the web page:** open `https://www.yourdomain.in/api/health`. If you see HTML, the Function is not running, so check the file path and that the build picked up the `functions` folder.

---

## 9. Security checklist (tick every box before launch)

**Accounts**
- [ ] Two-step login on Google, Cloudflare, GitHub, registrar and recovery email; recovery codes stored on paper
- [ ] Every staff member has their own login; no shared or default accounts
- [ ] Google **Owner** role used only when needed
- [ ] No service-account key files exist anywhere (`gcloud iam service-accounts keys list --iam-account=...` shows only Google-managed keys)

**Access**
- [ ] `madhuban-api` has only `roles/datastore.user`
- [ ] The raw `run.app` address returns **403**
- [ ] Logged out, `/api/submissions` and `/api/bills` return **401**
- [ ] Firestore rules are deny-all; delete protection is on
- [ ] Anyone who only needs to look at data has `roles/datastore.viewer`

**Application**
- [ ] Phase 0 items A-H finished
- [ ] Argon2 passwords, expiring tokens, roles enforced
- [ ] No PII in logs; `Cache-Control: no-store` on every API response
- [ ] Dependabot enabled on the repository

**Data**
- [ ] Point-in-time recovery, scheduled backups, second-project export and R2 copy all running (section 10)
- [ ] A restore has been **tested** (section 10.5)
- [ ] Invoices are never deleted; inquiries auto-delete after your chosen period

**Audit trail**
- [ ] IAM, Audit Logs: Data Read and Data Write logs turned on for Firestore, so every access to PII is recorded
- [ ] Your own `audit_log` collection records exports and deletions

**Privacy (DPDP Act)**
- [ ] Consent text on forms; accurate privacy page naming Google, Cloudflare and WhatsApp as processors
- [ ] A way for customers to request their data or its deletion
- [ ] Only the fields a bill needs are collected

---

## 10. Backups: four copies, two companies

The rule: **3 copies, on 2 kinds of storage, with 1 somewhere else.** This plan exceeds it.

| Layer | Where | Protects against | Cost |
|-------|-------|------------------|------|
| 1. Point-in-time recovery (7 days) | Firestore | "Someone deleted the wrong thing at 3 pm" | Small |
| 2. Scheduled daily backups | Firestore | Bad deploys, corruption | Small |
| 3. Weekly export to a **second Google project** with a 30-day lock | Cloud Storage | The main project being compromised or misconfigured | Cents |
| 4. Weekly encrypted copy to **Cloudflare R2** | A different company | Your Google account being locked, hacked or suspended | Free |
| 5. Monthly offline copy | Drive at home | Everything online failing | Free |

### 10.1 Layers 1 and 2 (in the main project)

PITR was turned on in section 6. Add the schedule:

```powershell
gcloud firestore backups schedules create --database="(default)" --recurrence=daily --retention=14d
gcloud firestore backups schedules list --database="(default)"
```

### 10.2 Layer 3: second project with a locked bucket

```powershell
gcloud projects create madhuban-backups --name "Madhuban Backups"
gcloud billing projects link madhuban-backups --billing-account=YOUR_BILLING_ACCOUNT_ID

gcloud storage buckets create gs://madhuban-backups-mumbai `
  --project=madhuban-backups --location=asia-south1 `
  --uniform-bucket-level-access --public-access-prevention
gcloud storage buckets update gs://madhuban-backups-mumbai --versioning
gcloud storage buckets update gs://madhuban-backups-mumbai --retention-period=30d   # nobody can delete for 30 days

# Account that runs exports, and nothing else
gcloud iam service-accounts create db-exporter --project=madhuban-prod
gcloud projects add-iam-policy-binding madhuban-prod `
  --member "serviceAccount:db-exporter@madhuban-prod.iam.gserviceaccount.com" `
  --role roles/datastore.importExportAdmin
gcloud storage buckets add-iam-policy-binding gs://madhuban-backups-mumbai `
  --member "serviceAccount:db-exporter@madhuban-prod.iam.gserviceaccount.com" `
  --role roles/storage.objectAdmin
```

**If the export fails with a permission error on the bucket**, also grant *Storage Object Admin* on that bucket to the Firestore service agent, `service-<PROJECT_NUMBER>@gcp-sa-firestore.iam.gserviceaccount.com`. Because the bucket is in a different project, the export runs as that agent.

Manual export, for your first test:

```powershell
gcloud firestore export gs://madhuban-backups-mumbai/$(Get-Date -Format yyyy-MM-dd) --project=madhuban-prod
```

### 10.3 Layers 3 and 4 automated: one weekly workflow

This uses keyless GitHub-to-Google login (section 11.1). Create the R2 bucket first (private, `madhuban-backups`, lifecycle rule deleting objects after 90 days), an R2 token limited to that bucket, and a long random backup passphrase kept in your password manager **and on paper**. Without it the copies are unreadable, including by you.

Add to `.github/workflows/offsite-backup.yml`:

```yaml
name: Weekly off-site backup

on:
  schedule:
    - cron: "30 21 * * 0"      # Sunday 03:00 IST
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: db-exporter@madhuban-prod.iam.gserviceaccount.com
      - uses: google-github-actions/setup-gcloud@v2

      - name: Export and download
        run: |
          echo "D=$(date -u +%F)" >> "$GITHUB_ENV"
          D=$(date -u +%F)
          gcloud firestore export "gs://madhuban-backups-mumbai/$D" --project=madhuban-prod
          mkdir out
          gcloud storage cp -r "gs://madhuban-backups-mumbai/$D" out/
          tar -czf "backup-$D.tgz" -C out .

      - name: Encrypt
        env:
          BACKUP_PASSPHRASE: ${{ secrets.BACKUP_PASSPHRASE }}
        run: |
          gpg --batch --yes --pinentry-mode loopback --passphrase "$BACKUP_PASSPHRASE" \
              --symmetric --cipher-algo AES256 -o "backup-$D.tgz.gpg" "backup-$D.tgz"
          rm -rf out "backup-$D.tgz"

      - name: Upload to Cloudflare R2
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: auto
        run: |
          aws s3 cp "backup-$D.tgz.gpg" "s3://madhuban-backups/madhuban-$D.tgz.gpg" \
            --endpoint-url "https://${{ secrets.R2_ACCOUNT_ID }}.r2.cloudflarestorage.com"
```

Repository secrets to add: `WIF_PROVIDER`, `BACKUP_PASSPHRASE`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. The unencrypted data is deleted before upload, so nothing readable sits in GitHub or R2.

**Turn on GitHub email alerts for failed workflows.** A silently failing backup is worse than none, because you will believe you are covered.

### 10.4 Layer 5: monthly offline copy

Once a month, download the newest file from R2 to an external drive kept at home or the shop.

### 10.5 Test a restore before launch, then every quarter

```powershell
# Restore a managed backup into a brand-new database (never over the live one)
gcloud firestore backups list --location=asia-south1
gcloud firestore databases restore `
  --source-backup=projects/madhuban-prod/locations/asia-south1/backups/BACKUP_ID `
  --destination-database=restore-test
```

Open `restore-test`, check that bills, products and workers are there, then delete it. Also test the R2 path once: download a file, decrypt it (`gpg --batch --pinentry-mode loopback --passphrase "..." -d file.tgz.gpg > file.tgz`), and confirm it unpacks. **A backup you have never restored is a guess.** Check the current `gcloud firestore` documentation for the exact restore and point-in-time recovery commands; they have changed between releases.

---

## 11. Deploying updates safely

### 11.1 Keyless deploys from GitHub

The existing workflows store a service-account **JSON key** (`GCP_SERVICE_ACCOUNT_KEY`). A leaked key is a permanent way into your project. Use Workload Identity Federation instead, so GitHub proves who it is with a short-lived token:

```powershell
gcloud iam workload-identity-pools create github --location=global --display-name="GitHub" --project=madhuban-prod
gcloud iam workload-identity-pools providers create-oidc github-provider `
  --project=madhuban-prod --location=global --workload-identity-pool=github `
  --issuer-uri="https://token.actions.githubusercontent.com" `
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" `
  --attribute-condition="assertion.repository=='YOUR_GITHUB_USER/YOUR_REPO'"
```

Then allow the pool to impersonate `db-exporter` (for backups) and a separate `github-deployer` account with only `roles/run.admin`, `roles/iam.serviceAccountUser` on `madhuban-api`, and Cloud Build and Artifact Registry access. Follow Google's "Enabling keyless authentication from GitHub Actions" guide for the exact bindings. The attribute condition restricts it to **your repository only**.

### 11.2 Fix the existing workflows

`.github/workflows/backend-cloudrun.yml` and `frontend-cloudrun.yml` must be replaced: they set `PORT`, target Firestore's old project name, use a JSON key, and build a frontend container you no longer need (Cloudflare Pages deploys the site from Git). A simple new pipeline is: run tests, then `gcloud run deploy --source backend`. Until then, deploying by hand from your PC with the commands above is fine.

### 11.3 Release habits

- Protect the `main` branch: require a pull request and one review before merging.
- Keep the last good Cloud Run revision so you can roll back in seconds (section 13).

---

## 12. Phase 2: harden staff access (first 1-2 months)

A manager password is the weakest link in the system: it unlocks every customer record. Add a second factor. Two good ways:

| Option | Effort | How it works |
|--------|--------|--------------|
| **Cloudflare Access** (Zero Trust free plan, up to about 50 users) | Little or no code | Put `/manager-*`, `/billing*`, `/submissions` and the private API paths behind a Cloudflare login (for example "sign in with Google", where Google enforces 2-step verification). Only approved staff emails can even reach those pages, before your own login |
| **Firebase Authentication / Identity Platform with multi-factor sign-in** | About 1-2 days | Replace the custom password and token code with Google's managed sign-in; the API verifies Google-issued tokens. Removes password hashing and token storage from your code altogether |

Start with Cloudflare Access: it needs almost no code and works immediately. Move to Firebase Authentication when you have more staff or want the app itself to stop handling passwords. Check current pricing, as multi-factor features may sit behind the paid Identity Platform tier.

Also in Phase 2: an `audit_log` review habit, and a short **staff data-handling rule** (no exports to personal laptops or chat apps).

---

## 13. Monitoring and incident response

### 13.1 Monitoring

Create these in **Cloud Monitoring**, alerting your email and the Google Cloud mobile app:

- **Uptime check** on `https://www.yourdomain.in/api/health` every 5 minutes (it goes through Cloudflare, so it carries the secret; the raw address would correctly return 403)
- Cloud Run **5xx error rate** above a small threshold
- Cloud Run **request count** far above normal (possible abuse)
- Firestore daily **reads and writes** nearing the free quota (an unpaged query is the usual cause)

| When | Task |
|------|------|
| First month, weekly | Read Cloud Run logs for repeated errors. Confirm PITR and the schedule are active. Confirm a new R2 file appeared |
| Monthly | Billing report and Firestore usage. `npm audit` and `pip list --outdated`, then update, test, redeploy. Download the offline copy |
| Quarterly | IAM review and removal of unused accounts. Restore test. Review the `workers` collection |
| Every 6 months | Rotate `ORIGIN_SECRET` and the backup passphrase copy |

### 13.2 If something goes wrong

**Suspected compromise (a staff login, a device, or the code)**

1. Disable that user and clear their sessions in `workers`. Change their password.
2. For a Google account: remove its IAM access, change its password, and read **Logging, Audit logs** for unfamiliar activity.
3. For the API's service account: remove its role. There is no key to rotate, which is the point of using IAM.
4. If the shared secret may have leaked: rotate `ORIGIN_SECRET` (section 7.3).
5. Pause the API while you investigate: `gcloud run services update madhuban-api --region asia-south1 --max-instances 0`.
6. **If customer data was exposed**, write down what, when and how many people, and get legal advice promptly. The DPDP Act carries breach-notification duties, and delay makes things worse.

**The site is down**

1. Check Google Cloud and Cloudflare status pages and your uptime alert.
2. Read the Cloud Run logs.
3. Roll back: Cloud Run, Revisions, send 100% of traffic to the last good revision; Cloudflare Pages, Deployments, roll back.

**Data deleted or corrupted**

1. Stop writes: `--max-instances 0` as above.
2. Restore into a **new** database from point-in-time recovery or a backup (section 10.5), check it, then point the API at it.
3. If the whole Google project is lost or locked, restore from the second project's bucket, or decrypt the R2 copy and import it into a new project.

Fallback for outages at the counter: keep a numbered paper invoice book, and enter those bills afterwards.

---

## 14. Growth path

| Trigger | Upgrade | Cost |
|---------|---------|------|
| Billing staff notice slow first requests | Cloud Run `--min-instances 1` | A few $/mo |
| You want SQL reports, GST summaries or strict constraints | Move to **Cloud SQL for PostgreSQL** (IAM database sign-in, automated backups with PITR). Keep the same Cloud Run and Cloudflare setup | Roughly $10-30/mo |
| More than one shop, or more staff | Roles per person, per-shop data separation, Firebase Authentication with multi-factor | Small |
| Even lower tolerance for stolen data | Field-level encryption of phone and address with Cloud KMS, and customer-managed keys | Small |
| A firewall tuned to your traffic | Google load balancer with Cloud Armor | About $20+/mo |
| Online payments | A payment gateway such as Razorpay. **Never store card details yourself** | Per transaction |

---

## 15. Go-live order

1. Set up accounts, two-step login and the **$5 budget alert** (section 4).
2. Finish **Phase 0** code changes A-H and test them locally, per [howtorun.md](howtorun.md).
3. Create Firestore, delete protection, PITR, TTL, rules and the `madhuban-api` account (section 6).
4. Deploy Cloud Run with the shared secret (section 7). Check `/api/health` **through** the Cloudflare address, and confirm the raw `run.app` address returns **403**.
5. Deploy the site and the proxy function; connect the domain; set the WAF, bot and rate-limit rules (section 8).
6. Create your real manager account and set the real GSTIN and FSSAI in `settings`.
7. Create the backup project, bucket and export account; add the workflow; run it by hand; **test restoring both a managed backup and the R2 copy** (section 10).
8. Turn on Firestore data-access audit logs, the uptime check and the alerts (sections 9 and 13).
9. Full live test: browse, send an inquiry, log in, create a bill, print it, view history, cancel a bill.
10. **Protection tests, from a private browser window while logged out:**
    - `/api/submissions` returns 401
    - `/api/bills` returns 401
    - the raw `run.app` address returns 403
    - five wrong passwords on `/api/auth/login` get blocked
11. Issue each staff member their own login. Delete every shared or test account.
12. Schedule your first monthly offline copy and quarterly restore test in your calendar.

---

## 16. Cost summary

| Item | Monthly |
|------|---------|
| Cloudflare Pages, proxy, WAF, bot protection, Turnstile, R2 backups | Free (R2 may ask for a payment card) |
| Cloud Run (`--max-instances 3`) | Free to a few hundred rupees |
| Firestore including PITR and backup storage | Free to a few dollars |
| Cloud Storage for exports, Secret Manager, Logging, Monitoring | Free to under a dollar |
| GitHub Actions (private repo) | Free |
| Domain | About Rs 60-85 (yearly cost spread out) |
| **Total** | **About $0-8, plus domain** |

Things that raise it: `--min-instances 1` (a few dollars), loading whole collections instead of paging (read charges), heavy audit logging, and a load balancer with Cloud Armor (about $20+). The developer time for Phase 0 (roughly 2-4 days plus tests) is the real cost, and it is unavoidable on any platform.

---

## 17. Verify these before you rely on them

I wrote this from my knowledge of each service, without running any of it. Check these on the provider's own pages:

- [ ] Cloudflare free plan: number of rate-limit rules, Zero Trust user limit, Pages Functions daily request limit, R2 free storage
- [ ] Firestore free daily quota, PITR and backup pricing, and the current `gcloud firestore` restore and TTL syntax
- [ ] Firestore in `asia-south1` (Mumbai) is available for your account (the location cannot be changed later)
- [ ] The export to a bucket in another project: whether the Firestore service agent needs the bucket role (section 10.2)
- [ ] Cloud Run `--min-instances` and instance pricing in `asia-south1`
- [ ] Whether multi-factor sign-in in Firebase Authentication or Identity Platform is free at your size
- [ ] With Cloudflare Pages: that `/api/health` returns JSON and that direct links like `/catalog` work after removing `404.html`
- [ ] The GST invoice-retention period and the invoice-numbering rules, with your accountant
- [ ] Your privacy policy wording and breach-reporting duties, with a lawyer if you can

Confirm these in a test project before pointing real customers at the system.

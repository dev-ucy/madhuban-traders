# Going Live: Low Cost, High Security for Customer Data

Madhuban Traders stores customer names, phone numbers, addresses, GSTINs and purchase history. That is personal data (PII) and financial records, so this guide treats protecting it as the first requirement and cost as the second.

**Conclusion up front: about Rs 0-450 per month (roughly $0-5), with no change to the tech stack.** Details below, including why switching providers would not save money.

This file replaces `DEPLOY_LOW_COST.md`, which is now superseded. Prices and free-plan limits change often, so confirm each one on the provider's pricing page before you commit.

---

## 1. The honest headline

**Your hosting bill is not your PII risk. Your code is.**

Right now, anyone on the internet can list, read and delete every customer record you hold, with no password, by opening one URL. That is [backend/app.py:666-695](backend/app.py#L666-L695), item 1 in [PROJECT_REVIEW.md](PROJECT_REVIEW.md). No hosting provider, at any price, protects you from that.

So the plan is:

1. Fix the code that exposes customer data (section 4). This is unavoidable and costs developer time, not money.
2. Deploy on free tiers that are genuinely secure (sections 6-8).
3. Replace the one thing the free tiers do not give you, backups, with your own encrypted ones (section 10).

Spending $25 a month on a database upgrade while the API sits open would buy you nothing.

---

## 2. Recommended architecture

| Part | Service | Region | Monthly cost |
|------|---------|--------|--------------|
| Website (React build) | **Cloudflare Pages** | Global CDN | Free |
| Backend (FastAPI) | **Google Cloud Run** | `asia-south1` Mumbai | Free tier, then cents |
| Database | **Supabase Free** | Mumbai (`ap-south-1`) | Free |
| Backups | **GitHub Actions to Cloudflare R2**, encrypted | - | Free |
| Secrets | **Google Secret Manager** | - | Free at this size |
| Domain | Any registrar | - | About Rs 700-1,000/year |
| **Total** | | | **About Rs 0-450/month** |

```
Customer browser
      |  HTTPS  (Cloudflare WAF, rate limiting, DDoS protection)
      v
Cloudflare Pages  -- static React files only, no secrets
      |  HTTPS  /api/...
      v
Cloud Run (FastAPI)  <-- database key from Secret Manager, never in code
      |  TLS
      v
Supabase Postgres (Mumbai, encrypted at rest, RLS on every table)
      |
      +--> nightly encrypted dump --> Cloudflare R2 (different company, 30-day history)
```

Two properties matter most:

- **The browser never touches the database.** Only your backend holds the database key. A stolen frontend file gives an attacker nothing.
- **Backups live at a different company from the database.** If your Supabase or Google account is ever lost or compromised, the data still exists.

### Why these three, specifically

- **Cloudflare Pages:** free *and* permitted for commercial use. Vercel's Hobby plan forbids commercial use, so a business site there needs a paid plan. Cloudflare also gives you a free web firewall and rate limiting, which directly protect your login and contact form.
- **Cloud Run:** scales to zero, so an idle shop costs nothing, and the free tier covers a single shop's traffic comfortably. It gives you HTTPS, managed secrets and a hard cap on instances so nobody can run up your bill. Alternatives like Render's free tier sleep after 15 minutes and take most of a minute to wake, which is unacceptable at a billing counter.
- **Supabase Free:** Postgres with encryption at rest, TLS in transit and row-level security. 500 MB of storage is a great many text rows; your product images are files on Cloudflare, not database rows. **The free plan's biggest gap for you is backups**, which section 10 closes for free. Pausing, size and no uptime guarantee are the other limits, covered with their workarounds in section 11.

---

## 3. Should you switch the stack? No, and here is the arithmetic

You said you are open to switching. I looked at it properly. Every alternative either costs more, costs developer days, or makes you responsible for security you currently get for free.

| Option | Monthly | Rewrite needed | Verdict |
|--------|---------|----------------|---------|
| **Recommended above** | **~$0-5** | **None** | **Do this** |
| Supabase Pro | ~$25 | None | Later, see section 11.4 and the triggers in section 14 |
| Neon free + Cloud Run | ~$0-5 | ~1 day (data layer) | Saves nothing. Neon does not pause the project the way Supabase Free does, which is a real plus, but not worth a rewrite today |
| Cloudflare Workers + D1 | ~$0 | **Weeks.** Rewrite FastAPI in TypeScript | No. You would be re-implementing GST and invoice logic in a new language. In a billing system, that is how you get wrong invoices |
| Small VPS (Hostinger/DO Bangalore) + Docker | ~$5 | ~1 day | **Costs more than free tiers and makes you the security team.** You patch the OS, run the firewall, renew TLS, configure backups and watch the logs. One missed patch exposes the PII. Not advisable without a system administrator |
| Oracle Cloud Always Free VM | $0 | ~1 day | Same self-management burden, and idle free instances can be reclaimed without much warning. Not for customer data |
| Google Cloud SQL | ~$10-30 | ~1 day | Costs about the same as Supabase Pro and needs the rewrite too |

**The rule for a business your size: a managed database on a free tier plus your own backups beats a cheaper server you have to secure yourself.** Your time is worth more than $5 a month, and a breach costs far more than either.

### The one change worth considering later

Your backend talks to Supabase through its client library, but there are only **11 call sites** ([app.py:44](backend/app.py#L44), [:136-138](backend/app.py#L136-L138), [:430-467](backend/app.py#L430-L467), [:525](backend/app.py#L525), [:548-582](backend/app.py#L548-L582)), and nine of them sit inside four helper functions. Swapping the client for plain Postgres (`psycopg`) is roughly a day of work and would let you move to Supabase, Neon, Cloud SQL or your own server without touching anything else.

Do not do this now. Note it as portability insurance for when the business is bigger. It changes no cost today.

---

## 4. Blockers: fix these before you go live

From [PROJECT_REVIEW.md](PROJECT_REVIEW.md). Items 1-6 are non-negotiable, because each one exposes customer data or loses it.

| # | Change | Risk if skipped |
|---|--------|-----------------|
| 1 | Require a valid token on the submissions list, read, update and delete endpoints ([app.py:666-695](backend/app.py#L666-L695)), and send it from [Submissions.jsx](frontend/src/pages/Submissions.jsx) | **Anyone can download or delete your whole customer list** |
| 2 | Delete the `shop1` / `shop123` seed from the SQL and from `ensure_seed_worker()` ([app.py:133-155](backend/app.py#L133-L155)); create your own login with a strong password | The password is published in this repo |
| 3 | Guard the `/submissions` page behind a login check ([App.jsx:96](frontend/src/App.jsx#L96)) | Customer data on screen for any visitor |
| 4 | Remove the in-memory fallback in production; return HTTP 503 when the database is unreachable ([app.py:29-45](backend/app.py#L29-L45), [:395-437](backend/app.py#L395-L437)) | Bills silently vanish on restart |
| 5 | Restrict CORS to your real domain instead of `*` ([app.py:22-28](backend/app.py#L22-L28)) | Any website can call your API using a logged-in manager's browser |
| 6 | Replace SHA-256 password hashing with bcrypt or argon2; give tokens an expiry ([app.py:129-131](backend/app.py#L129-L131)) | A database leak becomes a password leak within hours |
| 7 | Rate-limit login and the public contact form | Password guessing, spam floods |
| 8 | Stop the bill-ID overwrite and read billing settings from the database (review items 6 and 9) | Lost invoices, invoices carrying a placeholder GSTIN |

Budget a few days of developer time. Ask for tests on the login and bill-total code specifically, since mistakes there are legal and financial, not just technical.

---

## 5. Accounts and cost guards

1. A domain, for example `madhubantraders.in`.
2. [Cloudflare](https://cloudflare.com) (free). Point the domain's DNS at it.
3. [Google Cloud](https://cloud.google.com) with billing enabled. **Set a budget alert at $5** under Billing, Budgets & alerts, before you deploy anything.
4. [Supabase](https://supabase.com), Free plan.
5. [GitHub](https://github.com), with the repository set to **private**.

**Turn on two-step login on all five, plus the email account they all recover to.** This is the cheapest and most effective security control you will ever apply. An attacker who reaches your email can reset everything else.

---

## 6. Step 1: Database (Supabase Free, Mumbai)

1. Create a project. Region: **South Asia (Mumbai)**. Use a long random database password stored in a password manager.
2. In **SQL Editor**, run in order:
   1. `sql/database_setup.sql` — remove the default worker `INSERT` first (blocker 2)
   2. `sql/database_extra_setup.sql` — this enables row-level security
   3. `sql/products_seed.sql`
3. Under **Authentication, Policies**, confirm RLS shows **enabled** on `workers`, `products`, `bills`, `submissions` and `billing_settings`. With no public policies, the public `anon` key can read nothing; only your backend's service key works.
4. Create your real manager account:

   ```powershell
   python -c "import hashlib; print(hashlib.sha256(b'YOUR-STRONG-PASSWORD').hexdigest())"
   ```

   ```sql
   INSERT INTO workers (id, username, password_hash, name, role)
   VALUES ('w1', 'your-username', '<hash>', 'Owner', 'manager');
   ```

   Once blocker 6 is done, regenerate this with bcrypt instead.
5. **Settings, API:** copy the Project URL and the **service_role** key. That key is full access to all customer data. It goes into Secret Manager in the next step and nowhere else, ever. Not into the frontend, not into GitHub, not into WhatsApp or email.
6. Update the `billing_settings` row with your **real** GSTIN and FSSAI. The seed values are placeholders and would otherwise appear on live invoices.

---

## 7. Step 2: Backend (Cloud Run, Mumbai)

### 7.1 Fix the Dockerfile

Cloud Run chooses the port through `$PORT`. The current `backend/Dockerfile` hardcodes 5656, so the deploy would fail its health check. Replace the `CMD`, and stop running as root:

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

Also drop `google-cloud-firestore` from `requirements.txt` and delete the unused `backend/app-f.py`.

### 7.2 One-time cloud setup

```powershell
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

# Secrets live here, never in code or in plain env settings
"https://YOUR-PROJECT.supabase.co" | gcloud secrets create SUPABASE_URL --data-file=-
"YOUR-SERVICE-ROLE-KEY"            | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-

# A service account that can read those secrets and nothing else
gcloud iam service-accounts create madhuban-api --display-name "Madhuban API"
gcloud secrets add-iam-policy-binding SUPABASE_URL `
  --member "serviceAccount:madhuban-api@YOUR_PROJECT_ID.iam.gserviceaccount.com" --role roles/secretmanager.secretAccessor
gcloud secrets add-iam-policy-binding SUPABASE_SERVICE_ROLE_KEY `
  --member "serviceAccount:madhuban-api@YOUR_PROJECT_ID.iam.gserviceaccount.com" --role roles/secretmanager.secretAccessor
```

### 7.3 Deploy

```powershell
gcloud run deploy madhuban-api `
  --source backend `
  --region asia-south1 `
  --service-account madhuban-api@YOUR_PROJECT_ID.iam.gserviceaccount.com `
  --set-secrets SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest `
  --set-env-vars ALLOWED_ORIGINS=https://www.madhubantraders.in `
  --allow-unauthenticated `
  --min-instances 0 --max-instances 3 --memory 512Mi --concurrency 40
```

- **Never put `PORT` in `--set-env-vars`.** Cloud Run reserves it and the deploy fails. The existing workflows in `.github/workflows/` do this and need correcting.
- `--allow-unauthenticated` is required because the public website calls the API. Your own token checks protect the private endpoints, which is why blocker 1 matters.
- `--max-instances 3` caps your bill if someone floods the API.
- `--min-instances 0` is free when idle but adds a few seconds to the first request after a quiet spell. If the billing counter needs to be instant, `--min-instances 1` costs a few dollars a month. Start at 0 and see whether staff complain.
- `ALLOWED_ORIGINS` only works once blocker 5 makes the CORS setting read it.

Verify before going further:

```powershell
curl https://madhuban-api-xxxx.a.run.app/api/health
```

It must report `"database": "supabase"`. If it says `in-memory`, your secrets are wrong and **every bill will be lost on restart**. Stop and fix it.

---

## 8. Step 3: Website (Cloudflare Pages)

1. Cloudflare, **Workers & Pages, Create, Pages, Connect to Git**, select this repository.
2. Build settings:

   | Setting | Value |
   |---------|-------|
   | Root directory | `frontend` |
   | Build command | `npm run build` |
   | Output directory | `dist` |
   | Environment variable | `VITE_API_BASE_URL` = `https://madhuban-api-xxxx.a.run.app/api` |

3. Add two files in `frontend/public/` so the build copies them out.

   `_redirects`, so direct links like `/catalog` work instead of returning 404:

   ```
   /*  /index.html  200
   ```

   `_headers`:

   ```
   /*
     X-Content-Type-Options: nosniff
     X-Frame-Options: DENY
     Referrer-Policy: strict-origin-when-cross-origin
     Permissions-Policy: camera=(), microphone=(), geolocation=()
     Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```

4. **Custom domains:** add `www.madhubantraders.in`. HTTPS is issued automatically.
5. **Security, WAF, Rate limiting rules:** add a rule limiting `/api/auth/login` to about 5 requests per minute per IP, and the contact form path similarly. Turn on **Bot Fight Mode**. Both are on the free plan and directly protect the PII endpoints.
6. Redeploy the backend if `ALLOWED_ORIGINS` needs to change to this final domain.

---

## 9. Protecting the PII specifically

Hosting is now solid. These are the data-handling practices that matter under India's DPDP Act 2023 and simple good sense.

### Collect and keep less

- **Ask only for what a bill needs.** Every extra field is something to lose.
- **Set a retention rule for contact submissions.** Inquiries are not tax records. Delete them after 12-24 months with a scheduled job. Fewer old records means a smaller loss if anything goes wrong.
- **Tax invoices are different:** GST law requires keeping them for 72 months from the due date of the relevant annual return. Confirm the exact period with your accountant, and do not delete bills to save space.

### Consent and notice

- [InquiryForm.jsx](frontend/src/components/InquiryForm.jsx) has no consent text. Add a short line near the submit button: what you collect, why, and a link to your privacy policy. The `/privacy` page already exists; make sure it names the data you actually collect and how someone can ask for deletion.
- Give customers a way to request their data or its deletion, even if it is just a monitored email address on the privacy page.

### Know where PII leaves your system

- [Cart.jsx:85-87](frontend/src/pages/Cart.jsx#L85-L87) opens a `wa.me` link containing the customer's details, so that data reaches Meta. This is normal for Indian retail, but your privacy policy should say WhatsApp is used for order communication.
- Do not paste customer lists into spreadsheets on personal laptops, or into chat tools. Exports are the most common real-world leak.

### Never log PII

- Keep names, phone numbers, addresses and GSTINs out of log lines and error messages. The current code prints exception text on database failures ([app.py:429-437](backend/app.py#L429-L437)), which can include row data. Cloud Run logs are retained and readable by anyone with project access.
- If you add error tracking such as Sentry later, turn on its PII scrubbing.

### Control and record access

- One account per staff member. Never share a login, so that an export can be traced to a person.
- Add an audit record for sensitive actions: who listed submissions, who exported, who deleted. A small `audit_log` table with actor, action, timestamp is enough, and it is what tells you the scope of an incident.
- Enforce the `role` column. Today any logged-in worker can edit products, settings and bills ([PROJECT_REVIEW.md](PROJECT_REVIEW.md) item 13). A cashier does not need to delete customer records.
- Remove access the same day someone leaves, and clear their token: `UPDATE workers SET token = NULL WHERE username = '...';`

### Checklist

- [ ] Two-step login on Google, Cloudflare, Supabase, GitHub, registrar and recovery email
- [ ] Service key only in Secret Manager; `git ls-files | findstr .env` returns nothing
- [ ] RLS enabled on every table; `anon` key has no access
- [ ] Every submissions and billing endpoint requires a token
- [ ] Default `shop1` account deleted
- [ ] CORS limited to your domain; rate limits active
- [ ] Passwords hashed with bcrypt/argon2; tokens expire
- [ ] No PII in logs; consent notice on forms; retention rule for submissions
- [ ] Budget alert and `--max-instances` set

---

## 10. Backups: the one thing the free plan does not give you

Supabase Free has no dependable backups. This replaces them at no cost, and stores the copy at a **different company** from your database, which is stronger than what Pro alone gives you.

### 10.1 Setup

1. **Cloudflare R2:** create a **private** bucket `madhuban-backups`. R2 may ask for a card but stays free within 10 GB. Add a lifecycle rule deleting objects older than 30 days.
2. **R2 API token:** Object Read & Write, scoped to that bucket only. Save the Access Key ID, Secret and account ID.
3. **Connection string:** Supabase, Connect, **Session pooler** URI. Use the pooler, not the direct address, because GitHub runners are IPv4-only and the direct host is IPv6-only on the free plan.
4. **Passphrase:** generate a long random one. Store it in your password manager **and on paper somewhere safe**. Without it the backups are unreadable, including by you.
5. GitHub, Settings, Secrets and variables, Actions, add: `DB_URL`, `BACKUP_PASSPHRASE`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.

### 10.2 `.github/workflows/db-backup.yml`

```yaml
name: Daily database backup

on:
  schedule:
    - cron: "30 20 * * *"   # 02:00 IST
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Dump database
        env:
          DB_URL: ${{ secrets.DB_URL }}
        run: |
          docker run --rm -e DB_URL postgres:17 sh -c 'pg_dump "$DB_URL" -F c --no-owner' > backup.dump
          test -s backup.dump

      - name: Encrypt
        env:
          BACKUP_PASSPHRASE: ${{ secrets.BACKUP_PASSPHRASE }}
        run: |
          gpg --batch --yes --pinentry-mode loopback --passphrase "$BACKUP_PASSPHRASE" \
              --symmetric --cipher-algo AES256 -o backup.dump.gpg backup.dump
          rm backup.dump

      - name: Upload to R2
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: auto
        run: |
          aws s3 cp backup.dump.gpg \
            "s3://madhuban-backups/madhuban-$(date -u +%F).dump.gpg" \
            --endpoint-url "https://${{ secrets.R2_ACCOUNT_ID }}.r2.cloudflarestorage.com"
```

The unencrypted dump is deleted before upload, and the stored file is AES-256 encrypted, so no readable PII sits in GitHub or R2.

**Turn on GitHub notifications for failed workflows** (Settings, Notifications, Actions). A backup failing silently is worse than no backup, because you will believe you are covered.

A useful side effect: this job touches the database daily, which stops a Supabase free project from pausing through inactivity.

### 10.3 Test the restore, once, before going live

```powershell
# 1. Download a file from R2, then:
gpg --batch --pinentry-mode loopback --passphrase "YOUR-PASSPHRASE" -o backup.dump -d madhuban-2026-01-01.dump.gpg
# 2. Restore into a throwaway second free Supabase project:
pg_restore --no-owner --clean --if-exists -d "SCRATCH-DB-URL" backup.dump
```

Check the bills and products arrived, then delete the scratch project. **A backup you have never restored is a guess, not a backup.**

### 10.4 Second copy

Once a month, download the newest file to an external drive kept at the shop or at home. That covers the case where a cloud account is locked or compromised.

---

## 11. Supabase Free: limits, risk and how to deal with them

The free plan is a real trade-off, not a free lunch. This section lists every limit, what it can do to your business, and what to do about it. Limits below are from memory of Supabase's published plans, so check them on the pricing page before you rely on them.

### 11.1 Be clear about what the risk is

The free plan **does not make customer data less private.** Encryption, row-level security and TLS are the same on Free and Pro. What Free weakens is **durability and availability**: whether your data can be recovered, and whether the system is up.

| Risk | Free plan | Pro plan | What actually decides it |
|------|-----------|----------|--------------------------|
| Stranger reads customer data | Same | Same | **Your code** (section 4 blockers) |
| Data lost or corrupted | Up to your last backup | Daily managed backups, plus optional point-in-time | Backups (section 10) |
| System unavailable | Paused project, no uptime guarantee | No pausing, better compute | Monitoring, and how much downtime you can absorb |

So the honest question is not "is Free secure?" but **"how much data loss and downtime can the business tolerate?"**

### 11.2 The limits and how to handle each

| Free-plan limit | What it can do to you | How to deal with it |
|-----------------|----------------------|---------------------|
| **No automatic backups** | Deleted or corrupted data cannot be recovered by Supabase | Nightly encrypted backup to Cloudflare R2 (section 10). Test a restore once before going live. This is mandatory, not optional |
| **No point-in-time recovery** | You can lose everything since the last backup, up to a day | Run the backup every 6 hours instead of daily (see 11.3). Print or save each invoice as a PDF at the time of issue, so bills exist outside the database |
| **Pauses after about 1 week of inactivity** | Site and billing stop until you un-pause in the dashboard. Paused projects are kept for a limited period (about 90 days, I believe), after which only a backup download remains | The backup job touches the database daily. Add an uptime monitor on `/api/health` that runs one tiny query, and alert your phone. Never ignore a "down" alert |
| **500 MB database size** | Over the limit the database becomes **read-only**, so new bills fail to save | A bill is a few KB, so 500 MB is on the order of 100,000 bills. Check usage monthly (Settings, Usage) and act at about 350 MB. Delete old contact submissions on a retention schedule. **Never delete tax invoices.** Upgrade before you hit the limit |
| **About 5 GB monthly data transfer** | Overage can restrict the project | Product images are on Cloudflare, not in the database. Your code loads every bill on each request, which wastes transfer, so add pagination ([PROJECT_REVIEW.md](PROJECT_REVIEW.md) item 6) |
| **Small shared compute** | Reports and history pages can be slow | Fine for one shop once the "load all rows" queries are fixed. Slowness is your signal to upgrade |
| **No uptime guarantee, community support only** | An outage at Supabase means waiting | Uptime monitor with phone alerts. Return HTTP 503 with a clear "temporarily unavailable" message. Keep a numbered paper invoice book as an outage fallback and enter those bills afterwards |
| **Short log retention (about a day)** | You cannot investigate an incident after the fact | Treat Cloud Run logs as your main record and keep an `audit_log` table in your own database (section 9) |
| **Some network-hardening options are paid** | Fewer controls over who can reach the database | Rely on what you control: RLS on every table, service key only in Secret Manager, a token check on every private endpoint |
| **2 free projects** | One live, one spare | Use the spare as a scratch project for restore tests, then wipe it |

Your setup already avoids two other free-plan limits: the backend uses Supabase's API rather than direct connections, so connection limits rarely matter, and you use neither Supabase auth nor file storage.

### 11.3 Cut the data-loss window for free: back up every 6 hours

In `.github/workflows/db-backup.yml` (section 10.2), change the schedule:

```yaml
on:
  schedule:
    - cron: "30 */6 * * *"   # every 6 hours (UTC)
  workflow_dispatch:
```

The job takes a couple of minutes, so four runs a day fits comfortably in GitHub's free minutes for private repositories. Your worst-case loss drops from about a day to about six hours, at no cost. Adjust the lifecycle rule on the R2 bucket so it keeps 30 days of files (about 120 small files).

### 11.4 If this is still too risky for you, here is the honest ladder

You said the free plan feels risky. For a business holding customer PII and tax invoices, that instinct is reasonable. Choose by how much loss you can accept:

| Level | Monthly | Worst-case data loss | Downtime risk | Choose it when |
|-------|---------|---------------------|---------------|----------------|
| **A. Free + 6-hourly backups + PDF invoices** | ~$0 | ~6 hours | Possible pause or outage, you act on the alert | Launch and low volume; you can re-enter a few hours of bills by hand |
| **B. Supabase Pro + your own backups** | ~$25 | Managed daily backups (about 7 days kept), plus your own copies | No pausing, better compute | Real customers and real invoices flow every day |
| **C. Pro plus point-in-time recovery add-on** | ~$25 plus add-on | Minutes | Same as B | You cannot afford to lose even an hour of bills |

Two recommendations:

1. **Start on level A while you test and launch, and move to level B on the day real customer data starts arriving daily.** You lose nothing by waiting, because the upgrade is a plan switch with no code change, and you avoid paying $25 a month for an empty database.
2. **Keep your own encrypted R2 backups even after upgrading.** A backup at a different company protects you from a lost or compromised Supabase account, which Supabase's own backups cannot.

If even level B is too much for now, the priority order for spending is: (1) the security fixes in section 4, (2) tested backups, (3) monitoring, and only then (4) a paid database plan. Paying for Pro without the first three would protect less than the free plan with all three.

---

## 12. Monitoring and upkeep

- **Uptime:** free UptimeRobot or Better Stack on the website and on `/api/health`, alerting your phone. Make `/api/health` run one small database query so the check also catches a database outage.
- **First month:** check weekly that a new backup file appeared each day, that its size is growing slowly, and that Cloud Run logs show no repeated errors.
- **Monthly:** database size under Supabase Settings, Usage. Act at 350 MB. Run `npm audit` in `frontend/` and `pip list --outdated` in `backend/`, then update, test and redeploy. Turn on GitHub Dependabot (free).
- **Quarterly:** review who has access to each account and the rows in `workers`.

---

## 13. Go-live order

1. Fix blockers 1-8 (section 4) and test locally, per [howtorun.md](howtorun.md).
2. Create the Supabase Free project in Mumbai, run the SQL, create your own manager login, set the real GSTIN and FSSAI.
3. Deploy the backend; confirm `/api/health` reports `supabase`.
4. Deploy the website; connect the domain; add the WAF rate-limit rules.
5. Set up R2 and the backup workflow; run it by hand; **test a restore**.
6. Turn on the uptime monitor, budget alert and GitHub failure emails.
7. Test the live flow end to end: browse, inquire, log in, create a bill, print, view history.
8. **Test the protection.** In a private browser window, logged out, open `/api/submissions` and `/api/bills`. Both must return **401**. If either returns data, do not go live.
9. Issue staff their own logins. Delete every shared or test account.

---

## 14. When to spend more

| Trigger | Upgrade | Cost |
|---------|---------|------|
| Database passes ~350 MB | Supabase Pro | ~$25/mo |
| Losing up to a day of data is unacceptable | Supabase Pro plus point-in-time recovery | ~$25/mo+ |
| Staff complain the billing screen is slow after idle periods | Cloud Run `--min-instances 1` | A few $/mo |
| Several shops or staff depend on it daily | Pro, plus per-role permissions and an audit log | ~$25/mo |
| You want freedom to move providers | Swap the Supabase client for `psycopg` (section 3) | ~1 developer-day |
| Online payments | Razorpay or similar; **never store card data yourself** | Per transaction |

Switching from Supabase Free to Pro is a plan change with no code change, so you can defer it until a trigger actually fires.

---

## 15. If something goes wrong

**A key or password may have leaked**

1. Rotate the Supabase service key (Settings, API), then update the secret and redeploy:
   ```powershell
   "NEW-KEY" | gcloud secrets versions add SUPABASE_SERVICE_ROLE_KEY --data-file=-
   gcloud run services update madhuban-api --region asia-south1
   ```
2. Invalidate every session: `UPDATE workers SET token = NULL;`
3. Change all worker passwords.
4. Review Cloud Run and Supabase logs for unfamiliar access, and your audit log if you built one.
5. **If customer data was exposed**, write down what, when and how many people. Get legal advice promptly: the DPDP Act carries breach-reporting duties, and the penalties for mishandling a breach are far larger than the cost of reporting it.

**The site is down**

1. Check the Cloudflare and Google Cloud status pages.
2. Read the Cloud Run logs.
3. Roll back: Cloud Run, Revisions, route 100% of traffic to the last good revision; Cloudflare Pages, Deployments, roll back.

**Data deleted or corrupted**

1. Stop further writes (scale Cloud Run to 0 instances).
2. Restore the most recent R2 backup into a fresh database, verify it, then repoint the backend.
3. Expect to lose up to one day. That gap is the price of the free plan, and the reason to upgrade when it stops being acceptable.

---

## Cost summary

| Item | Monthly |
|------|---------|
| Cloudflare Pages, DNS, WAF, R2 backups | Free |
| Cloud Run, Secret Manager, logging (low traffic) | Free to a few hundred rupees |
| Supabase Free | Free |
| GitHub Actions backups (private repo) | Free |
| Domain | About Rs 60-85 |
| **Total** | **About Rs 0-450 (roughly $0-5)** |

Compared with the Supabase Pro version of this setup, you save roughly $300 a year, in exchange for about an hour of backup setup and a 30-second weekly check.

The developer time to fix the blockers in section 4 is not optional in either version.

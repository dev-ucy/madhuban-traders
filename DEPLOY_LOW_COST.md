# Lowest-Cost Live Setup (about $0 per month, with safe backups)

This replaces the database choice in [DEPLOY_LIVE.md](DEPLOY_LIVE.md). Everything else in that file (Cloud Run, Cloudflare Pages, the security checklist, the "fix before going live" list) still applies.

Prices and free-plan limits change. Confirm them on each provider's pricing page before you rely on them.

---

## 1. The recommendation

**Keep Supabase, but use the Free plan, and replace what Pro gives you (backups) with your own automatic encrypted backups.**

| Part | Service | Monthly cost |
|------|---------|--------------|
| Website | Cloudflare Pages | Free |
| Backend | Google Cloud Run (Mumbai, max 3 instances) | Free at small traffic |
| Database | Supabase **Free** (Mumbai) | Free |
| Backups | GitHub Actions (daily) into Cloudflare R2 (10 GB free), encrypted | Free |
| Secrets | Google Secret Manager | Free at this size |
| Domain | Any registrar | About Rs 60-85 (yearly cost spread out) |
| **Total** | | **About Rs 0-100 per month** |

### Why this is the best low-cost option for you

- **No code rewrite.** The backend already uses the Supabase client. Any other database (Neon, a VPS with Postgres, Cloud SQL) means rewriting the data layer in `backend/app.py`, which costs developer time and adds risk to a billing system.
- **The security features you need are on the free plan.** Data is encrypted at rest and in transit (TLS), row-level security works, and the service key stays on your backend.
- **Size is not a problem.** The free plan gives 500 MB of database space. Bills and customer records are small text rows, and product images are files on Cloudflare, not in the database. That is room for many tens of thousands of bills. Check usage in the Supabase dashboard every few months.
- **The one real gap is backups**, and the workflow below closes it for free.

### What you give up compared with Pro

| Missing on Free | What to do instead |
|-----------------|--------------------|
| Automatic daily backups | Your own daily encrypted backup (section 3) |
| Point-in-time recovery | Daily backups mean you can lose at most one day of data. Move to Pro if that is too much |
| Uptime guarantee and support | Uptime monitor (section 5). Accept that support is community-only |
| Project pauses after about 1 week with no activity | You use it daily, and the backup job touches it every day. If it ever pauses, restore it from the dashboard (paused projects are normally kept for a limited time, so do not leave it paused for months) |
| Smaller shared compute | Fine for one shop. Upgrade when the billing screen slows down |
| Some network-hardening options | Rely on RLS, strong passwords and a locked-down backend instead |

### When to move to Supabase Pro (about $25)

Upgrade when **any** of these is true:
- Database size passes about 350 MB.
- Losing up to a day of data would be unacceptable (you want point-in-time recovery).
- Downtime during business hours is costing you money.
- You have several shops or staff depending on the system every day.

Because the code does not change, the upgrade is a plan switch with no migration.

---

## 2. Setup

Follow [DEPLOY_LIVE.md](DEPLOY_LIVE.md) sections 2 to 7, with one difference in section 4: when you create the Supabase project, choose the **Free** plan (still pick the **Mumbai** region). Do not skip the security work in section 2 of that file. A free database holding unprotected customer data is still a leak.

---

## 3. Free automatic daily backup (the important part)

Idea: every night a GitHub job dumps the database, encrypts it, and uploads it to storage in a different company (Cloudflare). If Supabase, your Google account or your PC fails, the data is still safe.

### 3.1 One-time setup

1. **Cloudflare R2 bucket.** In Cloudflare, go to R2, create a **private** bucket named `madhuban-backups`. (R2 may ask for a payment card, but stays free within 10 GB.) Add a **lifecycle rule** to delete objects older than 30 days.
2. **R2 API token.** R2, Manage API tokens, create a token with **Object Read & Write** limited to that one bucket. Save the Access Key ID, Secret and your account ID.
3. **Database connection string.** Supabase, Connect, **Session pooler** URI. Use the pooler, not the direct connection, because GitHub's servers only have IPv4 and the direct address is IPv6 only on the free plan. Put your database password in the string.
4. **Encryption passphrase.** Generate a long random passphrase and store it in your password manager **and** on paper somewhere safe. Without it the backups cannot be opened.
5. In your GitHub repo, go to Settings, Secrets and variables, Actions, and add these secrets:

   | Secret | Value |
   |--------|-------|
   | `DB_URL` | Session pooler connection string |
   | `BACKUP_PASSPHRASE` | The long passphrase |
   | `R2_ACCOUNT_ID` | Cloudflare account ID |
   | `R2_ACCESS_KEY_ID` | R2 token key ID |
   | `R2_SECRET_ACCESS_KEY` | R2 token secret |

### 3.2 The workflow file

Create `.github/workflows/db-backup.yml` in the repo (this is a new file; ask a developer if you prefer):

```yaml
name: Daily database backup

on:
  schedule:
    - cron: "30 20 * * *"   # 02:00 IST every day
  workflow_dispatch:         # lets you run it by hand

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
          # Use a recent client so it matches the server version
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

Notes:
- The repository must be **private**. Nothing readable is stored in GitHub: the dump is deleted before upload and the file in R2 is encrypted.
- Turn on GitHub email alerts for failed workflows (GitHub, Settings, Notifications, Actions). A backup that fails silently is worse than none.
- Run it once by hand (Actions tab, Run workflow) and check the file appears in R2.

### 3.3 Test the restore (do this once, before going live)

1. Download one file from R2.
2. Decrypt: `gpg --batch --pinentry-mode loopback --passphrase "YOUR-PASSPHRASE" -o backup.dump -d madhuban-2026-01-01.dump.gpg`
3. Create a second free Supabase project (a scratch one) and restore into it:
   `pg_restore --no-owner --clean --if-exists -d "SCRATCH-DB-URL" backup.dump`
4. Open the scratch project and check the bills and products are there. Then delete the scratch project.

If you have never restored a backup, you do not have a backup.

### 3.4 Keep a second copy (optional, free)

Once a month, download the newest file from R2 to an external drive kept at home. This protects you if one cloud account is ever locked or hacked.

---

## 4. Other cheap options and why they are second choice

| Option | Cost | Verdict |
|--------|------|---------|
| **Neon** (managed Postgres) free plan | Free to a few dollars | Needs the backend data layer rewritten from the Supabase client to plain SQL. Free plan has only a short history window. Not worth the rewrite while Supabase Free works |
| **Small VPS** running Postgres + backend (about $5-6 per month, for example in Bangalore/Mumbai) | About $5-6 | Full control, but you (or a hired admin) must patch the server, set up the firewall, TLS, backups and monitoring. One mistake exposes the data. Needs a data-layer rewrite too. Not recommended without a system administrator |
| **Oracle Cloud "Always Free" VM** | Free | Same self-management burden, and idle free instances can be reclaimed. Not recommended for customer data |
| **Google Cloud SQL** | Roughly $10-30+ | Costs about as much as Supabase Pro, and needs the rewrite |
| **Supabase Pro** | About $25 | Best when the business is bigger. See upgrade triggers above |

The rule: **a cheap managed database plus your own backups beats a cheaper database you have to secure yourself.**

---

## 5. Keeping the free setup safe and running

- **Uptime monitor** (free UptimeRobot or Better Stack) on the website and on `/api/health`, with alerts to your phone. Make `/api/health` run one tiny database query so the check also shows a database problem.
- **Check R2 weekly for the first month:** a new file each day, roughly the same size (it should slowly grow).
- **Check database size monthly:** Supabase, Settings, Usage. Alert yourself at 350 MB.
- **Cost guard:** Google Cloud budget alert at $5, and Cloud Run `--max-instances 3`.
- **Everything else in the security checklist** in [DEPLOY_LIVE.md](DEPLOY_LIVE.md) section 7 still applies: two-step login on every account, RLS on all tables, no default password, token checks on submissions, rate limits, CORS limited to your domain.

## 6. Revised cost summary

| | Before (Pro) | Now (Free + own backups) |
|---|---|---|
| Database | About $25 | $0 |
| Backups | Included | $0 (GitHub Actions + R2) |
| Website + backend | About $0-5 | About $0-5 |
| **Monthly total** | **About $25-35** | **About $0-5, plus domain** |

Yearly saving: roughly $300, in exchange for about an hour of setup and a 30-second check on the backup each week.

## 7. Go-live order (low-cost version)

1. Do the required code and security fixes ([DEPLOY_LIVE.md](DEPLOY_LIVE.md) section 2).
2. Create the **Free** Supabase project (Mumbai), run the SQL, create your own manager login.
3. Deploy the backend to Cloud Run and confirm `/api/health` shows `supabase`.
4. Deploy the site to Cloudflare Pages and connect the domain.
5. Set up the R2 bucket, secrets and `db-backup.yml`; run it by hand; **test a restore**.
6. Turn on the uptime monitor, budget alert and GitHub failure emails.
7. Test the live flow, and check that `/api/submissions` and `/api/bills` return **401** when logged out.
8. Go live. Review database size, backups and logs weekly for the first month, then monthly.

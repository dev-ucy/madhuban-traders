# Madhuban Traders: Project Review

Review date: 2026-09-19
Scope: `backend/`, `frontend/`, `sql/`, `docker-compose.yml`, `.github/workflows/`
Method: static read of the code and config. Nothing was run or changed. Each item lists file and line, so it can be checked against the code.

Severity: **Critical** (security or data loss in production), **High** (breaks a feature or deployment), **Medium** (wrong behaviour in some cases), **Low** (cleanup).

---

## Summary

| # | Severity | Issue |
|---|----------|-------|
| 1 | Critical | Submissions API has no authentication (view, edit and delete customer data) |
| 2 | Critical | Production deploy is misconfigured: backend falls back to in-memory storage and the workflows are written for Firestore |
| 3 | Critical | Backend Docker image and Cloud Run workflows disagree on the port |
| 4 | Critical | Default credentials `shop1` / `shop123` are seeded automatically |
| 5 | High | Silent fallback to in-memory storage hides database errors and loses data |
| 6 | High | Bill IDs and invoice numbers can collide, and a collision overwrites an existing bill |
| 7 | High | Bill totals are trusted from the client and `totalAmount` defaults to 0 |
| 8 | High | `PUT /api/products/{id}` resets fields to defaults on partial updates |
| 9 | High | Billing settings are never read back from the database |
| 10 | High | Issued bills can be edited freely (`PUT /api/bills/{id}`) |
| 11 | High | Frontend pages guard access on the client only; `/submissions` has no guard |
| 12 | Medium | GST and invoice rules are only approximately implemented |
| 13 | Medium | Weak authentication design (unsalted SHA-256, plaintext non-expiring token, no rate limit) |
| 14 | Medium | CORS `*` together with `allow_credentials=True` |
| 15 | Medium | Seeding code writes wrong column names, and `GET /products` seeds fake data |
| 16 | Medium | Frontend production API fallback is inconsistent and points to `localhost:8000` |
| 17 | Medium | Hard-coded sample line items and business data in the bill generator |
| 18 | Medium | `navigate()` called during render |
| 19 | Low | Dead and duplicate files, stale docs, unused dependency |
| 20 | Low | Unpinned dependencies, no tests, no lint, no CI checks |

---

## Critical

### 1. Submissions API has no authentication
[backend/app.py:666-695](backend/app.py#L666-L695)

`GET /api/submissions`, `GET /api/submissions/{id}`, `PUT /api/submissions/{id}` and `DELETE /api/submissions/{id}` take no `Authorization` header and never call `verify_token`. Anyone who knows the URL can read every customer's name, phone, email, address and cart, or edit and delete records. Only `POST /api/submissions` should be public.

The frontend `/submissions` page also calls these without a token ([Submissions.jsx:55](frontend/src/pages/Submissions.jsx#L55), [:134](frontend/src/pages/Submissions.jsx#L134), [:178](frontend/src/pages/Submissions.jsx#L178)).

Also related: `POST /api/submissions` has no rate limit or size limit, so it can be used to flood the table.

**Fix:** require `verify_token` on the list, get, update and delete routes, send the token from the frontend, add rate limiting or a captcha to the public POST.

### 2. Production deploy targets the wrong backend
[.github/workflows/backend-cloudrun.yml](.github/workflows/backend-cloudrun.yml)

- The workflow sets only `FIRESTORE_PROJECT_ID` and `GOOGLE_CLOUD_PROJECT`. The code (`app.py`) uses Supabase and reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, so the deployed service starts with the message "Supabase credentials missing. Using in-memory fallback."
- Result: production runs without a database. Every bill, submission and billing setting is lost on restart, and Cloud Run runs several instances, each with its own separate memory.
- The last step grants `roles/datastore.user` (Firestore access) that nothing uses any more.
- `backend/app-f.py` is the old Firestore version, and `requirements.txt` still installs `google-cloud-firestore`.

**Fix:** pass the Supabase values (ideally from Secret Manager, not plain `--set-env-vars`), remove the Firestore role and dependency, and make the service fail at startup when the database is unreachable in production (see #5).

### 3. Port mismatch on Cloud Run
[backend/Dockerfile](backend/Dockerfile), [backend-cloudrun.yml](.github/workflows/backend-cloudrun.yml), [frontend-cloudrun.yml](.github/workflows/frontend-cloudrun.yml)

- Backend: the Dockerfile has `CMD ["gunicorn", ..., "--bind", "0.0.0.0:5656"]` and ignores `$PORT`. The workflow sets `PORT=8080`. Cloud Run sends traffic to 8080 (its default) and nothing listens there, so the revision fails its startup check.
- Both workflows pass `--set-env-vars PORT=...`. `PORT` is a reserved variable on Cloud Run, and setting it makes the deploy command fail.
- Frontend: the generated image runs nginx on port 80 and the workflow sets `PORT=80`, with no `--port 80` flag. Cloud Run again expects 8080.
- The generated nginx config has no SPA fallback (`try_files ... /index.html`). Direct links such as `/catalog` or `/billing` return an nginx 404. The `postbuild` script that copies `index.html` to `404.html` does not help because nginx is not configured to serve it.

**Fix:** bind to `${PORT:-8080}` in the backend CMD (shell form), remove `PORT` from `--set-env-vars`, pass `--port 80` (or make nginx listen on 8080) for the frontend, and add an nginx config with `try_files $uri /index.html`.

### 4. Default credentials seeded automatically
[sql/database_setup.sql:20](sql/database_setup.sql#L20), [backend/app.py:133-155](backend/app.py#L133-L155)

A manager account `shop1` / `shop123` is created by the SQL script and again by `ensure_seed_worker()` at every startup. The password is in the docs and in the source. Anyone can log in to the billing area of a fresh deployment.

**Fix:** remove the seed from the code, create the first manager with a one-off script using a strong password, and force a change on first login.

---

## High

### 5. Silent fallback to in-memory storage
[backend/app.py:29-45](backend/app.py#L29-L45), [:395-437](backend/app.py#L395-L437)

`list_documents`, `get_document` and `save_document` catch every Supabase exception, print a line, and switch to the in-memory dict. If Supabase is briefly down or a column name is wrong, writes look successful (HTTP 200) but exist only in one process's memory. Reads then return a mix of database and memory data.

`delete_document` behaves differently: it does not catch exceptions, so a database error becomes a 500.

**Fix:** in production, fail loudly (return 503) instead of falling back. Keep the in-memory store only behind an explicit `DEV_IN_MEMORY=true` flag.

### 6. Bill ID and invoice number race conditions
[backend/app.py:729-731](backend/app.py#L729-L731), [:348-354](backend/app.py#L348-L354)

Both the bill `id` (`max(existing)+1`) and the invoice number (`highest sequence + 1`) are computed by reading all bills, then writing. Two requests at the same moment compute the same values.

- Same `id`: `save_document` uses `upsert`, so the second bill **silently overwrites the first**. A legal invoice is lost.
- Same `bill_number`: the column is `UNIQUE`, so one request fails with a database error (turned into a silent in-memory save by #5).

It also loads **every bill** on each create just to find the maximum, which gets slower as data grows.

The expression `... if str(id).isdigit() else 999` means non-numeric IDs count as 999, so the next id can jump.

**Fix:** use a database sequence or `INSERT` (not `upsert`) with a retry, and generate the invoice number in the database.

### 7. Totals are trusted from the client
[backend/app.py:735-763](backend/app.py#L735-L763)

- `BillPayload.totalAmount` defaults to `0`, so `payload.totalAmount is not None` is always true. The fallback to the server-computed `gst_breakdown["netAmount"]` can never run. A client that omits the field gets a bill with total 0.
- When it is sent, the client's value is stored as-is even if it differs from the server's calculation. Prices, GST rate and discount all come from the request body, not from the products table. A tampered request can create a bill with any total.
- The server GST maths adds tax on top of `price * qty`, then subtracts the bill-level discount from the tax-inclusive total. If prices in the UI are tax-inclusive (the sample "Little Oil" price of `186.67` looks like a back-calculated value), the two disagree.
- B2C high-value validation (> Rs 50,000) uses the client's `totalAmount`.

**Fix:** treat the server calculation as the source of truth, reject or overwrite mismatches, and look up price and GST rate by product id.

### 8. Partial product updates wipe fields
[backend/app.py:646-654](backend/app.py#L646-L654), [:80-99](backend/app.py#L80-L99)

`ProductPayload` has defaults for almost every field (`price=0`, `category="General"`, `stock=0`, `ingredients=[]`, `gstRate=5`, ...). `payload.model_dump(exclude_none=True)` therefore always contains all of them. A `PUT` that sends only `{"stock": 10}` resets `price` to 0, `category` to "General", `gstRate` to 5 and empties the lists. `exclude_none` does not help because the defaults are not `None`.

**Fix:** use `model_dump(exclude_unset=True)` for updates, or make the fields `Optional` with `None` defaults. Also validate `price >= 0`, `stock >= 0`, `0 <= gstRate <= 28`, and require `name` (the DB column is `NOT NULL`, the model allows `None`).

### 9. Billing settings are not read from the database
[backend/app.py:385-393](backend/app.py#L385-L393), [:704-714](backend/app.py#L704-L714)

`get_billing_settings()` reads only `fallback_store`. `update_billing_settings` writes to both, but after a restart, or on another Cloud Run instance, the settings revert to the hard-coded defaults, including the **placeholder GSTIN `09AAAAA0000A1Z5`**. New invoices can then be issued with a fake GSTIN without any error.

**Fix:** read from the `billing_settings` table, cache with care, and refuse to issue bills while GSTIN or FSSAI is still the placeholder.

### 10. Issued bills are editable
[backend/app.py:816-825](backend/app.py#L816-L825)

`PUT /api/bills/{id}` accepts any JSON dict and merges it into the stored bill. There is no field whitelist, no validation, no recalculation and no audit trail. A caller can change totals, customer, `createdBy`, `billNumber`, or add unknown keys (which then break the upsert because the columns don't exist). Under GST rules an issued tax invoice should not be altered; corrections are made with a credit or debit note.

**Fix:** allow only status changes such as cancel, keep history, and add a credit-note flow for changes.

### 11. Client-side-only route protection
[frontend/src/App.jsx:97-104](frontend/src/App.jsx#L97-L104), [frontend/src/pages/Submissions.jsx](frontend/src/pages/Submissions.jsx)

- `/submissions` is listed as a billing path but has no auth check and no redirect. Anyone can open it and see the data from #1.
- Other pages redirect when `worker` is empty, but only after render. This is fine for UX, not for security. The backend must enforce access (it does for bills, not for submissions).
- `BillingContext` stores the token in `localStorage`, which any XSS can read.

---

## Medium

### 12. GST and invoice rules only partly implemented
[backend/app.py:288-360](backend/app.py#L288-L360)

- `generate_invoice_number` names its variable `fy_suffix` but uses the **calendar year** (`%Y`). Indian financial year runs April to March, and the sequence must restart each financial year. Here the sequence never restarts.
- `get_hsn_minimum_digits` switches to 6 digits at an invoice total of Rs 5 crore. The GST rule depends on the supplier's **annual turnover**, not the single invoice value. (Confirm the exact rule with an accountant.)
- `validate_liquid_oil_package` returns early when quantity is a number. Since the UI sends numeric quantities (see `BillGenerator.jsx`), the pack-size check almost never runs. It also matches any product whose name contains "oil", including non-liquid items.
- Inter-state detection defaults the customer state to the supplier state when it is missing, so a missing state code means CGST and SGST rather than IGST.
- GSTIN validation checks the format only, not the checksum digit.
- Stock is never reduced when a bill is created.

### 13. Weak authentication design
[backend/app.py:129-131](backend/app.py#L129-L131), [:542-575](backend/app.py#L542-L575)

- Passwords are hashed with plain, unsalted SHA-256 (fast to brute-force, and the same password gives the same hash). Use bcrypt or argon2. Comparison should use `hmac.compare_digest`.
- The session token is stored **in plaintext** in the `workers` table, never expires, and there is one token per worker (a second login logs out the first device).
- No rate limiting or lockout on `/api/auth/login`.
- No roles are enforced: every logged-in worker can edit products, settings and bills. `role` is stored but never checked.

### 14. CORS is fully open
[backend/app.py:22-28](backend/app.py#L22-L28)

`allow_origins=["*"]` with `allow_credentials=True`. Restrict to the real frontend origin(s) from an environment variable.

### 15. Seeding issues
[backend/app.py:133-155](backend/app.py#L133-L155), [:379-383](backend/app.py#L379-L383), [:622-625](backend/app.py#L622-L625)

- `ensure_seed_worker` inserts the keys `passwordHash` and `createdAt` directly, without `to_db_record`. Postgres columns are `password_hash` and `created_at`, so the insert fails and the code falls through to the in-memory seed.
- `GET /api/products` calls `ensure_seed_products()` on every request. If the table is empty, it inserts three demo products (Rs 190, 70, 90 with made-up manufacturers). A public read endpoint should not write. It also lists all products twice per call.
- `/api/products` has no pagination.

### 16. Frontend API base URL handling
[frontend/src/lib/api.js:1](frontend/src/lib/api.js#L1), [billing.config.js:11](frontend/src/config/billing.config.js#L11), [BillingContext.jsx:8](frontend/src/context/BillingContext.jsx#L8)

- `api.js` falls back to `/api`. `billing.config.js` and `BillingContext.jsx` fall back to `http://localhost:8000/api` in production. `billing.config.js` and the `API_BASE` constant in `BillingContext.jsx` appear unused, but they document a different default (port 8000) from everything else (5656).
- On Vercel, `frontend/vercel.json` rewrites **every** path, including `/api/...`, to `index.html`. Without `VITE_API_BASE_URL` set at build time, API calls return the HTML page, and `response.json()` then throws.
- `VITE_ENABLE_FAKE_LOGIN` is in `.env.example` but no code reads it.
- `QUICK_TEST_START.txt` describes `test`/`test` logins and a `PYTHON_API_SPECIFICATION.md`; neither exists in the code or repo.

### 17. Hard-coded business data in the UI
[frontend/src/pages/BillGenerator.jsx:130-190](frontend/src/pages/BillGenerator.jsx#L130-L190), [App.jsx:80-81](frontend/src/App.jsx#L80-L81)

- The bill generator contains sample line items ("Little Oil", "Garam Masala", "Haldi") with fixed prices and quantities. Confirm these are only used in an intentional example mode and cannot reach a real bill.
- HSN code `1514` is used as the fallback for any product without one.
- The WhatsApp/call number `+917897061003` is hard-coded in `App.jsx`, and again in other components. Move to config.
- Supplier defaults (name, address, placeholder GSTIN and FSSAI) are repeated in `BillPayload`, `BillingSettingsPayload`, `default_billing_settings()` and the SQL file. Four places must stay in sync.

### 18. `navigate()` during render
[frontend/src/pages/BillGenerator.jsx:28-29](frontend/src/pages/BillGenerator.jsx#L28-L29)

`if (!worker) { navigate('/billing-login') }` runs in the render body. React warns about this and it can loop or misbehave in strict mode. Other pages correctly use `useEffect` (for example [BillHistory.jsx:14](frontend/src/pages/BillHistory.jsx#L14)). Better still, use one shared `<RequireAuth>` route wrapper.

---

## Low

### 19. Dead files, stale docs, unused dependency
- Duplicates and backups committed to git: `backend/app-f.py` (old Firestore app), `frontend/src/pages/Contact copy.jsx`, `frontend/src/lib/printBill copy.js`, `frontend/src/data/products copy.js`, `frontend/src/data/products copy.json`.
- Product images are stored **twice**: `frontend/public/assets/products/` and `frontend/src/assets/products/`.
- `frontend/src/data/products.json/js` is static catalog data, while the app also loads `/api/products`. Decide on one source of truth.
- `backend/README.md` and `backend/.env.example` describe Firestore. `docker-compose.yml` still mounts gcloud credentials and sets `FIRESTORE_PROJECT_ID=triambh-web` (a different project name from this business).
- `requirements.txt` includes `google-cloud-firestore` (unused) and `gunicorn` (does not run on Windows).
- `frontend/Dockerfile` contains a large commented-out block, and the real file is a dev image. `docker-compose.yml` has a commented-out duplicate `frontend` service. `run_app.text` is loose notes with a `web` service name that does not exist.
- `vite.config.js` sets `terserOptions.drop_console` while `minify` is `esbuild`, so the option is ignored and console logs stay in production. `optimizeDeps.force: false` is the default. `usePolling` is on even for non-Docker development, which costs CPU.
- `.dockerignore` lists `node_modules` several times and `.env` twice.
- `.vite/` and `.venv/` sit at the repo root (git-ignored, fine), but keep them out of shared archives.

### 20. Dependencies, tests, tooling
- `requirements.txt`: `supabase>=2.10.0,<3` and `python-dotenv` are not pinned exactly (the others are), so builds are not reproducible. Use a lock file.
- No automated tests anywhere. The GST and invoice logic in particular (`calculate_gst_breakdown`, validators, invoice numbering) should have unit tests, since mistakes there have legal and financial impact.
- No linting or formatting config (ESLint, ruff/black), no type checking, and the CI workflows only deploy: they run no build, test or lint step before pushing to production.
- `app.py` is one 800-line file mixing models, helpers, validation, data access and routes. Splitting it into modules would make it testable.
- `backend/vercel.json` is set up to run a FastAPI app as a serverless function, while the repo also deploys it to Cloud Run and Docker. Pick one production target.
- Secrets: `.env` files are git-ignored (checked, none are tracked). Consider a secret scan in CI anyway, since `docker-compose.yml` already contains a GCP project name.

---

## Suggested order of work

1. **Now (security and data loss):** #1 protect submissions, #4 remove default credentials, #6 stop bill overwrite, #5 stop silent in-memory fallback.
2. **Before the next deploy:** #2 and #3 fix Cloud Run config (port, env vars, Supabase secrets, nginx SPA fallback), #9 persist billing settings.
3. **Correctness of billing:** #7, #10, #12 (server-side totals, immutable invoices, financial-year numbering). Have an accountant confirm the GST rules.
4. **Hardening:** #13 and #14 (password hashing, token expiry, CORS, roles), #8 product update bug.
5. **Cleanup:** #15 to #20 (dead files, docs, tests, lint, CI checks).

## What is already good

- Clear split between `frontend/` and `backend/`, with SQL scripts for the whole schema, RLS policies and indexes.
- Route-based code splitting in the frontend, and English/Hindi localisation.
- Server-side validation exists for GSTIN, FSSAI, invoice number format, HSN and B2C high-value rules. It needs the fixes above, but the structure is a good base.
- Bill, product and settings write endpoints do require a token.
- `.env` files are correctly git-ignored and none are committed.

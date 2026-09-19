# How to Run Madhuban Traders

Complete guide to setting up, running, building and deploying the Madhuban Traders app.

## Contents

1. [Architecture](#1-architecture)
2. [Prerequisites](#2-prerequisites)
3. [Project structure](#3-project-structure)
4. [Quick start (local, no Docker)](#4-quick-start-local-no-docker)
5. [Environment variables](#5-environment-variables)
6. [Database setup (Supabase)](#6-database-setup-supabase)
7. [Running with Docker Compose](#7-running-with-docker-compose)
8. [App pages and login](#8-app-pages-and-login)
9. [API reference](#9-api-reference)
10. [Production build](#10-production-build)
11. [Deployment](#11-deployment)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Architecture

| Part | Tech | Default port |
|------|------|--------------|
| Frontend (`frontend/`) | React 18 + Vite 5 + React Router 6 | `5173` |
| Backend (`backend/`) | Python, FastAPI + Uvicorn (Gunicorn in Docker) | `5656` in Docker, `8080` if run via `python app.py` |
| Database | Supabase (PostgreSQL) | hosted |

- The frontend calls the backend under `/api`. In dev, Vite proxies `/api` to the backend (see [frontend/vite.config.js](frontend/vite.config.js)).
- If Supabase credentials are missing or the connection fails, the backend **falls back to an in-memory store**. The app still works, but all data (bills, submissions, workers) is lost when the backend restarts. `GET /api/health` shows which one is active (`"database": "supabase"` or `"in-memory"`).

---

## 2. Prerequisites

- **Node.js** 18+ (Docker image uses 20) and npm
- **Python** 3.10+ (Docker image uses 3.12) and pip
- **Git**
- **Docker Desktop** with Compose (optional)
- A **Supabase** project (optional for local trials, required for persistent data)

Check versions:

```powershell
node -v
npm -v
python --version
docker --version
```

---

## 3. Project structure

```
Madhuban Traders/
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── pages/            # Home, Catalog, Product, Cart, Contact, Billing pages...
│   │   ├── components/       # Reusable UI (header, footer, product cards, forms)
│   │   ├── context/          # Billing, Catalog, Language contexts
│   │   ├── lib/              # api.js (API client), printBill.js
│   │   ├── locales/          # en.json, hi.json (English / Hindi)
│   │   ├── data/             # Static product data
│   │   └── config/           # billing.config.js
│   ├── public/assets/products/   # Product images
│   ├── .env.example
│   ├── Dockerfile            # Dev image (runs Vite)
│   └── vercel.json
├── backend/
│   ├── app.py                # FastAPI application (all endpoints)
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile            # Gunicorn + Uvicorn worker on port 5656
│   └── vercel.json
├── sql/
│   ├── database_setup.sql        # Tables + seed worker/settings
│   ├── database_extra_setup.sql  # RLS, indexes, analytics views, triggers
│   └── products_seed.sql         # Product seed data
├── docker-compose.yml        # frontend + backend for local development
├── .github/workflows/        # Cloud Run deploy workflows
└── .env                      # Root env file (frontend API URL)
```

---

## 4. Quick start (local, no Docker)

Open **two terminals** at the project root.

### Terminal 1: Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env               # then edit values (see section 5)
```

Start the server on port **5656** (this is the port the frontend expects):

```powershell
$env:PORT = 5656                     # macOS/Linux: PORT=5656 python app.py
python app.py
```

Alternative with auto-reload:

```powershell
uvicorn app:app --host 0.0.0.0 --port 5656 --reload
```

Verify: open <http://localhost:5656/api/health>. Expected:

```json
{ "status": "ok", "timestamp": "...", "database": "supabase" }
```

`"database": "in-memory"` means Supabase is not connected (see [Database setup](#6-database-setup-supabase)).

> If you skip `PORT`, the backend listens on **8080**. Then set `VITE_API_BASE_URL` / `API_URL` to that port instead.

FastAPI's auto-generated docs are at <http://localhost:5656/docs>.

### Terminal 2: Frontend

```powershell
cd frontend
npm install
copy .env.example .env               # VITE_API_BASE_URL=http://localhost:5656/api
npm run dev
```

Open <http://localhost:5173>.

---

## 5. Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | For persistence | Supabase project URL, e.g. `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | For persistence | Supabase **service_role** key (server side only, never expose to the browser) |
| `PORT` | No | Port for `python app.py` (default `8080`) |

[backend/.env.example](backend/.env.example) still lists `FIRESTORE_PROJECT_ID` and `GOOGLE_CLOUD_PROJECT`. The code no longer reads them (it uses Supabase), so add the two Supabase variables above to your `.env`.

Example `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5656
```

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base, e.g. `http://localhost:5656/api` |
| `VITE_ENABLE_FAKE_LOGIN` | `true`/`false` flag from `.env.example` |
| `API_URL` | Used only by the Vite dev proxy (default `http://localhost:5656/api`) |

Vite only exposes variables prefixed with `VITE_` to browser code. Restart `npm run dev` after editing `.env`.

> Never commit real keys. `.env` files are git-ignored except `.env.example`.

---

## 6. Database setup (Supabase)

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor** and run these files **in order**:
   1. [sql/database_setup.sql](sql/database_setup.sql): creates `workers`, `billing_settings`, `products`, `bills`, `submissions` and seeds the default worker and billing settings.
   2. [sql/database_extra_setup.sql](sql/database_extra_setup.sql): `updated_at` triggers, RLS, indexes, manager analytics views.
   3. [sql/products_seed.sql](sql/products_seed.sql): product catalog data.
3. Copy **Project URL** and the **service_role** key (Settings → API) into `backend/.env`.
4. Restart the backend and confirm `/api/health` reports `"database": "supabase"`. The startup log also prints `Supabase connected successfully.`

Default worker created by the seed script:

| Username | Password |
|----------|----------|
| `shop1` | `shop123` |

**Change this password before going live.** Passwords are stored as unsalted SHA-256 hashes (`sha256(password)`). To set a new one, generate a hash and update `workers.password_hash`:

```powershell
python -c "import hashlib; print(hashlib.sha256(b'NEW_PASSWORD').hexdigest())"
```

---

## 7. Running with Docker Compose

Requires Docker Desktop running.

```powershell
docker compose up --build
```

| Service | URL | Notes |
|---------|-----|-------|
| frontend | <http://localhost:5173> | Vite dev server with hot reload (source mounted from `./frontend`) |
| backend | <http://localhost:5656> | Gunicorn + Uvicorn |

Notes:

- `docker-compose.yml` does **not** currently pass `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` to the backend, and it mounts gcloud credentials left over from the old Firestore setup. To use Supabase, add to the backend service:

  ```yaml
  environment:
    - SUPABASE_URL=https://your-project.supabase.co
    - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```

  or use `env_file: ./backend/.env`. Without them the backend runs with the in-memory store.
- The `${APPDATA}/gcloud` volume is Windows-specific; remove it if the folder doesn't exist.

Useful commands:

```powershell
docker compose up -d --build          # run in background
docker compose logs -f backend        # follow backend logs
docker compose down                   # stop
docker compose down --volumes         # stop and remove volumes
docker compose build --no-cache       # force a clean rebuild
```

---

## 8. App pages and login

### Public site

| Route | Page |
|-------|------|
| `/` | Home |
| `/catalog` | Product catalog |
| `/product/:id` | Product detail |
| `/cart` | Cart / inquiry |
| `/about`, `/contact` | Info pages |
| `/privacy`, `/shipping`, `/terms` | Policies |

The language can be switched between English and Hindi (`src/locales/`).

### Billing / manager area

| Route | Page |
|-------|------|
| `/billing-login` | Worker login (redirects to dashboard if already logged in) |
| `/manager-dashboard` | Manager dashboard |
| `/billing` | Bill generator |
| `/quick-entry` | Quick bill entry |
| `/bill-preview`, `/bill-invoice` | Preview and printable invoice |
| `/billing-history` | Past bills |
| `/manager-settings` | Supplier name, address, GSTIN, FSSAI, state |
| `/submissions` | Contact / inquiry form submissions |

Log in at <http://localhost:5173/billing-login> with the worker credentials from your `workers` table (default `shop1` / `shop123`, or the same account created automatically when the backend runs in in-memory mode).

Typical billing workflow: log in → search/add products → enter customer name, phone and payment method → generate bill → preview/print → review in history.

---

## 9. API reference

All endpoints are prefixed with `/api`. Protected endpoints expect an `Authorization` header with the token returned by login.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` (also `/health`) | Status and active database |
| POST | `/api/auth/login` | Body `{username, password}` → `{token, worker}` |
| POST | `/api/auth/logout` | Invalidate token |
| GET | `/api/auth/verify` | Validate token |
| GET / POST | `/api/products` | List / create products |
| GET / PUT / DELETE | `/api/products/{id}` | Read / update / delete a product |
| POST | `/api/submissions` | Submit contact form |
| GET | `/api/submissions` | List submissions |
| GET / PUT / DELETE | `/api/submissions/{id}` | Read / update / delete a submission |
| GET / PUT | `/api/billing-settings` | Supplier billing settings |
| POST / GET | `/api/bills` | Create / list bills |
| GET / PUT | `/api/bills/{id}` | Read / update a bill |

Quick test:

```powershell
curl http://localhost:5656/api/health
curl -X POST http://localhost:5656/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"shop1\",\"password\":\"shop123\"}"
```

---

## 10. Production build

### Frontend

```powershell
cd frontend
npm run build       # outputs dist/, then postbuild copies index.html to 404.html (SPA fallback)
npm run preview     # serve the built bundle locally
```

### Backend (production server)

```powershell
cd backend
gunicorn -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:5656
```

Gunicorn does not run on native Windows. Use Docker or WSL there, or use `uvicorn app:app`.

Backend Docker image:

```powershell
docker build -t madhuban-api ./backend
docker run -p 5656:5656 --env-file backend/.env madhuban-api
```

> [frontend/Dockerfile](frontend/Dockerfile) is a **dev** image (runs Vite). The multi-stage nginx production build in it is commented out. Uncomment that block (and remove the dev stage) to build a static production image.

### Scripts

| Location | Script | Purpose |
|----------|--------|---------|
| `frontend/` | `npm run dev` | Vite dev server with HMR |
| `frontend/` | `npm run build` | Production bundle in `dist/` |
| `frontend/` | `npm run preview` | Preview the production bundle |

---

## 11. Deployment

### Vercel

Both `frontend/` and `backend/` contain a `vercel.json`. Deploy them as **two separate Vercel projects**, setting each project's root directory to its folder:

```powershell
npm install -g vercel
cd frontend; vercel deploy --prod
cd ../backend; vercel deploy --prod
```

- Backend project env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Frontend project env var: `VITE_API_BASE_URL=https://<your-backend-domain>/api`.

Vercel's filesystem is ephemeral, so a real Supabase connection is required in production (the in-memory fallback won't persist).

### Google Cloud Run (GitHub Actions)

Workflows: [backend-cloudrun.yml](.github/workflows/backend-cloudrun.yml) and [frontend-cloudrun.yml](.github/workflows/frontend-cloudrun.yml). Both are triggered manually (**Actions → Run workflow**) and push an image to Artifact Registry in `us-central1`.

Required GitHub repository secrets:

- `GCP_PROJECT_ID`
- `GCP_SERVICE_ACCOUNT_KEY`

Set the backend's Supabase variables on the Cloud Run service and point the frontend's `VITE_API_BASE_URL` at the deployed backend URL (`https://<cloud-run-url>/api`).

---

## 12. Troubleshooting

**Frontend loads but API calls fail / network errors**
- Confirm the backend is running and <http://localhost:5656/api/health> responds.
- Check `VITE_API_BASE_URL` and that the backend port matches (`5656` vs the default `8080`).
- Restart `npm run dev` after changing `.env`.

**Health shows `"database": "in-memory"`**
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are missing or wrong, or the `workers` table doesn't exist. Check the backend startup log for `Supabase connection failed. Details: ...` and run the SQL scripts.

**Login returns 401 Invalid credentials**
- The worker doesn't exist in the active database, or the password hash doesn't match. Re-run `database_setup.sql` or update `password_hash` (see section 6).

**Bills/submissions vanish after restarting the backend**
- The backend is on the in-memory fallback. Connect Supabase.

**Port already in use (PowerShell)**

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Same for `:5656`.

**`Activate.ps1 cannot be loaded because running scripts is disabled`**

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**Docker issues**

```powershell
docker compose down --volumes
docker compose build --no-cache
docker compose up
```

If the gcloud volume mount errors, remove that `volumes:` entry from the backend service (it is not needed for Supabase).

**Hot reload not working on Windows/Docker**
- Already handled: `usePolling` is enabled in `vite.config.js` and `CHOKIDAR_USEPOLLING=true` in compose.

**npm install problems**

```powershell
cd frontend
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

---

## More information

- [README.md](README.md): project overview
- [backend/README.md](backend/README.md): backend notes (partly outdated: it still describes Firestore)
- [gst_food_compliance_requirements.md](gst_food_compliance_requirements.md): GST / FSSAI billing requirements

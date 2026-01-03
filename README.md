# Madhuban Traders — React Frontend (Prototype)

This repository contains a minimal Vite + React single-page application scaffold for the Madhuban Traders frontend. It's designed to be a starting point that consumes a backend API (or mock data) and provides reusable components, routing, and a simple React Context for state.

Getting started (Windows PowerShell):

```powershell
npm install
npm run dev
```

Files of interest:
- `src/` — application source
- `src/components` — reusable components (Navigation, ProductCard, InquiryForm)
- `src/pages` — route pages (Home, Catalog, About, Contact)
- `src/context/CatalogContext.jsx` — sample app context (catalog + cart)
- `src/data/products.json` — example product data for local demo

Next steps:
- Replace sample data with real API endpoints
- Add styling system (Tailwind, CSS Modules, or component library)
- Add TypeScript if desired
- Add tests and CI/CD

Docker
------

This project includes Docker support for both development and production scenarios.

Development (with live reload using Docker Compose):

```powershell
cd 'd:\Madhuban Traders'
docker compose up --build
```

This starts the `dev` service (Vite) and a lightweight `api` service (Dev API shim) that exposes `POST /api/submissions` and `GET /api/submissions` at `http://api:4000` inside the Compose network (and `http://localhost:4000` on the host). Vite is configured to proxy `/api` to the API service when using Docker Compose, so you can test the real serverless function behavior locally.

Alternatively, to test the real Vercel function runtime locally, use the Vercel CLI:

```powershell
npx vercel dev
```

Note: writing to disk inside serverless functions works for local testing (`vercel dev`), but ephemeral production serverless environments (like Vercel) do not guarantee persistent disk writes; for production use an external store (Vercel KV, S3, or a database).

Production (build image and serve static files with nginx):

Build and run the production image:

```powershell
cd 'd:\Madhuban Traders'
docker build -t madhuban-frontend:prod .
docker run -p 8080:80 madhuban-frontend:prod
```

Or using Docker Compose to build and run the `web` service:

```powershell
docker compose up --build web
```

Notes:
- The `Dockerfile` is a multi-stage build: a Node build stage runs `npm run build` and an `nginx` stage serves the resulting `dist/` folder.
- `.dockerignore` excludes `node_modules` and `dist` to keep the build context small.
- If you are on Windows and experience file watching issues in `dev`, the `CHOKIDAR_USEPOLLING` environment variable is enabled in the Compose dev service; adjust or remove if not needed.

If you'd like, I can:
- Add an Nginx config to enable SPA fallback routing (redirect unknown paths to `index.html`).
- Add a healthcheck and smaller production image (e.g., using `caddy` or optimizing nginx config).
- Add a GitHub Actions workflow to build and push the image to a container registry.

Vercel serverless function (single-file submissions)
---------------------------------------------------
This project now includes a Vercel Serverless Function at `api/submissions.js` that appends all submissions into a single file `data/submissions.json` during local development (`vercel dev`) or when running functions on a server that allows file writes.

- `POST /api/submissions` — append a submission to the JSON file
- `GET /api/submissions` — read all submissions

Important: Vercel functions run on ephemeral serverless instances; writing to disk is not guaranteed to persist in production. For persistent storage use an external service (Vercel KV, S3, or a database).

There is also a viewer page in the app at `/submissions` that lists records and allows exporting them as a JSON file for local review.

Vercel / production notes
-------------------------
- The `api/submissions.js` function writes records to a single JSON file. For local development this is stored under `data/submissions.json` in the repo and persists between runs.
- On Vercel (or other serverless platforms) the function writes to the OS temporary directory (e.g. `/tmp`) to allow the function to run without write permission errors, but this data is **ephemeral** and not guaranteed to persist across invocations or across regions/instances.
- For reliable production storage use an external service such as Vercel KV, AWS S3, or a database.

How to test on Vercel (quick):
- Install the Vercel CLI: `npm i -g vercel` (or `npx vercel` for single-run usage)
- Start local emulation: `npx vercel dev` and test the site; the serverless function will write to the local `data/submissions.json` while `vercel dev` runs.
- To deploy: `npx vercel --prod` and test `https://<your-deployment>.vercel.app/submissions`. Remember that file writes on Vercel are ephemeral; check the viewer and export immediately after testing.

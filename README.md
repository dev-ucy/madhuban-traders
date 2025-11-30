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
docker compose up --build dev
```

This runs the `dev` service which mounts your workspace into the container and starts Vite. Open `http://localhost:5173` in your browser.

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

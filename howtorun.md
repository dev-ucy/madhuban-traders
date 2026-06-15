# How to Run Madhuban Traders

This guide covers how to run the Madhuban Traders application in various environments.

## Prerequisites

- **Node.js** (v18+) and npm installed
- **Docker** and Docker Compose (optional, for containerized development)
- **Git** (for cloning/version control)

---

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Running with Docker Compose

Docker Compose allows you to run both the frontend and backend API services with a single command, including hot-reload support.

### Start Development with Docker Compose

```powershell
docker compose up --build
```

This starts:
- **Frontend (Vite)** at `http://localhost:5173` with live reload
- **Backend API** at `http://localhost:4000`

The services communicate internally via the Compose network (`api` service is accessible to frontend at `http://api:4000`).

### Stop Services

```bash
docker compose down
```

---

## Running Individual Services

### Frontend Only

```bash
npm run dev
```

Runs Vite development server at `http://localhost:5173`

### Backend API Only

```bash
cd server
npm install
node dev-server.js
```

Backend API runs at `http://localhost:4000`

---

## Production Build

### Build Frontend

```bash
npm run build
```

Creates optimized production build in the `dist/` directory.

### Build & Run Production Docker Image

```bash
docker build -t madhuban-traders:latest .
docker run -p 8080:80 madhuban-traders:latest
```

Access the application at `http://localhost:8080`

---

## Testing with Vercel CLI

To test the real Vercel serverless function runtime locally:

```bash
npx vercel dev
```

**Note:** Local testing with `vercel dev` allows writing to disk, but production Vercel environments are ephemeral and don't guarantee persistent disk writes. For production, use an external store (Vercel KV, S3, or a database).

---

## Available Scripts

### Frontend (Root)

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |

### Backend (server/)

| Script | Purpose |
|--------|---------|
| `node dev-server.js` | Start development API server |
| `node index.js` | Start production API server |

---

## Project Structure

```
├── src/                          # React frontend source
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Route pages (Home, Catalog, About, etc.)
│   ├── context/                  # React Context (CatalogContext, LanguageContext)
│   ├── hooks/                    # Custom hooks
│   ├── locales/                  # i18n translations (English, Hindi)
│   └── data/                     # Static product data
│
├── server/                       # Express backend
│   ├── index.js                  # Production server entry point
│   └── dev-server.js             # Development server with live reload
│
├── api/                          # Serverless function (Vercel)
│   └── submissions.js            # POST/GET submissions endpoint
│
├── public/                       # Static assets
└── docker-compose.yml            # Docker Compose configuration
```

---

## Features

- **React + Vite**: Fast frontend development with hot module replacement
- **Multi-language Support**: English and Hindi localization
- **Product Catalog**: Dynamic product listing with cart functionality
- **Contact Forms**: Inquiry and submission forms
- **Responsive Design**: Mobile-first component architecture
- **Docker Support**: Easy containerized development and deployment
- **Vercel Ready**: Pre-configured for serverless deployment

---

## Environment Variables

### Frontend

- `API_URL`: Backend API endpoint (default: `/api`)

### Backend

- `PORT`: Server port (default: `4000`)

---

## Troubleshooting

### Port Already in Use

If port `5173` (frontend) or `4000` (backend) is already in use:

**On Windows:**
```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Docker Issues

Clear Docker cache and rebuild:
```bash
docker compose down --volumes
docker compose up --build
```

### Dependencies Not Installing

Clear npm cache and reinstall:
```bash
npm cache clean --force
rm -r node_modules
npm install
```

---

## Deployment

### Vercel

This project is configured for Vercel deployment:

```bash
npm install -g vercel
vercel deploy
```

### Docker (Self-hosted)

Build and deploy the Docker image to your hosting provider:

```bash
docker build -t madhuban-traders:latest .
docker push <registry>/madhuban-traders:latest
```

---

## Support

For issues or questions, refer to the [README.md](README.md) or check the component documentation in `src/components/`.

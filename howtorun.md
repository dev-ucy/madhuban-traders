# How to Run Madhuban Traders

This guide covers how to run the Madhuban Traders application in various environments.

## Prerequisites

- **Node.js** (v18+) and npm installed
- **Python** (v3.8+) and pip for Billing Module backend (optional)
- **Docker** and Docker Compose (optional, for containerized development)
- **Git** (for cloning/version control)

---

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Billing Module Setup (with Python Backend)

The Billing Module requires a backend API. You can build it in Python.

### 1. Configure API Endpoint

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. Set Up Python Backend

Create a Python server following the specification in `PYTHON_API_SPECIFICATION.md`:

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-cors

# Create app.py with endpoints from PYTHON_API_SPECIFICATION.md
python app.py
```

The Python API should run on `http://localhost:8000`

### 3. Start Frontend

In another terminal:

```bash
npm run dev
```

### 4. Access Billing Module

Navigate to `http://localhost:5173/billing-login`

Default credentials (configure in your Python backend):
- Username: `shop1`
- Password: `shop123`

---

## Running with Docker Compose

Docker Compose allows you to run the frontend and backend services.

### Start Development with Docker Compose

```powershell
docker compose up --build
```

This starts:
- **Frontend (Vite)** at `http://localhost:5173` with live reload

For the Billing Module backend, run your Python API separately or add it to docker-compose.yml

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

### Python Billing Backend Only

```bash
# Install dependencies
pip install flask flask-cors

# Run server (ensure app.py exists)
python app.py
```

Backend API runs at `http://localhost:8000` (or your configured port)

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

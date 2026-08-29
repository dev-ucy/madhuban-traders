# Madhuban Traders

A React + Vite storefront with a billing workflow, inquiry flow, customer submissions, and a Python FastAPI backend designed for local development and Google Cloud deployment.

## Overview

This project includes:

- Storefront UI for browsing products and placing orders
- Contact and inquiry submission workflow
- Checkout order capture
- Billing module for manager login, bill creation, and bill history
- Customer submissions management for the shop manager
- Python API backend with Firestore-ready persistence
- Docker Compose support for local development
- Cloud Run deployment via Artifact Registry and GitHub Actions
- Optional Vercel deployment for the frontend

## Project structure

- Frontend app: frontend/
- Python backend: backend/
- GitHub Actions: .github/workflows/
- Docker setup: docker-compose.yml
- Environment sample: frontend/.env.example

## Local development

### Start with Docker Compose

From the project root:

```powershell
cd "F:\New folder\Madhuban Traders"
gcloud auth application-default login --project triambh-web
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:5656/api/health

### Start backend directly

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

### Start frontend directly

```powershell
cd frontend
npm install
npm run dev
```

## Default billing login

- Username: shop1
- Password: shop123

## Backend endpoints

The API exposes:

- POST /api/auth/login
- GET /api/auth/verify
- POST /api/auth/logout
- POST /api/submissions
- GET /api/submissions
- PUT /api/submissions/{id}
- DELETE /api/submissions/{id}
- POST /api/bills
- GET /api/bills
- GET /api/bills/{id}
- PUT /api/bills/{id}

## Environment variables

### Local backend

```env
FIRESTORE_PROJECT_ID=triambh-web
GOOGLE_CLOUD_PROJECT=triambh-web
PORT=5656
CLOUDSDK_CONFIG=/root/.config/gcloud
GOOGLE_APPLICATION_CREDENTIALS=/root/.config/gcloud/application_default_credentials.json
```

### Local frontend

```env
VITE_API_BASE_URL=http://localhost:5656/api
```

For production or Cloud Run, set the same value to the deployed backend URL instead of localhost.

## Firestore setup

The backend tries to connect to Firestore using Google Application Default Credentials or environment variables. If credentials are not configured, the app falls back to in-memory storage for local testing only.

For local Docker on Windows, make sure this command has been run on the host machine:

```powershell
gcloud auth application-default login --project triambh-web
```

This ensures the mounted `%APPDATA%\gcloud` folder is available to the Docker container.

## Deployment options

### Option 1: Cloud Run with Artifact Registry (recommended)

This project is configured for Cloud Run deployments using Artifact Registry and GitHub Actions.

#### 1) Enable required services

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
```

#### 2) Create a Docker repository

```bash
gcloud artifacts repositories create madhuban-traders \
  --repository-format=docker \
  --location=us-central1 \
  --description="Madhuban Traders container images"
```

#### 3) Authenticate Docker

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
```

#### 4) Build and push backend image

```bash
cd backend
docker build -t us-central1-docker.pkg.dev/PROJECT_ID/madhuban-traders/madhuban-traders-api:latest .
docker push us-central1-docker.pkg.dev/PROJECT_ID/madhuban-traders/madhuban-traders-api:latest
```

#### 5) Deploy backend to Cloud Run

```bash
gcloud run deploy madhuban-traders-api \
  --image us-central1-docker.pkg.dev/PROJECT_ID/madhuban-traders/madhuban-traders-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars FIRESTORE_PROJECT_ID=PROJECT_ID,GOOGLE_CLOUD_PROJECT=PROJECT_ID,PORT=8080
```

#### 6) Grant Firestore permissions

```bash
SERVICE_ACCOUNT=$(gcloud run services describe madhuban-traders-api --region us-central1 --format='value(spec.template.spec.serviceAccountName)')
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/datastore.user"
```

#### 7) Deploy frontend to Cloud Run

```bash
cd frontend
docker build -t us-central1-docker.pkg.dev/PROJECT_ID/madhuban-traders/madhuban-traders-frontend:latest .
docker push us-central1-docker.pkg.dev/PROJECT_ID/madhuban-traders/madhuban-traders-frontend:latest

gcloud run deploy madhuban-traders-frontend \
  --image us-central1-docker.pkg.dev/PROJECT_ID/madhuban-traders/madhuban-traders-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Option 2: Vercel for frontend only

If the frontend is hosted on Vercel instead of Cloud Run, configure the Vercel project as follows:

- Framework Preset: Vite
- Root Directory: frontend
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install
- Node.js Version: 20.x

Environment variable:

```env
VITE_API_BASE_URL=https://YOUR_CLOUD_RUN_BACKEND_URL/api
```

This is important because the real app is inside the frontend folder, not the repository root.

## GitHub Actions deployment

GitHub Actions workflows are included in [.github/workflows/backend-cloudrun.yml](.github/workflows/backend-cloudrun.yml) and [.github/workflows/frontend-cloudrun.yml](.github/workflows/frontend-cloudrun.yml).

These workflows:

- push Docker images to Artifact Registry
- deploy to Cloud Run
- support manual workflow_dispatch trigger
- allow specifying an image tag when needed

Required GitHub secrets:

```bash
GCP_PROJECT_ID
GCP_SERVICE_ACCOUNT_KEY
```

## Useful commands

```powershell
docker compose up --build
docker compose down
docker compose logs -f backend
docker compose logs -f frontend
```

## Production notes

- Use a real GCP project and real Firestore instance for production.
- Grant the Cloud Run service account proper Firestore access.
- Keep the backend as the API source of truth and do not depend on demo or fake login modes in production.
- The app is ready for local development, GitHub-based CI/CD, Artifact Registry builds, and Cloud Run deployment.

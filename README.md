# Madhuban Traders

A React + Vite storefront with a billing module, inquiry flow, checkout submissions, and a Python backend designed for containerized local development and deployment on Google Cloud Run.

## Overview

This project includes:

- Storefront UI for browsing products and placing orders
- Contact and inquiry submission workflow
- Checkout order capture
- Billing module for staff login, bill creation, and bill history
- Python API backend with Firestore-ready storage
- Docker Compose support for local development
- Cloud Run deployment path for the backend

## Project structure

- Frontend app: frontend/
- Python backend: backend/
- Docker setup: docker-compose.yml
- Environment sample: frontend/.env.example

## Local development with Docker

From the project root:

```powershell
cd "F:\New folder\Madhuban Traders"
gcloud auth application-default login --project triambh-web
docker compose up --build
```

For Windows Docker, the backend container must see the same Google ADC files stored under `%APPDATA%\gcloud`. The compose setup mounts that path automatically so Firestore can connect without falling back to in-memory storage.

Then open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:5656/api/health

### Default login for billing

- Username: shop1
- Password: shop123

### Backend API endpoints

The Python API exposes:

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

## Backend details

The backend is located in [backend](backend) and uses FastAPI.

### Local backend run

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

### Local frontend run

```powershell
cd frontend
npm install
npm run dev
```

Backend port:

- Local Docker: 5656
- Direct local app run: 8080 by default unless overridden with PORT

### Firestore configuration

The backend is Firestore-ready and tries to connect using Google Application Default Credentials or the project environment variables.

Environment variables used:

```env
FIRESTORE_PROJECT_ID=triambh-web
GOOGLE_CLOUD_PROJECT=triambh-web
PORT=5656
CLOUDSDK_CONFIG=/root/.config/gcloud
GOOGLE_APPLICATION_CREDENTIALS=/root/.config/gcloud/application_default_credentials.json
```

For local Docker on Windows, ensure `gcloud auth application-default login --project triambh-web` has been run on the host machine and that the `APPDATA/gcloud` folder is available to the container. If Google credentials are not configured, the app falls back to in-memory local storage so the backend still starts for local testing.

## Frontend environment

The frontend expects the API base URL in a local env file. Use the sample file in [frontend/.env.example](frontend/.env.example):

```env
VITE_API_BASE_URL=http://localhost:5656/api
VITE_ENABLE_FAKE_LOGIN=false
```

## Docker Compose

The current compose setup includes:

- frontend service on port 5173
- backend service on port 5656
- backend-to-frontend internal URL: http://backend:5656/api

## Cloud Run deployment

The backend is structured for Google Cloud Run deployment.

Example flow:

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/madhuban-traders-api ./backend

gcloud run deploy madhuban-traders-api \
  --image gcr.io/PROJECT_ID/madhuban-traders-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

Then set the frontend API URL to the deployed Cloud Run URL:

```env
VITE_API_BASE_URL=https://YOUR_CLOUD_RUN_URL/api
```

## Production note

For a real production deployment, use a real Firestore project and grant the Cloud Run service account access to Firestore. In local Docker, the app can run with in-memory fallback, but production should use Google credentials and Firestore-backed persistence.

## Useful commands

```powershell
docker compose up --build
docker compose down
docker compose logs -f backend
docker compose logs -f frontend
```

## Notes

- The app intentionally supports both frontend-only demo flows and a proper backend-connected mode.
- The billing module is configured to work against the backend API endpoints described above.
- The project is ready for local Docker testing and Cloud Run deployment.

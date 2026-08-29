# Madhuban Traders Firestore Backend

This folder contains the Python API intended for deployment on Google Cloud Run.

## Local development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The service listens on port 8080 by default and exposes endpoints under `/api`.

## Environment variables

```env
FIRESTORE_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
PORT=8080
```

## Cloud Run deployment

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/madhuban-traders-api ./backend
gcloud run deploy madhuban-traders-api \
  --image gcr.io/PROJECT_ID/madhuban-traders-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

Then set the frontend env variable:

```env
VITE_API_BASE_URL=https://YOUR_CLOUD_RUN_URL/api
```

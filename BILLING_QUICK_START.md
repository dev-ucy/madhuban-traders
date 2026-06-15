# Billing Module - Quick Setup Guide

**Frontend Only** - No Express server needed. Build your backend in Python!

## 📋 Step 1: Configure Frontend

### A. Create `.env` file in project root:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

### B. Install and Run Frontend:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🐍 Step 2: Build Python Backend

Your Python backend needs to implement the API endpoints. See **`PYTHON_API_SPECIFICATION.md`** for complete details.

### Quick Start Flask Example:

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Flask
pip install flask flask-cors

# Create app.py with endpoints
# (Copy from PYTHON_API_SPECIFICATION.md sample code)

# Run backend
python app.py
```

Backend should run on `http://localhost:8000`

---

## ✅ Step 3: Test

1. **Start Backend** → Python server running on port 8000
2. **Start Frontend** → React app running on port 5173
3. **Visit** → `http://localhost:5173/billing-login`
4. **Login** → Use credentials you define in Python backend

---

## 📚 Documentation Files

- **`PYTHON_API_SPECIFICATION.md`** - Complete API requirements & sample code
- **`BILLING_MODULE_GUIDE.md`** - Detailed feature documentation
- **`.env.example`** - Configuration template
- **`src/config/billing.config.js`** - Frontend configuration

---

## 🔧 Configuration Options

Edit `.env`:

```
# Development (local)
VITE_API_BASE_URL=http://localhost:8000/api

# Production (remote)
VITE_API_BASE_URL=https://api.yourdomain.com/api

# Docker
VITE_API_BASE_URL=http://billing-api:8000/api
```

---

## 📝 Frontend Routes

Once running, access:

- Login: `http://localhost:5173/billing-login`
- Bill Generator: `http://localhost:5173/billing`
- Bill History: `http://localhost:5173/billing-history`

---

## 🚀 That's It!

The frontend is ready to connect to ANY backend that implements the API spec. Build your Python backend following `PYTHON_API_SPECIFICATION.md` and you're done!

For questions, check:
- `PYTHON_API_SPECIFICATION.md` - Backend requirements
- `BILLING_MODULE_GUIDE.md` - Feature details
- `BILLING_MODULE_GUIDE.md` → Troubleshooting - Common issues

# Python Backend API - Required Endpoints

This document lists all the endpoints your Python backend must implement for the Billing Module to work.

## Quick Overview

**Base URL**: `http://localhost:8000/api` (configurable via `VITE_API_BASE_URL` in `.env`)

**Authentication**: Bearer Token (via `Authorization` header)

**Content Type**: `application/json`

---

## Required Endpoints

### 1. Authentication

#### POST `/auth/login`
Login a worker with credentials.

**Request:**
```json
{
  "username": "shop1",
  "password": "shop123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "token_string_here",
  "worker": {
    "id": "w1",
    "username": "shop1",
    "name": "Shop Manager",
    "role": "manager"
  }
}
```

**Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

#### GET `/auth/verify`
Verify that a token is valid.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "worker": {
    "id": "w1",
    "username": "shop1",
    "name": "Shop Manager",
    "role": "manager"
  }
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

#### POST `/auth/logout`
Logout a worker (optional, but recommended).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 2. Bills Management

#### POST `/bills`
Create a new bill.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "customerName": "John Doe",
  "customerPhone": "+919876543210",
  "items": [
    {
      "key": "1__v1a",
      "productId": 1,
      "productName": "Mustard Oil",
      "variant": {
        "id": "v1a",
        "label": "1 L"
      },
      "price": 195,
      "quantity": 2
    }
  ],
  "totalAmount": 390,
  "paymentMethod": "cash"
}
```

**Response (201):**
```json
{
  "success": true,
  "bill": {
    "id": 1001,
    "billNumber": "BILL-1001",
    "customerName": "John Doe",
    "customerPhone": "+919876543210",
    "items": [...],
    "totalAmount": 390,
    "paymentMethod": "cash",
    "createdBy": "w1",
    "createdByName": "Shop Manager",
    "createdAt": "2024-06-15T14:30:00Z",
    "status": "completed"
  }
}
```

**Response (400):**
```json
{
  "error": "Bill must contain at least one item"
}
```

---

#### GET `/bills`
Get all bills (paginated).

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional, default: 50) - Number of bills to return
- `offset` (optional, default: 0) - Number of bills to skip

**Example:** `/bills?limit=50&offset=0`

**Response (200):**
```json
{
  "success": true,
  "bills": [
    {
      "id": 1001,
      "billNumber": "BILL-1001",
      "customerName": "John Doe",
      "items": [...],
      "totalAmount": 390,
      "paymentMethod": "cash",
      "createdBy": "w1",
      "createdByName": "Shop Manager",
      "createdAt": "2024-06-15T14:30:00Z",
      "status": "completed"
    }
  ],
  "total": 42
}
```

---

#### GET `/bills/{id}`
Get a specific bill by ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "bill": {
    "id": 1001,
    "billNumber": "BILL-1001",
    ...
  }
}
```

**Response (404):**
```json
{
  "error": "Bill not found"
}
```

---

#### PUT `/bills/{id}`
Update bill status.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "bill": {
    "id": 1001,
    ...
    "status": "completed"
  }
}
```

---

### 3. Health Check (Optional but Recommended)

#### GET `/health`
Check API health status.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-06-15T14:30:00Z"
}
```

---

## Implementation Checklist

- [ ] `/auth/login` - Login endpoint
- [ ] `/auth/verify` - Token verification
- [ ] `/auth/logout` - Logout endpoint
- [ ] `/bills` - Create bill (POST)
- [ ] `/bills` - Get all bills (GET)
- [ ] `/bills/{id}` - Get specific bill
- [ ] `/bills/{id}` - Update bill status (PUT)
- [ ] CORS headers enabled
- [ ] Bearer token authentication
- [ ] Error responses with proper status codes

---

## Common Response Codes

- `200` - OK (successful GET, POST, PUT)
- `201` - Created (POST successful, resource created)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Server Error

---

## CORS Headers Required

```
Access-Control-Allow-Origin: * (or specific domain)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization
```

---

## See Full Specification

For complete details, sample code, and implementation examples, see:
**`PYTHON_API_SPECIFICATION.md`**

This file includes:
- Complete Flask example code
- Database setup examples
- Error handling patterns
- Testing with curl

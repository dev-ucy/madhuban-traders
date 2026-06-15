# Python Backend API Specification

This document specifies the API endpoints required for the Billing Module frontend to work with your Python backend.

## Configuration

1. Create a `.env` file in the project root (or copy from `.env.example`):
```
VITE_API_BASE_URL=http://localhost:8000/api
```

2. Update the URL to match your Python backend server address and port

## Required Endpoints

All endpoints require `Content-Type: application/json` and proper CORS headers.

### Authentication

#### 1. Login
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "username": string,
  "password": string
}

Response (200 OK):
{
  "success": true,
  "token": string,
  "worker": {
    "id": string,
    "username": string,
    "name": string,
    "role": string
  }
}

Response (401 Unauthorized):
{
  "error": "Invalid credentials"
}
```

#### 2. Verify Token
```
GET /auth/verify
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "worker": {
    "id": string,
    "username": string,
    "name": string,
    "role": string
  }
}

Response (401 Unauthorized):
{
  "error": "Unauthorized"
}
```

#### 3. Logout
```
POST /auth/logout
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Bills Management

#### 4. Create Bill
```
POST /bills
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "customerName": string,
  "customerPhone": string (optional),
  "items": [
    {
      "key": string,
      "productId": integer,
      "productName": string,
      "variant": {
        "id": string,
        "label": string
      } (optional),
      "price": number,
      "quantity": integer
    }
  ],
  "totalAmount": number,
  "paymentMethod": string (cash | card | check | online)
}

Response (201 Created):
{
  "success": true,
  "bill": {
    "id": integer,
    "billNumber": string,
    "customerName": string,
    "customerPhone": string,
    "items": [...],
    "totalAmount": number,
    "paymentMethod": string,
    "createdBy": string,
    "createdByName": string,
    "createdAt": ISO8601 datetime,
    "status": string
  }
}

Response (400 Bad Request):
{
  "error": "Bill must contain at least one item"
}
```

#### 5. Get All Bills
```
GET /bills?limit=50&offset=0
Authorization: Bearer {token}

Query Parameters:
- limit (optional, default: 50): Number of bills to return
- offset (optional, default: 0): Number of bills to skip

Response (200 OK):
{
  "success": true,
  "bills": [
    {
      "id": integer,
      "billNumber": string,
      "customerName": string,
      "customerPhone": string,
      "items": [...],
      "totalAmount": number,
      "paymentMethod": string,
      "createdBy": string,
      "createdByName": string,
      "createdAt": ISO8601 datetime,
      "status": string
    }
  ],
  "total": integer
}
```

#### 6. Get Single Bill
```
GET /bills/:id
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "bill": {...}
}

Response (404 Not Found):
{
  "error": "Bill not found"
}
```

#### 7. Update Bill Status
```
PUT /bills/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "status": string (completed | pending | cancelled)
}

Response (200 OK):
{
  "success": true,
  "bill": {...}
}

Response (404 Not Found):
{
  "error": "Bill not found"
}
```

### Health Check (Optional)

#### 8. Health Check
```
GET /health

Response (200 OK):
{
  "status": "ok",
  "timestamp": ISO8601 datetime
}
```

## Error Handling

All errors should follow this format:

```json
{
  "error": "Error description message"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid/missing token)
- 404: Not Found
- 500: Server Error

## CORS Requirements

The Python API must implement CORS headers:
```
Access-Control-Allow-Origin: * (or specific frontend domain)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization
```

## Authentication

- Use Bearer token authentication: `Authorization: Bearer {token}`
- Token can be JWT, session token, or any string-based token
- Tokens should be validated on every API request
- Implement token expiration for security

## Data Types

- **string**: UTF-8 text
- **integer**: Whole number
- **number**: Decimal number
- **boolean**: true/false
- **ISO8601 datetime**: e.g., "2024-06-15T14:30:00Z"

## Sample Python Implementation

Here's a minimal Flask example:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import secrets

app = Flask(__name__)
CORS(app)

# Demo worker database
WORKERS = {
    'shop1': {
        'id': 'w1',
        'username': 'shop1',
        'password_hash': 'hash_of_shop123',  # Use bcrypt in production
        'name': 'Shop Manager 1',
        'role': 'manager'
    }
}

# Demo bills storage
BILLS = {}
BILL_COUNTER = 1000

# Demo tokens storage
ACTIVE_TOKENS = {}

@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        return '', 204

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    worker = WORKERS.get(username)
    if not worker:
        return {'error': 'Invalid credentials'}, 401
    
    # TODO: Verify password hash
    token = secrets.token_hex(32)
    ACTIVE_TOKENS[token] = worker['id']
    
    return {
        'success': True,
        'token': token,
        'worker': {
            'id': worker['id'],
            'username': worker['username'],
            'name': worker['name'],
            'role': worker['role']
        }
    }, 200

@app.route('/api/auth/verify', methods=['GET'])
def verify():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return {'error': 'Unauthorized'}, 401
    
    token = auth[7:]
    worker_id = ACTIVE_TOKENS.get(token)
    if not worker_id:
        return {'error': 'Unauthorized'}, 401
    
    # Find worker by id
    for worker in WORKERS.values():
        if worker['id'] == worker_id:
            return {
                'success': True,
                'worker': {
                    'id': worker['id'],
                    'username': worker['username'],
                    'name': worker['name'],
                    'role': worker['role']
                }
            }, 200
    
    return {'error': 'Unauthorized'}, 401

@app.route('/api/bills', methods=['POST'])
def create_bill():
    auth = request.headers.get('Authorization', '')
    token = auth.split(' ')[1] if auth.startswith('Bearer ') else None
    
    if not token or token not in ACTIVE_TOKENS:
        return {'error': 'Unauthorized'}, 401
    
    data = request.json
    if not data.get('items'):
        return {'error': 'Bill must contain at least one item'}, 400
    
    global BILL_COUNTER
    BILL_COUNTER += 1
    
    bill = {
        'id': BILL_COUNTER,
        'billNumber': f'BILL-{BILL_COUNTER}',
        'customerName': data.get('customerName', 'Walk-in Customer'),
        'customerPhone': data.get('customerPhone', ''),
        'items': data.get('items'),
        'totalAmount': data.get('totalAmount'),
        'paymentMethod': data.get('paymentMethod', 'cash'),
        'createdBy': ACTIVE_TOKENS[token],
        'createdByName': 'Shop Manager',
        'createdAt': datetime.utcnow().isoformat() + 'Z',
        'status': 'completed'
    }
    
    BILLS[BILL_COUNTER] = bill
    return {'success': True, 'bill': bill}, 201

@app.route('/api/bills', methods=['GET'])
def get_bills():
    auth = request.headers.get('Authorization', '')
    token = auth.split(' ')[1] if auth.startswith('Bearer ') else None
    
    if not token or token not in ACTIVE_TOKENS:
        return {'error': 'Unauthorized'}, 401
    
    limit = int(request.args.get('limit', 50))
    offset = int(request.args.get('offset', 0))
    
    bills = sorted(BILLS.values(), key=lambda x: x['createdAt'], reverse=True)
    return {
        'success': True,
        'bills': bills[offset:offset+limit],
        'total': len(bills)
    }, 200

@app.route('/api/health', methods=['GET'])
def health():
    return {'status': 'ok', 'timestamp': datetime.utcnow().isoformat() + 'Z'}, 200

if __name__ == '__main__':
    app.run(debug=True, port=8000)
```

Install Flask and dependencies:
```bash
pip install flask flask-cors
```

Run the server:
```bash
python app.py
```

## Testing with curl

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"shop1","password":"shop123"}'

# Create bill (with token from login)
curl -X POST http://localhost:8000/api/bills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerName": "John Doe",
    "items": [{"key": "1__v1a", "productId": 1, "productName": "Oil", "price": 190, "quantity": 1}],
    "totalAmount": 190,
    "paymentMethod": "cash"
  }'
```

## Frontend Integration

Once your Python backend is ready:

1. Update `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

2. Start your Python backend server
3. Start the frontend: `npm run dev`
4. Navigate to `http://localhost:5173/billing-login`

The frontend will automatically connect to your Python API!

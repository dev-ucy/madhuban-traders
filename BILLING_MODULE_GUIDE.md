# Madhuban Traders - Secure Billing Module

## Overview

The billing module is a secure, authenticated system that allows authorized shop workers to generate instant customer bills with real-time product selection, quantity management, and comprehensive transaction history. It integrates seamlessly with your existing inventory system and provides secure authentication, modern UI, and print-friendly bill generation.

**The frontend is backend-agnostic** - it works with any backend API (Python, Node.js, Go, etc.) that implements the required endpoints specified in `PYTHON_API_SPECIFICATION.md`.

## Features

### 🔐 Security Features
- **Worker Authentication**: Secure login system for authorized shop personnel
- **Token-Based Authorization**: JWT-style token management for API requests
- **Session Management**: Automatic session validation and timeout protection
- **Password Hashing**: SHA-256 password hashing for secure credential storage

### 📝 Billing Features
- **Dynamic Product Selection**: Browse and search products from existing catalog
- **Variant Management**: Support for product variants (sizes, packaging options)
- **Real-Time Calculations**: Instant total amount calculation as items are added
- **Customer Information**: Capture customer details and payment method
- **Payment Methods**: Support for Cash, Card, Check, and Online Transfer
- **Bill Generation**: Create and store bills instantly

### 📊 Bill Management
- **Bill History**: View all generated bills with detailed information
- **Print Functionality**: Generate printable bills with professional formatting
- **Bill Details**: View complete bill information including items, amounts, and customer details
- **Status Tracking**: Monitor bill status (Completed, Pending)
- **Search & Filter**: Find bills by date, customer, or status

## System Architecture

### Frontend (React)
- **Routes**:
  - `/billing-login` - Worker login page
  - `/billing` - Main bill generator interface
  - `/billing-history` - View and manage past bills
- **Context**: `BillingContext` manages authentication and bill operations
- **Styling**: Comprehensive CSS with responsive design
- **API Communication**: RESTful HTTP requests with Bearer token authentication

### Backend (Your Python API)
- Implement endpoints from `PYTHON_API_SPECIFICATION.md`
- Can run on any port (configure via `.env`)
- Handles authentication, bill storage, and data persistence
- See `PYTHON_API_SPECIFICATION.md` for complete implementation guide

## Setup Instructions

### 1. Configure API Endpoint

Create or edit the `.env` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

Update the port and URL to match your Python backend configuration.

### 2. Build Your Python Backend

Follow the complete specification in `PYTHON_API_SPECIFICATION.md` to create your backend API.

Example Quick Start:

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-cors

# Create your API server (see PYTHON_API_SPECIFICATION.md for code)
# Run it on port 8000 (or update .env accordingly)
python app.py
```

### 3. Frontend Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar)

### 4. Running Together

**Terminal 1 (Python Backend)**:
```bash
python app.py
```

**Terminal 2 (Frontend)**:
```bash
npm run dev
```

**Access the app**:
- Main app: `http://localhost:5173`
- Billing login: `http://localhost:5173/billing-login`

## Usage Guide

### For Shop Workers

#### Login
1. Navigate to `http://localhost:5173/billing-login`
2. Enter credentials:
   - **Username**: `shop1`
   - **Password**: `shop123`
3. Click "Sign In"

#### Creating a Bill
1. After login, you'll see the Bill Generator page
2. **Left Panel**: Browse and search products
   - Use the search box to find products by name or category
   - Click on product variants to add different sizes/packages
   - Or click "Add" to add default variant
3. **Right Panel**: Manage bill details
   - Enter customer name (required)
   - Enter customer phone (optional)
   - Select payment method
4. **Managing Items**:
   - Adjust quantities using ±buttons or by typing
   - Remove items by clicking the ✕ button
   - Clear all items with "Clear All" button
5. **Generate Bill**:
   - Click "Generate Bill" when ready
   - Bill will be saved and counter resets
   - Success message appears briefly

#### Viewing Bill History
1. Click menu/navigation to access "Bill History"
2. Or manually navigate to `http://localhost:5173/billing-history`
3. View all generated bills in table format
4. **Actions**:
   - 📋 View bill details in modal
   - 🖨️ Print bill (opens print dialog)
5. **Filtering**: Select status filter to show specific bills

#### Printing Bills
1. From bill history, click the 📋 or 🖨️ icon
2. Print dialog opens with professionally formatted bill
3. Select printer and print settings
4. Bill shows:
   - Company name and logo
   - Bill number and date
   - Customer information
   - Itemized list with prices
   - Total amount
   - Payment method

### Admin/Manager Functions

#### Adding New Worker Accounts
1. Edit `server/index.js`
2. Add new worker to the `workers` Map initialization:

```javascript
workers.set('worker_username', {
  id: 'w2',
  username: 'worker_username',
  passwordHash: hashPassword('worker_password'),
  name: 'Worker Name',
  role: 'staff',
  createdAt: new Date()
})
```

3. Restart the server

#### Accessing Bill Data
- Bills are currently stored in-memory
- For production, implement database (MongoDB, PostgreSQL, etc.)
- Access bills via `/api/bills` endpoint with authentication token

## Configuration

### API Base URL Configuration

The frontend uses the `VITE_API_BASE_URL` environment variable to determine the backend API location.

Edit or create `.env` in the project root:

```bash
VITE_API_BASE_URL=http://your-api-url/api
```

Examples:
- Local: `http://localhost:8000/api`
- Remote: `https://api.yourdomain.com/api`
- Docker: `http://billing-api:8000/api`

### Authentication Token Storage

Tokens are stored in browser's localStorage under key `billingToken`. 
Tokens are automatically sent in the `Authorization: Bearer {token}` header.

### Product Integration

The billing module uses products from `CatalogContext`. Products are automatically synced with your existing catalog system.

## Data Storage

The backend is responsible for data persistence. Implement database storage in your Python backend:

### Options
- **SQLite**: Simple, file-based (good for small deployments)
- **PostgreSQL**: Robust, scalable, recommended for production
- **MongoDB**: Flexible schema, good for rapid development
- **MySQL**: Traditional, widely supported

See `PYTHON_API_SPECIFICATION.md` for backend implementation details.

## API Specification

**The frontend communicates with your backend via the API endpoints specified in `PYTHON_API_SPECIFICATION.md`**

Ensure your Python backend implements ALL required endpoints:
- Authentication: `/auth/login`, `/auth/verify`, `/auth/logout`
- Bills: `/bills`, `/bills/:id`, `PUT /bills/:id`

See `PYTHON_API_SPECIFICATION.md` for complete endpoint documentation and requirements.

## Security Considerations

### Frontend Security
✓ Uses secure token-based authentication  
✓ Tokens stored in browser's localStorage  
✓ Automatic session validation  
✓ HTTPS ready (use in production)  

### Backend Security (Your Responsibility)
Implement in your Python backend:

1. **HTTPS/TLS**: Always use HTTPS in production
2. **Password Hashing**: Use bcrypt, Argon2, or similar
   ```python
   from werkzeug.security import generate_password_hash, check_password_hash
   ```

3. **JWT Tokens**: Implement with expiration
   ```python
   import jwt
   token = jwt.encode({'worker_id': id, 'exp': datetime.utcnow() + timedelta(hours=8)}, SECRET)
   ```

4. **Rate Limiting**: Prevent brute force attacks
   ```python
   from flask_limiter import Limiter
   ```

5. **CORS**: Configure properly for your domain
   ```python
   CORS(app, resources={r"/api/*": {"origins": ["https://yourdomain.com"]}})
   ```

6. **Input Validation**: Validate all inputs
   ```python
   from marshmallow import Schema, fields, validate
   ```

7. **Database Security**: 
   - Use parameterized queries (ORM recommended)
   - Encrypt sensitive data
   - Regular backups

8. **Audit Logging**: Log all billing operations
9. **API Rate Limiting**: Prevent abuse
10. **Error Handling**: Don't expose internal errors to clients

## Troubleshooting

### Issue: "Failed to connect to API"
- **Check**: Is your Python backend running?
- **Verify**: `VITE_API_BASE_URL` in `.env` matches your backend URL
- **Test**: Visit `http://localhost:8000/api/health` (or your API URL)
- **Solution**: Start your Python backend and verify the port

### Issue: "Invalid credentials"
- **Check**: Are username/password correct?
- **Verify**: Worker account exists in your Python backend
- **Solution**: Add credentials to your Python backend's authentication system

### Issue: "Unauthorized" / Token errors
- **Solution**: Token may have expired, clear browser cache and login again
- **Check**: Browser console for authentication errors
- **Verify**: Backend properly validates tokens

### Issue: CORS errors
- **Cause**: Frontend and backend on different domains
- **Solution**: Update `.env` to match your backend URL
- **Backend**: Implement CORS headers in Python (`flask-cors`)

### Issue: "Bill creation failed"
- **Check**: All required fields provided (customerName, items, totalAmount)
- **Verify**: Backend accepts the request format
- **Debug**: Check browser Network tab for API response

### Issue: Products not showing up
- **Cause**: Products from CatalogContext may not be loaded
- **Check**: Browser console for errors
- **Verify**: Products exist in your catalog data

### Issue: Cannot view bill history
- **Check**: User is authenticated (token exists)
- **Verify**: Backend `/api/bills` endpoint returns data
- **Debug**: Check Network tab in browser DevTools

## Python Backend Implementation

See **`PYTHON_API_SPECIFICATION.md`** for complete implementation guide including:
- All required endpoints with request/response formats
- Sample Flask code
- Example database setup
- Error handling patterns
- Testing with curl

## Performance Optimization

1. **Pagination**: Bills page uses limit/offset for large datasets
2. **Search**: Client-side search is fast for current product count
3. **Caching**: Consider adding Redis for session management
4. **Database Indexing**: When using database, index billNumber, customerName

## Future Enhancements

- [ ] Export bills to PDF with better formatting
- [ ] Email bill to customer
- [ ] Multi-language support for bills
- [ ] Barcode/QR code on bills
- [ ] Refund/credit note generation
- [ ] Inventory management integration
- [ ] Sales analytics dashboard
- [ ] Multiple store support
- [ ] Advanced filtering and reports
- [ ] Mobile app version
- [ ] Offline mode support
- [ ] Integration with payment gateways

## Support & Maintenance

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Check browser console for errors
4. Review server logs
5. Check API responses in Network tab

## License

This module is part of Madhuban Traders application.

---

**Last Updated**: 2024
**Version**: 1.0

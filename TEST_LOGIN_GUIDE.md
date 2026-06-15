# Billing Module - Test Login (No Backend Required)

## 🧪 Testing Without Backend

The Billing Module now includes **fake login credentials** that bypass the backend API entirely. Perfect for UI testing and development!

---

## Test Credentials

Use **any** of these to login without a backend server:

| Username | Password |
|----------|----------|
| `test` | `test` |
| `demo` | `demo` |
| `worker` | `worker` |

---

## What Works in Test Mode

✅ **Worker Login** - Instantly logged in without API call  
✅ **Bill Generation** - Bills stored in browser localStorage  
✅ **Bill History** - View all generated test bills  
✅ **Print Bills** - Print functionality works normally  
✅ **Product Selection** - Full product catalog available  
✅ **All Features** - Complete billing workflow  

---

## How Test Mode Works

### Login Flow (Test)
1. Enter test credentials (e.g., `test` / `test`)
2. Generates fake token and worker data
3. Stores in localStorage instead of calling API
4. No backend required

### Bill Creation (Test)
1. Add products and fill in customer details
2. Click "Generate Bill"
3. Bill stored in browser's `fakeBills` localStorage key
4. Appears in Bill History immediately

### Bill History (Test)
1. All test bills displayed from localStorage
2. Print, view details - works as normal
3. Data persists until browser cache cleared

---

## Testing the Full Workflow

### 1. Start Frontend Only
```bash
npm install
npm run dev
```

### 2. Navigate to Billing Login
```
http://localhost:5173/billing-login
```

### 3. Login with Test Credentials
- Username: `test`
- Password: `test`

### 4. Test All Features
- ✓ Search products
- ✓ Add items to bill
- ✓ Adjust quantities
- ✓ Select payment method
- ✓ Generate bills
- ✓ View bill history
- ✓ Print bills

---

## Switching to Real Backend

Once your Python backend is ready:

1. Update `.env`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

2. Use real credentials in your Python backend
3. Test mode automatically disabled when API endpoint responds

The system detects if the API is available and uses real login if it responds. Test mode is only used when API is unavailable.

---

## Data Storage (Test Mode)

Test bills are stored in browser's localStorage under key: `fakeBills`

To clear test data:
- Open DevTools → Application → Local Storage
- Find `fakeBills` key
- Delete it

Or programmatically:
```javascript
localStorage.removeItem('fakeBills')
```

---

## Test vs. Production

| Feature | Test Mode | Production |
|---------|-----------|-----------|
| Login | Instant, no API | Real credentials, API verified |
| Bill Storage | Browser localStorage | Database |
| Data Persistence | Session only | Permanent |
| Worker Management | Single test user | Multiple users |
| Credentials | Fixed (test/demo/worker) | Dynamic |

---

## Notes

- **Test mode only works with test credentials** - Real credentials still go to API
- **Data is not encrypted** - localStorage is visible, don't use sensitive data in testing
- **Browser-only persistence** - Data lost if localStorage cleared
- **Single worker** - Test mode doesn't support multiple workers
- **Ready for production** - Disable test credentials before deploying:
  - Remove test credential list from BillingContext.jsx
  - Or check environment variable to disable test mode

---

## Quick Testing Scenario

```
1. npm run dev                          # Start frontend
2. Open http://localhost:5173/billing-login
3. Login: test / test
4. Search for "Mustard Oil"
5. Add 2 units of "1 L" variant
6. Enter customer name: "Test Customer"
7. Click "Generate Bill"
8. Go to Bill History
9. Click 🖨️ to print
10. Done! No backend needed!
```

---

## Troubleshooting Test Mode

**Q: Test login not working?**  
A: Make sure you're using exact credentials: `test`/`test`, `demo`/`demo`, or `worker`/`worker` (case-sensitive)

**Q: Bills not saving?**  
A: Check if localStorage is enabled in browser. DevTools → Application → Storage

**Q: Can't see test bills?**  
A: Navigate to /billing-history after creating a bill

**Q: Want to clear all test data?**  
A: Open DevTools, Application tab, Local Storage, delete `fakeBills` key

---

## Next Steps

1. **Test the UI** - Use test credentials to explore
2. **Build Backend** - Use `PYTHON_API_SPECIFICATION.md`
3. **Switch to Real** - Update `.env` with backend URL
4. **Deploy** - Remove test credentials for production

---

Enjoy testing! 🚀

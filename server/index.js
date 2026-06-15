import express from 'express'
import bodyParser from 'body-parser'
import crypto from 'crypto'

const app = express()
const PORT = process.env.PORT || 5000

app.use(bodyParser.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') res.sendStatus(200)
  else next()
})

// ============ WORKER AUTHENTICATION ============
// In-memory storage (replace with database for production)
const workers = new Map()
const bills = new Map()
let billCounter = 1000

// Initialize default shop worker for demo
workers.set('shop1', {
  id: 'w1',
  username: 'shop1',
  passwordHash: hashPassword('shop123'),
  name: 'Shop Manager 1',
  role: 'manager',
  createdAt: new Date()
})

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

// Middleware to verify token
function verifyToken(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  const token = auth.slice(7)
  const workerSession = Array.from(workers.values()).find(w => w.token === token)
  
  if (!workerSession) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  
  req.worker = workerSession
  next()
}

// ============ ENDPOINTS ============

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }
  
  const worker = workers.get(username)
  
  if (!worker || worker.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const token = generateToken()
  worker.token = token
  worker.lastLogin = new Date()
  
  res.json({
    success: true,
    token,
    worker: {
      id: worker.id,
      username: worker.username,
      name: worker.name,
      role: worker.role
    }
  })
})

// Logout endpoint
app.post('/api/auth/logout', verifyToken, (req, res) => {
  req.worker.token = null
  res.json({ success: true, message: 'Logged out successfully' })
})

// Verify token endpoint
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    worker: {
      id: req.worker.id,
      username: req.worker.username,
      name: req.worker.name,
      role: req.worker.role
    }
  })
})

// Create new bill
app.post('/api/bills', verifyToken, (req, res) => {
  const { customerName, customerPhone, items, totalAmount, paymentMethod } = req.body
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Bill must contain at least one item' })
  }
  
  const billId = ++billCounter
  const bill = {
    id: billId,
    billNumber: `BILL-${billId}`,
    customerName: customerName || 'Walk-in Customer',
    customerPhone: customerPhone || '',
    items,
    totalAmount,
    paymentMethod: paymentMethod || 'cash',
    createdBy: req.worker.id,
    createdByName: req.worker.name,
    createdAt: new Date(),
    status: 'completed'
  }
  
  bills.set(billId, bill)
  
  res.status(201).json({
    success: true,
    bill
  })
})

// Get all bills (with optional filters)
app.get('/api/bills', verifyToken, (req, res) => {
  const { limit = 50, offset = 0 } = req.query
  const allBills = Array.from(bills.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
  
  res.json({
    success: true,
    bills: allBills,
    total: bills.size
  })
})

// Get single bill
app.get('/api/bills/:id', verifyToken, (req, res) => {
  const bill = bills.get(parseInt(req.params.id))
  
  if (!bill) {
    return res.status(404).json({ error: 'Bill not found' })
  }
  
  res.json({ success: true, bill })
})

// Update bill status
app.put('/api/bills/:id', verifyToken, (req, res) => {
  const { status } = req.body
  const bill = bills.get(parseInt(req.params.id))
  
  if (!bill) {
    return res.status(404).json({ error: 'Bill not found' })
  }
  
  bill.status = status || bill.status
  bill.updatedAt = new Date()
  
  res.json({ success: true, bill })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

app.listen(PORT, () => {
  console.log(`Billing server running on port ${PORT}`)
})
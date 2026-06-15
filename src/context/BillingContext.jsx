import React, { createContext, useContext, useState, useEffect } from 'react'

const BillingContext = createContext(null)

/**
 * TEST LOGIN CREDENTIALS (No Backend Needed)
 * ==========================================
 * Username: test    / Password: test
 * Username: demo    / Password: demo
 * Username: worker  / Password: worker
 * 
 * These bypass API calls and store bills in localStorage for testing.
 * In production, these test credentials should be removed or disabled.
 */

// Get API base URL from environment variable or use default
// For Python backend, set VITE_API_BASE_URL in .env
// Example: VITE_API_BASE_URL=http://localhost:8000/api
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export function BillingProvider({ children }) {
  const [worker, setWorker] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('billingToken'))
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Verify token on mount
  useEffect(() => {
    if (token) {
      verifyToken()
    }
  }, [token])

  const verifyToken = async () => {
    try {
      // Check if it's a fake login token
      if (localStorage.getItem('fakeLogin') === 'true' && token.startsWith('fake_token_')) {
        setError(null)
        return
      }

      const response = await fetch(`${API_BASE}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setWorker(data.worker)
        setError(null)
      } else {
        logout()
      }
    } catch (err) {
      console.error('Token verification failed:', err)
      logout()
    }
  }

  const login = async (username, password) => {
    setLoading(true)
    setError(null)
    
    // ============ FAKE LOGIN FOR TESTING ============
    // Use any of these test credentials to bypass API:
    // - test / test
    // - demo / demo
    // - worker / worker
    if (['test', 'demo', 'worker'].includes(username.toLowerCase()) && password === username.toLowerCase()) {
      try {
        const testWorker = {
          id: `w_${username}`,
          username: username.toLowerCase(),
          name: `${username.charAt(0).toUpperCase() + username.slice(1)} Worker`,
          role: 'staff'
        }
        const testToken = `fake_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        setToken(testToken)
        setWorker(testWorker)
        localStorage.setItem('billingToken', testToken)
        localStorage.setItem('fakeLogin', 'true')
        
        setLoading(false)
        return true
      } catch (err) {
        setError('Test login failed')
        setLoading(false)
        return false
      }
    }
    
    // ============ REAL API LOGIN ============
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      if (!response.ok) {
        throw new Error('Invalid credentials')
      }
      
      const data = await response.json()
      setToken(data.token)
      setWorker(data.worker)
      localStorage.setItem('billingToken', data.token)
      localStorage.removeItem('fakeLogin')
      setLoading(false)
      return true
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return false
    }
  }

  const logout = async () => {
    if (token && localStorage.getItem('fakeLogin') !== 'true') {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (err) {
        console.error('Logout error:', err)
      }
    }
    
    setToken(null)
    setWorker(null)
    setBills([])
    localStorage.removeItem('billingToken')
    localStorage.removeItem('fakeLogin')
  }

  const createBill = async (billData) => {
    if (!token) throw new Error('Not authenticated')
    
    setLoading(true)
    setError(null)
    
    // Check if it's a fake login
    const isFakeLogin = localStorage.getItem('fakeLogin') === 'true'
    
    try {
      if (isFakeLogin) {
        // ============ FAKE BILL CREATION FOR TESTING ============
        const fakeBills = JSON.parse(localStorage.getItem('fakeBills') || '[]')
        const billId = 1000 + fakeBills.length + 1
        
        const fakeBill = {
          id: billId,
          billNumber: `BILL-${billId}`,
          ...billData,
          createdBy: worker?.id || 'test_worker',
          createdByName: worker?.name || 'Test Worker',
          createdAt: new Date().toISOString(),
          status: 'completed'
        }
        
        fakeBills.push(fakeBill)
        localStorage.setItem('fakeBills', JSON.stringify(fakeBills))
        setBills([fakeBill, ...bills])
        setLoading(false)
        return fakeBill
      }
      
      // ============ REAL API CALL ============
      const response = await fetch(`${API_BASE}/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(billData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create bill')
      }
      
      const data = await response.json()
      setBills([data.bill, ...bills])
      setLoading(false)
      return data.bill
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }

  const fetchBills = async (limit = 50, offset = 0) => {
    if (!token) throw new Error('Not authenticated')
    
    setLoading(true)
    setError(null)
    
    // Check if it's a fake login
    const isFakeLogin = localStorage.getItem('fakeLogin') === 'true'
    
    try {
      if (isFakeLogin) {
        // ============ FAKE BILLS FROM LOCALSTORAGE ============
        const fakeBills = JSON.parse(localStorage.getItem('fakeBills') || '[]')
        const sorted = fakeBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        const paginated = sorted.slice(offset, offset + limit)
        
        setBills(paginated)
        setLoading(false)
        return { bills: paginated, total: fakeBills.length }
      }
      
      // ============ REAL API CALL ============
      const response = await fetch(`${API_BASE}/bills?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch bills')
      }
      
      const data = await response.json()
      setBills(data.bills)
      setLoading(false)
      return data
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }

  const getBillById = async (billId) => {
    if (!token) throw new Error('Not authenticated')
    
    // Check if it's a fake login
    const isFakeLogin = localStorage.getItem('fakeLogin') === 'true'
    
    try {
      if (isFakeLogin) {
        // ============ FAKE BILL LOOKUP ============
        const fakeBills = JSON.parse(localStorage.getItem('fakeBills') || '[]')
        const bill = fakeBills.find(b => b.id === parseInt(billId))
        if (!bill) throw new Error('Bill not found')
        return bill
      }
      
      // ============ REAL API CALL ============
      const response = await fetch(`${API_BASE}/bills/${billId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Bill not found')
      }
      
      const data = await response.json()
      return data.bill
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateBillStatus = async (billId, status) => {
    if (!token) throw new Error('Not authenticated')
    
    try {
      const response = await fetch(`${API_BASE}/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update bill')
      }
      
      const data = await response.json()
      setBills(bills.map(b => b.id === billId ? data.bill : b))
      return data.bill
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    worker,
    token,
    bills,
    loading,
    error,
    login,
    logout,
    createBill,
    fetchBills,
    getBillById,
    updateBillStatus,
    isAuthenticated: !!worker && !!token
  }

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  )
}

export function useBilling() {
  const context = useContext(BillingContext)
  if (!context) {
    throw new Error('useBilling must be used within BillingProvider')
  }
  return context
}

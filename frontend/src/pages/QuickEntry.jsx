import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBilling } from '../context/BillingContext'
import '../styles/billing.css'

export default function QuickEntry() {
  const navigate = useNavigate()
  const { worker, logout, loading: billingLoading } = useBilling()

  const [billItems, setBillItems] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [orderType, setOrderType] = useState('retail')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [arrears, setArrears] = useState('0')
  const [discount, setDiscount] = useState('0')
  const [quickName, setQuickName] = useState('')
  const [quickQty, setQuickQty] = useState('1')
  const [quickRate, setQuickRate] = useState('0')
  const [quickCategory, setQuickCategory] = useState('General')
  const [generatingBill, setGeneratingBill] = useState(false)
  const [error, setError] = useState('')

  if (!worker) {
    navigate('/billing-login')
    return null
  }

  const calculateSubtotal = () =>
    billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal()
    const discountValue = parseFloat(discount) || 0
    const arrearsValue = parseFloat(arrears) || 0
    return Math.max(0, subtotal - discountValue + arrearsValue)
  }

  const addManualItem = () => {
    const itemName = quickName.trim()
    const quantity = Number(quickQty)
    const price = Number(quickRate)

    if (!itemName) {
      setError('Enter product name for quick entry.')
      return
    }

    if (!quantity || quantity <= 0 || !price || price <= 0) {
      setError('Enter valid quantity and rate.')
      return
    }

    const newItem = {
      key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      productId: `manual-${Date.now()}`,
      productName: itemName,
      hsnCode: '1514',
      gstRate: 5,
      category: quickCategory || 'General',
      variant: null,
      price,
      quantity,
      discount: 0
    }

    setBillItems(prev => [...prev, newItem])
    setQuickName('')
    setQuickQty('1')
    setQuickRate('0')
    setQuickCategory('General')
    setError('')
  }

  const handleFastExampleBill = () => {
    setCustomerName('Walk-in Customer')
    setOrderType('retail')
    setBillItems([
      {
        key: 'example-oil',
        productId: 'example-oil',
        productName: 'Little Oil',
        hsnCode: '1514',
        gstRate: 5,
        category: 'Edible Oil',
        variant: null,
        price: 186.67,
        quantity: 75,
        discount: 0
      },
      {
        key: 'example-garam-masala',
        productId: 'example-garam-masala',
        productName: 'Garam Masala',
        hsnCode: '0910',
        gstRate: 5,
        category: 'Spices',
        variant: null,
        price: 1350,
        quantity: 2,
        discount: 0
      },
      {
        key: 'example-haldi',
        productId: 'example-haldi',
        productName: 'Haldi',
        hsnCode: '0910',
        gstRate: 5,
        category: 'Spices',
        variant: null,
        price: 300,
        quantity: 5,
        discount: 0
      }
    ])
    setError('')
  }

  const removeItemFromBill = (key) => {
    setBillItems(prev => prev.filter(item => item.key !== key))
  }

  const updateItemQuantity = (key, quantity) => {
    if (quantity <= 0) {
      removeItemFromBill(key)
      return
    }

    setBillItems(prev => prev.map(item => item.key === key ? { ...item, quantity } : item))
  }

  const handleClearBill = () => {
    setBillItems([])
    setCustomerName('')
    setCustomerPhone('')
    setCustomerAddress('')
    setOrderType('retail')
    setDiscount('0')
    setArrears('0')
    setError('')
  }

  const handleReviewBill = () => {
    if (billItems.length === 0) {
      setError('Please add at least one item to the bill.')
      return
    }

    if (!customerName.trim()) {
      setError('Please enter customer name.')
      return
    }

    const billData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerStateCode: '09',
      customerStateName: 'Uttar Pradesh',
      supplierStateCode: '09',
      supplierStateName: 'Uttar Pradesh',
      orderType,
      arrears: parseFloat(arrears) || 0,
      discount: parseFloat(discount) || 0,
      subtotal: calculateSubtotal(),
      totalAmount: calculateFinalTotal(),
      paymentMethod,
      items: billItems
    }

    navigate('/bill-preview', { state: { billData } })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/billing-login')
  }

  return (
    <div className="billing-dashboard">
      <div className="billing-header">
        <div className="header-content">
          <h1>Quick Entry</h1>
          <div className="worker-info">
            <button className="btn-dashboard" onClick={() => navigate('/billing')}>🧾 Billing</button>
            <button className="btn-dashboard" onClick={() => navigate('/manager-dashboard')}>📊 Dashboard</button>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="billing-container">
        <div className="billing-summary" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="summary-card">
            <h2>Fast Billing</h2>

            <div className="form-section">
              <h3>Quick Entry</h3>
              <div className="quick-entry-box" style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleFastExampleBill}>
                  Use Example: 75 Little Oil + 2kg Garam Masala + 5kg Haldi
                </button>

                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="Little Oil"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Qty</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={quickQty}
                      onChange={(e) => setQuickQty(e.target.value)}
                      placeholder="75"
                    />
                  </div>
                  <div className="form-group">
                    <label>Rate (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={quickRate}
                      onChange={(e) => setQuickRate(e.target.value)}
                      placeholder="186.67"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={quickCategory} onChange={(e) => setQuickCategory(e.target.value)}>
                      <option value="General">General</option>
                      <option value="Edible Oil">Edible Oil</option>
                      <option value="Spices">Spices</option>
                      <option value="Masala">Masala</option>
                    </select>
                  </div>
                </div>

                <button type="button" className="btn btn-add" onClick={addManualItem}>
                  Add Manual Item
                </button>
              </div>

              <h3>Customer Information</h3>
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCustomerName('Walk-in Customer')}>
                  Walk-in Customer
                </button>
                <button type="button" className="btn btn-outline" onClick={handleClearBill}>
                  Clear Bill
                </button>
              </div>

              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>Customer Address</label>
                <textarea
                  rows="3"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter address for delivery or contact"
                />
              </div>
            </div>

            <div className="bill-items">
              <h3>Items ({billItems.length})</h3>
              {billItems.length === 0 ? (
                <p className="empty-message">No items added yet</p>
              ) : (
                <div className="items-list">
                  {billItems.map(item => (
                    <div key={item.key} className="bill-item">
                      <div className="item-details">
                        <div className="item-name">{item.productName}</div>
                        <div className="item-price">₹{item.price}</div>
                      </div>

                      <div className="item-controls">
                        <button className="qty-btn" onClick={() => updateItemQuantity(item.key, item.quantity - 1)}>−</button>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.key, parseFloat(e.target.value) || 0.01)}
                          className="qty-input"
                        />
                        <button className="qty-btn" onClick={() => updateItemQuantity(item.key, item.quantity + 1)}>+</button>
                      </div>

                      <div className="item-total">
                        <div>₹{(item.price * item.quantity).toFixed(2)}</div>
                        <button className="btn-remove" onClick={() => removeItemFromBill(item.key)} title="Remove item">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bill-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span className="amount">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <button className="btn btn-generate" onClick={handleReviewBill} disabled={billingLoading}>
              Review Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

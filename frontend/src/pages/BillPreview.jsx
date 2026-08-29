import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBilling } from '../context/BillingContext'
import '../styles/billing.css'

export default function BillPreview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { worker, createBill } = useBilling()
  
  const billData = location.state?.billData
  
  // Editable states
  const [customerName, setCustomerName] = useState(billData?.customerName || '')
  const [customerPhone, setCustomerPhone] = useState(billData?.customerPhone || '')
  const [customerAddress, setCustomerAddress] = useState(billData?.customerAddress || '')
  const [orderType, setOrderType] = useState(billData?.orderType || 'retail')
  const [paymentMethod, setPaymentMethod] = useState(billData?.paymentMethod || 'cash')
  const [discount, setDiscount] = useState(String(billData?.discount || '0'))
  const [arrears, setArrears] = useState(String(billData?.arrears || '0'))
  const [billItems, setBillItems] = useState(billData?.items || [])
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!billData || !worker) {
      navigate('/billing')
    }
  }, [billData, worker, navigate])

  if (!billData) {
    return <div>Loading...</div>
  }

  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTaxSummary = () => {
    const supplierStateCode = '09'
    const customerStateCode = supplierStateCode
    const isInterState = supplierStateCode !== customerStateCode
    let taxableValue = 0
    let cgst = 0
    let sgst = 0
    let igst = 0

    billItems.forEach((item) => {
      const quantity = Number(item.quantity) || 0
      const price = Number(item.price) || 0
      const lineDiscount = Number(item.discount) || 0
      const gstRate = Number(item.gstRate) || 5
      const lineTaxable = Math.max(0, quantity * price - lineDiscount)
      taxableValue += lineTaxable

      const taxAmount = (lineTaxable * gstRate) / 100
      if (isInterState) {
        igst += taxAmount
      } else {
        cgst += taxAmount / 2
        sgst += taxAmount / 2
      }
    })

    const discountValue = parseFloat(discount) || 0
    const arrearsValue = parseFloat(arrears) || 0
    const total = Math.max(0, taxableValue + cgst + sgst + igst - discountValue + arrearsValue)

    return {
      taxableValue,
      cgst,
      sgst,
      igst,
      discountValue,
      arrearsValue,
      total
    }
  }

  const calculateFinalTotal = () => {
    return calculateTaxSummary().total
  }

  const updateItemQuantity = (key, newQuantity) => {
    if (newQuantity <= 0) {
      setBillItems(billItems.filter(item => item.key !== key))
    } else {
      setBillItems(billItems.map(item =>
        item.key === key ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const removeItem = (key) => {
    setBillItems(billItems.filter(item => item.key !== key))
  }

  const handleGenerateBill = async () => {
    if (!customerName.trim()) {
      setError('Please enter customer name')
      return
    }

    if (billItems.length === 0) {
      setError('Please add at least one item to the bill')
      return
    }

    const invalidHsn = billItems.find((item) => item.hsnCode && !/^\d{4,8}$/.test(String(item.hsnCode).trim()))
    if (invalidHsn) {
      setError('Each item requires a valid HSN code with 4 to 8 digits.')
      return
    }

    if (calculateFinalTotal() > 50000 && !customerAddress.trim() && !customerPhone.trim()) {
      setError('For B2C invoices above ₹50,000, add customer address and phone details.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const finalBillData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        orderType,
        arrears: parseFloat(arrears) || 0,
        discount: parseFloat(discount) || 0,
        subtotal: calculateSubtotal(),
        totalAmount: calculateFinalTotal(),
        paymentMethod,
        items: billItems
      }

      const bill = await createBill(finalBillData)
      
      // Navigate to invoice page with bill data
      navigate('/bill-invoice', { state: { bill } })
    } catch (err) {
      setError(err.message || 'Failed to generate bill')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCancel = () => {
    navigate('/billing')
  }

  return (
    <div className="billing-dashboard">
      <div className="billing-header">
        <div className="header-content">
          <h1>Preview & Verify Bill</h1>
          <div className="worker-info">
            Review the bill details below before confirming.
          </div>
        </div>
      </div>

      <div className="billing-container preview-view">
        <div className="preview-content">
          
          {/* Customer Section */}
          <div className="preview-section">
            <h2>Customer Information</h2>
            <div className="preview-grid">
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  rows="3"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Customer address"
                />
              </div>
            </div>
          </div>

          {/* Order Details Section */}
          <div className="preview-section">
            <h2>Order Details</h2>
            <div className="preview-grid">
              <div className="form-group">
                <label>Order Type</label>
                <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                  <option value="retail">Retail</option>
                  <option value="bulk">Bulk</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="check">Check</option>
                  <option value="online">Online Transfer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="preview-section">
            <h2>Bill Items</h2>
            <div className="preview-items-table">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Product</th>
                    <th>Variant/Unit</th>
                    <th>Quantity</th>
                    <th>Rate (₹)</th>
                    <th>Total (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((item, idx) => (
                    <tr key={item.key}>
                      <td>{idx + 1}</td>
                      <td>{item.productName}</td>
                      <td>{item.variant?.label || 'Default'}</td>
                      <td>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.key, parseFloat(e.target.value) || 0)}
                          className="qty-edit-input"
                        />
                      </td>
                      <td>{item.price.toFixed(2)}</td>
                      <td>{(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <button
                          className="btn-remove"
                          onClick={() => removeItem(item.key)}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Section */}
          <div className="preview-section">
            <h2>Bill Summary</h2>
            <div className="summary-grid">
              <div className="form-group">
                <label>Subtotal (₹)</label>
                <input
                  type="text"
                  value={calculateSubtotal().toFixed(2)}
                  disabled
                  className="summary-input"
                />
              </div>
              <div className="form-group">
                <label>Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Arrears / Bakaya (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={arrears}
                  onChange={(e) => setArrears(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="form-group highlight">
                <label>Final Total (₹)</label>
                <input
                  type="text"
                  value={calculateFinalTotal().toFixed(2)}
                  disabled
                  className="summary-input total-highlight"
                />
              </div>
            </div>
            <div className="summary-grid" style={{ marginTop: 12 }}>
              <div className="form-group">
                <label>Taxable Value</label>
                <input type="text" value={calculateTaxSummary().taxableValue.toFixed(2)} disabled className="summary-input" />
              </div>
              <div className="form-group">
                <label>CGST</label>
                <input type="text" value={calculateTaxSummary().cgst.toFixed(2)} disabled className="summary-input" />
              </div>
              <div className="form-group">
                <label>SGST</label>
                <input type="text" value={calculateTaxSummary().sgst.toFixed(2)} disabled className="summary-input" />
              </div>
              <div className="form-group">
                <label>IGST</label>
                <input type="text" value={calculateTaxSummary().igst.toFixed(2)} disabled className="summary-input" />
              </div>
            </div>
          </div>

          {/* Errors */}
          {error && <div className="error-alert">{error}</div>}

          {/* Action Buttons */}
          <div className="preview-actions">
            <button
              className="btn btn-generate"
              onClick={handleGenerateBill}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating Bill...' : '✓ Generate & View Invoice'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isGenerating}
            >
              ← Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

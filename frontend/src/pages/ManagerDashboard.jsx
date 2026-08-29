import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBilling } from '../context/BillingContext'
import { useCatalog } from '../context/CatalogContext'
import '../styles/billing.css'

const emptyProductForm = {
  name: '',
  name_hi: '',
  category: 'Oils',
  price: '',
  stock: '0',
  hsnCode: '',
  gstRate: '5',
  manufacturer: 'Madhuban Traders',
  origin: 'India',
  description: '',
  description_hi: '',
  certifications: 'FSSAI'
}

export default function ManagerDashboard() {
  const navigate = useNavigate()
  const { worker, logout, fetchBills, bills, loading } = useBilling()
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct } = useCatalog()
  
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filteredBills, setFilteredBills] = useState([])
  const [expandedDate, setExpandedDate] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productMessage, setProductMessage] = useState('')

  useEffect(() => {
    if (!worker) {
      navigate('/billing-login')
      return
    }
    loadBills()
    fetchProducts().catch(() => {})
  }, [worker])

  useEffect(() => {
    filterBills()
  }, [bills, dateFrom, dateTo])

  const loadBills = async () => {
    try {
      await fetchBills()
    } catch (err) {
      console.error('Failed to load bills:', err)
    }
  }

  const filterBills = () => {
    let filtered = bills || []

    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      filtered = filtered.filter(bill => new Date(bill.createdAt) >= from)
    }

    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      filtered = filtered.filter(bill => new Date(bill.createdAt) <= to)
    }

    setFilteredBills(filtered)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/billing-login')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`
  }

  // Group bills by date
  const billsByDate = {}
  filteredBills.forEach(bill => {
    const dateKey = formatDate(bill.createdAt)
    if (!billsByDate[dateKey]) {
      billsByDate[dateKey] = []
    }
    billsByDate[dateKey].push(bill)
  })

  // Calculate totals
  const calculateTotals = (billList) => {
    return billList.reduce((acc, bill) => ({
      totalBills: acc.totalBills + 1,
      totalAmount: acc.totalAmount + (bill.totalAmount || 0),
      totalCash: acc.totalCash + (bill.paymentMethod === 'cash' ? bill.totalAmount : 0),
      totalCredit: acc.totalCredit + (bill.paymentMethod === 'credit' ? bill.totalAmount : 0),
      totalDiscount: acc.totalDiscount + (bill.discount || 0),
      totalArrears: acc.totalArrears + (bill.arrears || 0),
      totalReturn: acc.totalReturn + 0 // Will calculate based on order type
    }), {
      totalBills: 0,
      totalAmount: 0,
      totalCash: 0,
      totalCredit: 0,
      totalDiscount: 0,
      totalArrears: 0,
      totalReturn: 0
    })
  }

  const dateTotals = {}
  Object.keys(billsByDate).forEach(dateKey => {
    dateTotals[dateKey] = calculateTotals(billsByDate[dateKey])
  })

  const grandTotals = calculateTotals(filteredBills)

  const handleResetFilters = () => {
    setDateFrom('')
    setDateTo('')
  }

  const handleProductFieldChange = (field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }))
  }

  const resetProductForm = () => {
    setProductForm(emptyProductForm)
    setEditingProductId(null)
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()

    try {
      const payload = {
        name: productForm.name,
        name_hi: productForm.name_hi,
        category: productForm.category,
        price: Number(productForm.price || 0),
        stock: Number(productForm.stock || 0),
        hsnCode: productForm.hsnCode || '1514',
        gstRate: Number(productForm.gstRate || 5),
        manufacturer: productForm.manufacturer,
        origin: productForm.origin,
        description: productForm.description,
        description_hi: productForm.description_hi,
        certifications: productForm.certifications ? productForm.certifications.split(',').map((item) => item.trim()).filter(Boolean) : ['FSSAI'],
        variants: [],
        images: [],
        image: ''
      }

      if (editingProductId) {
        await updateProduct(editingProductId, payload)
        setProductMessage('Product updated successfully')
      } else {
        await createProduct(payload)
        setProductMessage('Product added successfully')
      }

      resetProductForm()
      await fetchProducts()
    } catch (error) {
      setProductMessage(error.message || 'Unable to save product')
    }
  }

  const handleEditProduct = (product) => {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name || '',
      name_hi: product.name_hi || '',
      category: product.category || 'Oils',
      price: product.price ?? '',
      stock: product.stock ?? '0',
      hsnCode: product.hsnCode || '',
      gstRate: product.gstRate ?? '5',
      manufacturer: product.manufacturer || 'Madhuban Traders',
      origin: product.origin || 'India',
      description: product.description || '',
      description_hi: product.description_hi || '',
      certifications: Array.isArray(product.certifications) ? product.certifications.join(', ') : 'FSSAI'
    })
  }

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId)
      setProductMessage('Product deleted successfully')
      await fetchProducts()
    } catch (error) {
      setProductMessage(error.message || 'Unable to delete product')
    }
  }

  const handleViewBill = (bill) => {
    navigate('/bill-invoice', { state: { bill } })
  }

  return (
    <div className="billing-dashboard">
      <div className="billing-header">
        <div className="header-content">
          <h1>📊 Shop Manager Dashboard</h1>
          <div className="worker-info">
            <button className="btn btn-secondary" onClick={() => navigate('/billing')}>← Back to Bill Generator</button>
            <button className="btn-dashboard" onClick={() => navigate('/submissions')}>📩 Customer Submissions</button>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="manager-container">
        {/* Filters Section */}
        <div className="filter-section">
          <div className="filter-card">
            <h3>📅 Filter by Date Range</h3>
            <div className="filter-group">
              <div className="filter-input">
                <label>From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="filter-input">
                <label>To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <button className="btn-reset" onClick={handleResetFilters}>
                🔄 Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards-grid">
          <div className="summary-card-item">
            <div className="card-header">📋 Total Bills</div>
            <div className="card-value">{grandTotals.totalBills}</div>
          </div>
          <div className="summary-card-item">
            <div className="card-header">💰 Total Revenue</div>
            <div className="card-value">{formatCurrency(grandTotals.totalAmount)}</div>
          </div>
          <div className="summary-card-item">
            <div className="card-header">💵 Cash Received</div>
            <div className="card-value cash">{formatCurrency(grandTotals.totalCash)}</div>
          </div>
          <div className="summary-card-item">
            <div className="card-header">💳 Credit Amount</div>
            <div className="card-value credit">{formatCurrency(grandTotals.totalCredit)}</div>
          </div>
          <div className="summary-card-item">
            <div className="card-header">🎁 Total Discount</div>
            <div className="card-value discount">{formatCurrency(grandTotals.totalDiscount)}</div>
          </div>
          <div className="summary-card-item">
            <div className="card-header">📦 Arrears (Bakaya)</div>
            <div className="card-value arrears">{formatCurrency(grandTotals.totalArrears)}</div>
          </div>
        </div>

        {/* Product Management */}
        <div className="filter-section" style={{ marginTop: '24px' }}>
          <div className="filter-card">
            <h3>🛒 Manage Products</h3>
            <form onSubmit={handleProductSubmit} className="filter-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
              <div className="filter-input">
                <label>Name</label>
                <input value={productForm.name} onChange={(e) => handleProductFieldChange('name', e.target.value)} required />
              </div>
              <div className="filter-input">
                <label>Hindi Name</label>
                <input value={productForm.name_hi} onChange={(e) => handleProductFieldChange('name_hi', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>Category</label>
                <input value={productForm.category} onChange={(e) => handleProductFieldChange('category', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>Price</label>
                <input type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => handleProductFieldChange('price', e.target.value)} required />
              </div>
              <div className="filter-input">
                <label>Stock</label>
                <input type="number" min="0" value={productForm.stock} onChange={(e) => handleProductFieldChange('stock', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>HSN</label>
                <input value={productForm.hsnCode} onChange={(e) => handleProductFieldChange('hsnCode', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>GST %</label>
                <input type="number" min="0" step="0.01" value={productForm.gstRate} onChange={(e) => handleProductFieldChange('gstRate', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>Manufacturer</label>
                <input value={productForm.manufacturer} onChange={(e) => handleProductFieldChange('manufacturer', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>Origin</label>
                <input value={productForm.origin} onChange={(e) => handleProductFieldChange('origin', e.target.value)} />
              </div>
              <div className="filter-input" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <input value={productForm.description} onChange={(e) => handleProductFieldChange('description', e.target.value)} />
              </div>
              <div className="filter-input" style={{ gridColumn: '1 / -1' }}>
                <label>Hindi Description</label>
                <input value={productForm.description_hi} onChange={(e) => handleProductFieldChange('description_hi', e.target.value)} />
              </div>
              <div className="filter-input" style={{ gridColumn: '1 / -1' }}>
                <label>Certifications</label>
                <input value={productForm.certifications} onChange={(e) => handleProductFieldChange('certifications', e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">
                {editingProductId ? 'Update Product' : 'Add Product'}
              </button>
              {editingProductId && (
                <button type="button" className="btn btn-secondary" onClick={resetProductForm}>
                  Cancel
                </button>
              )}
            </form>
            {productMessage && <p style={{ marginTop: '12px', color: '#0b6b3b', fontWeight: 600 }}>{productMessage}</p>}
          </div>
        </div>

        <div className="bills-by-date-section" style={{ marginTop: '24px' }}>
          <h2>📦 Product Inventory</h2>
          <div className="bills-list">
            <table className="bills-table-compact">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>GST</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(products || []).map((product) => (
                  <tr key={product.id} className="bill-row">
                    <td><strong>{product.name}</strong></td>
                    <td>{product.category || 'General'}</td>
                    <td>₹{Number(product.price || 0).toFixed(2)}</td>
                    <td>{product.stock ?? 0}</td>
                    <td>{product.gstRate ?? 5}%</td>
                    <td>
                      <button className="btn-action" onClick={() => handleEditProduct(product)} title="Edit product">✏️</button>
                      <button className="btn-action" onClick={() => handleDeleteProduct(product.id)} title="Delete product">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bills by Date */}
        <div className="bills-by-date-section">
          <h2>📊 Bills Breakdown by Date</h2>
          
          {Object.keys(billsByDate).length === 0 ? (
            <div className="no-data">
              <p>No bills found for the selected date range.</p>
            </div>
          ) : (
            Object.keys(billsByDate)
              .sort((a, b) => new Date(b) - new Date(a))
              .map(dateKey => (
                <div key={dateKey} className="date-group">
                  <div
                    className="date-header"
                    onClick={() => setExpandedDate(expandedDate === dateKey ? null : dateKey)}
                  >
                    <div className="date-title">
                      <span className="date-value">{dateKey}</span>
                      <span className="date-bill-count">({dateTotals[dateKey].totalBills} bills)</span>
                    </div>
                    <div className="date-totals">
                      <span className="total-badge">
                        Revenue: {formatCurrency(dateTotals[dateKey].totalAmount)}
                      </span>
                      <span className="cash-badge">
                        Cash: {formatCurrency(dateTotals[dateKey].totalCash)}
                      </span>
                      <span className="expand-icon">
                        {expandedDate === dateKey ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>

                  {expandedDate === dateKey && (
                    <div className="bills-list">
                      <table className="bills-table-compact">
                        <thead>
                          <tr>
                            <th>Bill No.</th>
                            <th>Time</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Discount</th>
                            <th>Arrears</th>
                            <th>Payment</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billsByDate[dateKey].map(bill => (
                            <tr key={bill.id} className="bill-row">
                              <td className="bill-number">
                                <strong>#{bill.billNumber}</strong>
                              </td>
                              <td className="bill-time">
                                {new Date(bill.createdAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="bill-customer">
                                <div className="customer-info">
                                  <div className="customer-name">{bill.customerName}</div>
                                  {bill.customerPhone && (
                                    <div className="customer-phone">{bill.customerPhone}</div>
                                  )}
                                </div>
                              </td>
                              <td className="bill-items">
                                <span className="badge-items">{bill.items?.length || 0}</span>
                              </td>
                              <td className="bill-amount">
                                <strong>{formatCurrency(bill.totalAmount)}</strong>
                              </td>
                              <td className="bill-discount">
                                {bill.discount > 0 ? formatCurrency(bill.discount) : '-'}
                              </td>
                              <td className="bill-arrears">
                                {bill.arrears > 0 ? formatCurrency(bill.arrears) : '-'}
                              </td>
                              <td className="bill-payment">
                                <span className={`payment-badge ${bill.paymentMethod}`}>
                                  {bill.paymentMethod?.toUpperCase() || 'CASH'}
                                </span>
                              </td>
                              <td className="bill-action">
                                <button
                                  className="btn-view-invoice"
                                  onClick={() => handleViewBill(bill)}
                                  title="View Invoice"
                                >
                                  👁️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Date Summary Row */}
                      <div className="date-summary">
                        <div className="summary-row">
                          <span className="summary-label">Date Total:</span>
                          <span className="summary-value">
                            Bills: <strong>{dateTotals[dateKey].totalBills}</strong> | 
                            Revenue: <strong>{formatCurrency(dateTotals[dateKey].totalAmount)}</strong> | 
                            Cash: <strong className="cash-value">{formatCurrency(dateTotals[dateKey].totalCash)}</strong> | 
                            Discount: <strong>{formatCurrency(dateTotals[dateKey].totalDiscount)}</strong> | 
                            Arrears: <strong>{formatCurrency(dateTotals[dateKey].totalArrears)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>

        {/* Grand Totals */}
        {filteredBills.length > 0 && (
          <div className="grand-totals-section">
            <h3>📈 Grand Totals</h3>
            <div className="totals-grid">
              <div className="total-item">
                <span className="total-label">Total Bills:</span>
                <span className="total-amount">{grandTotals.totalBills}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Total Revenue:</span>
                <span className="total-amount">{formatCurrency(grandTotals.totalAmount)}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Cash Received:</span>
                <span className="total-amount cash">{formatCurrency(grandTotals.totalCash)}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Credit Amount:</span>
                <span className="total-amount credit">{formatCurrency(grandTotals.totalCredit)}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Total Discount:</span>
                <span className="total-amount discount">{formatCurrency(grandTotals.totalDiscount)}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Total Arrears:</span>
                <span className="total-amount arrears">{formatCurrency(grandTotals.totalArrears)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

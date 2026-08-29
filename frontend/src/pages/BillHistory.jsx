import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBilling } from '../context/BillingContext'
import { handlePrintBill } from '../lib/printBill'
import '../styles/billing.css'

export default function BillHistory() {
  const navigate = useNavigate()
  const { worker, logout, fetchBills, bills, loading } = useBilling()
  const [selectedBill, setSelectedBill] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!worker) {
      navigate('/billing-login')
      return
    }
    
    loadBills()
  }, [worker])

  const loadBills = async () => {
    try {
      await fetchBills()
    } catch (err) {
      console.error('Failed to load bills:', err)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/billing-login')
  }

  const handleBack = () => {
    navigate('/billing')
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // shared helper imported from ../lib/printBill

  return (
    <div className="billing-dashboard">
      <div className="billing-header">
        <div className="header-content">
          <h1>Bill History</h1>
          <div className="worker-info">
            <button className="btn-dashboard" onClick={() => navigate('/manager-dashboard')}>📊 Dashboard</button>
            <button className="btn-dashboard" onClick={() => navigate('/submissions')}>📩 Customer Submissions</button>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="billing-container history-view">
        <div className="history-controls">
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back to New Bill
          </button>
          <div className="filter-group">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Bills</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {loading && <div className="loading">Loading bills...</div>}

        {bills.length === 0 && !loading && (
          <div className="no-data">
            <p>No bills found</p>
          </div>
        )}

        <div className="bills-table">
          {bills.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id} className="bill-row">
                    <td className="bill-number">{bill.billNumber}</td>
                    <td>{bill.customerName}</td>
                    <td>{bill.items.length} item(s)</td>
                    <td className="amount">₹{bill.totalAmount.toFixed(2)}</td>
                    <td>{formatDate(bill.createdAt)}</td>
                    <td>{bill.paymentMethod}</td>
                    <td>
                      <span className={`status-badge status-${bill.status}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-action"
                        onClick={() => setSelectedBill(bill)}
                        title="View details"
                      >
                        📋
                      </button>
                      <button
                        className="btn-action"
                        onClick={() => handlePrintBill(bill)}
                        title="Print bill"
                      >
                        🖨️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedBill && (
          <div className="bill-detail-modal">
            <div className="modal-content">
              <button className="modal-close" onClick={() => setSelectedBill(null)}>✕</button>
              <h2>Bill Details - {selectedBill.billNumber}</h2>
              
              <div className="detail-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedBill.customerName}</p>
                {selectedBill.customerPhone && (
                  <p><strong>Phone:</strong> {selectedBill.customerPhone}</p>
                )}
                {selectedBill.customerAddress && (
                  <p><strong>Address:</strong> {selectedBill.customerAddress}</p>
                )}
                <p><strong>Order Type:</strong> {selectedBill.orderType ? selectedBill.orderType.charAt(0).toUpperCase() + selectedBill.orderType.slice(1) : 'Retail'}</p>
                <p><strong>Discount:</strong> ₹{(selectedBill.discount || 0).toFixed(2)}</p>
                <p><strong>Arrears (Bakaya):</strong> ₹{(selectedBill.arrears || 0).toFixed(2)}</p>
                <p><strong>Date:</strong> {formatDate(selectedBill.createdAt)}</p>
                <p><strong>Payment Method:</strong> {selectedBill.paymentMethod}</p>
              </div>

              <div className="detail-section">
                <h3>Items</h3>
                <table className="items-detail-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          {item.productName}
                          {item.variant && <br />}
                          {item.variant && <small>({item.variant.label})</small>}
                        </td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td colSpan="3"><strong>Total</strong></td>
                      <td><strong>₹{selectedBill.totalAmount.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="detail-section">
                <h3>Payment Summary</h3>
                <p><strong>Subtotal:</strong> ₹{(selectedBill.subtotal || selectedBill.items.reduce((sum, item) => sum + item.price * item.quantity, 0)).toFixed(2)}</p>
                <p><strong>Discount:</strong> ₹{(selectedBill.discount || 0).toFixed(2)}</p>
                <p><strong>Arrears (Bakaya):</strong> ₹{(selectedBill.arrears || 0).toFixed(2)}</p>
                <p><strong>Total:</strong> ₹{selectedBill.totalAmount.toFixed(2)}</p>
              </div>

              <div className="modal-actions">
                <button className="btn" onClick={() => handlePrintBill(selectedBill)}>
                  Print Bill
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedBill(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

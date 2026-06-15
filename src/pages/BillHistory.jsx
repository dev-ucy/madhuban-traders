import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBilling } from '../context/BillingContext'
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

  const handlePrintBill = (bill) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill ${bill.billNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; }
          .section {
            margin: 20px 0;
          }
          .section h3 {
            font-size: 14px;
            margin: 10px 0 5px 0;
            font-weight: bold;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin: 3px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 14px;
          }
          th {
            background: #f0f0f0;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .total-row {
            background: #f9f9f9;
            font-weight: bold;
          }
          .total-amount {
            background: #333;
            color: white;
            font-size: 18px;
            text-align: right;
            padding: 15px;
            margin: 15px 0;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MADHUBAN TRADERS</h1>
          <p>Invoice / Receipt</p>
          <p><strong>${bill.billNumber}</strong></p>
        </div>

        <div class="section">
          <h3>Customer Information</h3>
          <div class="info-row">
            <span>Name:</span>
            <span><strong>${bill.customerName}</strong></span>
          </div>
          ${bill.customerPhone ? `
            <div class="info-row">
              <span>Phone:</span>
              <span>${bill.customerPhone}</span>
            </div>
          ` : ''}
          ${bill.customerAddress ? `
            <div class="info-row">
              <span>Address:</span>
              <span>${bill.customerAddress}</span>
            </div>
          ` : ''}
          <div class="info-row">
            <span>Order Type:</span>
            <span>${bill.orderType ? bill.orderType.charAt(0).toUpperCase() + bill.orderType.slice(1) : 'Retail'}</span>
          </div>
          <div class="info-row">
            <span>Discount:</span>
            <span>₹${(bill.discount || 0).toFixed(2)}</span>
          </div>
          <div class="info-row">
            <span>Arrears (Bakaya):</span>
            <span>₹${(bill.arrears || 0).toFixed(2)}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items.map(item => `
              <tr>
                <td>
                  ${item.productName}
                  ${item.variant ? `<br><small>(${item.variant.label})</small>` : ''}
                </td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3">TOTAL</td>
              <td>₹${bill.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>This bill was generated on ${formatDate(bill.createdAt)}</p>
        </div>

        <div class="no-print">
          <button onclick="window.print()" style="padding: 10px 20px; margin: 10px; cursor: pointer;">Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; margin: 10px; cursor: pointer;">Close</button>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="billing-dashboard">
      <div className="billing-header">
        <div className="header-content">
          <h1>Bill History</h1>
          <div className="worker-info">
            Welcome, <strong>{worker?.name}</strong>
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

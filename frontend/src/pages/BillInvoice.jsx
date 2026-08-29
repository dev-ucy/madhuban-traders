import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBilling } from '../context/BillingContext'
import '../styles/invoice.css'

export default function BillInvoice() {
  const navigate = useNavigate()
  const location = useLocation()
  const { worker } = useBilling()
  const [bill, setBill] = useState(location.state?.bill || null)

  useEffect(() => {
    if (!bill) {
      navigate('/billing')
    }
  }, [bill, navigate])

  if (!bill) {
    return <div>Loading...</div>
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // For now, use print to PDF
    // In production, use a library like jsPDF
    alert('Print to PDF using browser print dialog (Ctrl+P or Cmd+P)')
    window.print()
  }

  const handleNewBill = () => {
    navigate('/billing')
  }

  const handleViewHistory = () => {
    navigate('/billing-history')
  }

  return (
    <div className="invoice-container">
      {/* Header - Hide in print */}
      <div className="invoice-header no-print">
        <h1>Invoice Generated Successfully</h1>
        <div className="invoice-actions">
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨️ Print
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadPDF}>
            📥 Download PDF
          </button>
          <button className="btn btn-outline" onClick={handleNewBill}>
            ➕ New Bill
          </button>
          <button className="btn btn-outline" onClick={handleViewHistory}>
            📋 View History
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="invoice-content">
        {/* Company Header */}
        <div className="invoice-company-header">
          <div className="company-logo-area">
            <h1 className="company-name">MADHUBAN TRADERS</h1>
            <p className="company-tagline">Premium Spices & Oils</p>
          </div>
          <div className="company-contact">
            <p>📱 +91-7897061003</p>
            <p>📧 info@madhubantraders.com</p>
            <p>📍 Rajasthan, India</p>
          </div>
        </div>

        <hr className="invoice-divider" />

        {/* Invoice Title & Details */}
        <div className="invoice-title-section">
          <div>
            <h2 className="invoice-title">INVOICE / RECEIPT</h2>
            <p className="invoice-number">
              <strong>Bill No.:</strong> <span className="highlight">{bill.billNumber}</span>
            </p>
          </div>
          <div className="invoice-date-section">
            <p>
              <strong>Date & Time:</strong> <br />
              <span className="date-value">{formatDate(bill.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* Customer & Bill Details */}
        <div className="invoice-details-grid">
          <div className="detail-box customer-details">
            <h3>BILL TO:</h3>
            <p className="customer-name">{bill.customerName}</p>
            {bill.customerPhone && <p className="customer-phone">📱 {bill.customerPhone}</p>}
            {bill.customerAddress && <p className="customer-address">📍 {bill.customerAddress}</p>}
          </div>

          <div className="detail-box bill-details">
            <h3>Bill Information:</h3>
            <p>
              <strong>Cashier:</strong> {bill.createdByName || 'System'}
            </p>
            <p>
              <strong>Order Type:</strong> {bill.orderType ? bill.orderType.charAt(0).toUpperCase() + bill.orderType.slice(1) : 'Retail'}
            </p>
            <p>
              <strong>Payment:</strong> <span className="payment-badge">{bill.paymentMethod.toUpperCase()}</span>
            </p>
            <p>
              <strong>Status:</strong> <span className={`status-badge status-${bill.status}`}>{bill.status.toUpperCase()}</span>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="invoice-items-section">
          <h3>Items Ordered</h3>
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th className="col-sn">S.No</th>
                <th className="col-product">Product</th>
                <th className="col-variant">Variant/Unit</th>
                <th className="col-qty">Quantity</th>
                <th className="col-rate">Rate</th>
                <th className="col-total">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => (
                <tr key={item.key} className="item-row">
                  <td className="col-sn">{index + 1}</td>
                  <td className="col-product">
                    <strong>{item.productName}</strong>
                  </td>
                  <td className="col-variant">
                    {item.variant ? (
                      <span className="variant-badge">{item.variant.label}</span>
                    ) : (
                      <span className="variant-badge">Default</span>
                    )}
                  </td>
                  <td className="col-qty text-center">
                    <strong>{item.quantity}</strong>
                  </td>
                  <td className="col-rate text-right">₹{item.price.toFixed(2)}</td>
                  <td className="col-total text-right">
                    <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="invoice-summary-section">
          <div className="summary-spacer"></div>
          <div className="summary-box">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{(bill.subtotal || bill.items.reduce((sum, item) => sum + item.price * item.quantity, 0)).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Discount:</span>
              <span>- ₹{((bill.discount || 0)).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Arrears (Bakaya):</span>
              <span>+ ₹{((bill.arrears || 0)).toFixed(2)}</span>
            </div>
            <div className="summary-row taxes">
              <span>Taxes (GST):</span>
              <span>₹0.00</span>
            </div>
            <div className="summary-row shipping">
              <span>Shipping:</span>
              <span>₹0.00</span>
            </div>
            <div className="summary-row total">
              <span className="total-label">TOTAL AMOUNT:</span>
              <span className="total-amount">₹{(bill.totalAmount || (bill.subtotal || bill.items.reduce((sum, item) => sum + item.price * item.quantity, 0)) - (bill.discount || 0) + (bill.arrears || 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Terms & Conditions</h4>
              <p>
                • All items are subject to quality check<br />
                • Bulk orders require advance notice<br />
                • Returns accepted within 7 days<br />
                • For queries, contact us immediately
              </p>
            </div>
            <div className="footer-section">
              <h4>Payment Info</h4>
              <p>
                Payment Method: <strong>{bill.paymentMethod.toUpperCase()}</strong><br />
                Amount: <strong>₹{bill.totalAmount.toFixed(2)}</strong><br />
                Date: {formatDate(bill.createdAt)}<br />
              </p>
            </div>
          </div>
          <div className="invoice-footer-note">
            <p>Thank you for your purchase! We appreciate your business.</p>
            <p className="print-only">This is a system-generated invoice.</p>
          </div>
        </div>
      </div>

      {/* Mobile Footer Actions */}
      <div className="invoice-mobile-actions no-print">
        <button className="btn btn-primary" onClick={handleNewBill}>
          ➕ Create New Bill
        </button>
        <button className="btn btn-secondary" onClick={handleViewHistory}>
          📋 View All Bills
        </button>
      </div>
    </div>
  )
}

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

export const handlePrintBill = (bill) => {
  if (!bill) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to print the bill.')
    return
  }

  const itemRows = (bill.items || []).map((item) => {
    const variantText = item.variant && item.variant.label ? `<br><small>(${escapeHtml(item.variant.label)})</small>` : ''
    const itemTotal = Number(item.price || 0) * Number(item.quantity || 0)

    return `
      <tr>
        <td>
          ${escapeHtml(item.productName || '')}
          ${variantText}
        </td>
        <td>${Number(item.quantity || 0)}</td>
        <td>₹${Number(item.price || 0).toFixed(2)}</td>
        <td>₹${itemTotal.toFixed(2)}</td>
      </tr>
    `
  }).join('')

  const subtotal = (bill.subtotal ?? (bill.items || []).reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0))
  const totalAmount = Number(bill.totalAmount ?? subtotal - (Number(bill.discount || 0)) + (Number(bill.arrears || 0)))

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bill ${escapeHtml(bill.billNumber || '')}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 700px;
            margin: 0 auto;
            padding: 24px;
            background: white;
            color: #111;
          }
          .header {
            text-align: center;
            margin-bottom: 24px;
            border-bottom: 2px solid #333;
            padding-bottom: 14px;
          }
          .header h1 { margin: 0; font-size: 26px; }
          .header p { margin: 6px 0; color: #555; }
          .section { margin: 20px 0; }
          .section h3 {
            font-size: 14px;
            margin: 10px 0 6px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin: 4px 0;
            gap: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 14px;
          }
          th {
            background: #f2f2f2;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #ddd;
            padding: 8px;
            vertical-align: top;
          }
          .total-row {
            background: #f9f9f9;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 16px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MADHUBAN TRADERS</h1>
          <p>Invoice / Receipt</p>
          <p><strong>${escapeHtml(bill.billNumber || '')}</strong></p>
        </div>

        <div class="section">
          <h3>Customer Information</h3>
          <div class="info-row"><span>Name:</span><span><strong>${escapeHtml(bill.customerName || '')}</strong></span></div>
          ${bill.customerPhone ? `<div class="info-row"><span>Phone:</span><span>${escapeHtml(bill.customerPhone)}</span></div>` : ''}
          ${bill.customerAddress ? `<div class="info-row"><span>Address:</span><span>${escapeHtml(bill.customerAddress)}</span></div>` : ''}
          <div class="info-row"><span>Order Type:</span><span>${escapeHtml(bill.orderType ? bill.orderType.charAt(0).toUpperCase() + bill.orderType.slice(1) : 'Retail')}</span></div>
          <div class="info-row"><span>Discount:</span><span>₹${Number(bill.discount || 0).toFixed(2)}</span></div>
          <div class="info-row"><span>Arrears (Bakaya):</span><span>₹${Number(bill.arrears || 0).toFixed(2)}</span></div>
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
            ${itemRows}
            <tr class="total-row">
              <td colspan="3">TOTAL</td>
              <td>₹${totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>This bill was generated on ${escapeHtml(formatDate(bill.createdAt))}</p>
        </div>

        <div class="no-print">
          <button onclick="window.print()" style="padding: 10px 20px; margin: 10px; cursor: pointer;">Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; margin: 10px; cursor: pointer;">Close</button>
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 300)
}

export default handlePrintBill

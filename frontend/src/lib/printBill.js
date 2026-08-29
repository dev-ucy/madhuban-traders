// Full GST & FSSAI Compliant Bill Printing Script for Madhuban Traders
// Handles Food, Spices (Masala), and Edible Oil compliance standards with Mock Data Fallbacks

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatDate = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date()
  if (isNaN(date.getTime())) return new Date().toLocaleString('en-IN')
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Helper to convert number to Indian currency text format
const numberToWords = (num) => {
  const safeNum = Math.floor(Math.abs(Number(num) || 0))
  if (safeNum === 0) return 'Zero Rupees Only'
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  
  const numString = safeNum.toString()
  if (numString.length > 9) return 'Amount Too Large'
  
  const match = ('000000000' + numString).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
  if (!match) return 'Zero Rupees Only'
  
  let str = ''
  str += match[1] != 0 ? (a[Number(match[1])] || b[match[1][0]] + ' ' + a[match[1][1]]) + 'Crore ' : ''
  str += match[2] != 0 ? (a[Number(match[2])] || b[match[2][0]] + ' ' + a[match[2][1]]) + 'Lakh ' : ''
  str += match[3] != 0 ? (a[Number(match[3])] || b[match[3][0]] + ' ' + a[match[3][1]]) + 'Thousand ' : ''
  str += match[4] != 0 ? (a[Number(match[4])] || b[match[4][0]] + ' ' + a[match[4][1]]) + 'Hundred ' : ''
  str += match[5] != 0 ? (str != '' ? 'and ' : '') + (a[Number(match[5])] || b[match[5][0]] + ' ' + a[match[5][1]]) + 'Rupees Only' : 'Rupees Only'
  return str.replace(/\s+/g, ' ').trim()
}

// Default Mock Data in case bill object or properties are completely missing
const MOCK_ITEMS = [
  {
    productName: 'Kachi Ghani Mustard Oil (1L Bottle)',
    category: 'Edible Oil',
    isLiquidOil: true,
    hsnCode: '1514',
    price: 160.00,
    quantity: 5,
    discount: 0,
    gstRate: 5,
    variant: { label: '1 Litre Pack' }
  },
  {
    productName: 'Turmeric Powder (Haldi)',
    category: 'Spices',
    isLiquidOil: false,
    hsnCode: '0910',
    price: 90.00,
    quantity: 2,
    discount: 10,
    gstRate: 5,
    variant: { label: '500g Pack' }
  }
]

export const handlePrintBill = (billData) => {
  // Gracefully fallback to an empty object if billData is null/undefined
  const bill = billData || {}

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to print the bill.')
    return
  }

  // Business Profile Info with Mock Defaults
  const supplier = {
    name: bill.supplierName || 'MADHUBAN TRADERS',
    address: bill.supplierAddress || 'Main Market, Road No. 4, Ghaziabad, Uttar Pradesh - 201001',
    gstin: bill.supplierGstin || '09AAAAA0000A1Z5', 
    fssai: bill.supplierFssai || '10023051000123', 
    stateCode: bill.supplierStateCode || '09',
    stateName: bill.supplierStateName || 'Uttar Pradesh'
  }

  // Determine tax split based on Place of Supply vs Supplier State
  const buyerStateCode = bill.customerStateCode || supplier.stateCode
  const isInterState = supplier.stateCode !== buyerStateCode

  let totalTaxableValue = 0
  let totalCgst = 0
  let totalSgst = 0
  let totalIgst = 0

  // Fallback to MOCK_ITEMS if bill.items is missing or not an array
  const rawItems = Array.isArray(bill.items) && bill.items.length > 0 ? bill.items : MOCK_ITEMS

  const itemRows = rawItems.map((item, index) => {
    const safeItem = item || {}
    const qty = Number(safeItem.quantity) || 1
    const rate = Number(safeItem.price) || 0
    const discount = Number(safeItem.discount) || 0
    
    // Line Tax Calculation
    const taxableValue = Math.max(0, (qty * rate) - discount)
    const gstRate = Number(safeItem.gstRate) ?? 5 // Defaults to 5% standard tax
    const taxAmount = (taxableValue * gstRate) / 100

    totalTaxableValue += taxableValue

    if (isInterState) {
      totalIgst += taxAmount
    } else {
      totalCgst += taxAmount / 2
      totalSgst += taxAmount / 2
    }

    // Legal Metrology: Volumetric and Mass Conversion
    const isOil = Boolean(safeItem.isLiquidOil || safeItem.category?.toLowerCase().includes('oil'))
    const conversionText = isOil 
      ? `<br><span class="metrology-text">Vol: ${(qty).toFixed(2)}L | Mass: ${(qty * 0.91).toFixed(2)}Kg</span>` 
      : ''

    const variantLabel = safeItem.variant?.label || safeItem.variantLabel
    const variantText = variantLabel ? `<br><small style="color:#555;">(${escapeHtml(variantLabel)})</small>` : ''

    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>
          <strong>${escapeHtml(safeItem.productName || 'Sample Item')}</strong>
          ${variantText}
          ${conversionText}
        </td>
        <td style="text-align: center;">${escapeHtml(safeItem.hsnCode || '1514')}</td>
        <td style="text-align: right;">₹${rate.toFixed(2)}</td>
        <td style="text-align: center;">${qty}</td>
        <td style="text-align: right;">₹${discount.toFixed(2)}</td>
        <td style="text-align: right;">₹${taxableValue.toFixed(2)}</td>
        <td style="text-align: center;">${gstRate}%</td>
        <td style="text-align: right;">₹${taxAmount.toFixed(2)}</td>
      </tr>
    `
  }).join('')

  const additionalDiscount = Number(bill.discount) || 0
  const arrears = Number(bill.arrears) || 0
  const finalInvoiceAmount = Math.max(0, Math.round(totalTaxableValue + totalCgst + totalSgst + totalIgst - additionalDiscount + arrears))

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice - ${escapeHtml(bill.billNumber || 'MT/2026/MOCK-001')}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            max-width: 850px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            color: #222;
            line-height: 1.4;
          }
          .invoice-box {
            border: 1px solid #000;
            padding: 15px;
          }
          .title-heading {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 1px;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .biz-details p, .bill-details p { margin: 3px 0; font-size: 13px; }
          .section-title {
            background: #f2f2f2;
            font-weight: bold;
            padding: 4px 8px;
            font-size: 12px;
            text-transform: uppercase;
            border: 1px solid #000;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #000;
            padding: 6px;
          }
          th { background: #f2f2f2; font-weight: bold; }
          .metrology-text {
            font-size: 11px;
            color: #c44500;
            font-weight: 500;
          }
          .flex-totals {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-top: 10px;
          }
          .totals-table {
            width: 320px;
            margin: 0 0 0 auto;
          }
          .totals-table td { padding: 4px; font-size: 13px; }
          .words-block {
            font-size: 12px;
            margin: 10px 0;
            font-style: italic;
          }
          .declaration-box {
            border-top: 1px dashed #000;
            padding-top: 10px;
            font-size: 11px;
            color: #444;
          }
          .sign-area {
            text-align: right;
            margin-top: 30px;
            font-size: 13px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
            .invoice-box { border: 1px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="title-heading">TAX INVOICE</div>
          
          <div class="grid-2">
            <div class="biz-details">
              <h2 style="margin:0 0 5px; font-size:18px;">${escapeHtml(supplier.name)}</h2>
              <p>${escapeHtml(supplier.address)}</p>
              <p><strong>GSTIN:</strong> ${escapeHtml(supplier.gstin)} | <strong>State:</strong> ${escapeHtml(supplier.stateName)} (${supplier.stateCode})</p>
              <p style="color: #0056b3;"><strong>FSSAI Lic No:</strong> ${escapeHtml(supplier.fssai)}</p>
            </div>
            <div class="bill-details" style="text-align: right;">
              <p><strong>Invoice No:</strong> ${escapeHtml(bill.billNumber || 'MT/2026/MOCK-001')}</p>
              <p><strong>Date:</strong> ${escapeHtml(formatDate(bill.createdAt))}</p>
              <p><strong>Reverse Charge:</strong> No</p>
            </div>
          </div>

          <div class="section-title">Details of Receiver (Billed To)</div>
          <div class="grid-2" style="margin-top: 5px;">
            <div class="biz-details">
              <p><strong>Name:</strong> ${escapeHtml(bill.customerName || 'Cash Customer')}</p>
              <p><strong>Address:</strong> ${escapeHtml(bill.customerAddress || 'Local Market, Ghaziabad')}</p>
              <p><strong>Phone:</strong> ${escapeHtml(bill.customerPhone || 'N/A')}</p>
            </div>
            <div class="bill-details" style="text-align: right;">
              <p><strong>Buyer GSTIN:</strong> ${escapeHtml(bill.customerGstin || 'URP (Unregistered Person)')}</p>
              <p><strong>Place of Supply:</strong> ${escapeHtml(bill.customerStateName || supplier.stateName)} (${buyerStateCode})</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 4%;">S.No</th>
                <th style="width: 30%;">Product Description</th>
                <th style="width: 10%;">HSN Code</th>
                <th style="width: 10%;">Rate</th>
                <th style="width: 8%;">Qty</th>
                <th style="width: 8%;">Disc.</th>
                <th style="width: 10%;">Taxable Val</th>
                <th style="width: 8%;">GST %</th>
                <th style="width: 12%;">Tax Amt</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div class="flex-totals">
            <div class="words-block">
              <strong>Amount in Words:</strong><br>
              ${numberToWords(finalInvoiceAmount)}
            </div>
            <div>
              <table class="totals-table">
                <tr>
                  <td>Total Taxable Value:</td>
                  <td style="text-align: right;">₹${totalTaxableValue.toFixed(2)}</td>
                </tr>
                ${!isInterState ? `
                  <tr>
                    <td>Central Tax (CGST):</td>
                    <td style="text-align: right;">₹${totalCgst.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>State Tax (SGST):</td>
                    <td style="text-align: right;">₹${totalSgst.toFixed(2)}</td>
                  </tr>
                ` : `
                  <tr>
                    <td>Integrated Tax (IGST):</td>
                    <td style="text-align: right;">₹${totalIgst.toFixed(2)}</td>
                  </tr>
                `}
                ${additionalDiscount ? `
                  <tr>
                    <td>Additional Discount:</td>
                    <td style="text-align: right;">-₹${additionalDiscount.toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${arrears ? `
                  <tr>
                    <td>Arrears (Previous Bakaya):</td>
                    <td style="text-align: right;">+₹${arrears.toFixed(2)}</td>
                  </tr>
                ` : ''}
                <tr style="background:#f2f2f2; font-weight:bold; border-top:1.5px solid #000;">
                  <td>Net Payable Amount:</td>
                  <td style="text-align: right;">₹${finalInvoiceAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>

          <div class="declaration-box">
            <p><strong>Declaration:</strong> Certified that the food products and packaged oils described in this invoice match configurations under current FSSAI guidelines and the Legal Metrology Act. All particulars are true and correct.</p>
            <div class="sign-area">
              <p>For <strong>${escapeHtml(supplier.name)}</strong></p>
              <br><br>
              <p>Authorised Signatory</p>
            </div>
          </div>
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 12px 25px; background: #28a745; color: white; border: none; font-weight: bold; cursor: pointer; border-radius: 4px; margin-right: 10px;">Print Invoice</button>
          <button onclick="window.close()" style="padding: 12px 25px; background: #6c757d; color: white; border: none; font-weight: bold; cursor: pointer; border-radius: 4px;">Cancel</button>
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 300)
}

export default handlePrintBill
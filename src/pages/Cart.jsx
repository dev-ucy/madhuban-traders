import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'

export default function Cart(){
  const { cart, removeFromCart, updateQty, clearCart } = useCatalog()
  const [showCheckout, setShowCheckout] = useState(false)
  const [customer, setCustomer] = useState({ name:'', phone:'', email:'', address:'', city:'', pincode:'', notes:'' })
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const subtotal = cart.reduce((s,i) => s + (i.price * i.qty), 0)

  if (cart.length === 0) return (
    <div>
      <h2>Your Cart is empty</h2>
      <p className="muted">Add items from the catalog to see them here.</p>
      <Link to="/catalog" className="btn">Browse Products</Link>
    </div>
  )

  const handleProceed = ()=>{
    setShowCheckout(true)
    setError('')
  }

  const validateCustomer = () => {
    if(!customer.name || !customer.phone || !customer.address) {
      setError('Please fill name, phone and delivery address.')
      return false
    }
    return true
  }

  const buildWhatsappMessage = () => {
    const lines = []
    lines.push(`Hello Madhuban Traders Sindhora Bazar Varanasi\n I would like to place an order with the following details:\n`)
    lines.push(`Name: ${customer.name}`)
    lines.push(`Phone: ${customer.phone}`)
    if(customer.email) lines.push(`Email: ${customer.email}`)
    lines.push(`Address: ${customer.address}, ${customer.city || ''} ${customer.pincode || ''}`)
    lines.push('')
    lines.push('Items:')
    cart.forEach(i => {
      lines.push(`- ${i.name} ${i.variant ? `(${i.variant.label})` : ''} x ${i.qty} = ₹${i.price * i.qty}`)
    })
    lines.push('')
    lines.push(`Subtotal: ₹${subtotal}`)
    if(customer.notes) lines.push(`Notes: ${customer.notes}`)
    return lines.join('\n')
  }

  const handleSendWhatsapp = () => {
    setError('')
    if(!validateCustomer()) return
    const msg = buildWhatsappMessage()
    const waNumber = '917897061003' // business number in international format without + or leading zeros
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    setSent(true)
    // optionally clear cart
    clearCart()
  }

  return (
    <div>
      <h2>Shopping Cart</h2>
      <div style={{marginTop:16}}>
        {cart.map(item => (
          <div key={item.key} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-thumb" />
            <div className="cart-body">
              <div className="cart-title">{item.name}</div>
              {item.variant && <div className="muted small">{item.variant.label}</div>}
              <div className="muted">₹{item.price} each</div>
            </div>
            <div className="cart-controls">
              <input className="form-control" type="number" value={item.qty} min={0} onChange={(e)=>updateQty(item.key, parseInt(e.target.value||0))} />
              <div className="cart-line-total">₹{item.price * item.qty}</div>
              <button className="btn btn-ghost" onClick={() => removeFromCart(item.key)}>Remove</button>
            </div>
          </div>
        ))}

        <div className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:16,marginTop:12}}>
          <div>
            <div className="muted">Subtotal</div>
            <div style={{fontSize:22,fontWeight:800}}>₹{subtotal}</div>
          </div>
          <div>
            <button className="btn" onClick={handleProceed}>Proceed to Checkout</button>
          </div>
        </div>

        {showCheckout && (
          <div className="checkout card">
            <h3>Checkout — Delivery Details</h3>
            {error && <div className="error-msg">{error}</div>}
            {sent && <div className="success-msg">Order opened in WhatsApp. Clear cart and return to catalog.</div>}
            <div className="checkout-grid">
              <label>Name *</label>
              <input className="form-control" value={customer.name} onChange={(e)=>setCustomer({...customer,name:e.target.value})} />
              <label>Phone *</label>
              <input className="form-control" value={customer.phone} onChange={(e)=>setCustomer({...customer,phone:e.target.value})} placeholder="e.g., +91 98765 43210" />
              <label>Email</label>
              <input className="form-control" value={customer.email} onChange={(e)=>setCustomer({...customer,email:e.target.value})} />
              <label>Address *</label>
              <textarea className="form-control" value={customer.address} onChange={(e)=>setCustomer({...customer,address:e.target.value})} rows={3} />
              <label>City</label>
              <input className="form-control" value={customer.city} onChange={(e)=>setCustomer({...customer,city:e.target.value})} />
              <label>Pincode</label>
              <input className="form-control" value={customer.pincode} onChange={(e)=>setCustomer({...customer,pincode:e.target.value})} />
              <label>Notes</label>
              <input className="form-control" value={customer.notes} onChange={(e)=>setCustomer({...customer,notes:e.target.value})} />
            </div>
            <div style={{marginTop:12,display:'flex',gap:12}}>
              <button className="btn" onClick={handleSendWhatsapp}>Send Order via WhatsApp</button>
              <button className="btn btn-outline" onClick={()=>setShowCheckout(false)}>Cancel</button>
            </div>
            <div style={{marginTop:12}}>
              <h4>Order Summary</h4>
              <div className="muted">{cart.length} items — Subtotal ₹{subtotal}</div>
              <ul>
                {cart.map(i => <li key={i.key}>{i.name} {i.variant?`(${i.variant.label})`:''} x {i.qty} = ₹{i.qty*i.price}</li>)}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

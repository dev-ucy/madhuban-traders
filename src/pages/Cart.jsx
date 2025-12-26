import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../context/LanguageContext'

export default function Cart(){
  const { cart, products, removeFromCart, updateQty, clearCart } = useCatalog()
  const [showCheckout, setShowCheckout] = useState(false)
  const [customer, setCustomer] = useState({ name:'', phone:'', email:'', address:'', city:'', pincode:'', notes:'' })
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [bulkContact, setBulkContact] = useState(null)

  const subtotal = cart.reduce((s,i) => s + (i.price * i.qty), 0)

  const { t } = useTranslation()
  const { language } = useLanguage()

  if (cart.length === 0) return (
    <div>
      <h2>{t('cart.empty_title')}</h2>
      <p className="muted">{t('cart.empty_desc')}</p>
      <Link to="/catalog" className="btn">{t('cart.browse')}</Link>
    </div>
  )

  const handleProceed = ()=>{
    setShowCheckout(true)
    setError('')
  }

  const validateCustomer = () => {
    if(!customer.name || !customer.phone || !customer.address) {
      setError(t('cart.error_fill'))
      return false
    }
    return true
  }

  const buildWhatsappMessage = () => {
    const lines = []
    lines.push(t('cart.whatsapp_intro'))
    lines.push(`${t('cart.label_name')}: ${customer.name}`)
    lines.push(`${t('cart.label_phone')}: ${customer.phone}`)
    if(customer.email) lines.push(`${t('cart.label_email')}: ${customer.email}`)
    lines.push(`${t('cart.label_address')}: ${customer.address}, ${customer.city || ''} ${customer.pincode || ''}`)
    lines.push('')
    lines.push(t('cart.items_label'))
    cart.forEach(i => {
      const product = products.find(p => p.id === i.productId)
      const displayName = language === 'hi' ? (product?.name_hi || i.name) : i.name
      lines.push(`- ${displayName} ${i.variant ? `(${i.variant.label})` : ''} x ${i.qty} = ₹${i.price * i.qty}`)
    })
    lines.push('')
    lines.push(`${t('cart.label_subtotal')}: ₹${subtotal}`)
    if(customer.notes) lines.push(`${t('cart.label_notes')}: ${customer.notes}`)
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
      <h2>{t('cart.title')}</h2>
      <div style={{marginTop:16}}>
        {cart.map(item => {
          const product = products.find(p => p.id === item.productId)
          const displayName = language === 'hi' ? (product?.name_hi || item.name) : item.name
          return (
            <div key={item.key} className="cart-item">
              <img src={item.image} alt={displayName} className="cart-thumb" />
              <div className="cart-body">
                <div className="cart-title">{displayName}</div>
                {item.variant && <div className="muted small">{item.variant.label}</div>}
                <div className="muted">{t('cart.each').replace('{{price}}', `₹${item.price}`)}</div>
              </div>
              <div className="cart-controls">
                <input className="form-control" type="number" value={item.qty} min={0} onChange={(e)=>{
                  const v = parseInt(e.target.value||0)
                  const res = updateQty(item.key, v)
                  if(res && res.capped){
                    setError(t('cart.max_per_product') || 'Maximum 100 units allowed per product in cart. For larger quantities, contact us for a bulk order.')
                    setBulkContact({ productId: item.productId, requested: v })
                    setTimeout(()=>setError(''), 4000)
                    setTimeout(()=>setBulkContact(null), 4000)
                  }
                }} />
                <div className="cart-line-total">{t('cart.line_total').replace('{{total}}', `₹${item.price * item.qty}`)}</div>
                <button className="btn btn-ghost" onClick={() => removeFromCart(item.key)}>{t('cart.remove')}</button>
              </div>
            </div>
          )
        })} 

        <div className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:16,marginTop:12}}>
          <div>
            <div className="muted">{t('cart.subtotal')}</div>
            <div style={{fontSize:22,fontWeight:800}}>₹{subtotal}</div>
          </div>
          <div>
            <button className="btn" onClick={handleProceed}>{t('cart.proceed')}</button>
          </div>
        </div>

        {showCheckout && (
          <div className="checkout card">
            <h3>{t('cart.checkout_title')}</h3>
            {error && <div className="error-msg">{error}
              {bulkContact && (() => {
                const p = products.find(x => x.id === bulkContact.productId)
                const link = `/contact?bulk=true&product=${encodeURIComponent(p?.name || '')}&qty=${bulkContact.requested}`
                return (
                  <div style={{marginTop:8}}>
                    <Link to={link}>{t('cart.contact_bulk') || 'Contact us for bulk orders'}</Link>
                  </div>
                )
              })()}
            </div>}
            {sent && <div className="success-msg">{t('cart.sent_msg')}</div>}
            <div className="checkout-grid">
              <label>{t('cart.label_name')} *</label>
              <input className="form-control" value={customer.name} onChange={(e)=>setCustomer({...customer,name:e.target.value})} />
              <label>{t('cart.label_phone')} *</label>
              <input className="form-control" value={customer.phone} onChange={(e)=>setCustomer({...customer,phone:e.target.value})} placeholder={t('cart.phone_placeholder')} />
              <label>{t('cart.label_email')}</label>
              <input className="form-control" value={customer.email} onChange={(e)=>setCustomer({...customer,email:e.target.value})} />
              <label>{t('cart.label_address')} *</label>
              <textarea className="form-control" value={customer.address} onChange={(e)=>setCustomer({...customer,address:e.target.value})} rows={3} />
              <label>{t('cart.label_city')}</label>
              <input className="form-control" value={customer.city} onChange={(e)=>setCustomer({...customer,city:e.target.value})} />
              <label>{t('cart.label_pincode')}</label>
              <input className="form-control" value={customer.pincode} onChange={(e)=>setCustomer({...customer,pincode:e.target.value})} />
              <label>{t('cart.label_notes')}</label>
              <input className="form-control" value={customer.notes} onChange={(e)=>setCustomer({...customer,notes:e.target.value})} />
            </div>
            <div style={{marginTop:12,display:'flex',gap:12}}>
              <button className="btn" onClick={handleSendWhatsapp}>{t('cart.send_whatsapp')}</button>
              <button className="btn btn-outline" onClick={()=>setShowCheckout(false)}>{t('cart.cancel')}</button>
            </div>
            <div style={{marginTop:12}}>
              <h4>{t('cart.order_summary')}</h4>
              <div className="muted">{cart.length} {t('cart.items')} — {t('cart.subtotal_short', {subtotal: `₹${subtotal}`})}</div>
              <ul>
                {cart.map(i => {
                  const product = products.find(p => p.id === i.productId)
                  const displayName = language === 'hi' ? (product?.name_hi || i.name) : i.name
                  return <li key={i.key}>{displayName} {i.variant?`(${i.variant.label})`:''} x {i.qty} = ₹{i.qty*i.price}</li>
                })}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

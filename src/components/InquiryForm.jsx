import React, { useState, useEffect } from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function InquiryForm({ inquiryType = 'general', prefillProduct = null, prefillQty = null, prefillMessage = null }){
  const { t } = useTranslation()
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [phone,setPhone] = useState('')
  const [message,setMessage] = useState('')
  const [status,setStatus] = useState(null)
  const [type, setType] = useState(inquiryType)

  useEffect(() => {
    setType(inquiryType)
  }, [inquiryType])

  // If parent provides prefill values (bulk flow), populate message accordingly
  useEffect(() => {
    if (prefillMessage) {
      setMessage(prefillMessage)
    } else if (prefillProduct || prefillQty) {
      const parts = []
      if (prefillProduct) parts.push(`Product: ${prefillProduct}`)
      if (prefillQty) parts.push(`Quantity: ${prefillQty}`)
      if (parts.length) {
        setMessage(`Bulk order inquiry\n${parts.join('\n')}\n\nPlease share pricing, lead time, and delivery options.`)
      }
    }
  }, [prefillProduct, prefillQty, prefillMessage])

  function buildWhatsAppMessage(){
    const lines = [
      `*New Inquiry from Madhuban Traders*`,
      `Type: ${type}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || '—'}`,
      `Message: ${message}`,
      `Page: ${window.location.href}`
    ]
    return encodeURIComponent(lines.join('\n'))
  }

  async function handleSubmit(e){
    e.preventDefault()
    if (!name || !email || !message) {
      setStatus(t('contact.validation_missing'))
      return
    }

    const payload = { type, name, email, phone, message, page: window.location.href }
    setStatus('Saving…')
    try{
      const res = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if(!res.ok){
        let text = ''
        try{ text = await res.text() }catch(e){}
        let parsed = null
        try{ parsed = JSON.parse(text) }catch(e){}
        setStatus(`Save failed: ${parsed?.message || parsed?.error || text }`)
      }else{
        setStatus('Saved')
      }
    }catch(err){
      console.error('Save failed', err)
      setStatus('Save failed: ' + (err.message || err))
    }

    const waPhone = '+917897061003' // business number
    const msg = buildWhatsAppMessage()
    const href = `https://wa.me/${waPhone.replace(/\D/g,'')}?text=${msg}`

    setStatus(t('contact.opening_whatsapp'))
    try{
      // Open in new tab/window
      window.open(href, '_blank')
      setStatus(t('contact.opened_whatsapp'))

      // Optionally clear inputs after a short delay
      setTimeout(() => { setName(''); setEmail(''); setPhone(''); setMessage('') }, 600)
    }catch(err){
      setStatus(t('contact.send_failed'))
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:600}}>
      <div className="form-row">
        <label>{t('contact.name')} *</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div className="form-row">
        <label>{t('contact.email')} *</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      </div>
      <div className="form-row">
        <label>{t('contact.phone')}</label>
        <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} />
      </div>
      <div className="form-row">
        <label>{t('contact.message')} *</label>
        <textarea rows={5} value={message} onChange={e=>setMessage(e.target.value)} required placeholder={
          type === 'wholesale' ? t('contact.wholesale_type') :
          type === 'bulk' ? t('contact.bulk_order') :
          t('contact.select_type')
        } />
      </div>
      <button className="btn hero-cta-btn" type="submit">{t('contact.submit')}</button>
      {status && <div style={{marginTop:12}} className={status.includes('Sent') ? 'success-msg' : 'muted'}>{status}</div>}
    </form>
  )
}

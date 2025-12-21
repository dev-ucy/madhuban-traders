import React, { useState, useEffect } from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function InquiryForm({ inquiryType = 'general' }){
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

  function handleSubmit(e){
    e.preventDefault()
    if (!name || !email || !message) {
      setStatus(t('contact.validation_missing'))
      return
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

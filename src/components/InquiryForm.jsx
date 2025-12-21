import React, { useState, useEffect } from 'react'

export default function InquiryForm({ inquiryType = 'general' }){
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
      setStatus('Please fill in all required fields.')
      return
    }

    const waPhone = '+917897061003' // business number
    const msg = buildWhatsAppMessage()
    const href = `https://wa.me/${waPhone.replace(/\D/g,'')}?text=${msg}`

    setStatus('Opening WhatsApp...')
    // Open in new tab/window
    window.open(href, '_blank')
    setStatus('Opened WhatsApp. Your message is ready to send.')

    // Optionally clear inputs after a short delay
    setTimeout(() => { setName(''); setEmail(''); setPhone(''); setMessage('') }, 600)
  }

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:600}}>
      <div className="form-row">
        <label>Name *</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div className="form-row">
        <label>Email *</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      </div>
      <div className="form-row">
        <label>Phone</label>
        <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Message *</label>
        <textarea rows={5} value={message} onChange={e=>setMessage(e.target.value)} required placeholder={
          type === 'wholesale' ? 'Please describe your wholesale needs...' :
          type === 'bulk' ? 'Please specify the product, quantity, and delivery requirements...' :
          'Tell us how we can help you...'
        } />
      </div>
      <button className="btn hero-cta-btn" type="submit">Send Inquiry</button>
      {status && <div style={{marginTop:12}} className={status.includes('Sent') ? 'success-msg' : 'muted'}>{status}</div>}
    </form>
  )
}

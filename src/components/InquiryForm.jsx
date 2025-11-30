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

  async function handleSubmit(e){
    e.preventDefault()
    if (!name || !email || !message) {
      setStatus('Please fill in all required fields.')
      return
    }
    
    setStatus('Sending...')
    try{
      // Replace endpoint with real API
      const payload = { name, email, phone, message, type }
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error('Failed to send')
      setStatus('Sent! Thank you. We will respond within 24 hours.')
      setName(''); setEmail(''); setPhone(''); setMessage('')
    }catch(err){
      setStatus('⚠ Failed to send (demo mode - no backend). Please contact us directly.')
    }
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

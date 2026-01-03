import React, { useEffect, useState, useMemo } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import SubmissionsControls from '../components/SubmissionsControls'
import Modal from '../components/Modal'
import Snackbar from '../components/Snackbar'

function toIST(iso){
  try{
    const d = new Date(iso)
    return {
      dateKey: d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }), // YYYY-MM-DD
      dateLabel: d.toLocaleDateString(undefined, { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric' }),
      timeLabel: d.toLocaleTimeString(undefined, { timeZone: 'Asia/Kolkata' })
    }
  }catch(e){
    return { dateKey: '', dateLabel: '', timeLabel: '' }
  }
}

export default function Submissions(){
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ q:'', type:'', from:'', to:'' })
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [readOnly, setReadOnly] = useState(false)

  // UI states
  const [modalItem, setModalItem] = useState(null)
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null)
  const [lastDeleted, setLastDeleted] = useState(null)
  const [snack, setSnack] = useState({ open:false, message:'', actionLabel:'', onAction:null })
  const [collapsed, setCollapsed] = useState(new Set())

  useEffect(() => {
    const fetchData = async () => {
      setReadOnly(false)
      try{
        // Primary: try API
        const res = await fetch('/api/submissions')
        const text = await res.text()
        if(!res.ok){
          let parsed = null
          try{ parsed = JSON.parse(text) }catch(e){}
          const msg = parsed?.message || parsed?.error || text || `HTTP ${res.status}`
          throw new Error(msg)
        }
        const data = text ? JSON.parse(text) : []
        setItems(data)
        setReadOnly(false)
        return
      }catch(apiErr){
        // Secondary: try static file fallback
        try{
          const res2 = await fetch('/data/submissions.json')
          if(res2.ok){
            const txt = await res2.text()
            const data = txt ? JSON.parse(txt) : []
            setItems(data)
            setReadOnly(true) // fallback mode - editing disabled
            return
          }else{
            throw new Error('No submissions available')
          }
        }catch(fileErr){
          setError(apiErr.message || fileErr.message || 'Error')
        }
      }finally{
        setLoading(false)
      }
    }
    fetchData()
  }, [refreshKey])

  const grouped = useMemo(() => {
    const list = (items || []).map(it => {
      const { dateKey, dateLabel, timeLabel } = toIST(it.receivedAt || it.createdAt || new Date().toISOString())
      return { ...it, dateKey, dateLabel, timeLabel }
    }).filter(it => {
      const q = filters.q.trim().toLowerCase()
      if(q){
        const hay = `${it.name||''} ${it.email||''} ${it.phone||''} ${it.message||''} ${it.type||''}`.toLowerCase()
        if(!hay.includes(q)) return false
      }
      if(filters.type && it.type !== filters.type) return false
      if(filters.from){
        if(it.dateKey < filters.from) return false
      }
      if(filters.to){
        if(it.dateKey > filters.to) return false
      }
      return true
    }).sort((a,b) => new Date(b.receivedAt) - new Date(a.receivedAt))

    const map = new Map()
    for(const it of list){
      if(!map.has(it.dateKey)) map.set(it.dateKey, { dateLabel: it.dateLabel, items: [] })
      map.get(it.dateKey).items.push(it)
    }
    return map
  }, [items, filters])

  function downloadVisible(){
    const all = []
    for(const v of grouped.values()) all.push(...v.items)
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'submissions-visible.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // CSV export removed due to nested records causing CSV formatting issues.

  async function doDelete(id, deletedItem){
    try{
      const res = await fetch(`/api/submissions/${encodeURIComponent(id)}`, { method: 'DELETE' })
      const text = await res.text()
      if(!res.ok) throw new Error(text || res.status)
      // success - provide undo using the provided deleted item
      setSnack({ open:true, message:'Deleted', actionLabel:'Undo', onAction:async ()=>{
        if(deletedItem){
          try{
            await fetch('/api/submissions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(deletedItem) })
            setSnack({ open:true, message:'Restored', actionLabel:'', onAction:null })
            setRefreshKey(k=>k+1)
          }catch(e){
            setSnack({ open:true, message:'Restore failed', actionLabel:'', onAction:null })
          }
        }
      }})
      setLastDeleted(null)
      setRefreshKey(k=>k+1)
    }catch(err){
      setSnack({ open:true, message: 'Delete failed: ' + (err.message||err), actionLabel:'', onAction:null })
      setRefreshKey(k=>k+1)
    }
  }

  function confirmDelete(it){
    if(readOnly){ setSnack({ open:true, message:'Delete disabled in read-only mode', actionLabel:'', onAction:null }); return }
    setConfirmDeleteItem(it)
  }

  function performDelete(it){
    const existing = items.find(x => x.id === it.id)
    setLastDeleted(existing)
    setItems(prev => prev.filter(x=>x.id !== it.id))
    doDelete(it.id, existing)
  }

  function startEdit(it){
    if(readOnly){ setSnack({ open:true, message:'Editing disabled in read-only mode', actionLabel:'', onAction:null }); return }
    setEditingId(it.id)
    setEditValues({ ...it })
  }
  function cancelEdit(){ setEditingId(null); setEditValues({}) }

  async function saveEdit(){
    try{
      const res = await fetch(`/api/submissions/${encodeURIComponent(editingId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editValues) })
      const text = await res.text()
      if(!res.ok){ let parsed=null; try{parsed=JSON.parse(text)}catch(e){}; throw new Error(parsed?.message||text||res.status) }
      setEditingId(null)
      setRefreshKey(k=>k+1)
      setSnack({ open:true, message:'Saved', actionLabel:'', onAction:null })
    }catch(err){
      setSnack({ open:true, message:'Save failed: ' + (err.message||err), actionLabel:'', onAction:null })
    }
  }

  function toggleCollapse(dateKey){
    setCollapsed(prev => {
      const copy = new Set(prev)
      if(copy.has(dateKey)) copy.delete(dateKey)
      else copy.add(dateKey)
      return copy
    })
  }

  if(loading) return <div>Loading…</div>
  if(error) return <div style={{color:'red'}}>Error: {error}</div>

  return (
    <div className="submissions-page">
      <div className="submissions-header">
        <div className="header-content">
          <h2>Submissions</h2>
          <p className="muted">Total: {(items||[]).length} records</p>
        </div>
        <div className="header-action">
          <button className="btn" onClick={()=>{ navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(items||[])).then(()=>setSnack({ open:true, message:'Copied to clipboard', actionLabel:'', onAction:null })) }}>Copy All</button>
        </div>
      </div>

      <SubmissionsControls filters={filters} setFilters={setFilters} onRefresh={()=>setRefreshKey(k=>k+1)} onExport={downloadVisible} />

      {readOnly && <div className="card" style={{marginTop:8,marginBottom:8}}>
        <strong>Read-only mode:</strong> Submissions loaded from `data/submissions.json`. Editing and deleting are disabled.
      </div>}

      {Array.from(grouped.keys()).length === 0 && <div className="card">No records match the filter.</div>}

      {Array.from(grouped.entries()).map(([dateKey, group]) => (
        <div key={dateKey} className="date-group">
          <div className="date-header" onClick={()=>toggleCollapse(dateKey)}>
            <div>
              <strong>{group.dateLabel}</strong>
              <span className="muted small"> — {group.items.length} record(s)</span>
            </div>
            <div className="date-actions">
              <button className="btn btn-ghost">{collapsed.has(dateKey) ? 'Expand' : 'Collapse'}</button>
            </div>
          </div>
          {!collapsed.has(dateKey) && group.items.map(it => (
            <div key={it.id} className="submission-card card">
              {editingId === it.id ? (
                <div className="edit-form">
                  <div className="edit-row">
                    <input className="form-control" placeholder="Name" value={editValues.name||''} onChange={e=>setEditValues(v=>({...v,name:e.target.value}))} />
                    <input className="form-control" placeholder="Email" value={editValues.email||''} onChange={e=>setEditValues(v=>({...v,email:e.target.value}))} />
                    <input className="form-control" placeholder="Phone" value={editValues.phone||''} onChange={e=>setEditValues(v=>({...v,phone:e.target.value}))} />
                  </div>
                  <div className="edit-row">
                    <textarea rows={4} className="form-control" placeholder="Message" value={editValues.message||''} onChange={e=>setEditValues(v=>({...v,message:e.target.value}))} />
                  </div>
                  <div className="edit-actions">
                    <button className="btn" onClick={saveEdit}>Save</button>
                    <button className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="submission-grid">
                  <div className="submission-main">
                    <div className="submission-meta">
                      <div className="submission-name">{it.name || it.customer?.name || '—'}</div>
                      <div className="muted small">{it.email || it.customer?.email || ''}</div>
                      <div className="muted tiny">{it.timeLabel} IST — <span className="type-chip">{it.type || (it.customer ? 'checkout' : 'inquiry')}</span></div>
                    </div>
                    {/* <div className="submission-message" onClick={()=>setModalItem(it)}>{(it.message && it.message.length > 250) ? it.message.slice(0,250)+'…' : (it.message || JSON.stringify(it.customer || {}, null, 2))}</div> */}
                  </div>

                  <div className="submission-actions">
                    <button className="btn" onClick={()=>setModalItem(it)}>View</button>
                    <button className="btn btn-ghost" onClick={()=>{ navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(it)).then(()=>setSnack({ open:true, message:'Copied to clipboard', actionLabel:'', onAction:null })) }}>Copy</button>
                    {/* Edit/Delete intentionally hidden from UI per request */}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <Modal open={!!modalItem} title={modalItem ? (modalItem.name || modalItem.customer?.name || 'Submission') : ''} onClose={()=>setModalItem(null)}>
        {modalItem && (
          <div>
            {/* Checkout data: display in formatted grid */}
            {modalItem.type === 'checkout' && modalItem.customer ? (
              <div className="modal-checkout">
                <div className="modal-grid">
                  <div>
                    <p><strong>Date:</strong>  {modalItem.dateLabel} — {modalItem.timeLabel} IST    </p>
                    <p><strong>Type:</strong> Checkout Order</p>
                  </div>
                  <div>
                    {/* <p><strong>ID</strong></p>
                    { <div className="muted small">{modalItem.id}</div> } */}
                    <div style={{height:8}} />
                    <button className="btn" onClick={()=>{ navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(modalItem)).then(()=>setSnack({ open:true, message:'Copied', actionLabel:'', onAction:null })) }}>Copy JSON</button>
                  </div>
                </div>

                <div style={{marginTop:'1.5em'}}>
                  <h4 style={{fontSize:'clamp(14px, 3vw, 16px)',marginBottom:'0.5em'}}>Customer Details</h4>
                  <div className="checkout-details">
                    <div className="detail-row"><strong>Name:</strong> <span>{modalItem.customer.name}</span></div>
                    <div className="detail-row"><strong>Phone:</strong> <span>{modalItem.customer.phone}</span></div>
                    <div className="detail-row"><strong>Email:</strong> <span>{modalItem.customer.email || 'N/A'}</span></div>
                    <div className="detail-row"><strong>Address:</strong> <span>{modalItem.customer.address}</span></div>
                    <div className="detail-row"><strong>City:</strong> <span>{modalItem.customer.city || 'N/A'}</span></div>
                    <div className="detail-row"><strong>Pincode:</strong> <span>{modalItem.customer.pincode || 'N/A'}</span></div>
                    {modalItem.customer.notes && <div className="detail-row"><strong>Notes:</strong> <span>{modalItem.customer.notes}</span></div>}
                  </div>
                </div>

                {modalItem.cart && modalItem.cart.length > 0 && (
                  <div style={{marginTop:'1.5em'}}>
                    <h4 style={{fontSize:'clamp(14px, 3vw, 16px)',marginBottom:'0.5em'}}>Items Ordered</h4>
                    <div className="checkout-items">
                      {modalItem.cart.map((item, idx) => (
                        <div key={idx} className="checkout-item-row">
                          <div className="item-name">{item.name} {item.variant ? `(${item.variant.label})` : ''}</div>
                          <div className="item-qty">Qty: {item.qty}</div>
                          <div className="item-price">₹{item.price * item.qty}</div>
                        </div>
                      ))}
                      <div style={{borderTop:'1px solid var(--border)',marginTop:8,paddingTop:8}}>
                        <strong>Subtotal: ₹{modalItem.subtotal || 0}</strong>
                      </div>
                    </div>
                  </div>
                )}

             
              </div>
            ) : (
              /* Inquiry data: original display */
              <div className="modal-grid">
                <div>
                  <p><strong>Received:</strong> {modalItem.timeLabel} IST — <span className="muted">{modalItem.dateLabel}</span></p>
                  <p><strong>Type:</strong> {modalItem.type || 'inquiry'}</p>
                  <p><strong>Email:</strong> {modalItem.email || ''}</p>
                   <p><strong>Phone:</strong> {modalItem.phone || ''}</p>
                 
                  <pre style={{whiteSpace:'pre-wrap',background:'var(--accent-light)',padding:'1em',borderRadius:8,fontSize:'clamp(12px, 2vw, 13px)',lineHeight:1.5}}>{modalItem.message || 'No message'}</pre>
                </div>
                <div>
                  {/* <p><strong>ID</strong></p>
                  <div className="muted small">{modalItem.id}</div>
                  <div style={{height:8}} /> */}
                  <button className="btn" onClick={()=>{ navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(modalItem)).then(()=>setSnack({ open:true, message:'Copied', actionLabel:'', onAction:null })) }}>Copy JSON</button>
                </div>
              </div>
            )}

            {/* <div style={{marginTop:'1.5em'}}>
              <h4 style={{fontSize:'clamp(14px, 3vw, 16px)',marginBottom:'0.5em'}}>Full Record</h4>
              <pre className="modal-json">{JSON.stringify(modalItem, null, 2)}</pre>
            </div> */}
          </div>
        )}
      </Modal>

      <Snackbar open={snack.open} message={snack.message} actionLabel={snack.actionLabel} onAction={async ()=>{ if(snack.onAction) await snack.onAction(); setSnack({ open:false, message:'', actionLabel:'', onAction:null }) }} onClose={()=>setSnack({ open:false, message:'', actionLabel:'', onAction:null })} />
    </div>
  )
}
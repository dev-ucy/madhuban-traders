import React from 'react'

export default function SubmissionsControls({ filters, setFilters, onRefresh, onExport }){
  return (
    <div className="submissions-controls">
      <div className="controls-left">
        <input className="form-control" placeholder="Search (name, email, message)" value={filters.q} onChange={e=>setFilters(f=>({...f,q:e.target.value}))} />
        <select value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))}>
          <option value="">All Types</option>
          <option value="general">General Inquiry</option>
          <option value="wholesale">Wholesale</option>
          <option value="bulk">Bulk Order</option>
          <option value="checkout">Checkout</option>
        </select>
       
        <label className="small">From <input type="date" value={filters.from} onChange={e=>setFilters(f=>({...f,from:e.target.value}))} /></label>
        <label className="small">To <input type="date" value={filters.to} onChange={e=>setFilters(f=>({...f,to:e.target.value}))} /></label>
      </div>

      <div className="controls-right">
        <button className="btn" onClick={onRefresh}>Refresh</button>
        <button className="btn" onClick={onExport}>Export JSON</button>
        <button className="btn btn-outline" onClick={()=>setFilters({ q:'', type:'', from:'', to:'' })}>Clear</button>
      </div>
    </div>
  )
}
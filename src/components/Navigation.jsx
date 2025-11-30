import React from 'react'
import { NavLink } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'

export default function Navigation(){
  const { cart } = useCatalog()
  const cartCount = cart.reduce((s,i)=>s+i.qty,0)
  return (
    <nav className="nav">
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <h2 style={{margin:0}}>Madhuban Traders</h2>
        <NavLink to="/" style={{marginLeft:10}}>Home</NavLink>
        <NavLink to="/catalog">Catalog</NavLink>
        <NavLink to="/about">About Us</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </div>
      <div style={{marginLeft:'auto'}}>
        <span className="muted">Cart: {cartCount}</span>
      </div>
    </nav>
  )
}

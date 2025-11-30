import React from 'react'
import { useCatalog } from '../context/CatalogContext'

export default function ProductCard({product}){
  const { addToCart } = useCatalog()
  return (
    <div className="card">
      <img src={product.image} alt={product.name} />
      <h3 style={{margin:'8px 0 4px'}}>{product.name}</h3>
      <div className="muted">{product.category}</div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <strong>₹{product.price}</strong>
        <button className="btn" onClick={()=>addToCart(product)}>Add</button>
      </div>
    </div>
  )
}

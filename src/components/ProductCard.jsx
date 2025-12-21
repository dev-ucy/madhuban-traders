import React from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'

export default function ProductCard({product}){
  const { addToCart } = useCatalog()
  const excerpt = product.description && product.description.length > 80 ? product.description.slice(0,80) + '…' : product.description
  return (
    <div className="card">
      <Link to={`/product/${product.id}`} style={{color:'inherit',textDecoration:'none'}}>
        <img src={product.image} alt={product.name} />
        <h3 style={{margin:'8px 0 4px'}}>{product.name}</h3>
      </Link>
      {excerpt && <p className="excerpt">{excerpt}</p>}
      <div className="muted">{product.category}</div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <div />
        <div className="card-actions">
          <Link to={`/product/${product.id}`} className="btn btn-light">View</Link>
        </div>
      </div>
    </div>
  )
}

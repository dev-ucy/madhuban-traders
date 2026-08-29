import React from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../hooks/useTranslation'

export default function ProductCard({product}){
  const { addToCart } = useCatalog()
  const { language } = useLanguage()
  const { t } = useTranslation()

  const title = language === 'hi' ? (product.name_hi || product.name) : product.name
  const description = language === 'hi' ? (product.description_hi || product.description) : product.description
  const excerpt = description && description.length > 80 ? description.slice(0,80) + '…' : description

  return (
    <div className="card">
      <Link to={`/product/${product.id}`} style={{color:'inherit',textDecoration:'none'}}>
        <img src={product.image} alt={title} />
        <h3 style={{margin:'8px 0 4px'}}>{title}</h3>
      </Link>
      {excerpt && <p className="excerpt">{excerpt}</p>}
      <div className="muted">{product.category}</div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <div />
        <div className="card-actions">
          <Link to={`/product/${product.id}`} className="btn btn-light">{t('product.view') || 'View'}</Link>
        </div>
      </div>
    </div>
  )
}

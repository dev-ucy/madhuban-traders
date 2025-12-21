import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../context/LanguageContext'

export default function Product(){
  const { id } = useParams()
  const { products, addToCart, cartCount } = useCatalog()
  const product = products.find(p => String(p.id) === String(id))
  const images = product?.images || (product ? [product.image] : [])
  const [main, setMain] = useState(images[0] || product?.image)
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] ?? null)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const sizes = product?.variants?.map(v => v.label) || []

  // Ensure the main image and selected variant are set/re-set when the product data becomes available
  useEffect(() => {
    if (!product) return
    const imgs = (product.images && product.images.length) ? product.images : (product.image ? [product.image] : [])
    // If main image not set or points to an old value, set it from product data
    setMain(imgs[0] || product.image)
    setSelectedVariant(product.variants?.[0] ?? null)
  }, [product])

  // If products are still loading (empty array), show a loading state so the page doesn't look broken on refresh
  const { t } = useTranslation()

  if (!product && products.length === 0) return (
    <div>
      <h2>{t('product.loading') /* Loading product… */}</h2>
      <p className="muted">{t('product.fetching') /* Fetching product information, please wait. */}</p>
    </div>
  )

  if (!product) return (
    <div>
      <h2>{t('product.not_found') /* Product not found */}</h2>
      <p className="muted">{t('product.not_found_desc') /* The product you are looking for doesn't exist. */}</p>
      <Link to="/catalog" className="btn">{t('product.back_to_catalog') /* Back to Catalog */}</Link>
    </div>
  )

  const share = async () => {
    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.description, url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Product link copied to clipboard')
      }
    } catch (e) {
      // ignore
    }
  }

  const price = selectedVariant ? selectedVariant.price : (product.price || 0)

  const handleAddToCart = () => {
    if (adding) return
    setAdding(true)
    addToCart(product, selectedVariant, qty)
    // small visual feedback for user — keep 'added' visible briefly so user can click Go to Cart
    setTimeout(() => {
      setAdding(false)
      setAdded(true)
      // keep added state for 4s to give user time to go to cart
      setTimeout(() => setAdded(false), 4000)
    }, 300)
  }

  const { language } = useLanguage()
  const title = language === 'hi' ? (product.name_hi || product.name) : product.name
  const desc = language === 'hi' ? (product.description_hi || product.description) : product.description

  return (
    <div className="product-detail card">
      <div className="product-grid">
        <div className="product-left">
          <div className="image-wrap">
            <img
              src={main || product?.image}
              alt={title}
              onError={(e) => {
                // If image fails to load, try the product.image fallback
                if (product?.image && e.target.src !== product.image) e.target.src = product.image
              }}
            />
          </div>

          <div className="gallery-grid">
            {images.slice(0,3).map((src, i) => (
              <button key={i} className={`thumb ${src===main? 'active':''}`} onClick={()=>setMain(src)} aria-label={`View image ${i+1}`}>
                <img src={src} alt={`${title} ${i+1}`} />
              </button>
            ))}
          </div>

          <div className="badges">
            {product.certifications && product.certifications.map((c, i) => (
              <span key={i} className="badge">{c}</span>
            ))}
          </div>
        </div>

        <div className="product-right">
          <div className="product-head">
            <div>
              <h1 className="product-title">{title}</h1>
              <div className="muted small">{product.category} • {product.origin || '—'}</div>
              {/* {sizes.length > 0 && (
                <div className="sizes-badges" aria-hidden>
                  {sizes.slice(0,5).map((s, i) => <span key={i} className="sizes-badge">{s}</span>)}
                </div>
              )} */}
            </div>
            <div className="price-box">
              <div className="price">₹{price}</div>
              <div className="controls">
                <label className="qty-label">{t('product.qty_label') || 'Qty'}</label>
                <input className="qty-input" type="number" min="1" value={qty} onChange={(e)=>setQty(parseInt(e.target.value||1))} />
                <Link to="/catalog" className="btn btn-light">{t('product.back') || 'Back'}</Link>
              </div>
            </div>
          </div>

          <p className="lead">{desc}</p>

        

          {/* Variant selector (show directly as buttons) */}
          {product.variants && (
            <div className="variant-row">
              {product.variants.map(v => (
                <button key={v.id} className={`variant-btn ${selectedVariant?.id===v.id? 'active':''}`} onClick={()=>setSelectedVariant(v)}>
                  <div className="variant-label">{v.label}</div>
                  <div className="variant-price">₹{v.price}</div>
                </button>
              ))}
            </div>
          )}

          <div style={{marginTop:16,display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
            <button className={`btn add-to-cart ${added ? 'added' : ''}`} onClick={handleAddToCart} disabled={adding}>
              {adding ? t('product.adding') : (added ? t('product.added') : t('product.add_to_cart'))}
            </button>
            {cartCount > 0 && (
              <Link to="/cart" className="btn go-cart">{t('product.go_to_cart').replace('{{count}}', cartCount)}</Link>
            )}

            <button className="btn btn-ghost" onClick={share}>{t('product.share')}</button>
            <Link className="btn btn-outline" to={`/contact?product=${encodeURIComponent(title)}`}>{t('product.ask_question')}</Link>
          </div>

          <div className="detail-sections">

            {product.healthBenefits && (
              <div className="detail-card">
                <h4>{t('product.sections.health_benefits')}</h4>
                <ul>
                  {(language === 'hi' ? (product.healthBenefits_hi || product.healthBenefits) : product.healthBenefits).map((hb, idx) => <li key={idx}>{hb}</li>)}
                </ul>
              </div>
            )}

            {product.usage && (
              <div className="detail-card">
                <h4>{t('product.sections.usage')}</h4>
                <p className="muted">{language === 'hi' ? (product.usage_hi || product.usage) : product.usage}</p>
              </div>
            )}

            {product.storage && (
              <div className="detail-card">
                <h4>{t('product.sections.storage')}</h4>
                <p className="muted">{language === 'hi' ? (product.storage_hi || product.storage) : product.storage}</p>
              </div>
            )}

            {(product.manufacturer || product.netWeight || (product.variants && product.variants.length)) && (
              <div className="detail-card">
                <h4>{t('product.sections.manufacturing_specs')}</h4>
                <p className="muted"><strong>{t('product.labels.manufacturer')}:</strong> {product.manufacturer || '—'}</p>
                {product.variants && product.variants.length ? (
                  <p className="muted"><strong>{t('product.labels.available_sizes')}:</strong> {product.variants.map(v => v.label).join(', ')}</p>
                ) : (
                  <p className="muted"><strong>{t('product.labels.net_weight')}:</strong> {product.netWeight || '—'}</p>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
} 

import React from 'react'
import { useTranslation } from '../hooks/useTranslation'
import ProductCard from './ProductCard'
import { useCatalog } from '../context/CatalogContext'

export default function FeaturedProducts(){
  const { t } = useTranslation()
  const { products } = useCatalog()

  // Show the first 6 products as featured (fallback to empty array while loading)
  const featured = products?.slice(0, 6) || []

  if (!featured.length) {
    return (
      <section className="featured-products">
        <h2>{t('featured.title')}</h2>
        <p className="muted">{t('featured.empty') || 'No featured products available.'}</p>
      </section>
    )
  }

  return (
    <section className="featured-products">
      <h2>{t('featured.title')}</h2>
      <div className="featured-grid">
        {featured.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

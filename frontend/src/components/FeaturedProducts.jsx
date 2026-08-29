import React from 'react'
import { useTranslation } from '../hooks/useTranslation'
import ProductCard from './ProductCard'
import { useCatalog } from '../context/CatalogContext'

export default function FeaturedProducts(){
  const { t } = useTranslation()
  const { products } = useCatalog()

  // Show the first 8 products as featured (fallback to empty array while loading)
  // const featured = products?.slice(0, 8) || []

  // Shuffle and pick random products instead
  const featured = products?.sort(() => Math.random() - 0.5).slice(0, 8) || []
  // const featured = shuffled

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

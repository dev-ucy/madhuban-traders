import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import ProductCard from '../components/ProductCard'

export default function Catalog(){
  const { products } = useCatalog()
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  
  const [filter, setFilter] = useState(category || 'all')

  const filtered = useMemo(() => {
    if (filter === 'all') return products
    return products.filter(p => p.category.toLowerCase() === filter.toLowerCase())
  }, [products, filter])

  return (
    <div>
      <div className="toolbar">
        <h2>Product Catalog</h2>
        <div className="filter-controls">
          <label>Filter: </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Products</option>
            <option value="oils">Oils</option>
            <option value="spices">Spices</option>
          </select>
        </div>
      </div>
      <p className="muted">{filtered.length} items found</p>
      <div className="featured-grid">
        {filtered.map(p=> <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}

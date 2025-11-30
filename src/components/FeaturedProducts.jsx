import React, { useState, useEffect } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import ProductCard from './ProductCard'

export default function FeaturedProducts(){
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/data/products.json')
        const allProducts = await response.json()
        const featured = allProducts.slice(0, 6)
        setProducts(featured)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([
          {
            id: 1,
            name: 'Mustard Oil 5L',
            price: 450,
            image: 'https://www.shutterstock.com/shutterstock/photos/2273122381/display_1500/stock-photo-mustard-oil-with-seeds-in-glass-bowl-and-flowers-outdoor-2273122381.jpg',
            category: 'Oils',
            description: 'Premium cold-pressed mustard oil'
          },
          {
            id: 2,
            name: 'Groundnut Oil 1L',
            price: 220,
            image: 'http://shutterstock.com/shutterstock/photos/2462688021/display_1500/stock-photo-groundnut-oil-a-conceptual-advertisement-for-edible-groundnut-oil-this-oil-has-infinite-energy-2462688021.jpg',
            category: 'Oils',
            description: 'Pure cold-pressed groundnut oil'
          },
          {
            id: 3,
            name: 'Turmeric (Haldi) 500g',
            price: 320,
            image: 'https://www.shutterstock.com/shutterstock/photos/229723168/display_1500/stock-photo-dried-spices-on-spoons-on-a-wooden-background-229723168.jpg',
            category: 'Spices',
            description: 'Premium whole turmeric roots'
          },
          {
            id: 4,
            name: 'Cardamom (Elaichi) 100g',
            price: 480,
            image: 'https://www.shutterstock.com/shutterstock/photos/229723168/display_1500/stock-photo-dried-spices-on-spoons-on-a-wooden-background-229723168.jpg',
            category: 'Spices',
            description: 'Premium green cardamom pods'
          },
          {
            id: 5,
            name: 'Cumin Seeds 500g',
            price: 180,
            image: 'https://www.shutterstock.com/shutterstock/photos/229723168/display_1500/stock-photo-dried-spices-on-spoons-on-a-wooden-background-229723168.jpg',
            category: 'Spices',
            description: 'Fresh whole cumin seeds'
          },
          {
            id: 6,
            name: 'Cinnamon Sticks 100g',
            price: 260,
            image: 'https://www.shutterstock.com/shutterstock/photos/229723168/display_1500/stock-photo-dried-spices-on-spoons-on-a-wooden-background-229723168.jpg',
            category: 'Spices',
            description: 'Premium cinnamon bark sticks'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return <section className="featured-products"><p>{t('featured.title')}</p></section>
  }

  return (
    <section className="featured-products">
      <h2>{t('featured.title')}</h2>
      <div className="featured-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

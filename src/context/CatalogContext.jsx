import React, { createContext, useContext, useEffect, useState } from 'react'
import sampleProducts from '../data/products.json'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }){
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])

  useEffect(()=>{
    // For now we load local sample data; replace with API call later
    setProducts(sampleProducts)
  },[])

  function addToCart(product, variant = null, qty = 1){
    setCart((c)=>{
      // normalize item key by product id + variant id
      const key = variant ? `${product.id}__${variant.id}` : `${product.id}__default`
      const existing = c.find(item=>item.key === key)
      if(existing) return c.map(item=>item.key===key?{...item,qty: item.qty + qty}:item)

      const item = {
        key,
        productId: product.id,
        name: product.name,
        variant: variant ? { id: variant.id, label: variant.label, price: variant.price } : null,
        price: variant ? variant.price : (product.price || 0),
        qty,
        image: product.images?.[0] || product.image
      }
      return [...c, item]
    })
  }

  function removeFromCart(key){
    setCart((c)=> c.filter(i => i.key !== key))
  }

  function updateQty(key, qty){
    setCart(c => c.map(i => i.key === key ? {...i, qty: Math.max(0, qty)} : i))
  }

  function clearCart(){
    setCart([])
  }

  const cartCount = cart.reduce((s,i)=>s + (i.qty||0), 0)

  return (
    <CatalogContext.Provider value={{products, addToCart, cart, removeFromCart, updateQty, clearCart, cartCount}}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog(){
  return useContext(CatalogContext)
}

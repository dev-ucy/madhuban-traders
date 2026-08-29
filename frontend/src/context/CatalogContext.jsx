import React, { createContext, useContext, useEffect, useState } from 'react'
import sampleProducts from '../data/products'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }){
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])

  useEffect(()=>{
    // For now we load local sample data; replace with API call later
    setProducts(sampleProducts)
  },[])

  // Add items but enforce a per-product max of 100 units across variants
  // Returns an object: { success: boolean, added: number, allowed: number }
  // IMPORTANT: Do not perform partial adds — if requested qty exceeds remaining allowance, reject the add and return allowed remaining.
  function addToCart(product, variant = null, qty = 1){
    const productId = product.id
    // current total quantity for this product across all variants
    const currentTotal = cart.reduce((s,i) => i.productId === productId ? s + i.qty : s, 0)
    const allowed = Math.max(0, 100 - currentTotal)

    // If request exceeds allowed, do not add (no partial adds)
    if (qty > allowed) return { success:false, added:0, allowed }

    // Nothing allowed
    if (allowed <= 0) return { success:false, added:0, allowed:0 }

    setCart((c)=>{
      const key = variant ? `${product.id}__${variant.id}` : `${product.id}__default`
      const existing = c.find(item=>item.key === key)
      if(existing) return c.map(item=> item.key===key ? {...item, qty: Math.min(100, item.qty + qty)} : item)

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

    return { success:true, added: qty, allowed: Math.max(0, allowed - qty) }
  }

  function removeFromCart(key){
    setCart((c)=> c.filter(i => i.key !== key))
  }

  // Update quantity for an item but ensure the total for the product does not exceed 100
  // Returns an object: { success: boolean, qty: number, capped: boolean, allowed: number }
  // IMPORTANT: If requested qty exceeds remaining allowance, do NOT change the quantity and return capped:true
  function updateQty(key, qty){
    const item = cart.find(i => i.key === key)
    if(!item) return { success:false, qty:0, capped:false, allowed:0 }

    const productId = item.productId
    const otherTotal = cart.reduce((s,i) => (i.productId === productId && i.key !== key) ? s + i.qty : s, 0)
    const allowed = Math.max(0, 100 - otherTotal)

    // If requested exceeds allowed, do not change
    if (qty > allowed) return { success:false, qty: item.qty, capped:true, allowed }

    const newQty = Math.max(0, qty)
    setCart(c => c.map(i => i.key === key ? {...i, qty: newQty} : i))
    return { success:true, qty: newQty, capped:false, allowed: Math.max(0, allowed - newQty) }
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

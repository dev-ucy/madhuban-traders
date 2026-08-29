import React, { createContext, useContext, useEffect, useState } from 'react'
import sampleProducts from '../data/products'
import { apiUrl } from '../lib/api'

const CatalogContext = createContext(null)

// --- Manager Product CRUD (New feature) ---
// This catalog context now supports backend-backed product list, add, update, and delete actions.
export function CatalogProvider({ children }){
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])

  const fetchProducts = async () => {
    const token = localStorage.getItem('billingToken')

    try {
      const response = await fetch(apiUrl('/products'), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      const list = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : sampleProducts
      setProducts(list)
      return list
    } catch (error) {
      console.warn('Using sample product catalog because backend products are unavailable:', error)
      setProducts(sampleProducts)
      return sampleProducts
    }
  }

  useEffect(()=>{
    fetchProducts()
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

  // --- Manager Product CRUD actions (New feature) ---
  // Used by the shop manager UI to create/update/delete catalog products.
  async function createProduct(productData) {
    const token = localStorage.getItem('billingToken')
    if (!token) throw new Error('Not authenticated')

    const response = await fetch(apiUrl('/products'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    })

    if (!response.ok) throw new Error('Failed to create product')
    const data = await response.json()
    const nextList = [data.product, ...products]
    setProducts(nextList)
    return data.product
  }

  async function updateProduct(productId, productData) {
    const token = localStorage.getItem('billingToken')
    if (!token) throw new Error('Not authenticated')

    const response = await fetch(apiUrl(`/products/${productId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    })

    if (!response.ok) throw new Error('Failed to update product')
    const data = await response.json()
    setProducts((current) => current.map((item) => String(item.id) === String(productId) ? data.product : item))
    return data.product
  }

  async function deleteProduct(productId) {
    const token = localStorage.getItem('billingToken')
    if (!token) throw new Error('Not authenticated')

    const response = await fetch(apiUrl(`/products/${productId}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!response.ok) throw new Error('Failed to delete product')
    setProducts((current) => current.filter((item) => String(item.id) !== String(productId)))
    return true
  }

  const cartCount = cart.reduce((s,i)=>s + (i.qty||0), 0)

  return (
    <CatalogContext.Provider value={{products, fetchProducts, createProduct, updateProduct, deleteProduct, addToCart, cart, removeFromCart, updateQty, clearCart, cartCount}}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog(){
  return useContext(CatalogContext)
}

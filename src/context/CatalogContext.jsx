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

  function addToCart(product){
    setCart((c)=>{
      const existing = c.find(p=>p.id===product.id)
      if(existing) return c.map(p=>p.id===product.id?{...p,qty:p.qty+1}:p)
      return [...c,{...product,qty:1}]
    })
  }

  return (
    <CatalogContext.Provider value={{products, addToCart, cart}}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog(){
  return useContext(CatalogContext)
}

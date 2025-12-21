import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { usePageGradient } from './hooks/usePageGradient'
import AppHeader from './components/AppHeader'
import ScrollToTop from './components/ScrollToTop'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import FloatingCall from './components/FloatingCall'
import AppFooter from './components/AppFooter'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import About from './pages/About'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ShippingReturns from './pages/ShippingReturns'
import TermsConditions from './pages/TermsConditions'
import Product from './pages/Product'
import Cart from './pages/Cart'

export default function App(){
  usePageGradient()
  
  return (
    <div className="app-wrapper">
      <AppHeader />
      <ScrollToTop />
      <FloatingWhatsApp phone="+917897061003" message="Hello%20Madhuban%20Traders!" />
      <FloatingCall phone="+917897061003" />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/catalog" element={<Catalog/>} />
          <Route path="/product/:id" element={<Product/>} />
          <Route path="/cart" element={<Cart/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/privacy" element={<PrivacyPolicy/>} />
          <Route path="/shipping" element={<ShippingReturns/>} />
          <Route path="/terms" element={<TermsConditions/>} />
        </Routes>
      </main>
      <AppFooter />
      <FloatingWhatsApp phone="+917897061003" message="Hello%20Madhuban%20Traders!" />
    </div>
  )
}

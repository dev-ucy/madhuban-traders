import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { usePageGradient } from './hooks/usePageGradient'
import AppHeader from './components/AppHeader'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import AppFooter from './components/AppFooter'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import About from './pages/About'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ShippingReturns from './pages/ShippingReturns'
import TermsConditions from './pages/TermsConditions'

export default function App(){
  usePageGradient()
  
  return (
    <div className="app-wrapper">
      <AppHeader />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/catalog" element={<Catalog/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/privacy" element={<PrivacyPolicy/>} />
          <Route path="/shipping" element={<ShippingReturns/>} />
          <Route path="/terms" element={<TermsConditions/>} />
        </Routes>
      </main>
      <AppFooter />
      <FloatingWhatsApp phone="+919876543210" message="Hello%20Madhuban%20Traders!%20I%20need%20help%20with%20a%20bulk%20order." />
    </div>
  )
}

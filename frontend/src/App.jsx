import React, { Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { usePageGradient } from './hooks/usePageGradient'
import { BillingProvider, useBilling } from './context/BillingContext'
import AppHeader from './components/AppHeader'
import ScrollToTop from './components/ScrollToTop'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import FloatingCall from './components/FloatingCall'
import AppFooter from './components/AppFooter'

// Lazy load page components for route-based code splitting
const Home = React.lazy(() => import('./pages/Home'))
const Catalog = React.lazy(() => import('./pages/Catalog'))
const About = React.lazy(() => import('./pages/About'))
const Contact = React.lazy(() => import('./pages/Contact'))
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'))
const ShippingReturns = React.lazy(() => import('./pages/ShippingReturns'))
const TermsConditions = React.lazy(() => import('./pages/TermsConditions'))
const Product = React.lazy(() => import('./pages/Product'))
const Cart = React.lazy(() => import('./pages/Cart'))
const Submissions = React.lazy(() => import('./pages/Submissions'))
const BillingLogin = React.lazy(() => import('./pages/BillingLogin'))
const BillGenerator = React.lazy(() => import('./pages/BillGenerator'))
const BillPreview = React.lazy(() => import('./pages/BillPreview'))
const BillHistory = React.lazy(() => import('./pages/BillHistory'))
const BillInvoice = React.lazy(() => import('./pages/BillInvoice'))
const ManagerDashboard = React.lazy(() => import('./pages/ManagerDashboard'))
const ManagerSettings = React.lazy(() => import('./pages/ManagerSettings'))

// Loading component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
    <p>Loading...</p>
  </div>
)

function AppShell() {
  const location = useLocation()
  const { isAuthenticated } = useBilling()

  const billingPortalPaths = new Set([
    '/submissions',
    '/billing-login',
    '/billing',
    '/bill-preview',
    '/bill-invoice',
    '/billing-history',
    '/manager-dashboard',
    '/manager-settings'
  ])

  const isBillingRoute = isAuthenticated && billingPortalPaths.has(location.pathname)

  React.useEffect(() => {
    if (!isBillingRoute) return

    const billingHeaders = document.querySelectorAll('.billing-header')
    if (!billingHeaders.length) return

    const handleScroll = () => {
      const shouldHide = window.scrollY > 30
      billingHeaders.forEach((header) => {
        header.style.transform = shouldHide ? 'translateY(-120%)' : 'translateY(0)'
        header.style.transition = 'transform 0.25s ease'
        header.style.position = 'sticky'
        header.style.top = '0'
        header.style.zIndex = '1000'
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isBillingRoute, location.pathname])

  return (
    <div className="app-wrapper">
      <AppHeader />
      <ScrollToTop />
      <FloatingWhatsApp phone="+917897061003" message="Hello%20Madhuban%20Traders!" />
      <FloatingCall phone="+917897061003" />
      <main className="app-main">
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/submissions" element={<Submissions/>} />
            <Route path="/billing-login" element={isAuthenticated ? <Navigate to="/manager-dashboard" replace /> : <BillingLogin/>} />
            <Route path="/billing" element={<BillGenerator/>} />
            <Route path="/bill-preview" element={<BillPreview/>} />
            <Route path="/bill-invoice" element={<BillInvoice/>} />
            <Route path="/billing-history" element={<BillHistory/>} />
            <Route path="/manager-dashboard" element={<ManagerDashboard/>} />
            <Route path="/manager-settings" element={<ManagerSettings/>} />
          </Routes>
        </Suspense>
      </main>
      <AppFooter />
    </div>
  )
}

export default function App(){
  usePageGradient()

  return (
    <BillingProvider>
      <AppShell />
    </BillingProvider>
  )
}

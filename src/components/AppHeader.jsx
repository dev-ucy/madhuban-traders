// import React, { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useLanguage } from '../context/LanguageContext'
// import { useTranslation } from '../hooks/useTranslation'

// export default function AppHeader(){
//   const navigate = useNavigate()
//   const { language, toggleLanguage } = useLanguage()
//   const { t } = useTranslation()
//   const [menuOpen, setMenuOpen] = useState(false)

//   useEffect(() => {
//     function onResize(){ if(window.innerWidth > 768) setMenuOpen(false) }
//     window.addEventListener('resize', onResize)
//     return () => window.removeEventListener('resize', onResize)
//   }, [])
  
//   return (
//     <header className="app-header">
//       <div className="header-container">
//         <div className="logo-section">
//           <h1 className="logo">{t('header.logo')}</h1>
//         </div>
        
//         <button className={`hamburger ${menuOpen ? 'open' : ''}`} aria-label="Toggle navigation" onClick={() => setMenuOpen(v => !v)}>
//           <span />
//           <span />
//           <span />
//         </button>

//         <nav className={`header-nav ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
//           <Link to="/" className="nav-link">{t('header.nav_home')}</Link>
//           <Link to="/catalog" className="nav-link">{t('header.nav_catalog')}</Link>
//           {/* <Link to="/catalog?category=oils" className="nav-link">{t('header.nav_oils')}</Link>
//           <Link to="/catalog?category=spices" className="nav-link">{t('header.nav_spices')}</Link> */}
//           <Link to="/about" className="nav-link">{t('header.nav_about')}</Link>
//           <Link to="/contact" className="nav-link">{t('header.nav_contact')}</Link>
//         </nav>
        
//         <div className="header-actions">
//           <button className="language-toggle" onClick={toggleLanguage} title={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}>
//             <span className="lang-badge">{language === 'en' ? '🇬🇧 EN' : '🇮🇳 हिंदी'}</span>
//           </button>
//           <button className="bulk-inquiry-btn" onClick={() => navigate('/contact?type=wholesale')}>
//             {t('header.bulk_inquiry')}
//           </button>
//         </div>
//       </div>
//     </header>
//   )
// }



import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../hooks/useTranslation'
import { useCatalog } from '../context/CatalogContext'
// ⚠️ You'll need to make sure this path is correct for your project structure
import logoImage from '../assets/logo.jpg' 

export default function AppHeader(){
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const { t } = useTranslation()
  const { cartCount } = useCatalog()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onResize(){ if(window.innerWidth > 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  
  // Function to navigate to home when logo is clicked
  const handleLogoClick = () => {
    navigate('/')
    // Close the mobile menu if it's open
    setMenuOpen(false) 
  }
  
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Updated Logo Section to include the image and link to home */}
        <div className="logo-section" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <Link to="/" className="logo-link">
            {/* 1. Added Logo Image */}
            <img 
              src={logoImage} 
              style={{ maxHeight: "80px", maxWidth: "80px", borderRadius: '10px' }}
              alt={t('header.logo_alt_text') || 'App Logo'} // Use a translated alt text or default
              className="logo-image"
            />

          </Link>
        </div>
        
        <button className={`hamburger ${menuOpen ? 'open' : ''}`} aria-label="Toggle navigation" onClick={() => setMenuOpen(v => !v)}>
          <span />
          <span />
          <span />
        </button>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        {/* 2. Added Logo Text/Name (optional, but good for SEO/accessibility) */}
            
          {/* <h1 className="logo-text" style={{  }}>{t('header.logo')}</h1> */}
          {/* <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>{t('header.logo')}</Link> */}
          {/* <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>{t('')}</Link> */}
          {/* <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>{t('')}</Link> */}
          
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>{t('header.nav_home')}</Link>
          <Link to="/catalog" className="nav-link" onClick={() => setMenuOpen(false)}>{t('header.nav_catalog')}</Link>
          {/* <Link to="/catalog?category=oils" className="nav-link" onClick={() => setMenuOpen(false)}>{t('header.nav_oils')}</Link>
          <Link to="/catalog?category=spices" className="nav-link" onClick={() => setMenuOpen(false)}>{t('header.nav_spices')}</Link> */}
          <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>{t('header.nav_about')}</Link>
          <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>{t('header.nav_contact')}</Link>
        </nav>
        
        <div className="header-actions">
          <button className="language-toggle" onClick={toggleLanguage} title={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}>
            <span className="lang-badge">{language === 'en' ? '🇬🇧 EN' : '🇮🇳 हिंदी'}</span>
          </button>
          <Link to="/cart" className="nav-link cart-link" onClick={() => setMenuOpen(false)} style={{position:'relative'}}>
            🛒
            <span className="cart-count">{cartCount}</span>
          </Link>
          {/* <button className="bulk-inquiry-btn" onClick={() => {
            navigate('/contact?type=wholesale')
            setMenuOpen(false) // Close menu on navigation
          }}>
            {t('header.bulk_inquiry')}
          </button> */}
        </div>
      </div>
    </header>
  )
}

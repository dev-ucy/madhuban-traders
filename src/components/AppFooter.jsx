import React from 'react'
import facebookIcon from '../assets/facebook_icon.svg.png'
import youtubeIcon from '../assets/YouTube_Logo_2017.svg.png'
import instagramIcon from '../assets/Instagram_logo_2016.svg.png'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../context/LanguageContext'
export default function AppFooter(){
  const { t } = useTranslation()
  const { language, toggleLanguage } = useLanguage()

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>{t('footer.contact')}</h4>
          <p>📍 {t('contact.location')}</p>
          <p>📱 {t('contact.phone_num')}</p>
          <p>✉️ {t('contact.email_addr')}</p>
        </div>

        <div className="footer-section">
          <h4>{t('footer.quick_links')}</h4>
          <ul>
            <li><a href="/">{t('header.nav_home')}</a></li>
            <li><a href="/catalog">{t('header.nav_catalog')}</a></li>
            <li><a href="/about">{t('header.nav_about')}</a></li>
            <li><a href="/contact">{t('header.nav_contact')}</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t('footer.legal')}</h4>
          <ul>
            <li><a href="/privacy">{t('footer.privacy')}</a></li>
            <li><a href="/shipping">{t('footer.shipping')}</a></li>
            <li><a href="/terms">{t('footer.terms')}</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t('footer.follow')}</h4>
          <div className="social-links">
            <a href="https://www.facebook.com/profile.php?id=61576880997873" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src={facebookIcon} className="social-icon" alt="Facebook" loading="lazy" />
            </a>
            <a href="https://www.youtube.com/@MadhubanOilCompany" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <img src={youtubeIcon} className="social-icon" alt="YouTube" loading="lazy" />
            </a>
            <a href="https://www.instagram.com/madhubanoil10?igsh=NnIycTE1NWd4Y3h2" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src={instagramIcon} className="social-icon" alt="Instagram" loading="lazy" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>&copy; {t('footer.copyright')}</p>
          <div className="footer-lang">
            <button className="footer-lang-toggle" onClick={toggleLanguage} aria-label="Toggle language">
              {language === 'en' ? 'हिंदी' : 'EN'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

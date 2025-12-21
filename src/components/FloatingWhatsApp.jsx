import React from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function FloatingWhatsApp({ phone = '+917897061003', message = 'Hello%20Madhuban%20Traders%20team!' }){
  const { t } = useTranslation()
  const href = `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`
  return (
    <a className="floating-whatsapp" href={href} target="_blank" rel="noopener noreferrer" aria-label={t('ui.whatsapp')}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M20.52 3.48A11.95 11.95 0 0 0 12 .5C5.73.5.97 4.96.5 10.79c-.04.79.77 2.66 2.31 4.79L.5 23.5l7.98-2.1c2.02 1.1 4.4 1.68 6.98 1.68h.01c6.27 0 11.03-4.45 11.5-10.28.47-5.83-3.28-10.29-9.45-10.29z" fill="#25D366"/>
        <path d="M17.1 14.04c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.24-.46-2.36-1.45-.87-.77-1.45-1.72-1.62-2.02-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2 0-.37-.02-.52-.02-.15-.67-1.62-.92-2.22-.24-.57-.5-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.05 2.86 1.2 3.06.15.2 2.07 3.35 5.02 4.69 2.95 1.33 2.95.89 3.48.83.52-.05 1.68-.68 1.92-1.34.24-.66.24-1.23.17-1.35-.07-.12-.27-.2-.57-.35z" fill="#fff"/>
      </svg>
      <span className="wa-text">{t('ui.whatsapp')}</span>
    </a>
  ) 
}

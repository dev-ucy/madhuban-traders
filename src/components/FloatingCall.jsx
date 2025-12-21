import React from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function FloatingCall({ phone = '+917897061003' }){
  const { t } = useTranslation()
  const tel = `tel:${phone.replace(/\s+/g, '')}`
  return (
    <a className="floating-call" href={tel} aria-label={t('ui.call')} title={t('ui.call')}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.4 19.4 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12 1.05.38 2.08.76 3.04a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.01-1.01a2 2 0 0 1 2.11-.45c.96.38 1.99.64 3.04.76A2 2 0 0 1 22 16.92z" fill="#fff"/>
      </svg>
      <span className="call-text">{t('ui.call')}</span>
    </a>
  )
}

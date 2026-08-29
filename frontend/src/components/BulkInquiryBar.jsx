import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'

export default function BulkInquiryBar(){
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <section className="bulk-inquiry-bar">
      <div className="inquiry-content">
        <h3>{t('inquiry.title')}</h3>
        <p>{t('inquiry.description')}</p>
        <button className="inquiry-cta-btn" onClick={() => navigate('/contact?type=wholesale')}>
          {t('inquiry.cta')}
        </button>
      </div>
    </section>
  )
}

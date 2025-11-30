import React from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function TrustBadges(){
  const { t } = useTranslation()

  const badges = [
    {
      icon: '❄️',
      title: t('trust.coldpressed_title'),
      description: t('trust.coldpressed_desc')
    },
    {
      icon: '🌾',
      title: t('trust.farm_title'),
      description: t('trust.farm_desc')
    },
    {
      icon: '📦',
      title: t('trust.bulk_title'),
      description: t('trust.bulk_desc')
    }
  ]

  return (
    <section className="trust-badges">
      <h2>{t('trust.title')}</h2>
      <div className="badges-grid">
        {badges.map((badge, idx) => (
          <div key={idx} className="badge">
            <div className="badge-icon">{badge.icon}</div>
            <h3>{badge.title}</h3>
            <p>{badge.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

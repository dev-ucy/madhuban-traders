import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import YouTubeEmbed from './YouTubeEmbed'

export default function HeroBanner(){
  const { t } = useTranslation()

  return (
    <section className="hero-banner">
      <div className="hero-content">
        <h2 className="hero-headline">{t('hero.headline')}</h2>
        <p className="hero-subheadline">{t('hero.subheadline')}</p>
        <p className="hero-description">{t('hero.description')}</p>
        <Link to="/catalog" className="hero-cta-btn">
          {t('hero.cta')}
        </Link>
      </div>
      <div className="hero-video">
        <YouTubeEmbed videoId="zDd0qQovMLc" title="Cold-pressed oil extraction process" />
      </div>
    </section>
  )
}

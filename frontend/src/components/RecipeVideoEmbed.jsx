import React from 'react'
import { useTranslation } from '../hooks/useTranslation'
import YouTubeEmbed from './YouTubeEmbed'

export default function ManufacturingVideoEmbed(){
  const { t } = useTranslation()

  return (
    <section className="recipe-section manufacturing-section">
      <div className="recipe-content">
        <h2>{t('recipes.title')}</h2>
        <p className="recipe-description">{t('recipes.description')}</p>
      </div>
      <div className="recipe-video">
        <YouTubeEmbed videoId="JT5DPhS1g1w" title="Cold-pressed oil and spice manufacturing process" />
      </div>
      <div className="recipe-cta">
        <a href="/recipes" className="btn">{t('recipes.cta')}</a>
      </div>
    </section>
  )
}

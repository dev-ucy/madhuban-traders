import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import YouTubeEmbed from './YouTubeEmbed'

export default function ProductHighlights() {
    const { t } = useTranslation()

    return (
        <section className="product-highlights">
            <div className="highlights-grid">
                <div className="highlight-card oils-card">
                    {/* <div className="card-video-wrapper">
            <YouTubeEmbed videoId="tt5VDqJSBPM" title="Health benefits of cold-pressed oils" />
          </div> */}

                    <div className="card-image-wrapper">
                        <img src="src/assets/oils_home.png" alt="Farm-sourced whole oils " />
                    </div>
                    <div className="card-content">
                        <h3>{t('highlights.oils_title')}</h3>
                        <span className="card-subtitle">{t('highlights.oils_subtitle')}</span>
                        <p>{t('highlights.oils_description')}</p>
                        <p className="sizes-info"><strong>{t('highlights.oils_sizes')}</strong></p>
                        <Link to="/catalog?category=oils" className="highlight-cta">{t('highlights.oils_cta')}</Link>
                    </div>
                </div>

                <div className="highlight-card spices-card">
                    <div className="card-image-wrapper">
                        <img src="src/assets/spice_home.png" alt="Farm-sourced whole spices including turmeric, cardamom, cumin" />
                    </div>
                    <div className="card-content">
                        <h3>{t('highlights.spices_title')}</h3>
                        <span className="card-subtitle">{t('highlights.spices_subtitle')}</span>
                        <p>{t('highlights.spices_description')}</p>
                        <p className="spices-list"><strong>{t('highlights.spices_list')}</strong></p>
                        <Link to="/catalog?category=spices" className="highlight-cta">{t('highlights.spices_cta')}</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

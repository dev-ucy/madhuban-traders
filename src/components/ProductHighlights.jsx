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
                        <img src="https://www.shutterstock.com/shutterstock/photos/694371265/display_1500/stock-photo-concept-groundnuts-isolated-white-background-with-peanuts-oil-close-up-and-selective-focus-694371265.jpg" alt="Farm-sourced whole spices including turmeric, cardamom, cumin" />
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
                        <img src="https://www.shutterstock.com/shutterstock/photos/2546546751/display_1500/stock-photo-garam-masala-is-a-fragrant-spice-blend-used-in-indian-cuisine-featuring-warm-spices-like-cumin-2546546751.jpg" alt="Farm-sourced whole spices including turmeric, cardamom, cumin" />
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

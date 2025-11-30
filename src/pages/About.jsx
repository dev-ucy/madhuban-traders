import React from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function About(){
  const { t } = useTranslation()

  return (
    <div className="about-page" >
      <h2 style={{textAlign: 'center', margin: '40px auto'}}>{t('about.nav_about') === 'हमारे बारे में' ? 'हमारे बारे में' : 'About Us'}</h2>
      <section className="card" style={{marginTop: 24, marginBottom: 24}}>
        <h3>{t('about.story_title')}</h3>
        <p>{t('about.story_text')}</p>
      </section>
      <section className="card" style={{marginBottom: 24}}>
        <h3>{t('about.mission_title')}</h3>
        <p>{t('about.mission_text')}</p>
      </section>

      <section className="card" style={{marginBottom: 24}}>
        <h3>{t('about.why_title')}</h3>
        <ul>
          <li><strong>{t('trust.coldpressed_title')}:</strong> {t('about.why_1')}</li>
          <li><strong>{t('trust.farm_title')}:</strong> {t('about.why_2')}</li>
          <li><strong>{t('trust.bulk_title')}:</strong> {t('about.why_3')}</li>
          <li><strong>{t('contact.info_title')}:</strong> {t('about.why_4')}</li>
          <li><strong>Competitive Pricing:</strong> {t('about.why_5')}</li>
        </ul>
      </section>

      <section className="card" style={{marginBottom: 24}}>
        <h3>{t('about.products_title')}</h3>
        <h4>{t('about.oils_header')}</h4>
        <p>{t('about.oils_text')}</p>
        <h4>{t('about.spices_header')}</h4>
        <p>{t('about.spices_text')}</p>
      </section>

      <section className="card" style={{marginBottom: 24, textAlign: 'center', background: 'linear-gradient(135deg, rgba(243,199,91,0.06) 0%, rgba(127,85,57,0.04) 100%)'}}>
        <h3 style={{color: 'var(--deep-spice-red)', fontSize: '28px'}}>{t('about.journey_title')}</h3>
        <p style={{fontSize: '16px', lineHeight: '1.8', marginTop: '16px'}}>{t('about.journey_text')}</p>
        <div style={{marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)'}}>
          <p>🌾 <strong>{t('about.journey_pillars')}</strong></p>
        </div>
      </section>

      <section className="card" style={{marginBottom: 24}}>
        <h3 style={{textAlign: 'center'}}>{t('contact.info_title')}</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 12}}>
          <div style={{borderRadius: 8, overflow: 'hidden'}}>
            <iframe
              title="Madhuban Traders - Location"
              width="100%"
              height="320"
              frameBorder="0"
              style={{border:0}}
              src="https://www.google.com/maps?q=Madhuban%20Traders%20Sindhora%20Varanasi%20221208&output=embed"
              allowFullScreen
            />
          </div>

          <div style={{textAlign: 'left', padding: '12px 8px'}}>
            <p style={{margin: 0}}><strong>{t('contact.location') || 'Sindhora, Varanasi 221208'}</strong></p>
            <p style={{margin: '8px 0 12px', color: 'var(--text-muted)'}}>{t('header.logo').includes('मधुबन') ? 'हमारे ग्राहक अक्सर बताते हैं कि हमारे उत्पाद की शुद्धता और स्वाद बेहतरीन है। नीचे कुछ हालिया टिप्पणियाँ देखें।' : 'Our customers frequently praise the purity and flavor of our products. See a couple of recent reviews below.'}</p>

            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              <div style={{background: 'rgba(0,0,0,0.03)', padding: 10, borderRadius: 6}}>
                <div style={{fontSize: 14, fontWeight: 700}}>★★★★★ <span style={{fontWeight:500, marginLeft:8}}>{t('header.logo').includes('मधुबन') ? 'उत्कृष्ट सेवा और जल्दी डिलीवरी' : 'Excellent service and fast delivery'}</span></div>
                <div style={{fontSize: 13, color: 'var(--text-muted)', marginTop:6}}>{t('header.logo').includes('मधुबन') ? '"तेल बहुत ताज़ा और स्वादिष्ट था। थोक ऑर्डर में भी प्रतिक्रिया तुरंत मिली।"' : '"The oil was very fresh and flavorful. Quick response for bulk orders too."'}</div>
              </div>

              <div style={{background: 'rgba(0,0,0,0.03)', padding: 10, borderRadius: 6}}>
                <div style={{fontSize: 14, fontWeight: 700}}>★★★★☆ <span style={{fontWeight:500, marginLeft:8}}>{t('header.logo').includes('मधुबन') ? 'उत्कृष्ट गुणवत्ता' : 'Great quality'}</span></div>
                <div style={{fontSize: 13, color: 'var(--text-muted)', marginTop:6}}>{t('header.logo').includes('मधुबन') ? '"मसाले सुगंधित और स्वाद में तीखे थे — सिफारिश करता हूँ।"' : '"Spices were aromatic and bold in flavor — recommend."'}</div>
              </div>

              <p style={{fontSize:13, color: 'var(--text-muted)', marginTop:6}}>{t('header.logo').includes('मधुबन') ? 'पूरा रिव्यू और रेटिंग्स देखने के लिए Google Map खोलें।' : 'Open the Google Map to see full reviews and ratings.'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

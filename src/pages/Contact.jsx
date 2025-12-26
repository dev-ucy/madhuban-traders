import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import InquiryForm from '../components/InquiryForm'
import LocationCard from '../components/LocationCard'
import { useTranslation } from '../hooks/useTranslation'

export default function Contact() {
    const [searchParams] = useSearchParams()
    const [inquiryType, setInquiryType] = useState(searchParams.get('type') || 'general')
    const inquiryRef = useRef(null)
    const { t } = useTranslation()

    // When a query param 'type' is present (e.g. /contact?type=wholesale),
    // scroll to the inquiry section so the user lands on the correct block.
    useEffect(() => {
      const type = searchParams.get('type')
      if (type) {
        setInquiryType(type)
        setTimeout(() => {
          if (inquiryRef.current) {
            const header = document.querySelector('.app-header')
            const offset = (header && header.offsetHeight) ? header.offsetHeight + 12 : 80
            const top = inquiryRef.current.getBoundingClientRect().top + window.pageYOffset - offset
            window.scrollTo({ top, behavior: 'smooth' })

            // Focus a form control for accessibility
            const focusEl = inquiryRef.current.querySelector('input, textarea, button, select')
            if (focusEl) focusEl.focus()
          }
        }, 60)
      }
    }, [searchParams])

    const plantMapUrl = "https://www.google.com/maps?q=Madhuban%20Traders%20Plant%20Sindhora%20Varanasi%20221208&output=embed"
    const storeMapUrl = "https://www.google.com/maps?q=Madhuban%20Traders%20Store%20Sindhora%20Varanasi%20221208&output=embed"

    return (
        <div className="contact-page">
            <div className="contact-container">
                <h1 className="contact-title">{t('contact.title')}</h1>
                <p className="contact-subtitle muted">{t('contact.subtitle')}</p>

                {/* Quick Contact Info Section */}
                <section className="card" style={{marginBottom: 32}}>
                    {/* <h2 style={{textAlign: 'center', color: 'var(--primary)', marginTop: 0}}>{t('contact.info_title')}</h2> */}
                    <div className="contact-grid">
                        <section className="contact-info">
                            <p><strong>{t('footer.address') || 'Address'}:</strong><br />Madhuban Traders, Sindhora Bazar, Varanasi 221208, India</p>
                            <p><strong>{t('footer.phone') || 'Phone'}:</strong><br />+91 7897061003</p>
                            <p><strong>{t('footer.email') || 'Email'}:</strong><br />madhubanoil10@gmail.com</p>
                            <p><strong>{t('contact.hours') || 'Hours'}:</strong><br />Monday - Saturday: 9:00 AM - 6:00 PM<br />Sunday: Closed</p>
                        </section>

                        <section className="contact-map">
                            <div style={{ borderRadius: 8, overflow: 'hidden', height: '100%' }}>
                                <iframe
                                    title="Madhuban Traders - Main Location"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    style={{ border: 0 }}
                                    src={plantMapUrl}
                                    allowFullScreen
                                />
                            </div>
                        </section>
                    </div>
                </section>

                {/* Locations Section */}
                <section style={{marginBottom: 32}}>
                    <h2 style={{textAlign: 'center', color: 'var(--primary)', marginBottom: 24}}>{t('locations.transparency_header')}</h2>
                    <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 24}}>We believe in complete transparency about our operations. Visit our manufacturing facility or stop by our main store to see the quality and care we put into every product.</p>
                    
                    <div className="locations-grid">
                        <LocationCard
                            title={t('locations.plant_title')}
                            focus={t('locations.plant_focus')}
                            address={t('locations.plant_address')}
                            operationsLabel={t('locations.operations_label')}
                            operations={t('locations.plant_operations')}
                            note={t('locations.plant_note')}
                            mapEmbedUrl={plantMapUrl}
                        />
{/* 
                        <LocationCard
                            title={t('locations.store_title')}
                            focus={t('locations.store_focus')}
                            address={t('locations.store_address')}
                            hoursLabel={t('locations.hours_label')}
                            hours={`${t('locations.store_hours')}\n${t('locations.store_closed')}`}
                            contactLabel={t('locations.contact_label')}
                            contact={t('locations.store_contact')}
                            mapEmbedUrl={storeMapUrl}
                        /> */}
                    </div>
                </section>

                {/* Inquiry Section */}
                <section id="inquiry" ref={inquiryRef} className="card inquiry-section">
                    <div className="inquiry-grid">
                        <div className="inquiry-info">
                            <h3 style={{ marginTop: 0 }}>{t('contact.send_inquiry')}</h3>
                            <p className="muted">{t('contact.select_type')}</p>

                            <div className="inquiry-types">
                                <button
                                    className={`inquiry-type-btn ${inquiryType === 'general' ? 'active' : ''}`}
                                    onClick={() => setInquiryType('general')}
                                >
                                    {t('contact.general')}
                                </button>
                                <button
                                    className={`inquiry-type-btn ${inquiryType === 'wholesale' ? 'active' : ''}`}
                                    onClick={() => setInquiryType('wholesale')}
                                >
                                    {t('contact.wholesale_type')}
                                </button>
                                <button
                                    className={`inquiry-type-btn ${inquiryType === 'bulk' ? 'active' : ''}`}
                                    onClick={() => setInquiryType('bulk')}
                                >
                                    {t('contact.bulk_order')}
                                </button>
                            </div>

                            <div className="contact-quick">
                                <p style={{ margin: '12px 0 6px' }}><strong>📞</strong> +91 7897061003</p>
                                <p style={{ margin: '0 0 12px' }}><strong>✉️</strong> madhubanoil10@gmail.com</p>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('header.logo').includes('मधुबन') ? 'सम्पर्क करने के लिए ऊपर दिए गए नंबर पर कॉल करें या नीचे फॉर्म भरें।' : 'Call us using the number above or fill the form to send an inquiry.'}</p>
                            </div>

                            <div className="contact-cta">
                                <button className="btn hero-cta-btn" onClick={() => window.open('tel:+917897061003')}>{t('header.bulk_inquiry')}</button>
                            </div>
                        </div>

                        <div className="inquiry-form-wrapper">
                            <InquiryForm inquiryType={inquiryType} />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

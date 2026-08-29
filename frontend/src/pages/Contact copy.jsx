import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import InquiryForm from '../components/InquiryForm'
import { useTranslation } from '../hooks/useTranslation'

export default function Contact() {
    const [searchParams] = useSearchParams()
    const [inquiryType, setInquiryType] = useState(searchParams.get('type') || 'general')
    const { t } = useTranslation()

    return (
        <div>

            <div className="contact-page">
                <h2 style={{ textAlign: 'center' }}>{t('contact.title')}</h2>
                <p className="muted" style={{ marginBottom: 32, textAlign: 'center' }}>{t('contact.subtitle')}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, alignItems: 'start' }}>
                    <section style={{ padding: 16 }}>
                        <h3>📍 {t('contact.info_title')}</h3>
                        <p><strong>{t('footer.address') || 'Address'}:</strong><br />Madhuban Traders, Sindhora Bazar , Varanasi 221208, India</p>
                        <p><strong>{t('footer.phone') || 'Phone'}:</strong><br />+91 [Phone Number]</p>
                        <p><strong>{t('footer.email') || 'Email'}:</strong><br />madhubanoil10@gmail.com</p>
                        <p><strong>{t('contact.hours') || 'Hours'}:</strong><br />Monday - Saturday: 9:00 AM - 6:00 PM<br />Sunday: Closed</p>
                    </section>

                    <section style={{ padding: 0, margin: 20 }}>
                        <div style={{ borderRadius: 8, overflow: 'hidden', height: '300px' }}>
                            <iframe
                                title="Madhuban Traders - Location"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0, minWidth: '100%', minHeight: '260px' }}
                                src="https://www.google.com/maps?q=Madhuban%20Traders%20Sindhora%20Varanasi%20221208&output=embed"
                                allowFullScreen
                            />
                        </div>
                    </section>
                </div>


            </div>




            <section className="card inquiry-section">
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
                            <p style={{ margin: '12px 0 6px' }}><strong>📞</strong> +91 [Phone Number]</p>
                            <p style={{ margin: '0 0 12px' }}><strong>✉️</strong> madhubanoil10@gmail.com</p>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('header.logo').includes('मधुबन') ? 'सम्पर्क करने के लिए ऊपर दिए गए नंबर पर कॉल करें या नीचे फॉर्म भरें।' : 'Call us using the number above or fill the form to send an inquiry.'}</p>
                        </div>

                        <div className="contact-cta">
                            <button className="btn hero-cta-btn" onClick={() => window.open('tel:+91', [])}>{t('header.bulk_inquiry')}</button>
                        </div>
                    </div>

                    <div className="inquiry-form-wrapper">
                        <InquiryForm inquiryType={inquiryType} />
                    </div>
                </div>
            </section>
        </div>

    )
}

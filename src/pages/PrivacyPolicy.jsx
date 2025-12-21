import React from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function PrivacyPolicy() {
    const { t } = useTranslation()

    return (
        <div className="legal-page">
            <div className="legal-container">
                <div className="legal-header">
                    <h1>🔒 {t('privacy.title')}</h1>
                    <p className="legal-subtitle">{t('privacy.subtitle')}</p>
                    <p className="legal-date">{t('footer.hours_text')}</p>
                </div>

                <div className="legal-content">
                    {/* Introduction */}
                    <section className="legal-section">
                        <h2>{t('privacy.intro_title')}</h2>
                        <p>{t('privacy.intro_text')}</p>
                        <p>{t('privacy.intro_paragraph')}</p>
                    </section>

                    {/* Information We Collect */}
                    <section className="legal-section">
                        <h2>{t('privacy.collect_title')}</h2>
                        
                        <h3>{t('privacy.collect_personal')}</h3>
                        <ul className="legal-list">
                            <li><strong>{t('footer.contact')}:</strong> {t('privacy.collect_personal_items.name_email')}</li>
                            <li><strong>{t('privacy.collect_personal_items.account_label')}:</strong> {t('privacy.collect_personal_items.account_items')}</li>
                            <li><strong>{t('footer.products')}:</strong> {t('privacy.collect_personal_items.order_history')}</li>
                        </ul>

                        <h3>{t('privacy.collect_automatic')}</h3>
                        <ul className="legal-list">
                            <li><strong>{t('privacy.device_info_label')}:</strong> {t('privacy.device_info_items')}</li>
                            <li><strong>{t('privacy.usage_data_label')}:</strong> {t('privacy.usage_data_items')}</li>
                        </ul>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="legal-section">
                        <h2>{t('privacy.use_title')}</h2>
                        <ul className="legal-list">
                            <li>{t('privacy.use.process_orders')}</li>
                            <li>{t('privacy.use.send_updates')}</li>
                            <li>{t('privacy.use.personalize')}</li>
                        </ul>
                    </section>

                    {/* Sharing Your Information */}
                    <section className="legal-section">
                        <h2>{t('privacy.share_title')}</h2>
                        
                        <h3>{t('privacy.share_intro')}</h3>
                        <ul className="legal-list">
                            <li><strong>{t('privacy.share.service_providers')}:</strong> {t('privacy.share.service_providers_items')}</li>
                            <li><strong>{t('privacy.share.legal_requirements')}:</strong> {t('privacy.share.legal_requirements_desc')}</li>
                        </ul>

                        <p><strong>⚠️ {t('privacy.share.no_sell')}</strong></p>
                    </section>

                    {/* Data Security */}
                    <section className="legal-section">
                        <h2>{t('privacy.security_title')}</h2>
                        <p>{t('privacy.security_paragraph')}</p>
                        <ul className="legal-list">
                            <li>{t('privacy.security_items.ssl')}</li>
                            <li>{t('privacy.security_items.pci')}</li>
                            <li>{t('privacy.security_items.audits')}</li>
                        </ul>
                    </section>

                    {/* Your Rights */}
                    <section className="legal-section">
                        <h2>{t('privacy.rights_title')}</h2>
                        <p>{t('privacy.rights_paragraph')}</p>
                        <ul className="legal-list">
                            <li>{t('privacy.rights.access')}</li>
                            <li>{t('privacy.rights.correction')}</li>
                            <li>{t('privacy.rights.deletion')}</li>
                        </ul>
                        <p>{t('privacy.contact_title')}: {t('privacy.email')}</p>
                    </section>

                    {/* Cookies & Tracking */}
                    <section className="legal-section">
                        <h2>{t('privacy.cookies_title')}</h2>
                        <p>{t('privacy.cookies_paragraph')}</p>
                    </section>

                    {/* Children's Privacy */}
                    <section className="legal-section">
                        <h2>{t('privacy.children_title')}</h2>
                        <p>{t('privacy.children_paragraph')}</p>
                    </section>

                    {/* Contact Us */}
                    <section className="legal-section legal-contact">
                        <h2>{t('privacy.contact_title')}</h2>
                        <p>{t('privacy.contact_paragraph')}</p>
                        
                        <div className="contact-details">
                            <div className="contact-item">
                                <strong>📧 {t('footer.email')}</strong>
                                <p>{t('privacy.email')}</p>
                            </div>
                            <div className="contact-item">
                                <strong>📞 {t('footer.phone')}</strong>
                                <p>{t('privacy.phone')}</p>
                            </div>
                            <div className="contact-item">
                                <strong>📍 {t('footer.address')}</strong>
                                <p>{t('privacy.address')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Policy Changes */}
                    <section className="legal-section">
                        <h2>{t('privacy.changes_title')}</h2>
                        <p>{t('privacy.changes_paragraph')}</p>
                    </section>
                </div>
            </div>
        </div>
    )
}

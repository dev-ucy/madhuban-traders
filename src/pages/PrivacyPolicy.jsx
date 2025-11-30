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
                        <p>
                            {t('footer.privacy') === 'গोपनीयता नीति' 
                                ? 'कृपया इस गोपनीयता नीति को ध्यान से पढ़ें। यदि आप हमारी नीतियों और प्रथाओं से सहमत नहीं हैं, तो कृपया हमारी वेबसाइट का उपयोग न करें।'
                                : 'Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our website.'}
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section className="legal-section">
                        <h2>{t('privacy.collect_title')}</h2>
                        
                        <h3>{t('privacy.collect_personal')}</h3>
                        <ul className="legal-list">
                            <li><strong>{t('footer.contact')}:</strong> {t('footer.hours') === 'समय' ? 'नाम, ईमेल पता, फोन नंबर, डाक पता' : 'Name, email address, phone number, mailing address'}</li>
                            <li><strong>Account Information:</strong> {t('footer.hours') === 'समय' ? 'उपयोगकर्ता नाम, पासवर्ड, खाता प्राथमिकताएं' : 'Username, password, account preferences'}</li>
                            <li><strong>{t('footer.products')}:</strong> {t('footer.hours') === 'समय' ? 'आदेश इतिहास, भुगतान विवरण, शिपिंग पता' : 'Order history, payment details, shipping address'}</li>
                        </ul>

                        <h3>{t('privacy.collect_automatic')}</h3>
                        <ul className="legal-list">
                            <li><strong>Device Information:</strong> {t('footer.hours') === 'समय' ? 'ब्राउज़र प्रकार, IP पता, ऑपरेटिंग सिस्टम, डिवाइस प्रकार' : 'Browser type, IP address, operating system, device type'}</li>
                            <li><strong>Usage Data:</strong> {t('footer.hours') === 'समय' ? 'दौरा किए गए पृष्ठ, समय व्यय, क्लिक, नेविगेशन पैटर्न' : 'Pages visited, time spent, clicks, navigation patterns'}</li>
                        </ul>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="legal-section">
                        <h2>{t('privacy.use_title')}</h2>
                        <ul className="legal-list">
                            <li>{t('footer.hours') === 'समय' ? 'आपके आदेशों को संसाधित और पूरा करना' : 'Process and fulfill your orders'}</li>
                            <li>{t('footer.hours') === 'समय' ? 'आदेश की पुष्टि और शिपिंग अपडेट भेजना' : 'Send order confirmations and shipping updates'}</li>
                            <li>{t('footer.hours') === 'समय' ? 'आपकी शॉपिंग अनुभव को व्यक्तिगत बनाना' : 'Personalize your shopping experience'}</li>
                        </ul>
                    </section>

                    {/* Sharing Your Information */}
                    <section className="legal-section">
                        <h2>{t('privacy.share_title')}</h2>
                        
                        <h3>{t('footer.hours') === 'समय' ? 'हम आपकी जानकारी किसके साथ साझा कर सकते हैं:' : 'We may share your information with:'}</h3>
                        <ul className="legal-list">
                            <li><strong>{t('footer.hours') === 'समय' ? 'सेवा प्रदाता' : 'Service Providers'}:</strong> {t('footer.hours') === 'समय' ? 'भुगतान प्रोसेसर, शिपिंग भागीदार, ईमेल सेवा प्रदाता' : 'Payment processors, shipping partners, email service providers'}</li>
                            <li><strong>{t('footer.hours') === 'समय' ? 'कानूनी आवश्यकताएं' : 'Legal Requirements'}:</strong> {t('footer.hours') === 'समय' ? 'कानून द्वारा आवश्यक होने पर' : 'When required by law'}</li>
                        </ul>

                        <p><strong>⚠️ {t('footer.hours') === 'समय' ? 'हम आपकी व्यक्तिगत जानकारी तीसरे पक्ष को नहीं बेचते या किराए पर नहीं देते हैं।' : 'We do NOT sell or rent your personal information to third parties.'}</strong></p>
                    </section>

                    {/* Data Security */}
                    <section className="legal-section">
                        <h2>{t('privacy.security_title')}</h2>
                        <p>
                            {t('footer.hours') === 'समय' 
                                ? 'हम आपकी व्यक्तिगत जानकारी को अनधिकृत पहुंच, परिवर्तन, प्रकटीकरण या विनाश से बचाने के लिए उपयुक्त तकनीकी, प्रशासनिक और भौतिक सुरक्षा उपाय लागू करते हैं।'
                                : 'We implement appropriate technical, administrative, and physical security measures to protect your personal information.'}
                        </p>
                        <ul className="legal-list">
                            <li>SSL {t('footer.hours') === 'समय' ? 'एन्क्रिप्शन' : 'encryption'}</li>
                            <li>PCI DSS {t('footer.hours') === 'समय' ? 'अनुपालन' : 'compliance'}</li>
                            <li>{t('footer.hours') === 'समय' ? 'नियमित सुरक्षा ऑडिट' : 'Regular security audits'}</li>
                        </ul>
                    </section>

                    {/* Your Rights */}
                    <section className="legal-section">
                        <h2>{t('privacy.rights_title')}</h2>
                        <p>{t('footer.hours') === 'समय' ? 'आपके स्थान के आधार पर, आपके पास निम्नलिखित अधिकार हो सकते हैं:' : 'Depending on your location, you may have the following rights:'}</p>
                        <ul className="legal-list">
                            <li><strong>{t('footer.hours') === 'समय' ? 'पहुंच' : 'Access'}:</strong> {t('footer.hours') === 'समय' ? 'हमारे पास आपकी व्यक्तिगत जानकारी तक पहुंचने का अधिकार' : 'Right to access personal information'}</li>
                            <li><strong>{t('footer.hours') === 'समय' ? 'सुधार' : 'Correction'}:</strong> {t('footer.hours') === 'समय' ? 'गलत जानकारी को ठीक करने का अधिकार' : 'Right to correct inaccurate information'}</li>
                            <li><strong>{t('footer.hours') === 'समय' ? 'विलोपन' : 'Deletion'}:</strong> {t('footer.hours') === 'समय' ? 'डेटा हटाने के लिए अनुरोध करने का अधिकार' : 'Right to request deletion of data'}</li>
                        </ul>
                        <p>{t('footer.hours') === 'समय' ? 'इन अधिकारों का प्रयोग करने के लिए, कृपया हमसे संपर्क करें' : 'To exercise these rights, please contact us'}</p>
                    </section>

                    {/* Cookies & Tracking */}
                    <section className="legal-section">
                        <h2>{t('privacy.cookies_title')}</h2>
                        <p>
                            {t('footer.hours') === 'समय' 
                                ? 'हम आपके ब्राउज़िंग अनुभव को बेहतर बनाने, प्राथमिकताओं को याद रखने और वेबसाइट उपयोग का विश्लेषण करने के लिए कुकीज़ और समान ट्रैकिंग तकनीकों का उपयोग करते हैं।'
                                : 'We use cookies and similar tracking technologies to enhance your browsing experience.'}
                        </p>
                    </section>

                    {/* Children's Privacy */}
                    <section className="legal-section">
                        <h2>{t('privacy.children_title')}</h2>
                        <p>
                            {t('footer.hours') === 'समय' 
                                ? 'हमारी वेबसाइट 13 वर्ष से कम उम्र के बच्चों के लिए अभिप्रेत नहीं है। हम जानबूझकर बच्चों से व्यक्तिगत जानकारी एकत्र नहीं करते हैं।'
                                : 'Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children.'}
                        </p>
                    </section>

                    {/* Contact Us */}
                    <section className="legal-section legal-contact">
                        <h2>{t('privacy.contact_title')}</h2>
                        <p>{t('footer.hours') === 'समय' ? 'यदि आपके पास इस गोपनीयता नीति के बारे में प्रश्न हैं, तो कृपया हमसे संपर्क करें:' : 'If you have questions about this Privacy Policy, please contact us:'}</p>
                        
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
                        <p>
                            {t('footer.hours') === 'समय' 
                                ? 'हम इस गोपनीयता नीति को समय-समय पर अपडेट कर सकते हैं। हम महत्वपूर्ण परिवर्तनों के बारे में आपको ईमेल या हमारी वेबसाइट पर प्रमुख नोटिस के माध्यम से सूचित करेंगे।'
                                : 'We may update this Privacy Policy periodically. We will notify you of significant changes by email or through prominent notice on our website.'}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}

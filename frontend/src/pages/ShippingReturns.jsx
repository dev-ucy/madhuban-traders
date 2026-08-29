import React from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function ShippingReturns() {
    const { t } = useTranslation()
    const isHindi = t('footer.phone') === 'फोन'

    return (
    
        <div className="legal-page">
            <div className="legal-container">
                <div className="legal-header">
                    <h1>📦 {t('shipping.title')}</h1>
                    <p className="legal-subtitle">{t('shipping.subtitle')}</p>
                    <p className="legal-date">{isHindi ? 'अंतिम अद्यतन: 30 नवंबर, 2025' : 'Last Updated: November 30, 2025'}</p>
                </div>

                <div className="legal-content">
                    {/* Shipping Information */}
                    <section className="legal-section">
                        <h2>{t('shipping.shipping_title')}</h2>
                        
                        <h3>{t('shipping.delivery_areas')}</h3>
                        <p>{isHindi ? 'हम भारत भर के सभी स्थानों पर शिपिंग करते हैं' : 'We ship to all locations across India'}</p>
                        <ul className="legal-list">
                            <li>{isHindi ? 'मेट्रोपॉलिटन शहर और शहरी केंद्र' : 'Metropolitan cities'}</li>
                            <li>{isHindi ? 'टियर 2 और टियर 3 शहर' : 'Tier 2 and Tier 3 cities'}</li>
                            <li>{isHindi ? 'दूरदराज के क्षेत्र (विस्तारित डिलीवरी समय के साथ)' : 'Remote areas (with extended delivery)'}</li>
                        </ul>

                        <h3>{t('shipping.shipping_methods')}</h3>
                        <ul className="legal-list">
                            <li><strong>{isHindi ? 'मानक शिपिंग' : 'Standard'}:</strong> {isHindi ? '5-7 कार्य दिवस' : '5-7 business days'}</li>
                            <li><strong>{isHindi ? 'एक्सप्रेस शिपिंग' : 'Express'}:</strong> {isHindi ? '2-3 कार्य दिवस' : '2-3 business days'}</li>
                            <li><strong>{isHindi ? 'समान दिन डिलीवरी' : 'Same-Day'}</strong>: {isHindi ? 'चुनिंदा शहरों में' : 'Selected cities'}</li>
                        </ul>

                        <h3>{t('shipping.shipping_costs')}</h3>
                        <ul className="legal-list">
                            <li>{t('shipping.free_shipping')}</li>
                            <li>{isHindi ? '₹500 से कम: ₹50 शिपिंग' : 'Below ₹500: ₹50 shipping'}</li>
                            <li>{isHindi ? 'एक्सप्रेस शिपिंग: स्थान और वजन पर आधारित' : 'Express: Location & weight based'}</li>
                        </ul>
                    </section>

                    {/* Order Processing */}
                    <section className="legal-section">
                        <h3>{t('shipping.processing_title')}</h3>
                        <ul className="legal-list">
                            <li><strong>{isHindi ? 'सोमवार-शनिवार' : 'Mon-Sat'}:</strong> {isHindi ? 'दोपहर 2 बजे से पहले: उसी दिन' : 'Before 2 PM: Same day'}</li>
                            <li><strong>{isHindi ? 'दोपहर 2 बजे के बाद' : 'After 2 PM'}:</strong> {isHindi ? 'अगले कार्य दिवस' : 'Next business day'}</li>
                            <li><strong>{isHindi ? 'रविवार & छुट्टियां' : 'Sun & Holidays'}:</strong> {isHindi ? 'अगले कार्य दिवस' : 'Next business day'}</li>
                        </ul>
                    </section>

                    {/* Tracking */}
                    <section className="legal-section">
                        <h2>{t('shipping.tracking_title')}</h2>
                        <p>{isHindi ? 'आपको ईमेल और एसएमएस के माध्यम से ट्रैकिंग नंबर प्राप्त होगा। आप निम्नलिखित माध्यम से ट्रैक कर सकते हैं:' : 'You will receive tracking via email & SMS. Track through:'}</p>
                        <ul className="legal-list">
                            <li>{isHindi ? 'हमारी वेबसाइट' : 'Our website'}</li>
                            <li>{isHindi ? 'कूरियर पार्टनर का ट्रैकर' : 'Courier partner tracker'}</li>
                            <li>{isHindi ? 'एसएमएस और ईमेल अपडेट' : 'SMS & email updates'}</li>
                        </ul>
                    </section>

                    {/* Delivery */}
                    <section className="legal-section">
                        <h2>{t('shipping.delivery_title')}</h2>
                        <ul className="legal-list">
                            <li><strong>{isHindi ? 'देरी से डिलीवरी' : 'Delayed Delivery'}:</strong> {isHindi ? 'हमसे संपर्क करें' : 'Contact us'}</li>
                            <li><strong>{isHindi ? 'खोया हुआ पैकेज' : 'Lost Package'}:</strong> {isHindi ? 'प्रतिस्थापन या रिफंड' : 'Replacement or refund'}</li>
                            <li><strong>{isHindi ? 'प्राप्तकर्ता अनुपलब्ध' : 'Not Available'}:</strong> {isHindi ? 'पुनः डिलीवरी' : 'Redelivery'}</li>
                        </ul>
                    </section>

                    {/* Return Policy */}
                    <section className="legal-section">
                        <h2>{t('shipping.return_title')}</h2>
                        
                        <h3>{t('shipping.return_window')}</h3>
                        <ul className="legal-list">
                            <li><strong>{isHindi ? 'सामान्य उत्पाद' : 'General Products'}:</strong> {isHindi ? '30 दिन' : '30 days'}</li>
                            <li><strong>{isHindi ? 'क्षतिग्रस्त/खराब' : 'Damaged/Defective'}:</strong> {isHindi ? '7 दिन' : '7 days'}</li>
                            <li><strong>{isHindi ? 'गलत आइटम' : 'Wrong Item'}:</strong> {isHindi ? '7 दिन' : '7 days'}</li>
                        </ul>

                        <h3>{t('shipping.returnable')}</h3>
                        <ul className="legal-list">
                            <li>{isHindi ? 'खोली गई नहीं या न्यूनतम उपयोग' : 'Unopened or minimal use'}</li>
                            <li>{isHindi ? 'मूल पैकेजिंग में' : 'In original packaging'}</li>
                            <li>{isHindi ? 'रिटर्न विंडो के भीतर' : 'Within return window'}</li>
                        </ul>

                        <h3>{t('shipping.non_returnable')}</h3>
                        <ul className="legal-list">
                            <li>{isHindi ? 'खोले गए या आंशिक उपयोग वाले उत्पाद' : 'Opened or partially used'}</li>
                            <li>{isHindi ? 'सामान्य हैंडलिंग से अधिक क्षति' : 'Damage beyond normal use'}</li>
                            <li>{isHindi ? 'मूल पैकेजिंग के बिना' : 'Without original packaging'}</li>
                        </ul>
                    </section>

                    {/* Return Process */}
                    <section className="legal-section">
                        <h2>{t('shipping.return_process')}</h2>
                        
                        <h3>{isHindi ? '1. रिटर्न अनुरोध करें' : '1. Request Return'}</h3>
                        <p>{isHindi ? 'हमसे संपर्क करें और अपना ऑर्डर नंबर दें।' : 'Contact us with your order number.'}</p>

                        <h3>{isHindi ? '2. प्राधिकरण नंबर प्राप्त करें' : '2. Get Authorization Number'}</h3>
                        <p>{isHindi ? 'हम एक RAN और रिटर्न पता प्रदान करेंगे।' : 'We provide RAN and return address.'}</p>

                        <h3>{isHindi ? '3. पैकेज तैयार करें' : '3. Prepare Package'}</h3>
                        <ul className="legal-list">
                            <li>{isHindi ? 'सुरक्षित पैकेजिंग' : 'Secure packaging'}</li>
                            <li>{isHindi ? 'सभी सहायक उपकरण शामिल करें' : 'Include all accessories'}</li>
                            <li>{isHindi ? 'RAN और ऑर्डर नंबर नोट करें' : 'Include RAN & order number'}</li>
                        </ul>

                        <h3>{isHindi ? '4. शिप करें' : '4. Ship Item'}</h3>
                        <p>{isHindi ? 'प्रदान किए गए पते पर शिप करें। 7 दिनों के भीतर रिटर्न के लिए हम शिपिंग कवर करते हैं।' : 'Ship to provided address. Free return shipping within 7 days.'}</p>

                        <h3>{isHindi ? '5. पुष्टि प्राप्त करें' : '5. Get Confirmation'}</h3>
                        <p>{isHindi ? 'निरीक्षण के बाद, हम रिफंड विवरण के साथ ईमेल भेजेंगे।' : 'After inspection, we email refund details.'}</p>
                    </section>

                    {/* Refunds */}
                    <section className="legal-section">
                        <h2>{t('shipping.refunds_title')}</h2>
                        
                        <h3>{isHindi ? 'प्रसंस्करण समय' : 'Processing Timeline'}</h3>
                        <ul className="legal-list">
                            <li>{isHindi ? 'निरीक्षण: प्राप्ति के 5-7 दिन' : 'Inspection: 5-7 days after receipt'}</li>
                            <li>{isHindi ? 'अनुमोदन: 2-3 कार्य दिवस' : 'Approval: 2-3 business days'}</li>
                            <li>{isHindi ? 'रिफंड: 7-10 कार्य दिवस' : 'Refund: 7-10 business days'}</li>
                        </ul>

                        <h3>{isHindi ? 'रिफंड राशि' : 'Refund Amount'}</h3>
                        <ul className="legal-list">
                            <li><strong>{isHindi ? 'पूर्ण' : 'Full'}:</strong> {isHindi ? 'उत्पाद मूल्य (7 दिन के भीतर)' : 'Product price (within 7 days)'}</li>
                            <li><strong>{isHindi ? 'आंशिक' : 'Partial'}:</strong> {isHindi ? '80% (7 दिनों के बाद)' : '80% (after 7 days)'}</li>
                            <li><strong>{isHindi ? 'मूल शिपिंग' : 'Original Shipping'}:</strong> {isHindi ? 'गैर-वापसी योग्य' : 'Non-refundable'}</li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <section className="legal-section legal-contact">
                        <h2>{t('footer.contact')}</h2>
                        <p>{isHindi ? 'शिपिंग, रिटर्न, या डिलीवरी के प्रश्नों के लिए:' : 'For shipping, return, or delivery questions:'}</p>
                        
                        <div className="contact-details">
                            <div className="contact-item">
                                <strong>📧 {t('footer.email')}</strong>
                                <p>{t('shipping.returns_email')}</p>
                            </div>
                            <div className="contact-item">
                                <strong>📞 {t('footer.phone')}</strong>
                                <p>+91 7897061003</p>
                            </div>
                            <div className="contact-item">
                                <strong>⏰ {isHindi ? 'घंटे' : 'Hours'}</strong>
                                <p>{t('shipping.support_hours')}</p>
                            </div>
                            <div className="contact-item">
                                <strong>📧 {isHindi ? 'थोक' : 'Bulk'}</strong>
                                <p>{t('shipping.bulk_email')}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>

         )
}


       

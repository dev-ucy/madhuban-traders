import React from 'react'
import { useTranslation } from '../hooks/useTranslation'

export default function TermsConditions() {
    const { t } = useTranslation()
    const isHindi = t('footer.phone') === 'फोन'

    return (
        <div className="legal-page">
            <div className="legal-container">
                <div className="legal-header">
                    <h1>⚖️ {t('terms.title')}</h1>
                    <p className="legal-subtitle">{t('terms.subtitle')}</p>
                    <p className="legal-date">{isHindi ? 'अंतिम अद्यतन: 30 नवंबर, 2025' : 'Last Updated: November 30, 2025'}</p>
                </div>

                <div className="legal-content">
                    {/* Agreement */}
                    <section className="legal-section">
                        <h2>{t('terms.agreement_title')}</h2>
                        <p>
                            {isHindi 
                                ? 'मधुबन व्यापारी की वेबसाइट और सेवाओं तक पहुंचकर और उपयोग करके, आप स्वीकार करते हैं कि आपने इन शर्तों को पढ़ा, समझा और सहमत हैं।' 
                                : 'By accessing and using our website and services, you agree to these terms.'}
                        </p>
                    </section>

                    {/* Intellectual Property */}
                    <section className="legal-section">
                        <h2>{t('terms.ip_title')}</h2>
                        <p>
                            {isHindi
                                ? 'हमारी वेबसाइट पर सभी सामग्री, जिसमें पाठ, ग्राफिक्स, लोगो, छवि, वीडियो आदि शामिल हैं, मधुबन व्यापारी की संपत्ति है।'
                                : 'All content on our website is our property and protected by intellectual property laws.'}
                        </p>
                        <ul className="legal-list">
                            <li>{isHindi ? 'व्यक्तिगत उपयोग के लिए केवल देखें और प्रिंट करें' : 'View and print for personal use only'}</li>
                            <li>{isHindi ? 'बिना अनुमति के पुनरुत्पादन की अनुमति नहीं है' : 'No reproduction without permission'}</li>
                            <li>{isHindi ? 'हमारे ट्रेडमार्क का अनुचित उपयोग निषिद्ध है' : 'Trademark misuse is prohibited'}</li>
                        </ul>
                    </section>

                    {/* Product Information */}
                    <section className="legal-section">
                        <h2>{t('terms.product_title')}</h2>
                        <ul className="legal-list">
                            <li>{isHindi ? 'सभी मूल्य भारतीय रुपये में हैं' : 'All prices in Indian Rupees (INR)'}</li>
                            <li>{isHindi ? 'कीमतें बिना सूचना के बदल सकती हैं' : 'Prices subject to change'}</li>
                            <li>{isHindi ? 'उत्पाद उपलब्धता के अधीन' : 'Products subject to availability'}</li>
                            <li>{isHindi ? 'सभी उत्पाद खाद्य सुरक्षा मानकों को पूरा करते हैं' : 'All products meet food safety standards'}</li>
                        </ul>
                    </section>

                    {/* Orders & Payments */}
                    <section className="legal-section">
                        <h2>{t('terms.orders_title')}</h2>
                        <p>{isHindi ? 'आपका ऑर्डर एक खरीद प्रस्ताव है। हम किसी भी ऑर्डर को स्वीकार या अस्वीकार कर सकते हैं।' : 'Your order is an offer. We reserve the right to accept or reject any order.'}</p>
                        <h3>{isHindi ? 'भुगतान विधियाँ' : 'Payment Methods'}</h3>
                        <ul className="legal-list">
                            <li>{isHindi ? 'क्रेडिट/डेबिट कार्ड (Visa, Mastercard)' : 'Credit/Debit Cards'}</li>
                            <li>{isHindi ? 'UPI (Google Pay, PhonePe, Paytm)' : 'UPI Payments'}</li>
                            <li>{isHindi ? 'नेट बैंकिंग' : 'Net Banking'}</li>
                            <li>{isHindi ? 'कैश ऑन डिलीवरी' : 'Cash on Delivery'}</li>
                        </ul>
                    </section>

                    {/* Shipping */}
                    <section className="legal-section">
                        <h2>{t('terms.shipping_title')}</h2>
                        <p>{isHindi ? 'विस्तृत शिपिंग जानकारी के लिए हमारी शिपिंग नीति देखें।' : 'See our Shipping & Returns Policy for details.'}</p>
                        <ul className="legal-list">
                            <li>{isHindi ? 'हम भारत भर में शिप करते हैं' : 'We ship all across India'}</li>
                            <li>{isHindi ? 'डिलीवरी समय अनुमानित हैं' : 'Delivery times are estimates'}</li>
                            <li>{isHindi ? 'डिलीवरी के बाद जोखिम आपकी है' : 'Risk transfers after delivery'}</li>
                        </ul>
                    </section>

                    {/* User Accounts */}
                    <section className="legal-section">
                        <h2>{t('terms.account_title')}</h2>
                        <p>{isHindi ? 'यदि आप खाता बनाते हैं, तो आप सहमत हैं:' : 'If you create an account, you agree to:'}</p>
                        <ul className="legal-list">
                            <li>{isHindi ? 'सटीक जानकारी प्रदान करना' : 'Provide accurate information'}</li>
                            <li>{isHindi ? 'पासवर्ड गोपनीय रखना' : 'Keep password confidential'}</li>
                            <li>{isHindi ? 'अपने खाते के लिए जिम्मेदार हैं' : 'Responsible for account activity'}</li>
                        </ul>
                    </section>

                    {/* Disclaimer */}
                    <section className="legal-section">
                        <h2>{t('terms.warranty_title')}</h2>
                        <p>
                            {isHindi
                                ? 'हमारी वेबसाइट और सेवाएं "जैसी है" आधार पर प्रदान की जाती हैं।'
                                : 'Our website and services are provided "as-is" without warranties.'}
                        </p>
                        <ul className="legal-list">
                            <li>{isHindi ? 'वेबसाइट अबाधित हो सकती है' : 'Website may have interruptions'}</li>
                            <li>{isHindi ? 'हम वायरस सुरक्षा की गारंटी नहीं देते' : 'No virus protection guarantee'}</li>
                            <li>{isHindi ? 'जानकारी की सटीकता की गारंटी नहीं' : 'No accuracy guarantee'}</li>
                        </ul>
                    </section>

                    {/* Liability */}
                    <section className="legal-section">
                        <h2>{t('terms.liability_title')}</h2>
                        <p>
                            {isHindi
                                ? 'हमारी कुल दायित्व आपके द्वारा भुगतान की गई राशि से अधिक नहीं होगी।'
                                : 'Our total liability shall not exceed the amount you paid.'}
                        </p>
                    </section>

                    {/* Compliance */}
                    <section className="legal-section">
                        <h2>{t('terms.compliance_title')}</h2>
                        <p>
                            {isHindi
                                ? 'आप भारत के सभी कानूनों का पालन करने के लिए सहमत हैं।'
                                : 'You agree to comply with all applicable laws of India.'}
                        </p>
                        <ul className="legal-list">
                            <li>{isHindi ? 'कोई अवैध गतिविधि नहीं' : 'No illegal activities'}</li>
                            <li>{isHindi ? 'खाद्य सुरक्षा मानकों का पालन' : 'Food safety compliance'}</li>
                            <li>{isHindi ? 'उपभोक्ता सुरक्षा कानूनों का पालन' : 'Consumer protection laws'}</li>
                        </ul>
                    </section>

                    {/* Dispute Resolution */}
                    <section className="legal-section">
                        <h2>{t('terms.dispute_title')}</h2>
                        <ul className="legal-list">
                            <li>{isHindi ? 'पहले हमसे संपर्क करने का प्रयास करें' : 'Contact us first to resolve'}</li>
                            <li>{isHindi ? 'कानून: भारतीय कानून' : 'Governing Law: Indian Law'}</li>
                            <li>{isHindi ? 'न्यायालय: वाराणसी' : 'Jurisdiction: Varanasi Courts'}</li>
                        </ul>
                    </section>

                    {/* Consumer Protection */}
                    <section className="legal-section">
                        <h2>{t('terms.consumer_title')}</h2>
                        <p>
                            {isHindi
                                ? 'ये शर्तें उपभोक्ता सुरक्षा अधिनियम, 2019 के तहत आपके अधिकारों को सीमित नहीं करती हैं।'
                                : 'These terms do not limit your rights under consumer protection law.'}
                        </p>
                    </section>

                    {/* Refund Rights */}
                    <section className="legal-section">
                        <h2>{t('terms.refund_title')}</h2>
                        <p>
                            {isHindi
                                ? 'आपको हमारी शिपिंग और रिटर्न नीति के अनुसार योग्य उत्पादों को वापस करने और रिफंड प्राप्त करने का अधिकार है।'
                                : 'You have the right to return eligible products and receive refunds per our policy.'}
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="legal-section legal-contact">
                        <h2>{t('footer.contact')}</h2>
                        <p>{isHindi ? 'इन शर्तों के बारे में प्रश्नों के लिए:' : 'For questions about these terms:'}</p>
                        
                        <div className="contact-details">
                            <div className="contact-item">
                                <strong>📧 {t('footer.email')}</strong>
                                <p>{t('terms.legal_email')}</p>
                            </div>
                            <div className="contact-item">
                                <strong>📞 {t('footer.phone')}</strong>
                                <p>+91 7897061003</p>
                            </div>
                            <div className="contact-item">
                                <strong>📍 {t('footer.address')}</strong>
                                <p>{t('terms.jurisdiction')}</p>
                            </div>
                            <div className="contact-item">
                                <strong>📧 {isHindi ? 'सहायता' : 'Support'}</strong>
                                <p>{t('terms.support_email')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Changes */}
                    <section className="legal-section">
                        <h2>{t('terms.changes_title')}</h2>
                        <p>
                            {isHindi
                                ? 'हम इन शर्तों को किसी भी समय संशोधित कर सकते हैं। परिवर्तन तुरंत प्रभावी होते हैं।'
                                : 'We reserve the right to modify these terms. Changes are effective immediately.'}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}

    //             <div className="legal-content">
    //                 {/* Agreement to Terms */}
    //                 <section className="legal-section">
    //                     <h2>1. Agreement to Terms</h2>
    //                     <p>
    //                         By accessing and using the Madhuban Traders website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website or services.
    //                     </p>
    //                     <p>
    //                         We reserve the right to modify these terms at any time. Your continued use of our website following any changes constitutes your acceptance of the new terms.
    //                     </p>
    //                 </section>

    //                 {/* Use License */}
    //                 <section className="legal-section">
    //                     <h2>2. Use License</h2>
                        
    //                     <h3>2.1 Grant of License</h3>
    //                     <p>
    //                         We grant you a limited, non-exclusive, non-transferable license to access and use our website and services for personal, non-commercial purposes, subject to these terms.
    //                     </p>

    //                     <h3>2.2 Prohibited Activities</h3>
    //                     <p>You agree not to:</p>
    //                     <ul className="legal-list">
    //                         <li>Harass, threaten, embarrass, or cause distress or discomfort to us or any third party</li>
    //                         <li>Violate the laws and regulations of India or any applicable jurisdiction</li>
    //                         <li>Infringe upon the intellectual property rights of others</li>
    //                         <li>Transmit obscene, profane, threatening, or unlawful content</li>
    //                         <li>Interfere with the functioning of our website or services</li>
    //                         <li>Attempt unauthorized access to our systems or data</li>
    //                         <li>Engage in any form of commercial activity without authorization</li>
    //                         <li>Scrape, crawl, or extract data from our website without permission</li>
    //                         <li>Engage in fraudulent or deceptive practices</li>
    //                         <li>Post unsolicited promotional content or spam</li>
    //                     </ul>
    //                 </section>

    //                 {/* Intellectual Property */}
    //                 <section className="legal-section">
    //                     <h2>3. Intellectual Property Rights</h2>
                        
    //                     <h3>3.1 Our Intellectual Property</h3>
    //                     <p>
    //                         All content on our website, including but not limited to text, graphics, logos, images, videos, audio, product descriptions, and software, is the property of Madhuban Traders or licensed to us. This content is protected by Indian and international copyright, trademark, and other intellectual property laws.
    //                     </p>

    //                     <h3>3.2 Limited Use Rights</h3>
    //                     <p>
    //                         You may view and print content from our website for personal use only. You may not:
    //                     </p>
    //                     <ul className="legal-list">
    //                         <li>Reproduce, distribute, or transmit any content without our permission</li>
    //                         <li>Modify, adapt, or create derivative works</li>
    //                         <li>Use our trademarks or logos without authorization</li>
    //                         <li>Frame or mirror our website on another platform</li>
    //                     </ul>

    //                     <h3>3.3 Trademarks</h3>
    //                     <p>
    //                         "Madhuban Traders," our logo, and product names are trademarks of Madhuban Traders. All other trademarks are the property of their respective owners.
    //                     </p>
    //                 </section>

    //                 {/* Product Information */}
    //                 <section className="legal-section">
    //                     <h2>4. Product Information & Accuracy</h2>
                        
    //                     <h3>4.1 Product Descriptions</h3>
    //                     <p>
    //                         We strive to provide accurate product information, images, pricing, and availability. However, we do not warrant that descriptions, images, or pricing are accurate, complete, or error-free.
    //                     </p>

    //                     <h3>4.2 Pricing</h3>
    //                     <ul className="legal-list">
    //                         <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
    //                         <li>Prices are subject to change without notice</li>
    //                         <li>We reserve the right to correct pricing errors</li>
    //                         <li>Applicable taxes (GST) will be calculated at checkout</li>
    //                     </ul>

    //                     <h3>4.3 Availability</h3>
    //                     <p>
    //                         Products are subject to availability. We reserve the right to limit quantities or discontinue products at any time. If a product becomes unavailable after you've placed an order, we will notify you and offer alternatives or a full refund.
    //                     </p>

    //                     <h3>4.4 Product Quality</h3>
    //                     <p>
    //                         Madhuban Traders is committed to providing high-quality cold-pressed oils and whole spices. All our products are sourced responsibly and processed with care to maintain nutritional value and purity.
    //                     </p>
    //                 </section>

    //                 {/* Orders & Payments */}
    //                 <section className="legal-section">
    //                     <h2>5. Orders & Payments</h2>
                        
    //                     <h3>5.1 Order Acceptance</h3>
    //                     <p>
    //                         Your order is an offer to purchase. We reserve the right to accept or reject any order in our sole discretion. We will confirm acceptance via email with order details.
    //                     </p>

    //                     <h3>5.2 Payment Methods</h3>
    //                     <p>
    //                         We accept the following payment methods:
    //                     </p>
    //                     <ul className="legal-list">
    //                         <li>Credit/Debit Cards (Visa, Mastercard, American Express)</li>
    //                         <li>UPI (Google Pay, PhonePe, Paytm)</li>
    //                         <li>Net Banking</li>
    //                         <li>Wallets (PayZapp, MobiKwik)</li>
    //                         <li>Cash on Delivery (where available)</li>
    //                     </ul>

    //                     <h3>5.3 Payment Security</h3>
    //                     <p>
    //                         All payment transactions are processed through secure, PCI-DSS compliant payment gateways. Your payment information is encrypted and protected. We do not store full credit card details on our servers.
    //                     </p>

    //                     <h3>5.4 Failed Transactions</h3>
    //                     <p>
    //                         If a payment fails, you will not be charged. If you are charged multiple times due to technical error, please contact us immediately and we will issue a refund.
    //                     </p>

    //                     <h3>5.5 Billing Information</h3>
    //                     <p>
    //                         You agree to provide accurate billing and shipping information. You are responsible for any delays or issues resulting from incorrect information.
    //                     </p>
    //                 </section>

    //                 {/* Shipping & Delivery */}
    //                 <section className="legal-section">
    //                     <h2>6. Shipping & Delivery</h2>
    //                     <p>
    //                         For detailed shipping information, return policy, and delivery terms, please refer to our separate Shipping & Returns Policy.
    //                     </p>
    //                     <ul className="legal-list">
    //                         <li>We ship to all locations across India</li>
    //                         <li>Delivery times are estimates and not guaranteed</li>
    //                         <li>Risk of loss transfers to you upon delivery</li>
    //                         <li>We are not responsible for losses after delivery</li>
    //                         <li>Delays due to weather, natural disasters, or force majeure are beyond our control</li>
    //                     </ul>
    //                 </section>

    //                 {/* User Accounts */}
    //                 <section className="legal-section">
    //                     <h2>7. User Accounts</h2>
                        
    //                     <h3>7.1 Account Creation</h3>
    //                     <p>
    //                         If you create an account on our website, you agree to:
    //                     </p>
    //                     <ul className="legal-list">
    //                         <li>Provide accurate and complete information</li>
    //                         <li>Maintain the confidentiality of your password</li>
    //                         <li>Accept responsibility for all activities under your account</li>
    //                         <li>Notify us of unauthorized access</li>
    //                     </ul>

    //                     <h3>7.2 Account Termination</h3>
    //                     <p>
    //                         We reserve the right to suspend or terminate accounts that:
    //                     </p>
    //                     <ul className="legal-list">
    //                         <li>Violate these terms</li>
    //                         <li>Engage in fraudulent activity</li>
    //                         <li>Harass other users or staff</li>
    //                         <li>Remain inactive for extended periods</li>
    //                     </ul>
    //                 </section>

    //                 {/* User-Generated Content */}
    //                 <section className="legal-section">
    //                     <h2>8. User-Generated Content</h2>
                        
    //                     <h3>8.1 Your Content</h3>
    //                     <p>
    //                         Any content you submit, including reviews, testimonials, feedback, or comments, is non-confidential. You grant us a perpetual, irrevocable license to use, reproduce, and distribute your content.
    //                     </p>

    //                     <h3>8.2 Content Standards</h3>
    //                     <p>
    //                         Your content must not:
    //                     </p>
    //                     <ul className="legal-list">
    //                         <li>Contain obscene, profane, or offensive language</li>
    //                         <li>Infringe intellectual property rights</li>
    //                         <li>Be defamatory, threatening, or harassing</li>
    //                         <li>Contain spam or commercial promotion</li>
    //                     </ul>

    //                     <h3>8.3 Moderation</h3>
    //                     <p>
    //                         We reserve the right to review, edit, or remove any user-generated content that violates these terms.
    //                     </p>
    //                 </section>

    //                 {/* Disclaimer of Warranties */}
    //                 <section className="legal-section">
    //                     <h2>9. Disclaimer of Warranties</h2>
                        
    //                     <h3>9.1 "As-Is" Basis</h3>
    //                     <p>
    //                         Our website and services are provided on an "as-is" basis without any warranties, express or implied.
    //                     </p>

    //                     <h3>9.2 No Warranties</h3>
    //                     <p>
    //                         We do not warrant that:
    //                     </p>
    //                     <ul className="legal-list">
    //                         <li>Our website will be uninterrupted or error-free</li>
    //                         <li>Defects will be corrected</li>
    //                         <li>The website or services are free of viruses</li>
    //                         <li>Information is accurate, complete, or timely</li>
    //                     </ul>

    //                     <h3>9.3 Limitation of Liability</h3>
    //                     <p>
    //                         In no event shall Madhuban Traders, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services, even if advised of the possibility of such damages.
    //                     </p>
    //                 </section>

    //                 {/* Limitation of Liability */}
    //                 <section className="legal-section">
    //                     <h2>10. Liability Cap</h2>
    //                     <p>
    //                         Our total liability for all claims arising from this agreement shall not exceed the amount you paid for the product or service in question.
    //                     </p>
    //                 </section>

    //                 {/* Indemnification */}
    //                 <section className="legal-section">
    //                     <h2>11. Indemnification</h2>
    //                     <p>
    //                         You agree to indemnify, defend, and hold harmless Madhuban Traders, its owners, employees, and agents from any claims, damages, losses, or expenses arising from:
    //                     </p>
    //                     <ul className="legal-list">
    //                         <li>Your violation of these terms</li>
    //                         <li>Your use of our website or services</li>
    //                         <li>Your infringement of third-party rights</li>
    //                         <li>Content you provide or upload</li>
    //                     </ul>
    //                 </section>

    //                 {/* Links to Third-Party Websites */}
    //                 <section className="legal-section">
    //                     <h2>12. Third-Party Links & Content</h2>
                        
    //                     <h3>12.1 External Links</h3>
    //                     <p>
    //                         Our website may contain links to third-party websites for your convenience. We do not endorse or control these sites and are not responsible for their content, accuracy, or practices.
    //                     </p>

    //                     <h3>12.2 Third-Party Content</h3>
    //                     <p>
    //                         We are not responsible for any third-party content, products, or services accessed through our website.
    //                     </p>
    //                 </section>

    //                 {/* Compliance with Laws */}
    //                 <section className="legal-section">
    //                     <h2>13. Compliance with Laws</h2>
    //                     <p>
    //                         You agree to comply with all applicable laws and regulations of India and any other relevant jurisdiction. You are prohibited from:
    //                     </p>
    //                     <ul className="legal-list">
    //                         <li>Engaging in illegal activities</li>
    //                         <li>Violating food safety regulations</li>
    //                         <li>Circumventing export/import restrictions</li>
    //                         <li>Violating consumer protection laws</li>
    //                     </ul>
    //                 </section>

    //                 {/* Dispute Resolution */}
    //                 <section className="legal-section">
    //                     <h2>14. Dispute Resolution</h2>
                        
    //                     <h3>14.1 Informal Resolution</h3>
    //                     <p>
    //                         If you have a dispute with us, please contact us first to attempt resolution. Many issues can be resolved quickly through communication.
    //                     </p>

    //                     <h3>14.2 Governing Law</h3>
    //                     <p>
    //                         These terms are governed by the laws of India, without regard to its conflict of law principles.
    //                     </p>

    //                     <h3>14.3 Jurisdiction</h3>
    //                     <p>
    //                         You agree that any legal action or proceeding shall be governed by the courts located in Varanasi, Uttar Pradesh, India.
    //                     </p>

    //                     <h3>14.4 Limitation Period</h3>
    //                     <p>
    //                         Any claim must be brought within one year of the cause of action arising, or it will be forever barred.
    //                     </p>
    //                 </section>

    //                 {/* Consumer Protection */}
    //                 <section className="legal-section">
    //                     <h2>15. Consumer Protection</h2>
    //                     <p>
    //                         Nothing in these terms limits your rights as a consumer under Indian consumer protection laws, including the Consumer Protection Act, 2019. If any provision conflicts with consumer protection law, the law will prevail.
    //                     </p>
    //                 </section>

    //                 {/* Refund & Return Rights */}
    //                 <section className="legal-section">
    //                     <h2>16. Right to Refund</h2>
    //                     <p>
    //                         Consistent with consumer protection law, you have the right to return eligible products and receive a refund as detailed in our Shipping & Returns Policy.
    //                     </p>
    //                 </section>

    //                 {/* Severability */}
    //                 <section className="legal-section">
    //                     <h2>17. Severability</h2>
    //                     <p>
    //                         If any provision of these terms is found to be invalid or unenforceable, that provision will be modified to the minimum extent necessary to make it valid, or if not possible, severed. The remaining provisions will continue in full force.
    //                     </p>
    //                 </section>

    //                 {/* Entire Agreement */}
    //                 <section className="legal-section">
    //                     <h2>18. Entire Agreement</h2>
    //                     <p>
    //                         These terms, along with our Privacy Policy and Shipping & Returns Policy, constitute the entire agreement between you and Madhuban Traders. They supersede all prior agreements and understandings.
    //                     </p>
    //                 </section>

    //                 {/* Contact Information */}
    //                 <section className="legal-section legal-contact">
    //                     <h2>19. Contact Us</h2>
    //                     <p>For questions about these Terms & Conditions:</p>
                        
    //                     <div className="contact-details">
    //                         <div className="contact-item">
    //                             <strong>📧 Email</strong>
    //                             <p>legal@madhubantraders.in</p>
    //                         </div>
    //                         <div className="contact-item">
    //                             <strong>📞 Phone</strong>
    //                             <p>+91 7897061003</p>
    //                         </div>
    //                         <div className="contact-item">
    //                             <strong>📍 Address</strong>
    //                             <p>Madhuban Traders<br/>Sindhora Bazar<br/>Varanasi 221208, India</p>
    //                         </div>
    //                         <div className="contact-item">
    //                             <strong>📧 General Support</strong>
    //                             <p>support@madhubantraders.in</p>
    //                         </div>
    //                     </div>
    //                 </section>

    //                 {/* Updates */}
    //                 <section className="legal-section">
    //                     <h2>20. Changes to Terms</h2>
    //                     <p>
    //                         We reserve the right to modify these terms at any time. Changes are effective immediately upon posting. Your continued use of our website and services constitutes your acceptance of the modified terms.
    //                     </p>
    //                 </section>
    //             </div>
    //         </div>
    //     </div>
    // )
// }
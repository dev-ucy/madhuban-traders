import React from 'react'
import LocationCard from '../components/LocationCard'
import { useTranslation } from '../hooks/useTranslation'

export default function Locations(){
  const { t } = useTranslation()

  const plantMapUrl = "https://www.google.com/maps?q=Madhuban%20Traders%20Plant%20Sindhora%20Varanasi%20221208&output=embed"
  const storeMapUrl = "https://www.google.com/maps?q=Madhuban%20Traders%20Store%20Sindhora%20Varanasi%20221208&output=embed"

  return (
    <div className="locations-page">
      <div className="locations-container">
        <h1 className="locations-title">{t('locations.page_title')}</h1>
        <p className="locations-subtitle">{t('locations.page_subtitle')}</p>

        <section className="locations-section">
          <h2 className="locations-section-header">{t('locations.transparency_header')}</h2>
          <p className="locations-intro">We believe in complete transparency about our operations. Visit our manufacturing facility or stop by our main store to see the quality and care we put into every product.</p>
        </section>

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

          <LocationCard
            title={t('locations.store_title')}
            focus={t('locations.store_focus')}
            address={t('locations.store_address')}
            hoursLabel={t('locations.hours_label')}
            hours={`${t('locations.store_hours')}\n${t('locations.store_closed')}`}
            contactLabel={t('locations.contact_label')}
            contact={t('locations.store_contact')}
            mapEmbedUrl={storeMapUrl}
          />
        </div>
      </div>
    </div>
  )
}

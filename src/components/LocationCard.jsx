import React from 'react'

export default function LocationCard({
  title,
  focus,
  address,
  operationsLabel,
  operations,
  hoursLabel,
  hours,
  contactLabel,
  contact,
  mapEmbedUrl,
  note
}){
  return (
    <div className="location-card">
      <div className="location-grid">
        <div className="location-info">
          <h3 className="location-title">{title}</h3>
          <p className="location-focus">{focus}</p>

          <div className="location-detail">
            <strong>📍 Address</strong>
            <p>{address}</p>
          </div>

          {operations && (
            <div className="location-detail">
              <strong>⚙️ {operationsLabel}</strong>
              <p>{operations}</p>
            </div>
          )}

          {hours && (
            <div className="location-detail">
              <strong>🕐 {hoursLabel}</strong>
              <p>{hours}</p>
            </div>
          )}

          {contact && (
            <div className="location-detail">
              <strong>📞 {contactLabel}</strong>
              <p>{contact}</p>
            </div>
          )}

          {note && (
            <div className="location-note">
              <p>{note}</p>
            </div>
          )}
        </div>

        <div className="location-map">
          <iframe
            title={title}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{border:0, minHeight: '380px'}}
            src={mapEmbedUrl}
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

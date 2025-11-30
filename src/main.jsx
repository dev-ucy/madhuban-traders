import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CatalogProvider } from './context/CatalogContext'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <CatalogProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CatalogProvider>
    </LanguageProvider>
  </React.StrictMode>
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import 'leaflet/dist/leaflet.css'
import './index.css'

// Tambahkan style untuk custom marker dan popup
const style = document.createElement('style')
style.textContent = `
  .custom-avatar-marker {
    background: transparent !important;
    border: none !important;
  }
  
  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    border: 1px solid rgba(0,0,0,0.1);
  }
  
  .custom-popup .leaflet-popup-tip {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)


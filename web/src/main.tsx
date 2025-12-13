import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import 'leaflet/dist/leaflet.css'
import './index.css'

// Tambahkan style untuk custom marker
const style = document.createElement('style')
style.textContent = `
  .custom-avatar-marker {
    background: transparent !important;
    border: none !important;
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


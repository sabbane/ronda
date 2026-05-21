import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { registerSW } from 'virtual:pwa-register'
import { LanguageProvider } from './contexts/LanguageContext'

// Register service worker with automatic updates
registerSW({ immediate: true })

const initApp = () => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </StrictMode>,
  )
}

// Coordinate with the early initialization script in head
if (window.playgamaInitPromise) {
  console.log('[PlayGama Main] Waiting for early SDK initialization to complete...');
  window.playgamaInitPromise
    .then(() => {
      console.log('[PlayGama Main] Early SDK initialization verified. Launching app.');
      initApp();
    })
    .catch(err => {
      console.warn('[PlayGama Main] Early SDK initialization failed or blocked. Launching offline mode:', err.message);
      initApp();
    });
} else if (window.bridge && typeof window.bridge.initialize === 'function') {
  // Redundant fallback if early setup script didn't run
  console.log('[PlayGama Main] Early SDK script wasn\'t present, initializing now...');
  window.bridge.initialize()
    .then(() => {
      console.log('[PlayGama Main] SDK initialized successfully in fallback.');
      if (window.bridge.platform && typeof window.bridge.platform.sendMessage === 'function') {
        window.bridge.platform.sendMessage('game_ready');
      }
      initApp();
    })
    .catch(err => {
      console.error('[PlayGama Main] Fallback SDK initialization failed:', err);
      initApp();
    });
} else {
  // Standard offline/web load
  console.log('[PlayGama Main] Running in standard Web mode.');
  initApp();
}

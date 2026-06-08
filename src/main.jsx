import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.jsx'

import { registerSW } from 'virtual:pwa-register'
import { LanguageProvider } from './contexts/LanguageContext'
import { SoundProvider } from './contexts/SoundContext'

// Register service worker with automatic updates & registration feedback loggers
registerSW({ 
  immediate: true,
  onRegisteredSW(swScriptUrl, _registration) {
    console.log('[PWA] Service Worker registered successfully at:', swScriptUrl);
  },
  onRegisterError(error) {
    console.error('[PWA] Service Worker registration failed:', error);
  }
})

const initApp = () => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <SoundProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </SoundProvider>
    </StrictMode>,
  )
}

const bootstrap = async () => {
  try {
    if (window.playgamaInitPromise) {
      await window.playgamaInitPromise;
    } else if (window.bridge?.initialize) {
      await window.bridge.initialize();
      window.bridge.platform?.sendMessage?.('game_ready');
    }
  } catch (err) {
    console.warn('SDK initialization failed, running in fallback:', err);
  } finally {
    initApp();
  }
};

bootstrap();

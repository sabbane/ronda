import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Ronda Card Game',
        short_name: 'Ronda',
        description: 'Authentic Moroccan Ronda Card Game',
        theme_color: '#0f172a', // slate-950
        background_color: '#0f172a',
        display: 'standalone',
        icons: []
      }
    })
  ],
})

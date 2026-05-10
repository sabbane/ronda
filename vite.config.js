import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
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
  test: {
    exclude: ['**/tests/**', '**/node_modules/**'],
  },
})

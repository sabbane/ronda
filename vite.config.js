import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  plugins: [
    tailwindcss(),
    react(),
    // PWA disabled to ensure users use full browsers for payment compatibility
  ],
  test: {
    exclude: ['**/tests/**', '**/node_modules/**'],
  },
})

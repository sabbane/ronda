import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

// Custom plugin to inject platform SDKs into index.html
const injectPlatformSdk = (mode, env) => {
  return {
    name: 'inject-platform-sdk',
    transformIndexHtml(html) {
      if (mode === 'playgama') {
        return html.replace(
          '</head>',
          `  <script src="https://unpkg.com/@playgama/bridge/dist/bridge.js"></script>\n</head>`
        );
      } else {
        // web mode / default
        const pubId = env.VITE_ADS_PUBLISHER_ID || 'ca-pub-XXXXXXXXX';
        return html.replace(
          '</head>',
          `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}" crossorigin="anonymous"></script>
  <script>
    window.adsbygoogle = window.adsbygoogle || [];
    var adBreak = adConfig = function(o) { adsbygoogle.push(o); }
  </script>\n</head>`
        );
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
    build: {
      outDir: mode === 'playgama' ? 'dist-playgama' : 'dist-web',
    },
    plugins: [
      tailwindcss(),
      react(),
      injectPlatformSdk(mode, env),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false
        },
        workbox: {
          // Forces the new Service Worker to activate immediately,
          // without waiting for all tabs to be closed first.
          skipWaiting: true,
          clientsClaim: true,
        },
        manifest: {
          name: 'Ronda Card Game',
          short_name: 'Ronda',
          description: 'Authentic Moroccan Ronda Card Game',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'browser', // Prevents install prompt
          icons: []
        }
      })
    ],
    test: {
      exclude: ['**/tests/**', '**/node_modules/**'],
    },
  }
})

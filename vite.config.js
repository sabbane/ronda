import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'
import pkg from './package.json'
import obfuscator from 'rollup-plugin-obfuscator'

const PLAYGAMA_SDK_HTML = `<head>
  <script src="https://bridge.playgama.com/v1/stable/playgama-bridge.js" onerror="window.playgamaLoadError = true;"></script>
  <script>
    (function() {
      console.log('[PlayGama Early Init] Checking for bridge SDK...');
      
      // We store the initialization state on window for main.jsx to consume
      window.playgamaInitPromise = new Promise(function(resolve, reject) {
        var checkCount = 0;
        var checkInterval = setInterval(function() {
          checkCount++;
          if (window.bridge) {
            clearInterval(checkInterval);
            console.log('[PlayGama Early Init] SDK bridge found. Initializing...');
            window.bridge.initialize()
              .then(function() {
                console.log('[PlayGama Early Init] SDK initialized successfully.');
                window.playgamaInitialized = true;
                
                // Immediately send game_ready signal
                if (window.bridge.platform && typeof window.bridge.platform.sendMessage === 'function') {
                  console.log('[PlayGama Early Init] Sending game_ready signal to platform.');
                  window.bridge.platform.sendMessage('game_ready');
                }
                resolve();
              })
              .catch(function(err) {
                console.error('[PlayGama Early Init] SDK initialization failed:', err);
                reject(err);
              });
          } else if (checkCount > 10 || window.playgamaLoadError) {
            clearInterval(checkInterval);
            console.warn('[PlayGama Early Init] SDK script load failed or timed out. AdBlocker active?');
            
            // Show user-friendly overlay
            var overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = 'rgba(15, 23, 42, 0.95)';
            overlay.style.color = '#f8fafc';
            overlay.style.zIndex = '999999';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.fontFamily = 'system-ui, sans-serif';
            overlay.style.padding = '20px';
            overlay.style.textAlign = 'center';
            
            overlay.innerHTML = ' \\
              <div style="max-width: 500px; background: #1e293b; border: 2px solid #ef4444; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);"> \
                <h3 style="color: #ef4444; margin-top: 0; font-size: 20px;">PlayGama SDK Blocked</h3> \
                <p style="color: #cbd5e1; line-height: 1.6; font-size: 14px;"> \
                  The PlayGama SDK script could not be loaded from the CDN. This is typically caused by an <strong>AdBlocker</strong>, <strong>Brave Shields</strong>, or tracking protection. \
                </p> \
                <p style="color: #94a3b8; font-size: 13px; margin: 16px 0;"> \
                  Please temporarily disable AdBlock / Shields for this page and reload to run the platform initialization test. \
                </p> \
                <button onclick="window.location.reload()" style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-top: 10px;"> \
                  Reload Game \
                </button> \
              </div> \
            ';
            document.body ? document.body.appendChild(overlay) : window.addEventListener('DOMContentLoaded', function() { document.body.appendChild(overlay); });
            
            reject(new Error('SDK Blocked'));
          }
        }, 100);
      });
    })();
  </script>`;

// Web Mode / Default AdSense HTML template
const getWebSdkHtml = (pubId) => `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}" crossorigin="anonymous"></script>
  <script>
    window.adsbygoogle = window.adsbygoogle || [];
    var adBreak = adConfig = function(o) { adsbygoogle.push(o); }
  </script>\n</head>`;

// Custom plugin to inject platform SDKs into index.html (nesting level: 3 max)
const injectPlatformSdk = (mode, env) => ({
  name: 'inject-platform-sdk',
  transformIndexHtml(html) {
    if (mode === 'playgama') {
      return html.replace('<head>', PLAYGAMA_SDK_HTML);
    }
    const pubId = env.VITE_ADS_PUBLISHER_ID || 'ca-pub-XXXXXXXXX';
    return html.replace('</head>', getWebSdkHtml(pubId));
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
    build: {
      outDir: mode === 'playgama' ? 'dist-playgama' : 'dist-web',
      rollupOptions: {
        plugins: [
          obfuscator({
            global: true,
            options: {
              compact: true,
              stringArray: true,
              stringArrayThreshold: 0.75,
              unicodeEscapeSequence: false
            },
            exclude: ['node_modules/**']
          })
        ]
      }
    },
    plugins: [
      tailwindcss(),
      react(),
      injectPlatformSdk(mode, env),
      mode === 'playgama' && viteSingleFile(),
      VitePWA({
        disable: mode === 'playgama',
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false
        },
        workbox: {
          // Exclude .mp3 files from PWA precaching to solve the iOS Safari media Range-Request playback bug
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          globIgnores: ['**/assets/sounds/*.mp3', '**/logo.png'],
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
          display: 'standalone',
          start_url: './',
          scope: './',
          id: './',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    test: {
      exclude: ['**/tests/**', '**/node_modules/**'],
    },
  }
})

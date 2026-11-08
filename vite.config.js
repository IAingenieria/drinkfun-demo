import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // En producción (build para GitHub Pages) la copia Drink Fun vive en /drinkfun-demo/.
  // En desarrollo local (npm run dev) se sirve en la raíz "/".
  base: command === 'build' ? '/drinkfun-demo/' : '/',
  // Caché propia de la copia (node_modules es un junction compartido con el original)
  cacheDir: '.vite',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo_deusa.png'],
      manifest: {
        name: 'DeUSA – Cross Border Shopping & Logistics',
        short_name: 'DeUSA',
        description: 'Compras por encargo de México a tiendas de USA (Target, Walmart, Ross).',
        theme_color: '#1A2330',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
}))

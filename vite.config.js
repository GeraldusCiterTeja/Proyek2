import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // Agar PWA bisa diuji di localhost saat development
      },
      manifest: {
        name: 'Story App - Berbagi Cerita',
        short_name: 'StoryApp',
        description: 'Aplikasi berbagi cerita dengan fitur peta dan offline',
        theme_color: '#2d3e50',
        background_color: '#f0f2f5',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        // Kriteria 3 (Skilled): Tambahkan screenshots aplikasi
        screenshots: [
          {
            src: 'screenshots/atom.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'screenshots/node-js.png',
            sizes: '720x1280',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Kriteria 3 (Advance): Caching data API agar tetap bisa dilihat saat offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-stories-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 Hari
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
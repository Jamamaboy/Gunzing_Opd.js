import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Vite PWA Project',
        short_name: 'Vite PWA',
        theme_color: '#660000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/mobile.png',
            sizes: '423x919',
            type: 'image/png'
          },
          {
            src: 'screenshots/desktop.png',
            sizes: '1919x1028',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },
    })
  ],
  server: {
    host: true, // Allow external access
    strictPort: true,
    port: 5173, // Ensure it's the correct port for your Vite app
    allowedHosts: ["ab2e-184-22-223-199.ngrok-free.app"] // ย้ายมาไว้ที่นี่
  }
})
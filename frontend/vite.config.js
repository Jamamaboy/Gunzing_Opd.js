import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 3000, // เพิ่มจาก 500 เป็น 3000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          // แยก libraries ใหญ่ๆ ออกเป็น chunk แยก
        }
      }
    }
  },
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
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // เพิ่มเป็น 5 MB
      }
    })
  ],
  server: {
    host: true,
    strictPort: true,
    port: 5173,
    allowedHosts: ["b1dc-49-237-19-118.ngrok-free.app"],
    watch: {
      usePolling: true
    }
  }
})
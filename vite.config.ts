import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['favicon.png'],

      manifest: {
        name: "Météo Pro Dashboard",
        short_name: "Météo Pro",
        description: "Votre météo en temps réel",

        theme_color: "#3b82f6",
        background_color: "#0f172a",

        display: "standalone",
        start_url: "/",
        scope: "/",

        orientation: "portrait",

        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
})
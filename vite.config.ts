manifest: {
  name: "Météo Pro Dashboard",
  short_name: "Météo Pro",
  description: "Votre météo en temps réel et prévisions",

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
      type: "image/png",
      purpose: "any"
    },
    {
      src: "/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any"
    }
  ]
}
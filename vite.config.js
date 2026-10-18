import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/appgym/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'appgym',
        short_name: 'appgym',
        description: 'Registra los días que vas al gym y ve tu constancia.',
        lang: 'es-MX',
        start_url: '/appgym/',
        scope: '/appgym/',
        display: 'standalone',
        background_color: '#1f7a4d',
        theme_color: '#1f7a4d',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
});

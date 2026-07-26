import fs from 'fs';

let config = fs.readFileSync('/home/fikfikk/projects/node/figo/nuxt.config.ts', 'utf8');

if (!config.includes('@vite-pwa/nuxt')) {
  config = config.replace(
    /modules:\s*\[/,
    "modules: [\n    '@vite-pwa/nuxt',"
  );
  
  const pwaConfig = `
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'FiGo Workspace',
      short_name: 'FiGo',
      description: 'FiGo is a free all-in-one online tool to download videos from TikTok, YouTube, Instagram, compress images, and convert files.',
      theme_color: '#0058be',
      background_color: '#1a1a1a',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      shortcuts: [
        {
          name: "Download",
          short_name: "Download",
          description: "Download Video, Audio, & File",
          url: "/download",
          icons: [{ src: "/icon-download.png", sizes: "192x192" }]
        },
        {
          name: "Artikel",
          short_name: "Artikel",
          description: "Kejawen Archive & Artikel",
          url: "/tools/artikel",
          icons: [{ src: "/icon-artikel.png", sizes: "192x192" }]
        },
        {
          name: "Convert",
          short_name: "Convert",
          description: "Konversi File",
          url: "/convert",
          icons: [{ src: "/icon-convert.png", sizes: "192x192" }]
        },
        {
          name: "Compress",
          short_name: "Compress",
          description: "Kompres dan Perkecil File",
          url: "/compress",
          icons: [{ src: "/icon-compress.png", sizes: "192x192" }]
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },
`;
  
  // Insert before the last `})`
  config = config.replace(/}\)\s*$/, pwaConfig + '\n})');
  
  fs.writeFileSync('/home/fikfikk/projects/node/figo/nuxt.config.ts', config);
  console.log('patched successfully');
}

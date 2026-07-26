// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  devtools: { enabled: false },

  devServer: {
    port: 5000
  },

  // Konfigurasi server-only (tidak pernah dikirim ke client).
  // Set lewat env: NUXT_STREAM_PIN dan NUXT_STREAM_SECRET
  runtimeConfig: {
    // PIN untuk membuka tool streaming
    streamPin: process.env.NUXT_STREAM_PIN || '112233',
    // Secret untuk menandatangani token unlock (HMAC). Wajib diisi di production.
    streamSecret: process.env.NUXT_STREAM_SECRET || 'fikfikk-figo-stream-secret',
  },

  nitro: {
    rollupConfig: {
      output: {
        plugins: [
          {
            name: 'fix-windows-esm-paths',
            renderChunk(code: string) {
              // Fix raw Windows paths like 'C:\\path\\to\\file.js' -> 'file:///C:/path/to/file.js'
              const fixed = code.replace(
                /from\s+['"](([A-Z]):\\\\[^'"]+)['"]/g,
                (_match: string, rawPath: string) => {
                  const normalized = rawPath.replace(/\\\\/g, '/')
                  return `from 'file:///${normalized}'`
                }
              )
              return fixed !== code ? { code: fixed, map: null } : null
            }
          }
        ]
      }
    },
  },

  vite: {
    optimizeDeps: {
      include: ['pdfjs-dist'],
    },
    server: {
      fs: {
        strict: false,
      }
    }
  },

  tailwindcss: {
    viewer: false,
    editorSupport: false
  },

  modules: [
    '@vite-pwa/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxtjs/tailwindcss',
  ],

  css: [
    '~/assets/css/main.css',
  ],

  googleFonts: {
    families: {
      'Inter': [300, 400, 500, 600],
      'Manrope': [500, 600, 700, 800],
      'Playfair Display': [400, 700, 800, 900],
    },
    display: 'swap',
    // Download font saat build & serve dari domain sendiri — hindari round-trip ke
    // Google CDN tiap hard reload (penyebab utama loading lama saat Shift+R).
    download: true,
    // Matikan prefetch/preconnect ke fonts.googleapis.com karena font sudah lokal.
    prefetch: false,
    preconnect: false,
    preload: true,
  },

  app: {
    head: {
      title: 'FiGo — Free Online File Tools: Download, Compress, Convert',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'FiGo is a free all-in-one online tool to download videos from TikTok, YouTube, Instagram & Twitter, compress images & PDFs, convert files between formats, generate QR codes, and more. No signup required.' },
        { name: 'theme-color', content: '#0058be' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'author', content: 'FiGo by fikfikk' },
        { name: 'keywords', content: 'download video tiktok, download video youtube, youtube to mp3, download video instagram, tiktok downloader, compress image online, kompres foto, convert file online, convert png to jpg, pdf to image, qr code generator, password generator, file tools online free' },
        { property: 'og:site_name', content: 'FiGo' },
        { property: 'og:title', content: 'FiGo — Free Online File Tools: Download, Compress, Convert' },
        { property: 'og:description', content: 'Download videos from TikTok, YouTube, Instagram for free. Compress images & PDFs. Convert files between any format. No account needed.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'FiGo — Free Online File Tools' },
        { name: 'twitter:description', content: 'Download, compress, convert any file for free. No signup. No limits.' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

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

})
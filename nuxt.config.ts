// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: false },

  devServer: {
    port: 5000
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
    },
    display: 'swap',
    prefetch: true,
    preload: true,
  },

  app: {
    head: {
      title: 'FiGo — The Ethereal Engine',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'FiGo is your all-in-one file utility engine. Compress, convert, download via URL, check links, analyze files — high-performance processing for modern engineers.' },
        { name: 'theme-color', content: '#f7f9fb' },
        { property: 'og:title', content: 'FiGo — The Ethereal Engine' },
        { property: 'og:description', content: 'High-performance file processing. One platform, zero limits.' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})

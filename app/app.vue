<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Template dinamis untuk title — setiap halaman otomatis mendapat suffix "— FiGo"
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? titleChunk : 'FiGo — Free Online File Tools'
  },
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'FiGo',
        url: 'https://go.fikfikk.my.id',
        description: 'Free online tools to download videos from TikTok, YouTube, Instagram, compress images & PDFs, convert file formats, generate QR codes, and more.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://go.fikfikk.my.id/download?url={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      })
    }
  ]
})
</script>

<style scoped>
/* Vite parser fix */
</style>


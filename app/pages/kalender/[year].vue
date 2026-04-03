<template>
  <div class="min-h-screen pt-24 pb-20 overflow-x-hidden" :class="isDark ? 'bg-neutral-950' : 'bg-slate-50'">
    <CalendarGrid 
      :year="currentYear" 
      @update:year="navigateYear"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { isDark } = useColorMode()

const currentYear = computed(() => {
  const year = parseInt(route.params.year as string)
  return isNaN(year) ? new Date().getFullYear() : year
})

// SEO Meta - Targetting search keywords like "Kalender 2026"
useSeoMeta({
  title: `Kalender ${currentYear.value} Indonesia Lengkap — FiGo`,
  ogTitle: `Kalender ${currentYear.value} Indonesia Lengkap — FiGo`,
  description: `Cek Kalender ${currentYear.value} lengkap dengan daftar Hari Libur Nasional dan Cuti Bersama. Download kalender digital gratis di FiGo. Jadwal puasa dan hari raya terupdate.`,
  ogDescription: `Download Kalender ${currentYear.value} Indonesia. Lengkap dengan daftar libur nasional.`,
  ogImage: '/og-calendar.png', // Fallback or general image
  twitterCard: 'summary_large_image',
})

function navigateYear(year: number) {
  router.push(`/kalender/${year}`)
}
</script>

<style scoped>
/* Page transition logic included in Nuxt by default */
</style>

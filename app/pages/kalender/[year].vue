<template>
  <div class="min-h-screen pt-24 pb-20 overflow-x-hidden bg-neutral-950">
    <ClientOnly>
      <CalendarGrid 
        :year="currentYear" 
        @update:year="navigateYear"
      />

      <!-- Skeleton saat SSR / loading -->
      <template #fallback>
        <div class="px-6 md:px-8 max-w-7xl mx-auto py-12">
          <div class="space-y-4 mb-12">
            <div class="h-4 w-48 rounded-full bg-white/5 animate-pulse"></div>
            <div class="h-12 w-72 rounded-2xl bg-white/5 animate-pulse"></div>
            <div class="h-4 w-96 rounded-full bg-white/5 animate-pulse"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="i in 12" :key="i" class="h-72 rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse"></div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

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
  ogImage: '/og-calendar.png',
  twitterCard: 'summary_large_image',
})

function navigateYear(year: number) {
  router.push(`/kalender/${year}`)
}
</script>


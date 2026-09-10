<template>
  <section class="py-16 md:py-24 border-t border-neutral-200 dark:border-neutral-800 transition-colors duration-300"
    :class="isDark ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'"
  >
    <div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8"
      ref="ctaRef"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      style="transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);"
    >
      <div class="p-8 md:p-14 rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm relative overflow-hidden">
        <!-- Swiss Corner Markers -->
        <div class="absolute top-3 left-3 font-mono text-[9px] text-neutral-400 select-none">+</div>
        <div class="absolute top-3 right-3 font-mono text-[9px] text-neutral-400 select-none">+</div>
        <div class="absolute bottom-3 left-3 font-mono text-[9px] text-neutral-400 select-none">+</div>
        <div class="absolute bottom-3 right-3 font-mono text-[9px] text-neutral-400 select-none">+</div>

        <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div class="space-y-4 max-w-xl">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-[10px] font-bold tracking-widest uppercase"
              :class="isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-700'"
            >
              DEPLOYMENT // INSTANT UTILITY
            </div>

            <h2 class="text-3xl sm:text-4xl md:text-5xl font-headline font-black tracking-tight leading-[1.05]"
              :class="isDark ? 'text-white' : 'text-neutral-950'"
            >
              ZERO FRICTION.<br />
              <span class="text-primary">INFINITE UTILITY.</span>
            </h2>

            <p class="text-sm md:text-base leading-relaxed"
              :class="isDark ? 'text-neutral-400' : 'text-neutral-600'"
            >
              Semua alat dirancang untuk langsung dipakai dari peramban tanpa hambatan pendaftaran, langganan, atau batasan tersembunyi.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <NuxtLink
              to="/tools"
              class="min-h-12 px-8 py-3.5 rounded-2xl bg-primary text-white font-headline font-extrabold text-sm uppercase tracking-wider hover:bg-primary/90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm text-center"
            >
              <span>Mulai Sekarang</span>
              <span class="material-symbols-outlined text-lg">arrow_forward</span>
            </NuxtLink>

            <NuxtLink
              to="/articles"
              class="min-h-12 px-6 py-3.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 font-headline font-bold text-sm hover:border-neutral-900 dark:hover:border-white transition-all flex items-center justify-center gap-2 text-center"
              :class="isDark ? 'text-neutral-200 hover:bg-neutral-800' : 'text-neutral-800 hover:bg-neutral-100'"
            >
              <span>Baca Arsip</span>
              <span class="material-symbols-outlined text-lg">north_east</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()
const ctaRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

onMounted(() => {
  if (!ctaRef.value) return
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.2 }
  )
  observer.observe(ctaRef.value)
})
</script>

<style scoped>
/* Swiss Poster Styling */
</style>

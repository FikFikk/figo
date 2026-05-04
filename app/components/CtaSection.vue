<template>
  <section class="py-20 md:py-32 transition-colors duration-300"
    :class="isDark ? 'bg-[#0a0c14]' : 'bg-surface-container-low'"
  >
    <div class="max-w-4xl mx-auto text-center px-6"
      ref="ctaRef"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      style="transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);"
    >
      <!-- Badge -->
      <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
        :class="isDark ? 'bg-primary/15 text-primary border border-primary/20' : 'bg-primary-fixed text-on-primary-fixed'"
      >
        Start for Free?
      </div>

      <h2 class="text-3xl sm:text-4xl md:text-6xl font-headline font-extrabold mb-6 md:mb-8 tracking-tight"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >
        Zero configuration.<br />Infinite potential.
      </h2>

      <p class="text-base md:text-lg max-w-xl mx-auto mb-8 md:mb-10"
        :class="isDark ? 'text-gray-400' : 'text-secondary'"
      >
        Join thousands of engineers who trust FiGo for their daily file operations. No signup required.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
        <button
          class="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-primary text-on-primary rounded-full font-bold text-base md:text-lg hover:scale-105 shadow-xl shadow-primary/20 transition-all active:scale-95"
          @click="scrollTo('tools')"
        >
          Launch Dashboard
        </button>
        <button
          class="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-base md:text-lg transition-all"
          :class="isDark ? 'bg-white/10 text-white hover:bg-white/15 border border-white/10' : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200'"
          @click="scrollTo('toolkit')"
        >
          View All Tools
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()
const ctaRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

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
/* fix */
</style>


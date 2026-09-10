<template>
  <div
    ref="cardRef"
    class="p-6 md:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/50 backdrop-blur-sm group hover:border-neutral-950 dark:hover:border-neutral-200 transition-all duration-300 flex flex-col justify-between min-h-[300px] md:min-h-[340px] shadow-sm hover:shadow-md cursor-pointer"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    :style="{ transitionDelay: `${delay}ms` }"
    @click="$emit('action')"
  >
    <div>
      <!-- Top Swiss Header with Index & Icon -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-850">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
          :class="iconBgClass"
        >
          <span class="material-symbols-outlined text-2xl" :class="iconColorClass">{{ icon }}</span>
        </div>
        <span class="font-mono text-[10px] uppercase font-bold tracking-widest text-neutral-400 group-hover:text-primary transition-colors">
          READY
        </span>
      </div>

      <h3 class="text-xl md:text-2xl font-headline font-black mb-2 tracking-tight group-hover:text-primary transition-colors"
        :class="isDark ? 'text-white' : 'text-neutral-900'"
      >
        {{ title }}
      </h3>
      <p class="leading-relaxed text-sm font-sans line-clamp-3" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
        {{ description }}
      </p>
    </div>

    <div class="pt-6 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between">
      <span class="text-xs font-headline font-bold uppercase tracking-wider text-primary">
        {{ actionLabel }}
      </span>
      <span class="material-symbols-outlined text-base text-primary transform group-hover:translate-x-1 transition-transform">
        arrow_forward
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
  actionLabel?: string
  iconBgClass?: string
  iconColorClass?: string
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  actionLabel: 'Buka Modul',
  iconBgClass: 'bg-neutral-100 dark:bg-neutral-800',
  iconColorClass: 'text-primary',
  delay: 0,
})

defineEmits<{ action: [] }>()

const { isDark } = useColorMode()
const cardRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

onMounted(() => {
  if (!cardRef.value) return
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.15 }
  )
  observer.observe(cardRef.value)
})
</script>

<style scoped>
/* Swiss Card Layout */
</style>

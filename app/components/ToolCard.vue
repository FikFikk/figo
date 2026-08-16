<template>
  <div
    ref="cardRef"
    class="glass-panel p-6 md:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] group hover:shadow-[0_12px_40px_rgba(0,88,190,0.08)] transition-all duration-500 flex flex-col justify-between min-h-[300px] md:min-h-[340px]"
    :class="[
      isDark ? 'border border-white/8 hover:border-white/15' : 'border border-white/50',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    ]"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <div>
      <div
        class="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-105 transition-transform duration-300"
        :class="iconBgClass"
      >
        <span class="material-symbols-outlined text-2xl md:text-3xl" :class="iconColorClass">{{ icon }}</span>
      </div>
      <h3 class="text-xl md:text-2xl font-headline font-bold mb-3"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >{{ title }}</h3>
      <p class="leading-relaxed text-sm" :class="isDark ? 'text-gray-400' : 'text-secondary'">{{ description }}</p>
    </div>
    <button
      class="mt-6 min-h-11 w-fit px-3 -ml-3 rounded-lg flex items-center gap-2 text-primary font-bold group/btn text-sm md:text-base hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
      @click="$emit('action')"
    >
      {{ actionLabel }}
      <span class="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform text-lg">arrow_forward</span>
    </button>
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
  actionLabel: 'Convert Now',
  iconBgClass: 'bg-blue-50',
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
/* fix */
</style>

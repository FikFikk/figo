<template>
  <div
    ref="cardRef"
    class="glass-panel p-8 md:p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] group hover:shadow-[0_12px_40px_rgba(0,88,190,0.08)] transition-all duration-500 flex flex-col justify-between min-h-[360px] md:min-h-[400px]"
    :class="[
      isDark ? 'border border-white/8 hover:border-white/15' : 'border border-white/50',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    ]"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <div>
      <div
        class="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-300"
        :class="iconBgClass"
      >
        <span class="material-symbols-outlined text-3xl md:text-4xl" :class="iconColorClass">{{ icon }}</span>
      </div>
      <h3 class="text-2xl md:text-3xl font-headline font-bold mb-3 md:mb-4"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >{{ title }}</h3>
      <p class="leading-relaxed text-sm md:text-base" :class="isDark ? 'text-gray-400' : 'text-secondary'">{{ description }}</p>
    </div>
    <button
      class="mt-6 md:mt-8 flex items-center gap-2 text-primary font-bold group/btn text-sm md:text-base"
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


const STORAGE_KEY = 'figo_history_count'

export function useHistoryCounter() {
  const count = ref(0)
  const displayCount = ref(0)
  let animationFrame: ReturnType<typeof requestAnimationFrame> | null = null

  function load() {
    if (import.meta.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      count.value = stored ? parseInt(stored, 10) : 14728 // Start with impressive base
      animateToValue(count.value)
    }
  }

  function save() {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, count.value.toString())
    }
  }

  function increment(amount: number = 1) {
    count.value += amount
    save()
    animateToValue(count.value)
  }

  function animateToValue(target: number) {
    const start = displayCount.value
    const diff = target - start
    if (diff === 0) return

    const duration = Math.min(1500, Math.max(400, diff * 50))
    const startTime = performance.now()

    function step(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      displayCount.value = Math.round(start + diff * eased)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      }
    }

    if (animationFrame) cancelAnimationFrame(animationFrame)
    animationFrame = requestAnimationFrame(step)
  }

  // Format number with commas
  const formattedCount = computed(() => {
    return displayCount.value.toLocaleString('en-US')
  })

  onMounted(() => {
    load()
  })

  onUnmounted(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame)
  })

  return {
    count: readonly(count),
    displayCount: readonly(displayCount),
    formattedCount,
    increment,
  }
}

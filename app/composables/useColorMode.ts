export function useColorMode() {
  const colorMode = useState<'dark' | 'light'>('color-mode', () => 'dark')

  function toggle() {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
    apply()
    save()
  }

  function apply() {
    if (import.meta.client) {
      const html = document.documentElement
      if (colorMode.value === 'dark') {
        html.classList.add('dark')
        html.classList.remove('light')
      } else {
        html.classList.add('light')
        html.classList.remove('dark')
      }
    }
  }

  function save() {
    if (import.meta.client) {
      localStorage.setItem('figo_color_mode', colorMode.value)
    }
  }

  function load() {
    if (import.meta.client) {
      const saved = localStorage.getItem('figo_color_mode') as 'dark' | 'light' | null
      colorMode.value = saved || 'dark'
      apply()
    }
  }

  const isDark = computed(() => colorMode.value === 'dark')

  onMounted(() => {
    load()
  })

  return {
    colorMode: readonly(colorMode),
    isDark,
    toggle,
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePwaInstall() {
  const deferredPrompt = shallowRef<BeforeInstallPromptEvent | null>(null)
  const isInstalled = ref(false)
  const isIos = ref(false)

  const canInstall = computed(() => Boolean(deferredPrompt.value) && !isInstalled.value)
  const showIosHint = computed(() => isIos.value && !isInstalled.value)

  function updateInstallState() {
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches
      || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  }

  function handleBeforeInstallPrompt(event: Event) {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
  }

  async function install() {
    if (!deferredPrompt.value) return false
    const promptEvent = deferredPrompt.value
    deferredPrompt.value = null
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    if (choice.outcome === 'accepted') isInstalled.value = true
    return choice.outcome === 'accepted'
  }

  onMounted(() => {
    updateInstallState()
    isIos.value = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', updateInstallState)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', updateInstallState)
  })

  return { canInstall, showIosHint, isInstalled, install }
}

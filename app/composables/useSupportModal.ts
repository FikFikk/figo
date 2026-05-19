/**
 * Composable untuk mengelola status global dari modal support (donasi)
 * Mendukung pembukaan modal dari berbagai komponen seperti Navbar dan Footer
 */
export function useSupportModal() {
  // State global menggunakan Nuxt useState
  const isOpen = useState<boolean>('support-modal-open', () => false)

  // Fungsi untuk membuka modal
  function open() {
    isOpen.value = true
  }

  // Fungsi untuk menutup modal
  function close() {
    isOpen.value = false
  }

  // Fungsi untuk mengubah status (toggle) modal
  function toggle() {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen: readonly(isOpen),
    open,
    close,
    toggle,
  }
}

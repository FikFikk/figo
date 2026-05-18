<template>
  <footer class="w-full py-10 md:py-12 border-t transition-colors duration-300"
    :class="isDark ? 'border-white/5 bg-[#0a0c14]' : 'border-slate-100 bg-white'"
  >
    <div class="flex flex-col items-center justify-center space-y-4 px-6">
      <div class="flex items-center space-x-6 md:space-x-8">
        <!-- Perulangan dinamis untuk merender tautan footer -->
        <a 
          v-for="link in footerLinks" 
          :key="link.label" 
          class="font-headline text-xs tracking-wide hover:text-primary transition-colors"
          :class="isDark ? 'text-gray-500' : 'text-slate-400'" 
          :href="link.href"
          :target="link.target || '_self'"
          :rel="link.target === '_blank' ? 'noopener noreferrer' : undefined"
        >
          {{ link.label }}
        </a>
      </div>
      <p class="font-headline text-xs tracking-wide" :class="isDark ? 'text-gray-600' : 'text-slate-400'">
        © {{ currentYear }} FiGo. Powered by Precision Engine.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()
const currentYear = new Date().getFullYear()

// Daftar tautan dinamis di footer
const footerLinks = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Status', href: '#' },
  { label: 'API', href: '#' },
  { label: 'Dukung', href: 'https://trakteer.id/8glcaxeiv6nrtxa4ykur/tip?open=true', target: '_blank' }
]
</script>

<style scoped>
/* fix */
</style>


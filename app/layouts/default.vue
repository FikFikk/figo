<script setup lang="ts">
const { isDark } = useColorMode()
</script>

<template>
  <div class="min-h-screen flex flex-col transition-colors duration-200 pb-20 md:pb-0"
    :class="isDark ? 'bg-[#090b10] text-white' : 'bg-neutral-50 text-neutral-900'"
  >
    <AppNavbar />
    <main class="flex-1 relative">
      <slot />
    </main>
    <AppFooter class="md:pb-0 pb-6" />
  </div>
</template>

<style scoped>
/* Vite parser fix */
</style>

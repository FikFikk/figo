<script setup lang="ts">
const { isDark } = useColorMode()
</script>

<template>
  <div class="min-h-screen flex flex-col transition-colors duration-300 pb-20 md:pb-0"
    :class="isDark ? 'bg-[#0f1117] text-gray-100' : 'bg-surface text-on-surface'"
  >
    <AppNavbar />
    <main class="flex-1 relative overflow-hidden">
      <slot />
    </main>
    <AppFooter class="md:pb-0 pb-6" />
  </div>
</template>

<style scoped>
/* Vite parser fix */
</style>

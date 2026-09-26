<script setup lang="ts">
const { isDark } = useColorMode()
</script>

<template>
  <div class="min-h-screen flex flex-col transition-colors duration-200 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 relative selection:bg-primary/20 selection:text-primary overflow-x-clip"
    :class="isDark ? 'text-slate-100 antialiased' : 'text-slate-900 antialiased'"
  >
    <AppNavbar />
    <main class="flex-1 relative w-full overflow-x-clip">
      <slot />
    </main>
    <AppFooter class="md:pb-0 pb-6 relative" />
  </div>
</template>

<style scoped>
/* Scoped layout */
</style>

<script setup lang="ts">
const { isDark } = useColorMode()
</script>

<template>
  <div class="min-h-screen flex flex-col transition-colors duration-200 pb-20 md:pb-0 relative selection:bg-primary/20 selection:text-primary"
    :class="isDark ? 'bg-[#08090d] text-slate-100 antialiased' : 'bg-[#fafafa] text-slate-900 antialiased'"
  >
    <!-- Ambient subtle background glow -->
    <div v-if="isDark" class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl opacity-60"></div>
    </div>

    <AppNavbar />
    <main class="flex-1 relative z-10">
      <slot />
    </main>
    <AppFooter class="md:pb-0 pb-6 relative z-10" />
  </div>
</template>

<style scoped>
/* Scoped layout */
</style>

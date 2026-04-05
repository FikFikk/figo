<template>
  <div class="flex items-center justify-center gap-1.5 p-1.5 mx-auto max-w-fit rounded-2xl mb-8 border backdrop-blur-md" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200/60 shadow-sm'">
    <NuxtLink 
      to="/kalender" 
      class="flex items-center gap-2 px-4 py-2 rounded-2xl transition-all text-xs font-bold"
      :class="isActive('/kalender') ? (isDark ? 'bg-white/15 text-white shadow-sm' : 'bg-slate-100/80 text-slate-900 shadow-sm') : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'"
    >
      <!-- <span class="material-symbols-outlined text-[16px]">calendar_month</span> -->
      Kalender
    </NuxtLink>
    
    <NuxtLink 
      to="/kalender/weton" 
      class="flex items-center gap-2 px-4 py-2 rounded-2xl transition-all text-xs font-bold"
      :class="isActive('/kalender/weton') ? (isDark ? 'bg-white/15 text-white shadow-sm' : 'bg-slate-100/80 text-slate-900 shadow-sm') : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'"
    >
      <!-- <span class="material-symbols-outlined text-[16px]">search</span> -->
      Weton
    </NuxtLink>

    <NuxtLink 
      to="/kalender/kalkulator" 
      class="flex items-center gap-2 px-4 py-2 rounded-2xl transition-all text-xs font-bold"
      :class="isActive('/kalender/kalkulator') ? (isDark ? 'bg-white/15 text-white shadow-sm' : 'bg-slate-100/80 text-slate-900 shadow-sm') : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'"
    >
      <!-- <span class="material-symbols-outlined text-[16px]">calculate</span> -->
      Kalkulator
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()
const route = useRoute()

function isActive(path: string) {
  // exact match for /kalender/weton and /kalender/kalkulator
  if (path !== '/kalender') {
    return route.path === path
  }
  // for /kalender, it's active if not weton and not kalkulator (meaning it's the dynamic year page)
  return !route.path.includes('/weton') && !route.path.includes('/kalkulator')
}
</script>

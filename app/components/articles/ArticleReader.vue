<template>
  <section class="relative">
    <div class="mb-6 flex items-center justify-between gap-4">
      <NuxtLink to="/articles" class="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:text-emerald-300">
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>Kembali ke katalog
      </NuxtLink>
      <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><span>Bagian {{ currentPage }} dari {{ totalPages }}</span><span class="hidden sm:inline">·</span><span class="hidden sm:inline">{{ progressPercent }}%</span></div>
    </div>

    <div class="lg:grid lg:grid-cols-12 lg:gap-8">
      <aside class="hidden lg:col-span-3 lg:block">
        <div class="sticky top-28 space-y-4"><ReaderOutline :items="outline" :current-page="currentPage" :highlights="highlights" @go-to-page="$emit('go-to-page', $event)" @go-to-highlight="$emit('go-to-highlight', $event)" /></div>
      </aside>

      <main class="min-w-0 lg:col-span-6">
        <header class="border-b border-slate-200 pb-6 dark:border-slate-800">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800 dark:text-emerald-300">{{ category }}</p>
          <h1 class="mt-3 font-serif text-3xl font-semibold leading-tight text-slate-950 md:text-4xl dark:text-white">{{ title }}</h1>
          <p v-if="author" class="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{{ author }}</p>
        </header>

        <article id="baca-top" class="mt-6 rounded-2xl border border-amber-100 bg-amber-50/30 px-5 py-7 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:px-8 sm:py-10">
          <div class="mx-auto max-w-[680px]">
            <div class="mb-8 flex flex-wrap items-start justify-between gap-3 border-b border-amber-100 pb-5 dark:border-slate-800">
              <div><p class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800 dark:text-emerald-300">Bagian {{ currentPage }}</p><h2 class="mt-2 font-serif text-2xl font-semibold leading-snug text-slate-900 dark:text-slate-100">{{ sectionTitle }}</h2></div>
              <span class="rounded-2xl bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">{{ progressPercent }}% selesai</span>
            </div>
            <slot name="prose" />
          </div>
        </article>

        <nav class="mt-7 flex items-center justify-between gap-3 border-t border-slate-200 pt-6 dark:border-slate-800" aria-label="Navigasi bagian artikel">
          <button type="button" class="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" :disabled="currentPage <= 1" @click="$emit('previous-page')"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg><span class="hidden sm:inline">Artikel sebelumnya</span><span class="sm:hidden">Sebelumnya</span></button>
          <button type="button" class="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300" :disabled="currentPage >= totalPages" @click="$emit('next-page')"><span class="hidden sm:inline">Artikel berikutnya</span><span class="sm:hidden">Berikutnya</span><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></button>
        </nav>
      </main>

      <aside class="hidden lg:col-span-3 lg:block"><div class="sticky top-28"><ReaderSettings :settings="settings" @update:settings="$emit('update:settings', $event)" @reset="$emit('reset-settings')" /><div class="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"><p class="text-sm font-semibold text-slate-900 dark:text-slate-100">Progres baca Anda</p><div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div class="h-full rounded-full bg-indigo-600 dark:bg-indigo-400" :style="{ width: `${progressPercent}%` }" /></div><p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ progressPercent }}% · bagian {{ currentPage }}/{{ totalPages }}</p></div></div></aside>
    </div>

    <div class="fixed bottom-24 left-5 right-5 z-30 flex justify-between gap-3 lg:hidden">
      <button type="button" class="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white/95 text-slate-700 shadow-lg backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-200" aria-label="Buka daftar isi dan sorotan" @click="showOutline = true"><svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 0 4 23V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5A2.5 2.5 0 0 1 20 23V5.5Z" /></svg></button>
      <button type="button" class="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white/95 text-lg font-serif font-semibold text-slate-700 shadow-lg backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-200" aria-label="Buka tampilan baca" @click="showSettings = true">Aa</button>
    </div>

    <div v-if="showOutline || showSettings" class="fixed inset-0 z-50 bg-slate-950/45 lg:hidden" @click.self="closeSheets"><section class="absolute inset-x-0 bottom-0 max-h-[78dvh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-slate-950"><div class="mb-5 flex items-center justify-between"><h2 class="text-base font-semibold text-slate-950 dark:text-white">{{ showOutline ? 'Daftar isi & sorotan' : 'Tampilan baca' }}</h2><button type="button" class="grid size-11 place-items-center rounded-2xl text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-slate-300 dark:hover:bg-slate-900" aria-label="Tutup panel" @click="closeSheets"><svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div><ReaderOutline v-if="showOutline" :items="outline" :current-page="currentPage" :highlights="highlights" @go-to-page="goToPageFromSheet" @go-to-highlight="goToHighlightFromSheet" /><ReaderSettings v-else :settings="settings" @update:settings="$emit('update:settings', $event)" @reset="$emit('reset-settings')" /></section></div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ArticleHighlight, ReaderSettings } from '~/types/articles'

defineProps<{
  title: string
  category: string
  author?: string
  sectionTitle: string
  currentPage: number
  totalPages: number
  progressPercent: number
  outline: Array<{ page: number; title: string }>
  highlights: ArticleHighlight[]
  settings: ReaderSettings
}>()
const emit = defineEmits<{ 'previous-page': []; 'next-page': []; 'go-to-page': [page: number]; 'go-to-highlight': [highlight: ArticleHighlight]; 'update:settings': [settings: ReaderSettings]; 'reset-settings': [] }>()
const showOutline = ref(false)
const showSettings = ref(false)
const closeSheets = () => { showOutline.value = false; showSettings.value = false }
const goToPageFromSheet = (page: number) => { closeSheets(); emit('go-to-page', page) }
const goToHighlightFromSheet = (highlight: ArticleHighlight) => { closeSheets(); emit('go-to-highlight', highlight) }
</script>

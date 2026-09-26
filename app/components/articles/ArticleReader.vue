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

    <!-- Tombol aksi mengambang mobile (Daftar Isi/Sorotan & Tampilan Baca) -->
    <div class="fixed bottom-24 left-5 right-5 z-30 flex justify-between gap-3 lg:hidden pointer-events-none">
      <button
        type="button"
        class="pointer-events-auto relative grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white/95 text-slate-700 shadow-lg backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-200 active:scale-95 transition"
        aria-label="Buka daftar isi dan sorotan"
        @click="openOutlineSheet"
      >
        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 0 4 23V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5A2.5 2.5 0 0 1 20 23V5.5Z" />
        </svg>
        <span
          v-if="highlights.length"
          class="absolute -top-1 -right-1 size-3 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-950"
        />
      </button>
      <button
        type="button"
        class="pointer-events-auto grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white/95 text-lg font-serif font-semibold text-slate-700 shadow-lg backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-200 active:scale-95 transition"
        aria-label="Buka tampilan baca"
        @click="openSettingsSheet"
      >
        Aa
      </button>
    </div>

    <!-- Modal bottom sheet mobile dengan Teleport ke body & z-index di atas AppNavbar (z-[80]) -->
    <Teleport to="body">
      <Transition name="sheet-backdrop">
        <div
          v-if="showOutline || showSettings"
          class="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm lg:hidden flex flex-col justify-end"
          @click.self="closeSheets"
        >
          <Transition name="sheet-slide" appear>
            <section
              v-if="showOutline || showSettings"
              class="relative flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800"
              role="dialog"
              aria-modal="true"
              :aria-label="showOutline ? 'Daftar isi & sorotan' : 'Tampilan baca'"
            >
              <!-- Indikator drag handle atas sheet -->
              <div class="pt-3 pb-1 flex justify-center cursor-grab select-none">
                <div class="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              <!-- Header tetap (sticky) di bagian atas sheet -->
              <div class="px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
                <!-- Header khusus Daftar Isi & Sorotan dengan Tab Switcher modern -->
                <div v-if="showOutline" class="flex items-center rounded-2xl bg-slate-100 p-1 dark:bg-slate-900">
                  <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition"
                    :class="outlineTab === 'outline'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
                    @click="outlineTab = 'outline'"
                  >
                    <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h7" /></svg>
                    Daftar isi
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition"
                    :class="outlineTab === 'highlights'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
                    @click="outlineTab = 'highlights'"
                  >
                    <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                    Sorotan tersimpan
                    <span
                      class="ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-bold"
                      :class="highlights.length
                        ? 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'"
                    >
                      {{ highlights.length }}
                    </span>
                  </button>
                </div>

                <!-- Header khusus Tampilan Baca -->
                <div v-else class="flex items-center gap-2">
                  <h2 class="text-base font-semibold text-slate-950 dark:text-white">Tampilan baca</h2>
                  <button
                    type="button"
                    class="rounded-xl px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 transition"
                    @click="$emit('reset-settings')"
                  >
                    Kembalikan bawaan
                  </button>
                </div>

                <!-- Tombol tutup sheet -->
                <button
                  type="button"
                  class="grid size-10 place-items-center rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white active:scale-95 transition"
                  aria-label="Tutup panel"
                  @click="closeSheets"
                >
                  <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <!-- Area isi konten yang dapat di-scroll secara independen dan nyaman -->
              <div class="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
                <ReaderOutline
                  v-if="showOutline"
                  variant="sheet"
                  :active-tab="outlineTab"
                  :items="outline"
                  :current-page="currentPage"
                  :highlights="highlights"
                  @go-to-page="goToPageFromSheet"
                  @go-to-highlight="goToHighlightFromSheet"
                />
                <ReaderSettings
                  v-else
                  variant="sheet"
                  :settings="settings"
                  @update:settings="$emit('update:settings', $event)"
                  @reset="$emit('reset-settings')"
                />
              </div>
            </section>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import ReaderOutline from '~/components/articles/ReaderOutline.vue'
import ReaderSettings from '~/components/articles/ReaderSettings.vue'
import type { ArticleHighlight, ReaderSettings as ReaderSettingsType } from '~/types/articles'

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
  settings: ReaderSettingsType
}>()

const emit = defineEmits<{
  'previous-page': []
  'next-page': []
  'go-to-page': [page: number]
  'go-to-highlight': [highlight: ArticleHighlight]
  'update:settings': [settings: ReaderSettingsType]
  'reset-settings': []
}>()

const showOutline = ref(false)
const showSettings = ref(false)
const outlineTab = ref<'outline' | 'highlights'>('outline')

// Membuka sheet daftar isi dan sorotan
const openOutlineSheet = () => {
  showSettings.value = false
  showOutline.value = true
}

// Membuka sheet preferensi tampilan baca
const openSettingsSheet = () => {
  showOutline.value = false
  showSettings.value = true
}

// Menutup semua modal sheet
const closeSheets = () => {
  showOutline.value = false
  showSettings.value = false
}

// Navigasi ke halaman bab dari sheet
const goToPageFromSheet = (page: number) => {
  closeSheets()
  emit('go-to-page', page)
}

// Navigasi ke sorotan teks dari sheet
const goToHighlightFromSheet = (highlight: ArticleHighlight) => {
  closeSheets()
  emit('go-to-highlight', highlight)
}

// Kunci scroll halaman belakang saat modal sheet terbuka
watch([showOutline, showSettings], ([outlineOpen, settingsOpen]) => {
  if (typeof document === 'undefined') return
  if (outlineOpen || settingsOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Pastikan overflow body dipulihkan saat komponen dilepas
onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
  opacity: 0;
}

.sheet-slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-slide-leave-active {
  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1);
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}
</style>

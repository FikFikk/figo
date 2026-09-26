<template>
  <!-- Panel pengaturan tipografi dan kenyamanan membaca -->
  <section
    :class="variant === 'sheet' ? 'space-y-5' : 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950'"
    aria-labelledby="reader-settings-heading"
  >
    <!-- Header panel khusus tampilan sidebar desktop -->
    <div v-if="variant !== 'sheet'" class="flex items-center justify-between gap-3">
      <h2 id="reader-settings-heading" class="text-sm font-semibold text-slate-900 dark:text-slate-100">Tampilan baca</h2>
      <button
        type="button"
        class="min-h-11 rounded-2xl px-3 text-xs font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-emerald-300"
        @click="$emit('reset')"
      >
        Kembalikan bawaan
      </button>
    </div>

    <!-- Kontrol ukuran teks membaca -->
    <div :class="variant === 'sheet' ? '' : 'mt-5'">
      <div class="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <label for="reader-font-size" class="font-medium">Ukuran teks</label>
        <span class="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {{ settings.fontSize }} px
        </span>
      </div>
      <div class="mt-3 flex items-center gap-3">
        <button
          type="button"
          class="grid size-11 place-items-center rounded-2xl border border-slate-200 text-lg font-semibold text-slate-700 transition hover:border-emerald-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900 active:scale-95"
          aria-label="Kurangi ukuran teks"
          :disabled="settings.fontSize <= 14"
          @click="updateFontSize(settings.fontSize - 1)"
        >
          −
        </button>
        <input
          id="reader-font-size"
          :value="settings.fontSize"
          type="range"
          min="14"
          max="28"
          class="h-2 flex-1 accent-emerald-700 dark:accent-emerald-400 cursor-pointer"
          aria-label="Ukuran teks"
          @input="updateFontSize(Number(($event.target as HTMLInputElement).value))"
        >
        <button
          type="button"
          class="grid size-11 place-items-center rounded-2xl border border-slate-200 text-lg font-semibold text-slate-700 transition hover:border-emerald-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900 active:scale-95"
          aria-label="Tambah ukuran teks"
          :disabled="settings.fontSize >= 28"
          @click="updateFontSize(settings.fontSize + 1)"
        >
          +
        </button>
      </div>
    </div>

    <!-- Pilihan jenis font pembaca -->
    <fieldset :class="variant === 'sheet' ? '' : 'mt-5'">
      <legend class="text-sm font-medium text-slate-600 dark:text-slate-300">Jenis huruf</legend>
      <div class="mt-2.5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          class="flex min-h-12 flex-col items-center justify-center rounded-2xl border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          :class="settings.fontFamily === 'font-serif' ? activeClass : idleClass"
          @click="update({ fontFamily: 'font-serif' })"
        >
          <span class="text-base font-serif font-bold">Serif</span>
          <span class="text-[10px] opacity-75 font-sans">Koleksi Sastra</span>
        </button>
        <button
          type="button"
          class="flex min-h-12 flex-col items-center justify-center rounded-2xl border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          :class="settings.fontFamily === 'font-sans' ? activeClass : idleClass"
          @click="update({ fontFamily: 'font-sans' })"
        >
          <span class="text-base font-sans font-bold">Sans</span>
          <span class="text-[10px] opacity-75 font-sans">Modern & Jelas</span>
        </button>
      </div>
    </fieldset>

    <!-- Pilihan perataan paragraf teks -->
    <fieldset :class="variant === 'sheet' ? '' : 'mt-5'">
      <legend class="text-sm font-medium text-slate-600 dark:text-slate-300">Perataan teks</legend>
      <div class="mt-2.5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          class="flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          :class="settings.textAlign === 'text-left' ? activeClass : idleClass"
          @click="update({ textAlign: 'text-left' })"
        >
          <svg class="size-4 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h10M4 18h14" /></svg>
          Rata kiri
        </button>
        <button
          type="button"
          class="flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          :class="settings.textAlign === 'text-justify' ? activeClass : idleClass"
          @click="update({ textAlign: 'text-justify' })"
        >
          <svg class="size-4 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          Rata kiri-kanan
        </button>
      </div>
    </fieldset>

    <!-- Kotak pratinjau langsung untuk melihat efek perubahan tipografi -->
    <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60" :class="variant === 'sheet' ? 'mt-1' : 'mt-5'">
      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Pratinjau langsung</p>
      <p :class="[settings.fontFamily, settings.textAlign]" :style="{ fontSize: `${settings.fontSize}px` }" class="leading-relaxed text-slate-800 dark:text-slate-200 line-clamp-2">
        "Urip iku urup, tansah menehi pepadhang marang sasama."
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ReaderSettings as Settings } from '~/types/articles'

const props = withDefaults(defineProps<{
  settings: Settings
  variant?: 'sidebar' | 'sheet'
}>(), {
  variant: 'sidebar'
})

const emit = defineEmits<{
  'update:settings': [settings: Settings]
  reset: []
}>()

// Kelas gaya tombol aktif
const activeClass = 'border-emerald-700 bg-emerald-50 text-emerald-900 font-semibold shadow-sm dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200'
// Kelas gaya tombol idle / tidak aktif
const idleClass = 'border-slate-200 bg-white text-slate-700 hover:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'

// Mengirimkan pembaruan konfigurasi
const update = (value: Partial<Settings>) => emit('update:settings', { ...props.settings, ...value })
// Mengatur ukuran font dengan batasan aman 14px - 28px
const updateFontSize = (fontSize: number) => update({ fontSize: Math.max(14, Math.min(28, fontSize)) })
</script>

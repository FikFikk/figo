<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950" aria-labelledby="reader-settings-heading">
    <div class="flex items-center justify-between gap-3">
      <h2 id="reader-settings-heading" class="text-sm font-semibold text-slate-900 dark:text-slate-100">Tampilan baca</h2>
      <button type="button" class="min-h-11 rounded-2xl px-3 text-xs font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-emerald-300" @click="$emit('reset')">Kembalikan bawaan</button>
    </div>

    <div class="mt-5">
      <div class="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300"><label for="reader-font-size">Ukuran teks</label><span>{{ settings.fontSize }} px</span></div>
      <div class="mt-3 flex items-center gap-3">
        <button type="button" class="grid size-11 place-items-center rounded-2xl border border-slate-200 text-lg font-semibold text-slate-700 transition hover:border-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:text-slate-200" aria-label="Kurangi ukuran teks" @click="updateFontSize(settings.fontSize - 1)">−</button>
        <input id="reader-font-size" :value="settings.fontSize" type="range" min="14" max="28" class="h-2 flex-1 accent-emerald-700 dark:accent-emerald-400" aria-label="Ukuran teks" @input="updateFontSize(Number(($event.target as HTMLInputElement).value))">
        <button type="button" class="grid size-11 place-items-center rounded-2xl border border-slate-200 text-lg font-semibold text-slate-700 transition hover:border-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:text-slate-200" aria-label="Tambah ukuran teks" @click="updateFontSize(settings.fontSize + 1)">+</button>
      </div>
    </div>

    <fieldset class="mt-5"><legend class="text-sm text-slate-600 dark:text-slate-300">Jenis huruf</legend>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button type="button" class="min-h-11 rounded-2xl border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" :class="settings.fontFamily === 'font-serif' ? activeClass : idleClass" @click="update({ fontFamily: 'font-serif' })">Serif</button>
        <button type="button" class="min-h-11 rounded-2xl border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" :class="settings.fontFamily === 'font-sans' ? activeClass : idleClass" @click="update({ fontFamily: 'font-sans' })">Sans</button>
      </div>
    </fieldset>

    <fieldset class="mt-5"><legend class="text-sm text-slate-600 dark:text-slate-300">Perataan teks</legend>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button type="button" class="min-h-11 rounded-2xl border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" :class="settings.textAlign === 'text-left' ? activeClass : idleClass" @click="update({ textAlign: 'text-left' })">Rata kiri</button>
        <button type="button" class="min-h-11 rounded-2xl border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" :class="settings.textAlign === 'text-justify' ? activeClass : idleClass" @click="update({ textAlign: 'text-justify' })">Rata kiri-kanan</button>
      </div>
    </fieldset>
  </section>
</template>

<script setup lang="ts">
import type { ReaderSettings as Settings } from '~/types/articles'

const props = defineProps<{ settings: Settings }>()
const emit = defineEmits<{ 'update:settings': [settings: Settings]; reset: [] }>()

const activeClass = 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200'
const idleClass = 'border-slate-200 bg-white text-slate-700 hover:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'

const update = (value: Partial<Settings>) => emit('update:settings', { ...props.settings, ...value })
const updateFontSize = (fontSize: number) => update({ fontSize: Math.max(14, Math.min(28, fontSize)) })
</script>

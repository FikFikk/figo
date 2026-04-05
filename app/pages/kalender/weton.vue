<template>
  <div class="min-h-screen pt-24 pb-20 overflow-x-hidden transition-colors" :class="isDark ? 'bg-neutral-950 text-white' : 'bg-slate-50 text-slate-900'">
    <div class="px-6 md:px-8 max-w-4xl mx-auto space-y-8">
      
      <!-- TABS -->
      <CalendarTabs />

      <!-- TITLE -->
      <div>
        <h2 class="text-2xl font-bold font-headline mb-2">Cek Weton Jawa</h2>
        <p class="opacity-60 text-sm">Ketahui weton, neptu, wuku, pancasuda, dan informasi kalender Jawa lengkap berdasarkan tanggal.</p>
      </div>

      <!-- INPUT CARD -->
      <div 
        class="rounded-3xl p-6 md:p-8 border shadow-sm transition-all"
        :class="isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100'"
      >
        <h3 class="font-bold text-lg mb-6">Pilih Tanggal</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-wider font-bold opacity-50">Tanggal</label>
            <input 
              v-model.number="inputDate"
              type="number" 
              min="1" max="31"
              class="w-full px-4 py-3 rounded-2xl border outline-none transition-colors"
              :class="isDark ? 'bg-white/5 border-white/10 focus:border-primary' : 'bg-slate-50 border-slate-200 focus:border-primary focus:bg-white'"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-wider font-bold opacity-50">Bulan</label>
            <select 
              v-model.number="inputMonth"
              class="w-full px-4 py-3 rounded-2xl border outline-none transition-colors appearance-none"
              :class="isDark ? 'bg-neutral-900 border-white/10 focus:border-primary' : 'bg-slate-50 border-slate-200 focus:border-primary focus:bg-white'"
            >
              <option v-for="(m, i) in months" :key="i" :value="i">{{ m }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-wider font-bold opacity-50">Tahun</label>
            <input 
              v-model.number="inputYear"
              type="number" 
              class="w-full px-4 py-3 rounded-2xl border outline-none transition-colors"
              :class="isDark ? 'bg-white/5 border-white/10 focus:border-primary' : 'bg-slate-50 border-slate-200 focus:border-primary focus:bg-white'"
            />
          </div>
        </div>

        <button 
          @click="calculateWeton"
          class="w-full py-3.5 rounded-2xl bg-primary text-white font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          Cek Weton
        </button>
      </div>

      <!-- RESULTS -->
      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="transform translate-y-8 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
      >
        <div 
          v-if="result" 
          class="rounded-3xl p-6 md:p-10 border shadow-md transition-all text-center relative overflow-hidden"
          :class="isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100'"
        >
          <!-- Weton Title -->
          <span class="text-xs uppercase tracking-widest font-black opacity-50 mb-2 block">WETON</span>
          <h3 class="text-4xl md:text-5xl font-black font-headline mb-3 text-primary">{{ result.hari }} {{ result.pasaran }}</h3>
          <p class="text-xl font-bold mb-2">Neptu: <span class="text-rose-500">{{ result.neptu }}</span></p>
          <p class="text-sm opacity-60 mb-8">{{ formatMasehi(new Date(result.year, result.month, result.day)) }}</p>

          <!-- Perhitungan Neptu -->
          <div class="max-w-sm mx-auto rounded-2xl p-6 mb-8 text-sm" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
            <span class="text-[10px] uppercase tracking-widest font-black opacity-40 mb-4 block">PERHITUNGAN NEPTU</span>
            <div class="flex justify-between mb-2">
              <span class="opacity-80">Nilai Hari ({{ result.hari }})</span>
              <span class="font-bold border border-current px-2 rounded">{{ result.neptuHari }}</span>
            </div>
            <div class="flex justify-between mb-4">
              <span class="opacity-80">Nilai Pasaran ({{ result.pasaran }})</span>
              <span class="font-bold border border-current px-2 rounded">{{ result.neptuPasaran }}</span>
            </div>
            <div class="flex justify-between pt-3 border-t border-current/10 font-black text-base">
              <span>Total Neptu</span>
              <span class="text-primary">{{ result.neptu }}</span>
            </div>
          </div>

          <!-- Extended Info (Wuku & Pancasuda) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div class="p-5 rounded-2xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'">
              <p class="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">WUKU</p>
              <p class="text-lg font-bold mb-1">{{ result.wuku }}</p>
              <p class="text-xs opacity-60">Siklus 210 hari mingguan Jawa.</p>
            </div>
            <div class="p-5 rounded-2xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'">
              <p class="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">PANCASUDA</p>
              <p class="text-lg font-bold text-emerald-500 mb-1" :class="getPancasudaColor(result.pancasuda.name)">{{ result.pancasuda.name }}</p>
              <p class="text-xs opacity-60">{{ result.pancasuda.description }}</p>
            </div>
          </div>

<!-- Wewaran (Siklus Hari) -->
          <div class="mt-8 text-left">
            <span class="text-[10px] uppercase tracking-widest font-black opacity-40 mb-3 block">WEWARAN (SIKLUS HARI)</span>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="p-4 rounded-xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
                <p class="text-[9px] font-bold opacity-50 uppercase tracking-wider mb-1">Triwara (3)</p>
                <p class="font-bold text-sm">{{ result.wewaran.triwara }}</p>
              </div>
              <div class="p-4 rounded-xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
                <p class="text-[9px] font-bold opacity-50 uppercase tracking-wider mb-1">Caturwara (4)</p>
                <p class="font-bold text-sm">{{ result.wewaran.caturwara }}</p>
              </div>
              <div class="p-4 rounded-xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
                <p class="text-[9px] font-bold opacity-50 uppercase tracking-wider mb-1">Pancawara (5)</p>
                <p class="font-bold text-sm">{{ result.pasaran }}</p>
              </div>
              <div class="p-4 rounded-xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
                <p class="text-[9px] font-bold opacity-50 uppercase tracking-wider mb-1">Sadwara (6)</p>
                <p class="font-bold text-sm">{{ result.wewaran.sadwara }}</p>
              </div>
              <div class="p-4 rounded-xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
                <p class="text-[9px] font-bold opacity-50 uppercase tracking-wider mb-1">Saptawara (7)</p>
                <p class="font-bold text-sm">{{ result.hari }}</p>
              </div>
              <div class="p-4 rounded-xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
                <p class="text-[9px] font-bold opacity-50 uppercase tracking-wider mb-1">Sangawara (9)</p>
                <p class="font-bold text-sm">{{ result.wewaran.sangawara }}</p>
              </div>
            </div>
          </div>

        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { getFullDateInfo } from '~/utils/calendar-converter'

useSeoMeta({
  title: 'Cek Weton Jawa & Neptu Online — FiGo',
  description: 'Hitung weton kelahiran, jumlah neptu, wuku, dan pancasuda berdasarkan penanggalan kalender Jawa kuno akurat.'
})

const { isDark } = useColorMode()

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const today = new Date()
const inputDate = ref(today.getDate())
const inputMonth = ref(today.getMonth())
const inputYear = ref(today.getFullYear())

const result = ref<any>(null)

function formatMasehi(d: Date) {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  return d.toLocaleDateString('id-ID', options)
}

function calculateWeton() {
  const d = new Date(inputYear.value, inputMonth.value, inputDate.value)
  const info = getFullDateInfo(d)

  // Extra details for Neptu specifically
  const DAY_NEPTU = [5, 4, 3, 7, 8, 6, 9] // Sun - Sat
  const PASARAN_NEPTU: Record<string, number> = {
    'Legi': 5, 'Pahing': 9, 'Pon': 7, 'Wage': 4, 'Kliwon': 8
  }

  const dayIdx = d.getDay()
  const pasaran = info.pasaran

  result.value = {
    day: inputDate.value,
    month: inputMonth.value,
    year: inputYear.value,
    hari: d.toLocaleDateString('id-ID', { weekday: 'long' }),
    pasaran,
    neptuHari: DAY_NEPTU[dayIdx],
    neptuPasaran: PASARAN_NEPTU[pasaran],
    neptu: info.neptu,
    wuku: info.wuku,
    pancasuda: info.pancasuda
  }
}

function getPancasudaColor(name: string) {
  if (isDark.value) {
    switch (name) {
      case 'Wasesa Segara': return 'text-cyan-400'
      case 'Tunggak Semi': return 'text-emerald-400'
      case 'Satria Wibawa': return 'text-amber-400'
      case 'Sumur Sinaba': return 'text-sky-400'
      case 'Satria Wirang': return 'text-rose-400'
      case 'Bumi Kapetak': return 'text-orange-400'
      default: return 'text-white'
    }
  }
  switch (name) {
    case 'Wasesa Segara': return 'text-cyan-600'
    case 'Tunggak Semi': return 'text-emerald-600'
    case 'Satria Wibawa': return 'text-amber-600'
    case 'Sumur Sinaba': return 'text-sky-600'
    case 'Satria Wirang': return 'text-rose-600'
    case 'Bumi Kapetak': return 'text-orange-600'
    default: return 'text-slate-800'
  }
}

// Init calculation
onMounted(() => {
  calculateWeton()
})
</script>

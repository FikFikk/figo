<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen && date" class="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60" @click.self="$emit('close')">
      <div 
        class="modal-body w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        :class="isDark ? 'bg-neutral-900' : 'bg-white'"
      >
        <!-- Tanggal besar sebagai hero -->
        <div class="px-7 pt-7 pb-5">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-6xl font-black leading-none tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ date.getDate() }}
              </p>
              <p class="text-sm font-medium mt-1.5" :class="isDark ? 'text-white/50' : 'text-slate-400'">
                {{ monthNames[date.getMonth()] }} {{ date.getFullYear() }}
              </p>
            </div>
            <button @click="$emit('close')" class="w-8 h-8 rounded-full flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity mt-1">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <!-- Holiday -->
          <div v-if="holidays.length > 0" class="mt-4 space-y-2">
            <div v-for="h in holidays" :key="h.name" class="px-3.5 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/15">
              <p class="text-xs font-bold text-red-500">{{ h.type === 'joint_leave' ? 'Cuti Bersama' : 'Hari Libur' }}</p>
              <p class="text-sm font-bold mt-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">{{ h.name }}</p>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px mx-7" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>

        <!-- Scrollable info -->
        <div class="px-7 py-5 space-y-5 max-h-[55vh] overflow-y-auto overscroll-contain">

          <!-- Hijriah -->
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest mb-1" :class="isDark ? 'text-white/25' : 'text-slate-300'">Hijriah</p>
            <p class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">{{ info.hijri }}</p>
          </div>

          <!-- Tanggal Jawa -->
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest mb-1" :class="isDark ? 'text-white/25' : 'text-slate-300'">Tanggal Jawa</p>
            <p class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">{{ info.tanggalJawa }}</p>
            <p class="text-xs mt-0.5" :class="isDark ? 'text-white/35' : 'text-slate-400'">
              Tahun {{ info.tahunJawa }} · Windu {{ info.winduJawa }}
            </p>
          </div>

          <!-- Weton -->
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest mb-1" :class="isDark ? 'text-white/25' : 'text-slate-300'">Weton</p>
            <p class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">{{ info.jawa }}</p>
            <p class="text-xs mt-0.5" :class="isDark ? 'text-white/35' : 'text-slate-400'">
              Neptu: {{ info.neptu }}
            </p>
          </div>

          <!-- Wuku -->
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest mb-1" :class="isDark ? 'text-white/25' : 'text-slate-300'">Wuku</p>
            <p class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">{{ info.wuku }}</p>
          </div>

          <!-- Pancasuda -->
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest mb-1" :class="isDark ? 'text-white/25' : 'text-slate-300'">Pancasuda</p>
            <p class="text-sm font-bold" :class="getPancasudaColor(info.pancasuda?.name)">{{ info.pancasuda?.name }}</p>
            <p class="text-xs mt-0.5" :class="isDark ? 'text-white/35' : 'text-slate-400'">
              {{ info.pancasuda?.description }}
            </p>
          </div>

          <!-- Divider visual antara info tradisional dan zodiak -->
          <div class="h-px" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>

          <!-- Zodiak Barat -->
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest mb-2" :class="isDark ? 'text-white/25' : 'text-slate-300'">Zodiak</p>
            <div class="flex items-start gap-3 px-3.5 py-3 rounded-2xl border"
              :class="isDark ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50/60 border-indigo-100'"
            >
              <span class="text-3xl leading-none mt-0.5">{{ info.zodiac.symbol }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">
                  {{ info.zodiac.name }}
                  <span class="font-normal opacity-50">· {{ info.zodiac.nameId }}</span>
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    :class="getElementStyle(info.zodiac.element)"
                  >
                    {{ info.zodiac.elementEmoji }} {{ info.zodiac.element }}
                  </span>
                  <span class="text-[10px] font-medium" :class="isDark ? 'text-white/30' : 'text-slate-400'">
                    {{ info.zodiac.dateRange }}
                  </span>
                </div>
                <p class="text-[11px] mt-1.5" :class="isDark ? 'text-white/40' : 'text-slate-500'">
                  {{ info.zodiac.traits }}
                </p>
              </div>
            </div>
          </div>

          <!-- Shio -->
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest mb-2" :class="isDark ? 'text-white/25' : 'text-slate-300'">Shio</p>
            <div class="flex items-start gap-3 px-3.5 py-3 rounded-2xl border"
              :class="isDark ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50/60 border-amber-100'"
            >
              <span class="text-3xl leading-none mt-0.5">{{ info.shio.emoji }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">
                  {{ info.shio.nameId }}
                  <span class="font-normal opacity-50">· {{ info.shio.name }}</span>
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    :class="getElementStyle(info.shio.element)"
                  >
                    {{ info.shio.elementEmoji }} {{ info.shio.element }}
                  </span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                    :class="isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'"
                  >
                    {{ info.shio.yinYang }}
                  </span>
                </div>
                <p class="text-[11px] mt-1.5" :class="isDark ? 'text-white/40' : 'text-slate-500'">
                  {{ info.shio.traits }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Close button -->
        <div class="px-7 pb-7 pt-2">
          <button 
            @click="$emit('close')"
            class="w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
            :class="isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { getFullDateInfo, formatToLocalDate } from '~/utils/calendar-converter'
import { getHolidays } from '~/utils/calendar-data'

const props = defineProps<{
  isOpen: boolean
  date: Date | null
}>()

defineEmits(['close'])

const { isDark } = useColorMode()

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const info = computed(() => {
  if (!props.date) return {
    masehi: '', hijri: '', jawa: '', pasaran: '', neptu: 0, wuku: '',
    tanggalJawa: '', tahunJawa: '', winduJawa: '', bulanJawa: '', tahunAngkaJawa: 0,
    pancasuda: { name: '', description: '' },
    zodiac: { name: '', nameId: '', symbol: '', emoji: '', element: '', elementEmoji: '', dateRange: '', traits: '' },
    shio: { name: '', nameId: '', emoji: '', element: '', elementEmoji: '', yinYang: '', traits: '' },
  }
  return getFullDateInfo(props.date)
})

const holidays = computed(() => {
  if (!props.date) return []
  const dateStr = formatToLocalDate(props.date)
  const allHolidays = getHolidays(props.date.getFullYear())
  return allHolidays.filter(h => h.date === dateStr)
})

function getPancasudaColor(name?: string): string {
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

/** Warna badge elemen (untuk zodiak & shio) */
function getElementStyle(element: string): string {
  if (isDark.value) {
    switch (element) {
      case 'Api': return 'bg-red-500/15 text-red-400'
      case 'Tanah': return 'bg-amber-500/15 text-amber-400'
      case 'Udara': return 'bg-sky-500/15 text-sky-400'
      case 'Air': return 'bg-blue-500/15 text-blue-400'
      case 'Kayu': return 'bg-emerald-500/15 text-emerald-400'
      case 'Logam': return 'bg-slate-400/15 text-slate-300'
      default: return 'bg-white/10 text-white/50'
    }
  }
  switch (element) {
    case 'Api': return 'bg-red-100 text-red-600'
    case 'Tanah': return 'bg-amber-100 text-amber-700'
    case 'Udara': return 'bg-sky-100 text-sky-600'
    case 'Air': return 'bg-blue-100 text-blue-600'
    case 'Kayu': return 'bg-emerald-100 text-emerald-700'
    case 'Logam': return 'bg-slate-200 text-slate-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}
</script>

<style scoped>
.modal-body {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(24px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>

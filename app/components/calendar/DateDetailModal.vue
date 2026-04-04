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
          <div v-if="holidayName" class="mt-4 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/15">
            <p class="text-xs font-bold text-red-500">{{ holiday?.type === 'joint_leave' ? 'Cuti Bersama' : 'Hari Libur' }}</p>
            <p class="text-sm font-bold mt-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">{{ holidayName }}</p>
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
    pancasuda: { name: '', description: '' }
  }
  return getFullDateInfo(props.date)
})

const holiday = computed(() => {
  if (!props.date) return null
  const dateStr = formatToLocalDate(props.date)
  const holidays = getHolidays(props.date.getFullYear())
  return holidays.find(h => h.date === dateStr) ?? null
})

const holidayName = computed(() => holiday.value?.name ?? '')
const isIslamicHoliday = computed(() =>
  holidayName.value.includes('Idul') ||
  holidayName.value.includes('Hijri') ||
  holidayName.value.includes('Maulid') ||
  holidayName.value.includes('Isra')
)

function getPancasudaColor(name?: string): string {
  if (isDark.value) {
    switch (name) {
      case 'Sri': return 'text-emerald-400'
      case 'Lungguh': return 'text-sky-400'
      case 'Gedhong': return 'text-amber-400'
      case 'Lara': return 'text-orange-400'
      case 'Pati': return 'text-red-400'
      default: return 'text-white'
    }
  }
  switch (name) {
    case 'Sri': return 'text-emerald-600'
    case 'Lungguh': return 'text-sky-600'
    case 'Gedhong': return 'text-amber-600'
    case 'Lara': return 'text-orange-600'
    case 'Pati': return 'text-red-600'
    default: return 'text-slate-800'
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

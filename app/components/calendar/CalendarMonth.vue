<template>
  <div class="calendar-month-card rounded-3xl p-5 border transition-all duration-300 relative"
    :class="isDark ? 'bg-white/[0.03] border-white/5 hover:border-white/10' : 'bg-white border-slate-100 shadow-sm hover:shadow-lg'"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-headline font-black text-lg tracking-tight uppercase" :class="isDark ? 'text-white' : 'text-slate-900'">
        {{ monthName }}
      </h3>
      <span class="text-[10px] font-black opacity-30 tracking-widest">{{ year }}</span>
    </div>

    <!-- Header hari -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div v-for="day in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']" :key="day"
        class="text-[10px] font-black text-center opacity-30 py-1"
      >
        {{ day }}
      </div>
    </div>

    <!-- Grid tanggal -->
    <div class="grid grid-cols-7 gap-1">
      <!-- Slot kosong awal bulan -->
      <div v-for="empty in firstDayOffset" :key="'empty-' + empty" class="aspect-square"></div>
      
      <!-- Tanggal -->
      <div 
        v-for="day in daysInMonth" 
        :key="day"
        @click="$emit('select-date', new Date(year, month, day))"
        class="day-cell relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer group"
        :class="getDayClasses(day)"
      >
        <span class="z-10 leading-none">{{ day }}</span>
        
        <!-- Pasaran kecil di bawah angka (desktop only) -->
        <span class="hidden sm:block text-[6px] font-bold opacity-30 mt-0.5 z-10 leading-none">
          {{ dayCache[day - 1]?.pasaran?.substring(0, 3) }}
        </span>
        
        <!-- Holiday dot indicator -->
        <div v-if="dayCache[day - 1]?.holiday" 
          class="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
          :class="dayCache[day - 1]?.holiday?.type === 'joint_leave' ? 'bg-orange-400' : 'bg-red-500'"
        ></div>

        <!-- Tooltip (desktop only, no backdrop-blur) -->
        <div 
          class="tooltip-bubble hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[220px] p-3 rounded-2xl bg-neutral-900 text-white shadow-2xl shadow-black/40 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[200] text-left"
        >
          <div class="space-y-2">
            <!-- Nama hari libur / tanggal -->
            <div class="border-b border-white/10 pb-2">
              <p v-if="dayCache[day - 1]?.holiday" class="text-[11px] font-black leading-tight text-red-400">
                {{ dayCache[day - 1]?.holiday?.name }}
              </p>
              <p class="text-[10px] font-bold leading-tight" :class="dayCache[day - 1]?.holiday ? 'opacity-50 mt-1' : 'opacity-70'">
                {{ dayCache[day - 1]?.info?.masehi }}
              </p>
            </div>
            
            <!-- Grid info Jawa -->
            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px]">
              <div>
                <span class="opacity-40 uppercase tracking-tight block">Pasaran</span>
                <span class="font-bold text-[10px]">{{ dayCache[day - 1]?.pasaran }}</span>
              </div>
              <div>
                <span class="opacity-40 uppercase tracking-tight block">Wuku</span>
                <span class="font-bold text-[10px]">{{ dayCache[day - 1]?.info?.wuku }}</span>
              </div>
              <div>
                <span class="opacity-40 uppercase tracking-tight block">Neptu</span>
                <span class="font-bold text-[10px]">{{ dayCache[day - 1]?.info?.neptu }}</span>
              </div>
              <div>
                <span class="opacity-40 uppercase tracking-tight block">Pancasuda</span>
                <span class="font-bold text-[10px]" :class="getPancasudaColor(dayCache[day - 1]?.info?.pancasuda?.name)">
                  {{ dayCache[day - 1]?.info?.pancasuda?.name }}
                </span>
              </div>
            </div>

            <!-- Tanggal Jawa -->
            <div class="pt-1.5 border-t border-white/10">
              <span class="opacity-40 uppercase tracking-tight text-[8px] block mb-0.5">Tanggal Jawa</span>
              <span class="font-bold text-[10px] block">{{ dayCache[day - 1]?.info?.tanggalJawa }}</span>
              <span class="text-[8px] opacity-50">Tahun {{ dayCache[day - 1]?.info?.tahunJawa }} · Windu {{ dayCache[day - 1]?.info?.winduJawa }}</span>
            </div>
          </div>

          <!-- Arrow -->
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-neutral-900"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getHolidays, type Holiday } from '~/utils/calendar-data'
import { getJavanesePasaran, getFullDateInfo, formatToLocalDate } from '~/utils/calendar-converter'

const props = defineProps<{
  year: number
  month: number // 0-11
}>()

defineEmits(['select-date'])

const { isDark } = useColorMode()

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const monthName = computed(() => monthNames[props.month])

const daysInMonth = computed(() => {
  return new Date(props.year, props.month + 1, 0).getDate()
})

const firstDayOffset = computed(() => {
  return new Date(props.year, props.month, 1).getDay()
})

/** Cache holidays per bulan — dihitung sekali bukan per-hari */
const holidayMap = computed(() => {
  const map = new Map<string, Holiday>()
  const holidays = getHolidays(props.year)
  for (const h of holidays) {
    // Filter hanya bulan ini
    const [, m] = h.date.split('-').map(Number)
    if (m === props.month + 1) {
      map.set(h.date, h)
    }
  }
  return map
})

interface DayCache {
  pasaran: string
  holiday: Holiday | null
  info: ReturnType<typeof getFullDateInfo>
}

/** Cache semua data per hari — dihitung sekali per bulan */
const dayCache = computed<DayCache[]>(() => {
  const cache: DayCache[] = []
  const total = daysInMonth.value
  for (let d = 1; d <= total; d++) {
    const dateObj = new Date(props.year, props.month, d)
    const dateStr = formatToLocalDate(dateObj)
    const pasaran = getJavanesePasaran(dateObj)
    const holiday = holidayMap.value.get(dateStr) ?? null
    const info = getFullDateInfo(dateObj)
    cache.push({ pasaran, holiday, info })
  }
  return cache
})

/** Warna Pancasuda untuk visual cue */
function getPancasudaColor(name?: string): string {
  switch (name) {
    case 'Sri': return 'text-emerald-400'
    case 'Lungguh': return 'text-sky-400'
    case 'Gedhong': return 'text-amber-400'
    case 'Lara': return 'text-orange-400'
    case 'Pati': return 'text-red-400'
    default: return ''
  }
}

function getDayClasses(day: number) {
  const dateObj = new Date(props.year, props.month, day)
  const isToday = new Date().toDateString() === dateObj.toDateString()
  const cached = dayCache.value[day - 1]
  const holiday = cached?.holiday
  const isSunday = dateObj.getDay() === 0

  const classes: string[] = []
  
  if (isToday) {
    classes.push(isDark.value ? 'bg-primary text-white ring-2 ring-primary/30' : 'bg-primary text-white shadow-md shadow-primary/30')
  } else if (holiday) {
    if (holiday.type === 'joint_leave') {
      classes.push('text-red-500 bg-red-500/10')
    } else {
      classes.push('text-white bg-red-500')
    }
  } else if (isSunday) {
    classes.push('text-red-500')
  } else {
    classes.push(isDark.value ? 'text-white/70 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
  }
  
  return classes.join(' ')
}
</script>

<style scoped>
/* Performa mobile: tidak pakai backdrop-filter sama sekali */
.calendar-month-card {
  will-change: auto;
}

/* Tooltip muncul hanya di desktop via group-hover (CSS only, no JS) */
.day-cell:hover .tooltip-bubble {
  opacity: 1;
}

/* Pastikan tooltip di edge kiri/kanan tidak terpotong */
.grid > .day-cell:nth-child(7n + 1) .tooltip-bubble,
.grid > .day-cell:nth-child(7n + 2) .tooltip-bubble {
  left: 0;
  transform: translateX(0);
}
.grid > .day-cell:nth-child(7n + 1) .tooltip-bubble > div:last-child,
.grid > .day-cell:nth-child(7n + 2) .tooltip-bubble > div:last-child {
  left: 16px;
  transform: translateX(0);
}

.grid > .day-cell:nth-child(7n) .tooltip-bubble,
.grid > .day-cell:nth-child(7n - 1) .tooltip-bubble {
  left: auto;
  right: 0;
  transform: translateX(0);
}
.grid > .day-cell:nth-child(7n) .tooltip-bubble > div:last-child,
.grid > .day-cell:nth-child(7n - 1) .tooltip-bubble > div:last-child {
  left: auto;
  right: 16px;
  transform: translateX(0);
}
</style>

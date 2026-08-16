<template>
  <div class="calendar-month-card h-full rounded-3xl p-5 border transition-all duration-300 relative"
    :class="isDark ? 'bg-white/[0.03] border-white/5 hover:border-white/10' : 'bg-white border-slate-100 shadow-sm hover:shadow-lg'"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-headline font-black text-lg tracking-tight uppercase" :class="isDark ? 'text-white' : 'text-slate-900'">
        {{ monthName }}
      </h3>
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
      <!-- Tanggal -->
      <div 
        v-for="cell in calendarCells"
        :key="cell.key"
        @click="$emit('select-date', cell.date)"
        class="day-cell relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer group"
        :class="getDayClasses(cell)"
      >
        <span class="z-10 leading-none">{{ cell.day }}</span>
        
        <!-- Pasaran kecil di bawah angka (desktop only) -->
        <span class="hidden sm:block text-[6px] font-bold opacity-30 mt-0.5 z-10 leading-none">
          {{ cell.data.pasaran.substring(0, 3) }}
        </span>
        
        <!-- Holiday dot indicator -->
        <div v-if="cell.data.holidays.length"
          class="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
          :class="cell.data.holidays.some(h => h.type === 'national') ? 'bg-red-500' : 'bg-orange-400'"
        ></div>

        <!-- Tooltip (desktop only, no backdrop-blur) -->
        <div 
          class="tooltip-bubble hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[220px] p-3 rounded-2xl bg-neutral-900 text-white shadow-2xl shadow-black/40 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[200] text-left"
        >
          <div class="space-y-2">
            <!-- Nama hari libur / tanggal -->
            <div class="border-b border-white/10 pb-2">
              <template v-if="cell.data.holidays.length">
                <p v-for="h in cell.data.holidays" :key="h.name" class="text-[11px] font-black leading-tight text-red-400 mb-0.5">
                  {{ h.name }}
                </p>
              </template>
              <p class="text-[10px] font-bold leading-tight" :class="cell.data.holidays.length ? 'opacity-50 mt-1' : 'opacity-70'">
                {{ cell.data.info.masehi }}
              </p>
            </div>
            
            <!-- Grid info Jawa -->
            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px]">
              <div>
                <span class="opacity-40 uppercase tracking-tight block">Pasaran</span>
                <span class="font-bold text-[10px]">{{ cell.data.pasaran }}</span>
              </div>
              <div>
                <span class="opacity-40 uppercase tracking-tight block">Wuku</span>
                <span class="font-bold text-[10px]">{{ cell.data.info.wuku }}</span>
              </div>
              <div>
                <span class="opacity-40 uppercase tracking-tight block">Neptu</span>
                <span class="font-bold text-[10px]">{{ cell.data.info.neptu }}</span>
              </div>
              <div>
                <span class="opacity-40 uppercase tracking-tight block">Pancasuda</span>
                <span class="font-bold text-[10px]" :class="getPancasudaColor(cell.data.info.pancasuda?.name)">
                  {{ cell.data.info.pancasuda?.name }}
                </span>
              </div>
            </div>

            <!-- Tanggal Jawa & Hijriah -->
            <div class="pt-1.5 border-t border-white/10 grid grid-cols-2 gap-x-2 w-full">
              <div>
                <span class="opacity-40 uppercase tracking-tight text-[8px] block mb-0.5">Tanggal Jawa</span>
                <span class="font-bold text-[9px] block">{{ cell.data.info.tanggalJawa }}</span>
                <span class="text-[7.5px] opacity-50 block leading-tight mt-0.5">Th. {{ cell.data.info.tahunJawa }}</span>
              </div>
              <div class="pl-2 border-l border-white/5">
                <span class="opacity-40 uppercase tracking-tight text-[8px] block mb-0.5">Hijriah</span>
                <span class="font-bold text-[10px] block">{{ cell.data.info.hijriShort }}</span>
              </div>
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
  const map = new Map<string, Holiday[]>()
  const holidaysList = getHolidays(props.year)
  for (const h of holidaysList) {
    // Filter hanya bulan ini
    const [, m] = h.date.split('-').map(Number)
    if (m === props.month + 1) {
      if (!map.has(h.date)) map.set(h.date, [])
      map.get(h.date)!.push(h)
    }
  }
  return map
})

interface DayCache {
  pasaran: string
  holidays: Holiday[]
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
    const holidays = holidayMap.value.get(dateStr) ?? []
    const info = getFullDateInfo(dateObj)
    cache.push({ pasaran, holidays, info })
  }
  return cache
})

interface CalendarCell {
  key: string
  date: Date
  day: number
  isCurrentMonth: boolean
  data: DayCache
}

/** Lengkapi minggu pertama/terakhir tanpa memaksakan semua bulan menjadi 6 baris. */
const calendarCells = computed<CalendarCell[]>(() => {
  const cells: CalendarCell[] = []
  const firstDate = new Date(props.year, props.month, 1)
  const firstDayOffset = firstDate.getDay()
  const currentMonthDays = new Date(props.year, props.month + 1, 0).getDate()
  const visibleCellCount = Math.ceil((firstDayOffset + currentMonthDays) / 7) * 7
  const gridStart = new Date(props.year, props.month, 1 - firstDayOffset)
  const gridEnd = new Date(gridStart)
  gridEnd.setDate(gridStart.getDate() + visibleCellCount - 1)
  const holidaysByDate = new Map<string, Holiday[]>()

  for (let year = gridStart.getFullYear(); year <= gridEnd.getFullYear(); year++) {
    for (const holiday of getHolidays(year)) {
      if (!holidaysByDate.has(holiday.date)) holidaysByDate.set(holiday.date, [])
      holidaysByDate.get(holiday.date)!.push(holiday)
    }
  }

  for (let index = 0; index < visibleCellCount; index++) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    const dateStr = formatToLocalDate(date)
    const holidays = holidaysByDate.get(dateStr) ?? []
    cells.push({
      key: dateStr,
      date,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === props.month && date.getFullYear() === props.year,
      data: {
        pasaran: getJavanesePasaran(date),
        holidays,
        info: getFullDateInfo(date),
      },
    })
  }

  return cells
})

/** Warna Pancasuda untuk visual cue */
function getPancasudaColor(name?: string): string {
  switch (name) {
    case 'Wasesa Segara': return 'text-cyan-400'
    case 'Tunggak Semi': return 'text-emerald-400'
    case 'Satria Wibawa': return 'text-amber-400'
    case 'Sumur Sinaba': return 'text-sky-400'
    case 'Satria Wirang': return 'text-rose-400'
    case 'Bumi Kapetak': return 'text-orange-400'
    default: return ''
  }
}

function getDayClasses(cell: CalendarCell) {
  const dateObj = cell.date
  const isToday = new Date().toDateString() === dateObj.toDateString()
  const isSunday = dateObj.getDay() === 0

  const hasNational = cell.data.holidays.some(h => h.type === 'national')
  const hasJointLeave = cell.data.holidays.some(h => h.type === 'joint_leave')

  const classes: string[] = []

  if (!cell.isCurrentMonth) {
    classes.push(isDark.value
      ? 'text-white/20 hover:text-white/45 hover:bg-white/5'
      : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50')
    return classes.join(' ')
  }
  
  if (isToday) {
    classes.push(isDark.value ? 'bg-primary text-white ring-2 ring-primary/30' : 'bg-primary text-white shadow-md shadow-primary/30')
  } else if (hasNational) {
    classes.push('text-white bg-red-500')
  } else if (hasJointLeave) {
    classes.push('text-red-500 bg-red-500/10')
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

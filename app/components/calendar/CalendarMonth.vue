<template>
  <div class="calendar-month-card glass-panel rounded-3xl p-5 border transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 relative hover:z-[60]"
    :class="isDark ? 'bg-white/5 border-white/5' : 'bg-white/80 border-slate-100 shadow-sm'"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-headline font-black text-lg tracking-tight uppercase" :class="isDark ? 'text-white' : 'text-slate-900'">
        {{ monthName }}
      </h3>
      <span class="text-[10px] font-black opacity-30 tracking-widest">{{ year }}</span>
    </div>

    <!-- Days Header -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div v-for="day in ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']" :key="day" 
        class="text-[10px] font-black text-center opacity-30 py-1"
      >
        {{ day }}
      </div>
    </div>

    <!-- Days Grid -->
    <div class="grid grid-cols-7 gap-1">
      <!-- Empty slots for start of month -->
      <div v-for="empty in firstDayOffset" :key="'empty-' + empty" class="aspect-square"></div>
      
      <!-- Actual Days -->
      <div 
        v-for="day in daysInMonth" 
        :key="day"
        @click="$emit('select-date', new Date(year, month, day))"
        class="relative aspect-square flex flex-col items-center justify-center rounded-full text-xs font-bold transition-all group cursor-pointer p-1 hover:z-[100]"
        :class="getDayClasses(day)"
      >
        <span class="z-10">{{ day }}</span>
        
        <!-- Pasaran Jawa -->
        <!-- <span class="text-[7px] font-black opacity-30 mt-0.5 z-10 hidden sm:block">
          {{ getPasaran(day) }}
        </span> -->
        
        <!-- Holiday Indicator/Tooltip -->
        <!-- <div v-if="getHoliday(day)" 
          class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50"
        ></div> -->
        
        <!-- Universal Hover Tooltip -->
        <div 
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max min-w-[180px] p-4 rounded-2xl bg-neutral-900/95 backdrop-blur-md text-white shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 transform translate-y-2 group-hover:translate-y-0 text-left"
        >
          <div class="space-y-3">
            <div class="border-b border-white/10 pb-2 mb-2">
              <h4 v-if="getHoliday(day)" class="text-[11px] font-black leading-tight text-red-400">
                {{ getHoliday(day)?.name }}
              </h4>
              <h4 v-else class="text-[11px] font-black leading-tight opacity-40">
                {{ day }} {{ monthName }} {{ year }}
              </h4>
            </div>
            
            <div class="grid grid-cols-1 gap-1.5 text-[10px] font-medium opacity-80">
              <div class="flex justify-between gap-4">
                <span class="opacity-40 uppercase tracking-tighter">Pasaran</span>
                <span class="font-bold">{{ getPasaran(day) }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="opacity-40 uppercase tracking-tighter">Neptu</span>
                <span class="font-bold">{{ getDetailInfo(day).neptu }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="opacity-40 uppercase tracking-tighter">Wuku</span>
                <span class="font-bold">{{ getDetailInfo(day).wuku }}</span>
              </div>
            </div>
          </div>
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-neutral-900/95"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getHolidays } from '~/utils/calendar-data'
import { getJavanesePasaran, getNeptu, getWuku, getFullDateInfo, formatToLocalDate } from '~/utils/calendar-converter'

const props = defineProps<{
  year: number
  month: number // 0-11
}>()

const emit = defineEmits(['select-date'])

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
  // 0 = Sunday, 1 = Monday, etc.
  return new Date(props.year, props.month, 1).getDay()
})

function getHoliday(day: number) {
  const dateStr = formatToLocalDate(new Date(props.year, props.month, day))
  const holidays = getHolidays(props.year)
  return holidays.find(h => h.date === dateStr)
}

function getPasaran(day: number) {
  return getJavanesePasaran(new Date(props.year, props.month, day))
}

function getDetailInfo(day: number) {
  return getFullDateInfo(new Date(props.year, props.month, day))
}

function getDayClasses(day: number) {
  const dateObj = new Date(props.year, props.month, day)
  const isToday = new Date().toDateString() === dateObj.toDateString()
  const holiday = getHoliday(day)
  const isSunday = dateObj.getDay() === 0

  let classes = []
  
  if (isToday) {
    classes.push(isDark.value ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-primary text-white shadow-lg shadow-primary/30')
  } else if (holiday) {
    if (holiday.type === 'joint_leave') {
      classes.push('text-red-500 bg-red-500/20') // Transparency for cuti bersama
    } else {
      classes.push('text-white bg-red-500') // Solid for national holiday
    }
  } else if (isSunday) {
    classes.push('text-red-500')
  } else {
    classes.push(isDark.value ? 'text-white/70 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100')
  }
  
  return classes.join(' ')
}
</script>

<style scoped>
.calendar-month-card {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>

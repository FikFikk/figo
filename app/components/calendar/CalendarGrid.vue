<template>
  <div class="calendar-grid-container px-4 sm:px-6 md:px-8 max-w-7xl mx-auto pt-6 pb-16">
    
    <!-- Hero Header — Clean & Minimal -->
    <div class="calendar-hero text-center mb-8 md:mb-12">

      <!-- Subtitle dekoratif -->
      <p class="text-[10px] sm:text-[11px] font-black tracking-[0.3em] uppercase mb-4"
        :class="isDark ? 'text-white/25' : 'text-slate-300'"
      >
        ✦ Kalender Indonesia ✦
      </p>

      <!-- Tahun besar — panah + klik untuk edit -->
      <div class="flex items-center justify-center gap-3 sm:gap-5 mb-2">
        <button 
          @click="$emit('update:year', year - 1)"
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90"
          :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-300 hover:text-slate-600'"
        >
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>

        <!-- Klik tahun → inline input -->
        <div v-if="!isEditing" 
          @click="startEditing"
          class="cursor-pointer group"
        >
          <h1 
            class="text-6xl sm:text-7xl md:text-8xl font-headline font-black tracking-tighter tabular-nums select-none transition-colors duration-200"
            :class="isDark ? 'text-white group-hover:text-primary' : 'text-slate-900 group-hover:text-primary'"
            :key="year"
          >
            {{ year }}
          </h1>
        </div>

        <!-- Inline Year Input (muncul saat klik tahun) -->
        <div v-else>
          <input 
            ref="yearInputRef"
            type="number" 
            v-model="inputYear" 
            min="1900" 
            max="2100"
            class="w-36 sm:w-44 text-center text-5xl sm:text-6xl md:text-7xl font-headline font-black tracking-tighter rounded-2xl border-2 py-1 outline-none transition-all"
            :class="isDark 
              ? 'bg-white/5 border-primary/40 text-white focus:border-primary' 
              : 'bg-slate-50 border-primary/30 text-slate-900 focus:border-primary'"
            @keyup.enter="confirmYear"
            @keyup.escape="cancelEditing"
            @blur="confirmYear"
          />
        </div>

        <button 
          @click="$emit('update:year', year + 1)"
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90"
          :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-300 hover:text-slate-600'"
        >
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>

      <!-- Hijriah year — di bawah tahun besar -->
      <p class="text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase"
        :class="isDark ? 'text-white/20' : 'text-slate-300'"
      >
        Tahun Hijriah {{ hijriYearRange }}
      </p>
    </div>

    <!-- 12 Months Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
      <CalendarMonth 
        v-for="month in 12" 
        :key="`${year}-${month}`" 
        :year="year" 
        :month="month - 1"
        @select-date="handleSelectDate"
      />
    </div>

    <!-- Footer Stats + Nav — Kecil di bawah -->
    <div class="flex flex-col items-center gap-3 mt-8 md:mt-12">
      <!-- Stats -->
      <div class="flex items-center gap-3 sm:gap-4">
        <span class="text-[10px] sm:text-[11px] font-bold"
          :class="isDark ? 'text-white/20' : 'text-slate-300'"
        >
          {{ totalHolidays }} hari libur
        </span>
        <span class="w-1 h-1 rounded-full" :class="isDark ? 'bg-white/10' : 'bg-slate-200'"></span>
        <span class="text-[10px] sm:text-[11px] font-bold"
          :class="isDark ? 'text-white/20' : 'text-slate-300'"
        >
          {{ totalJointLeave }} cuti bersama
        </span>
        <span class="w-1 h-1 rounded-full" :class="isDark ? 'bg-white/10' : 'bg-slate-200'"></span>
        <span class="text-[10px] sm:text-[11px] font-bold"
          :class="isDark ? 'text-white/20' : 'text-slate-300'"
        >
          {{ isLeapYear ? '366' : '365' }} hari
        </span>
      </div>
      <!-- Tools Nav -->
      <div class="flex items-center gap-4">
        <NuxtLink to="/kalender/weton" 
          class="text-[11px] font-bold transition-all hover:text-primary"
          :class="isDark ? 'text-white/25 hover:text-primary' : 'text-slate-300 hover:text-primary'"
        >
          Cek Weton
        </NuxtLink>
        <span class="w-0.5 h-3 rounded-full" :class="isDark ? 'bg-white/10' : 'bg-slate-200'"></span>
        <NuxtLink to="/kalender/kalkulator" 
          class="text-[11px] font-bold transition-all hover:text-primary"
          :class="isDark ? 'text-white/25 hover:text-primary' : 'text-slate-300 hover:text-primary'"
        >
          Kalkulator Tanggal
        </NuxtLink>
      </div>
    </div>

    <!-- Date Detail Modal -->
    <CalendarDateDetailModal 
      :is-open="isModalOpen" 
      :date="selectedDate" 
      @close="isModalOpen = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { toHijri } from '~/utils/calendar-converter'
import { getHolidays } from '~/utils/calendar-data'

const props = defineProps<{
  year: number
}>()

const emit = defineEmits(['update:year'])

const { isDark } = useColorMode()

const isModalOpen = ref(false)
const selectedDate = ref<Date | null>(null)
const isEditing = ref(false)
const inputYear = ref(props.year)
const yearInputRef = ref<HTMLInputElement | null>(null)




/** Info Tahun Hijriah (rentang) */
const hijriYearRange = computed(() => {
  const jan1 = toHijri(new Date(props.year, 0, 1))
  const dec31 = toHijri(new Date(props.year, 11, 31))
  if (jan1.year === dec31.year) return `${jan1.year} H`
  return `${jan1.year}–${dec31.year} H`
})

/** Cek tahun kabisat */
const isLeapYear = computed(() => {
  const y = props.year
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
})

/** Total libur nasional */
const totalHolidays = computed(() => {
  return getHolidays(props.year).filter(h => h.type === 'national').length
})

/** Total cuti bersama */
const totalJointLeave = computed(() => {
  return getHolidays(props.year).filter(h => h.type === 'joint_leave').length
})

/** Mulai mode edit — fokus ke input */
function startEditing() {
  inputYear.value = props.year
  isEditing.value = true
  nextTick(() => {
    yearInputRef.value?.focus()
    yearInputRef.value?.select()
  })
}

/** Konfirmasi tahun dari input */
function confirmYear() {
  const y = parseInt(inputYear.value.toString())
  if (y >= 1900 && y <= 2100 && y !== props.year) {
    emit('update:year', y)
  }
  isEditing.value = false
}

/** Batal edit */
function cancelEditing() {
  inputYear.value = props.year
  isEditing.value = false
}

function handleSelectDate(date: Date) {
  selectedDate.value = date
  isModalOpen.value = true
}

watch(() => props.year, (newYear) => {
  inputYear.value = newYear
  isEditing.value = false
})
</script>

<style scoped>
.calendar-grid-container {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Sembunyikan scrollbar di year pills mobile */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Animasi year ganti */
h1 {
  animation: yearPop 0.3s ease-out;
}
@keyframes yearPop {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Sembunyikan spinner di number input */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>

<template>
  <div class="calendar-grid-container px-6 md:px-8 max-w-7xl mx-auto py-12">
    <!-- Header with Year Selection -->
    <div class="flex flex-col md:flex-row items-center justify-between mb-12 gap-8 text-center md:text-left">
      <div class="space-y-4">
        <div class="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
          :class="isDark ? 'bg-primary/15 text-primary border border-primary/20' : 'bg-primary-fixed text-on-primary-fixed'"
        >
          Dynamic Calendar Engine v2.0
        </div>
        <div class="flex items-center gap-4 group">
          <h1 class="text-4xl md:text-6xl font-headline font-black tracking-tighter" :class="isDark ? 'text-white' : 'text-slate-900'">
            Indonesia <span class="text-primary">{{ year }}</span>
          </h1>
          <button @click="showYearInput = !showYearInput" class="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
            <span class="material-symbols-outlined">{{ showYearInput ? 'close' : 'edit_calendar' }}</span>
          </button>
        </div>
        
        <!-- Year Input Overlay -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform -translate-y-4 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-4 opacity-0"
        >
          <div v-if="showYearInput" class="flex items-center gap-2">
            <input 
              type="number" 
              v-model="inputYear" 
              min="1900" 
              max="2100"
              class="w-32 px-4 py-2 rounded-xl border focus:ring-2 focus:ring-primary outline-none transition-all"
              :class="isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'"
              @keyup.enter="updateYear"
            />
            <button @click="updateYear" class="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20">Go</button>
          </div>
        </Transition>

        <p class="text-sm md:text-base opacity-50 max-w-lg font-medium leading-relaxed">
          Kalender pintar berbasis algoritma (1900-2100). Lengkap dengan penanggalan Hijriah, Jawa Pasaran, dan estimasi hari raya otomatis.
        </p>
      </div>

      <div class="flex items-center gap-2 p-1.5 rounded-3xl" :class="isDark ? 'bg-white/5' : 'bg-slate-100'">
        <button 
          v-for="y in [2024, 2025, 2026, 2027, 2028]" 
          :key="y"
          @click="$emit('update:year', y)"
          class="px-5 py-2.5 rounded-2xl text-xs font-black transition-all"
          :class="year === y 
            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
            : 'opacity-40 hover:opacity-100'"
        >
          {{ y }}
        </button>
      </div>
    </div>

    <!-- 12 Months Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      <CalendarMonth 
        v-for="month in 12" 
        :key="month" 
        :year="year" 
        :month="month - 1"
        @select-date="handleSelectDate"
      />
    </div>

    <!-- Date Detail Modal -->
    <DateDetailModal 
      :is-open="isModalOpen" 
      :date="selectedDate" 
      @close="isModalOpen = false" 
    />

    <!-- Date Detail Modal -->
    <DateDetailModal 
      :is-open="isModalOpen" 
      :date="selectedDate" 
      @close="isModalOpen = false" 
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  year: number
}>()

const emit = defineEmits(['update:year'])

const { isDark } = useColorMode()

const showYearInput = ref(false)
const inputYear = ref(props.year)
const isModalOpen = ref(false)
const selectedDate = ref<Date | null>(null)

function updateYear() {
  const y = parseInt(inputYear.value.toString())
  if (y >= 1900 && y <= 2100) {
    emit('update:year', y)
    showYearInput.value = false
  }
}

function handleSelectDate(date: Date) {
  selectedDate.value = date
  isModalOpen.value = true
}

watch(() => props.year, (newYear) => {
  inputYear.value = newYear
})
</script>

<style scoped>
.calendar-grid-container {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.glass-panel {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>

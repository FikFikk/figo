<template>
  <div class="border transition-all duration-200 font-mono"
    :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'"
  >
    <!-- Toggle Header -->
    <button @click="expanded = !expanded"
      class="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors border-b"
      :class="isDark ? 'border-neutral-800 hover:bg-neutral-800/30' : 'border-neutral-200 hover:bg-neutral-50'"
    >
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-base opacity-70">calendar_month</span>
        <h2 class="font-mono font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-white' : 'text-neutral-900'">
          GLOBAL ECONOMIC CALENDAR
        </h2>
      </div>
      <span class="material-symbols-outlined text-base transition-transform duration-200 opacity-60" 
        :class="expanded ? 'rotate-180' : ''"
      >expand_more</span>
    </button>
    
    <div v-if="expanded" class="p-5">
      <!-- Unlocked State (Click to Load) -->
      <div v-if="!isUnlocked && !loading" class="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
        <div class="w-10 h-10 border flex items-center justify-center mb-3"
          :class="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'"
        >
          <span class="material-symbols-outlined text-lg">calendar_month</span>
        </div>
        <h4 class="font-mono font-bold text-xs uppercase tracking-wider mb-1" :class="isDark ? 'text-white' : 'text-neutral-900'">
          MACROECONOMIC EVENTS
        </h4>
        <p class="text-[11px] opacity-60 mb-4 max-w-[280px]">Pantau inflasi, suku bunga, &amp; data makro global yang memicu volatilitas pasar.</p>
        <button @click="handleUnlock" 
          class="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all"
          :class="isDark 
            ? 'bg-white text-black border-white hover:bg-neutral-200' 
            : 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'"
        >
          LOAD CALENDAR
        </button>
      </div>

      <!-- Controls / Filters (Always shown after unlock) -->
      <div v-if="isUnlocked" class="flex flex-wrap items-center gap-2 mb-4 transition-opacity pb-4 border-b" 
        :class="[
          loading ? 'opacity-50 pointer-events-none' : '',
          isDark ? 'border-neutral-800' : 'border-neutral-200'
        ]"
      >
        <button v-for="f in countryFilters" :key="f.value"
          @click="filter = f.value"
          class="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all border"
          :class="filter === f.value
            ? (isDark ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900')
            : (isDark ? 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300')"
        >
          {{ f.label }}
        </button>
        
        <div class="flex items-center gap-2 p-1 border font-mono text-[10px]" 
          :class="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'"
        >
          <div class="flex items-center gap-1 px-1.5">
            <input type="date" v-model="startDate" 
              class="bg-transparent border-none text-[10px] font-mono font-bold focus:ring-0 p-0 w-24"
              :class="isDark ? 'text-neutral-300' : 'text-neutral-700'"
            />
          </div>
          <span class="opacity-40">→</span>
          <div class="flex items-center gap-1 px-1.5">
            <input type="date" v-model="endDate" 
              class="bg-transparent border-none text-[10px] font-mono font-bold focus:ring-0 p-0 w-24"
              :class="isDark ? 'text-neutral-300' : 'text-neutral-700'"
            />
          </div>
        </div>
        
        <button @click="fetchCalendar" 
          class="p-1.5 border transition-all"
          :class="isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'"
          :disabled="loading"
        >
          <span class="material-symbols-outlined text-sm" :class="loading ? 'animate-spin' : ''">refresh</span>
        </button>
      </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-4 py-4 border-t" :class="isDark ? 'border-white/5' : 'border-slate-100'">
          <div v-for="i in 5" :key="i" class="flex gap-4 animate-pulse">
            <div class="w-12 h-12 rounded-xl" :class="isDark ? 'bg-white/5' : 'bg-slate-50'"></div>
            <div class="flex-1 space-y-2 py-1">
              <div class="h-3 w-1/4 rounded" :class="isDark ? 'bg-white/5' : 'bg-slate-50'"></div>
              <div class="h-4 w-3/4 rounded" :class="isDark ? 'bg-white/5' : 'bg-slate-50'"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="py-10 text-center">
          <div class="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl">error</span>
          </div>
          <p class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-slate-900'">Gagal Memuat Data</p>
          <p class="text-xs opacity-50 mb-6">{{ error }}</p>
          
          <button @click="fetchCalendar" class="px-6 py-2 bg-primary text-white rounded-2xl text-xs font-bold hover:shadow-lg hover:shadow-primary/30 transition-all mb-6">
            Coba Lagi
          </button>

          <!-- RapidAPI Hint in Error State -->
          <div class="p-3 rounded-xl border border-dashed text-left max-w-[320px] mx-auto"
            :class="isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'"
          >
            <p class="text-[9px] font-bold text-red-500 uppercase mb-1">⚠️ Masalah Akses (403)</p>
            <p class="text-[10px] opacity-70 leading-relaxed" :class="isDark ? 'text-red-200' : 'text-red-700'">
              Jika error berlanjut, kemungkinan besar Anda belum mengaktifkan "Free Plan" di portal RapidAPI. Silakan klik <strong>"Subscribe"</strong> di halaman API tersebut.
            </p>
          </div>
        </div>

        <!-- Events List -->
        <div v-else-if="filteredEvents.length > 0" class="space-y-3">
          <div v-for="(event, idx) in filteredEvents" :key="event.id || idx"
            class="relative flex items-start gap-4 p-4 rounded-2xl transition-all group overflow-hidden border"
            :class="isDark ? 'hover:bg-white/5 border-white/5' : 'hover:bg-slate-50 border-transparent hover:border-slate-100'"
          >
            <!-- Impact Glow Background -->
            <div class="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.07]"
              :class="getImpactBg(event.volatility)"
            ></div>

            <!-- Left: Date/Time -->
            <div class="w-[50px] flex-shrink-0 text-center py-0.5">
              <p class="text-[11px] font-black leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ formatDay(event.date) }}
              </p>
              <p class="text-[9px] font-bold opacity-30">{{ formatMonth(event.date) }}</p>
              <div class="mt-2 text-[10px] font-mono font-bold" :class="isDark ? 'text-primary' : 'text-primary'">
                {{ formatTime(event.date) }}
              </div>
            </div>

            <!-- Middle: Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <!-- Flag placeholder/Country -->
                <span class="px-1.5 py-0.5 rounded text-[8px] font-black border"
                  :class="isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'"
                >
                  {{ event.country }}
                </span>
                <!-- Impact Badge -->
                <span class="text-[8px] font-black uppercase tracking-tighter" :class="getImpactClass(event.volatility)">
                  {{ event.volatility }} IMPACT
                </span>
              </div>
              <h4 class="text-xs md:text-sm font-bold leading-snug mb-2 line-clamp-2" :class="isDark ? 'text-gray-200' : 'text-slate-800'">
                {{ event.event }}
              </h4>
              
              <!-- Values Grid -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <p class="text-[9px] opacity-40 uppercase font-black tracking-tighter mb-0.5">Actual</p>
                  <p class="text-[11px] font-mono font-bold" :class="getActualColor(event)">
                    {{ event.actual || '--' }}
                  </p>
                </div>
                <div>
                  <p class="text-[9px] opacity-40 uppercase font-black tracking-tighter mb-0.5">Forecast</p>
                  <p class="text-[11px] font-mono font-bold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                    {{ event.forecast || '--' }}
                  </p>
                </div>
                <div>
                  <p class="text-[9px] opacity-40 uppercase font-black tracking-tighter mb-0.5">Previous</p>
                  <p class="text-[11px] font-mono font-bold opacity-50">
                    {{ event.previous || '--' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Right: Icon/Status -->
            <div class="flex-shrink-0 flex items-center justify-center pt-2">
              <span v-if="event.actual" class="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
              <span v-else class="material-symbols-outlined text-gray-300 dark:text-gray-700 text-lg">schedule</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="isUnlocked" class="py-16 text-center">
          <span class="material-symbols-outlined text-4xl opacity-10 mb-2">event_busy</span>
          <p class="text-xs opacity-40">Tidak ada event ekonomi penting dalam waktu dekat.</p>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen Kalender Ekonomi
 * Menampilkan data event ekonomi global dari RapidAPI
 * Dilengkapi dengan filter negara dan indikator dampak
 */
const { isDark } = useColorMode()
const expanded = ref(false)
const isUnlocked = ref(false)
const loading = ref(false)
const isFetching = ref(false)
const error = ref('')
const events = ref<any[]>([])
const filter = ref('ALL')
const endDate = ref(new Date().toISOString().split('T')[0])
const startDate = ref(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

function handleUnlock() {
  isUnlocked.value = true
  fetchCalendar()
}

watch([filter, startDate, endDate], () => {
  if (isUnlocked.value) {
    fetchCalendar()
  }
})

const countryFilters = [
  { label: '🌎 ALL', value: 'ALL' },
  { label: '🇮🇩 ID', value: 'ID' },
  { label: '🇺🇸 US', value: 'US' },
  { label: '🇬🇧 UK', value: 'GB' },
  { label: '🇩🇪 DE', value: 'DE' },
  { label: '🇯🇵 JP', value: 'JP' },
]

async function fetchCalendar() {
  if (isFetching.value) return
  isFetching.value = true
  loading.value = true
  error.value = ''
  try {
    const params: any = {
      startDate: startDate.value,
      endDate: endDate.value
    }
    if (filter.value !== 'ALL') {
      params.countryCode = filter.value
    }
    
    const data = await $fetch<any>('/api/stock/calendar', { params })
    
    // Konversi ke array yang lebih tangguh (menangani jika data berupa objek indeks)
    let raw: any[] = []
    if (Array.isArray(data)) {
      raw = data
    } else if (data && typeof data === 'object') {
      const possibleData = data.data
      if (Array.isArray(possibleData)) {
        raw = possibleData
      } else if (possibleData && typeof possibleData === 'object') {
        raw = Object.values(possibleData)
      } else if (data.success && !possibleData) {
        // Jika data benar-benar kosong tapi success
        raw = []
      }
    }
    
    events.value = raw.map((item: any) => ({
      id: item.id,
      date: item.dateUtc || item.date,
      country: item.countryCode || item.country,
      event: item.name || item.event,
      actual: item.actual,
      forecast: item.consensus || item.forecast,
      previous: item.previous,
      volatility: (item.volatility || 'LOW').toUpperCase(),
      unit: item.unit || ''
    }))
  } catch (err: any) {
    console.error('Economic Calendar error:', err)
    error.value = err?.data?.statusMessage || 'Gagal memuat kalender ekonomi'
  } finally {
    loading.value = false
    isFetching.value = false
  }
}

const filteredEvents = computed(() => {
  if (filter.value === 'ALL') return events.value
  return events.value.filter(e => e.country === filter.value)
})

// Hapus auto-fetch saat expand, ganti dengan manual unlock
watch(expanded, (val) => {
  if (!val) {
    // Optional: reset skip fetch if collapsed? 
  }
})

// Formatting Utilities
function formatDay(dateStr: string) {
  const d = new Date(dateStr)
  return d.getDate()
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function getImpactClass(vol: string) {
  if (vol === 'HIGH') return 'text-red-500'
  if (vol === 'MEDIUM') return 'text-amber-500'
  return 'text-blue-500'
}

function getImpactBg(vol: string) {
  if (vol === 'HIGH') return 'bg-red-500'
  if (vol === 'MEDIUM') return 'bg-amber-500'
  return 'bg-blue-500'
}

function getActualColor(event: any) {
  if (!event.actual || !event.forecast) return isDark.value ? 'text-white' : 'text-slate-900'
  
  // Basic comparison logic (might need unit parsing for better accuracy)
  const act = parseFloat(String(event.actual).replace(/[^\d.-]/g, ''))
  const forc = parseFloat(String(event.forecast).replace(/[^\d.-]/g, ''))
  
  if (isNaN(act) || isNaN(forc)) return isDark.value ? 'text-white' : 'text-slate-900'
  
  // Note: some indicators are "lower is better" but we keep it simple for now
  if (act > forc) return 'text-emerald-500'
  if (act < forc) return 'text-red-500'
  return isDark.value ? 'text-white' : 'text-slate-900'
}
</script>

<style scoped>
.glass-panel {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5) opacity(0.5);
  margin-left: 2px;
}

.dark input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.5);
}
</style>

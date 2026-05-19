<template>
  <div class="min-h-screen pt-24 pb-20 overflow-x-hidden transition-colors" :class="isDark ? 'bg-neutral-950 text-white' : 'bg-slate-50 text-slate-900'">
    <div class="px-6 md:px-8 max-w-4xl mx-auto space-y-8">
      
      <!-- TABS -->
      <CalendarTabs />

      <!-- TITLE -->
      <div>
        <h2 class="text-2xl font-bold font-headline mb-2">Kalkulator Hari</h2>
        <p class="opacity-60 text-sm">Alat untuk menghitung selisih hari antara dua tanggal atau menentukan tanggal berdasarkan jumlah hari dari tanggal tertentu.</p>
      </div>

      <!-- INTERNAL TABS -->
      <div class="flex p-1.5 rounded-2xl max-w-md mx-auto" :class="isDark ? 'bg-white/5' : 'bg-slate-200/50'">
        <button 
          @click="activeMode = 'selisih'"
          class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
          :class="activeMode === 'selisih' ? (isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') : 'opacity-50 hover:opacity-100'"
        >
          Selisih Hari
        </button>
        <button 
          @click="activeMode = 'hitung'"
          class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
          :class="activeMode === 'hitung' ? (isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') : 'opacity-50 hover:opacity-100'"
        >
          Hitung Tanggal
        </button>
      </div>

      <!-- SELISIH HARI CARD -->
      <div v-show="activeMode === 'selisih'" 
        class="rounded-3xl p-6 md:p-8 border shadow-sm transition-all"
        :class="isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100'"
      >
        <div class="mb-6">
          <h3 class="font-bold text-lg">Selisih Hari</h3>
          <p class="text-xs opacity-50">Pilih tanggal awal dan akhir untuk menghitung selisih hari</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-wider font-bold opacity-50 block">Tanggal Awal</label>
            <input 
              v-model="selisihStart"
              type="date" 
              class="w-full px-4 py-3 rounded-2xl border outline-none transition-colors"
              :class="isDark ? 'bg-white/5 border-white/10 focus:border-primary' : 'bg-slate-50 border-slate-200 focus:border-primary focus:bg-white'"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-wider font-bold opacity-50 block">Tanggal Akhir</label>
            <input 
              v-model="selisihEnd"
              type="date" 
              class="w-full px-4 py-3 rounded-2xl border outline-none transition-colors"
              :class="isDark ? 'bg-white/5 border-white/10 focus:border-primary' : 'bg-slate-50 border-slate-200 focus:border-primary focus:bg-white'"
            />
          </div>
        </div>

        <div class="rounded-2xl p-6 text-center border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
          <span class="text-xs font-bold opacity-50 mb-4 block">Hasil</span>
          <p class="text-sm opacity-70 mb-2">Selisih antara {{ formatSelisihStr(selisihStart) }} dan {{ formatSelisihStr(selisihEnd) }} adalah:</p>
          <div class="text-4xl font-black font-headline text-primary mb-2">
            {{ selisihResult }} hari
          </div>
          <p class="text-xs opacity-50" v-if="selisihResult === 0">Tanggal awal dan akhir adalah hari yang sama</p>
        </div>
      </div>

      <!-- HITUNG TANGGAL CARD -->
      <div v-show="activeMode === 'hitung'" 
        class="rounded-3xl p-6 md:p-8 border shadow-sm transition-all"
        :class="isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100'"
      >
        <div class="mb-6">
          <h3 class="font-bold text-lg">Hitung Tanggal</h3>
          <p class="text-xs opacity-50">Hitung tanggal berdasarkan penambahan atau pengurangan hari</p>
        </div>
        
        <div class="space-y-6 mb-8">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-wider font-bold opacity-50 block">Tanggal Awal</label>
            <input 
              v-model="hitungStart"
              type="date" 
              class="w-full px-4 py-3 rounded-2xl border outline-none transition-colors"
              :class="isDark ? 'bg-white/5 border-white/10 focus:border-primary' : 'bg-slate-50 border-slate-200 focus:border-primary focus:bg-white'"
            />
          </div>
          
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-wider font-bold opacity-50 block">Jumlah Hari</label>
            <div class="flex items-center gap-2">
              <button 
                @click="hitungDays = Number(hitungDays) - 1"
                class="w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xl hover:text-primary transition-colors"
                :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'"
              >
                -
              </button>
              <input 
                v-model.number="hitungDays"
                type="number" 
                class="flex-1 px-4 py-3 rounded-xl border outline-none transition-colors text-center font-bold"
                :class="isDark ? 'bg-white/5 border-white/10 focus:border-primary' : 'bg-slate-50 border-slate-200 focus:border-primary focus:bg-white'"
              />
              <button 
                @click="hitungDays = Number(hitungDays) + 1"
                class="w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xl hover:text-primary transition-colors"
                :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'"
              >
                +
              </button>
            </div>
            <p class="text-[10px] opacity-40">Masukkan angka positif (hari ke depan) atau negatif (hari ke belakang)</p>
          </div>
        </div>

        <div class="rounded-2xl p-6 text-center border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'">
          <span class="text-xs font-bold opacity-50 mb-4 block">Hasil</span>
          <p class="text-sm opacity-70 mb-2">{{ Math.abs(Number(hitungDays)) }} hari {{ Number(hitungDays) >= 0 ? 'setelah' : 'sebelum' }} {{ formatSelisihStr(hitungStart) }} adalah:</p>
          <div class="text-3xl font-black font-headline text-primary mb-1">
            {{ hitungResultDate }}
          </div>
          <p class="font-bold opacity-80">{{ hitungResultDay }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()

useSeoMeta({
  title: 'Kalkulator Hari & Selisih Tanggal Online — Hitung Hari Akurat — FiGo',
  ogTitle: 'Kalkulator Hari & Selisih Tanggal Online — FiGo',
  description: 'Hitung selisih hari antara dua tanggal atau tentukan tanggal berdasarkan jumlah hari dari tanggal tertentu. Kalkulator tanggal online akurat, gratis, dan mudah digunakan.',
  ogDescription: 'Kalkulator hari online: hitung selisih tanggal dan penambahan/pengurangan hari secara akurat.',
  twitterCard: 'summary_large_image',
})

const activeMode = ref<'selisih' | 'hitung'>('selisih')

// Default formatter
function formatDateInputValue(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const today = new Date()

// ========================
// SELISIH HARI
// ========================
const selisihStart = ref(formatDateInputValue(today))
const selisihEnd = ref(formatDateInputValue(today))

const selisihResult = computed(() => {
  const d1 = new Date(selisihStart.value)
  const d2 = new Date(selisihEnd.value)
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
  
  // Calculate difference without time biases
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

function formatSelisihStr(val: string) {
  const d = new Date(val)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ========================
// HITUNG TANGGAL
// ========================
const hitungStart = ref(formatDateInputValue(today))
const hitungDays = ref<number | string>(0)

const hitungResultComputedObj = computed(() => {
  const d1 = new Date(hitungStart.value)
  if (isNaN(d1.getTime())) return null
  
  const daysToAdd = parseInt(String(hitungDays.value)) || 0
  d1.setDate(d1.getDate() + daysToAdd)
  return d1
})

const hitungResultDate = computed(() => {
  const d = hitungResultComputedObj.value
  if (!d) return '-'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

const hitungResultDay = computed(() => {
  const d = hitungResultComputedObj.value
  if (!d) return '-'
  return d.toLocaleDateString('id-ID', { weekday: 'long' })
})
</script>

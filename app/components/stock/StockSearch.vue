<template>
  <div class="relative">
    <!-- Input Pencarian -->
    <div class="flex items-center gap-3">
      <div class="flex-1 relative">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl"
          :class="isDark ? 'text-gray-500' : 'text-slate-400'"
        >search</span>
        <input
          v-model="query"
          type="text"
          placeholder="Cari saham (cth: BBCA, TLKM, BBRI)..."
          class="w-full pl-12 pr-12 py-4 rounded-2xl text-sm font-medium transition-all outline-none"
          :class="isDark
            ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10 focus:border-primary/40'
            : 'bg-white text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-primary shadow-sm'"
          @input="onSearch"
          @focus="showDropdown = true"
          @keydown.escape="showDropdown = false"
          @keydown.enter="selectFirst"
        />
        <!-- Loading spinner -->
        <span v-if="loading" class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-lg animate-spin text-primary"
        >progress_activity</span>
        <!-- Clear button -->
        <button v-else-if="query" @click="clearSearch"
          class="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
        >
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>

    <!-- Dropdown hasil pencarian -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="showDropdown && query.length > 0"
        class="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto border"
        :class="isDark ? 'bg-[#1a1d28] border-white/10' : 'bg-white border-slate-200'"
      >
        <!-- Label: Hasil Pencarian -->
        <div class="px-4 pt-3 pb-2">
          <p class="text-[10px] font-black uppercase tracking-[0.2em]"
            :class="isDark ? 'text-gray-600' : 'text-slate-400'"
          >
            Hasil untuk "{{ query }}"
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isTyping || loading" class="px-4 py-8 text-center flex flex-col items-center justify-center">
          <span class="material-symbols-outlined text-primary animate-spin text-3xl mb-3 inline-block">progress_activity</span>
          <p class="text-xs font-bold opacity-70">{{ isTyping ? 'Menunggu...' : 'Mencari saham...' }}</p>
        </div>

        <!-- Daftar Saham -->
        <div v-else class="pb-2">
          <!-- Item Saham -->
          <button
            v-for="stock in displayList"
            :key="stock.symbol || stock.code"
            @click="selectStock(stock)"
            class="w-full px-4 py-3 flex items-center gap-3 transition-all"
            :class="isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'"
          >
            <!-- Ikon saham / Logo -->
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black bg-white overflow-hidden shadow-sm border"
              :class="isDark ? 'border-white/10' : 'border-slate-100'"
            >
              <img 
                v-if="!stock.logoError"
                :src="`https://assets.stockbit.com/logos/companies/${stock.symbol || stock.code}.png`" 
                :alt="stock.symbol || stock.code"
                class="w-full h-full object-contain p-1"
                @error="stock.logoError = true"
              />
              <span v-else :class="isDark ? 'text-slate-800' : 'text-slate-900'">
                {{ (stock.symbol || stock.code || '?').substring(0, 2) }}
              </span>
            </div>
            <div class="flex-1 text-left min-w-0">
              <div class="flex items-center gap-1.5">
                <p class="font-headline font-bold text-sm truncate"
                  :class="isDark ? 'text-white' : 'text-slate-900'"
                >{{ stock.symbol || stock.code }}</p>
                <!-- Badge IDX / Exchange -->
                <span v-if="stock.isIDX || stock.tag === 'IDX'" class="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">IDX</span>
                <span v-else-if="stock.tag" class="px-1.5 py-0.5 rounded text-[8px] font-black opacity-40 border"
                  :class="isDark ? 'border-white/10' : 'border-slate-200'"
                >{{ stock.tag }}</span>
              </div>
              <p class="text-[11px] truncate"
                :class="isDark ? 'text-gray-500' : 'text-slate-400'"
              >{{ stock.name || stock.company || '' }}</p>
            </div>
            <!-- Harga jika tersedia -->
            <div v-if="stock.close || stock.price" class="text-right flex-shrink-0">
              <p class="text-sm font-bold font-mono"
                :class="isDark ? 'text-white' : 'text-slate-900'"
              >{{ formatPrice(stock.close || stock.price) }}</p>
              <p v-if="stock.change !== undefined" class="text-[10px] font-bold"
                :class="(stock.change || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'"
              >{{ (stock.change || 0) >= 0 ? '+' : '' }}{{ formatPercent(stock.changePct || stock.percent || 0) }}%</p>
            </div>
          </button>

          <!-- Tidak ditemukan -->
          <div v-if="query.length > 0 && results.length === 0"
            class="px-4 py-8 text-center"
          >
            <span class="material-symbols-outlined text-3xl mb-2 block opacity-20">search_off</span>
            <p class="text-sm font-bold opacity-80">Saham "{{ query }}" tidak ditemukan</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Overlay untuk menutup dropdown -->
    <div v-if="showDropdown" class="fixed inset-0 z-40" @click="showDropdown = false"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * Komponen pencarian saham dengan autocomplete
 * Menampilkan trending stocks saat input kosong
 */
const emit = defineEmits<{
  select: [stock: any]
}>()

const { isDark } = useColorMode()
const { searchStock, loading } = useStockApi()

const query = ref('')
const results = ref<any[]>([])
const showDropdown = ref(false)
const isTyping = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Daftar yang ditampilkan: hasil pencarian
const displayList = computed(() => {
  return results.value
})

// Debounced search
function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  showDropdown.value = true
  isTyping.value = true

  if (query.value.trim().length < 1) {
    results.value = []
    isTyping.value = false
    return
  }

  // Debounce 2000ms
  searchTimeout = setTimeout(async () => {
    isTyping.value = false
    const data = await searchStock(query.value)

    // Yahoo Finance: mengembalikan array langsung [{symbol, name}]
    // RapidAPI IDX: mengembalikan { data: { data: { company: [...] } } }
    let items: any[] = []
    if (Array.isArray(data)) {
      items = data
    } else {
      const companies = extractSearchResults(data)
      items = companies
    }

    results.value = items.map((c: any) => ({
      symbol: c.symbol || c.name || c.code || '',
      name: c.name || c.longname || c.desc || c.description || c.company || '',
      ...c,
    }))
  }, 2000)
}

/**
 * Extract array dari berbagai format response API
 */
function extractArray(data: any): any[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.data) {
    if (Array.isArray(data.data)) return data.data
    if (data.data.data && Array.isArray(data.data.data)) return data.data.data
  }
  return []
}

/**
 * Extract hasil search dari format { data: { data: { company: [...] } } }
 */
function extractSearchResults(data: any): any[] {
  if (!data) return []
  // Format: { success, data: { data: { company: [...] } } }
  if (data?.data?.data?.company) return data.data.data.company
  if (data?.data?.company) return data.data.company
  // Fallback
  return extractArray(data)
}

// Pilih saham
function selectStock(stock: any) {
  query.value = stock.symbol || stock.code || ''
  showDropdown.value = false
  emit('select', stock)
}

// Pilih saham pertama dari daftar (Enter)
function selectFirst() {
  if (displayList.value.length > 0) {
    selectStock(displayList.value[0])
  }
}

// Bersihkan pencarian
function clearSearch() {
  query.value = ''
  results.value = []
  showDropdown.value = false
}

// Format harga ke Rupiah
function formatPrice(price: number): string {
  if (!price) return '-'
  return new Intl.NumberFormat('id-ID').format(price)
}

// Format persen
function formatPercent(pct: number): string {
  return (pct || 0).toFixed(2)
}
</script>

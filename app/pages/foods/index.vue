<template>
  <div class="foods-page" :class="isDark ? 'dark-mode' : 'light-mode'">
    <!-- Header Section -->
    <header class="page-header max-w-5xl mx-auto px-6 pt-24 pb-8 flex flex-col items-center text-center">
      <h1 class="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-2">
        The Nutrition Index
      </h1>
      <p class="text-sm md:text-base text-secondary max-w-xl opacity-70">
        A curated registry of high-fidelity nutritional data.
      </p>
    </header>

    <!-- Controls Container -->
    <div class="sticky-controls top-0 z-10 transition-colors duration-300">
      <div class="max-w-5xl mx-auto px-6 py-6 flex justify-center">
        
        <!-- Search Bar -->
        <div class="search-wrap w-full">
          <div class="relative group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for products, ingredients, or brands..."
              class="search-input"
              @input="onSearchInput"
            />
            <div class="search-underline"></div>
            <span class="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none transition-colors group-focus-within:text-primary text-lg opacity-50 group-focus-within:opacity-100">
              search
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-[1400px] mx-auto px-6 py-10 min-h-[600px]">
      <!-- Loading State -->
      <div v-if="pending" class="food-grid">
        <div v-for="i in 10" :key="i" class="skeleton-card h-64 rounded-xl animate-pulse"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error/10 text-error mb-4">
          <span class="material-symbols-outlined">error</span>
        </div>
        <p class="text-secondary font-medium mb-4">Index connection timed out</p>
        <button @click="refresh()" class="btn-outline-small">
          Reconnect
        </button>
      </div>

      <!-- Grid Layout -->
      <div v-else-if="foods.length > 0">
        <div class="food-grid">
          <div 
            v-for="food in foods" 
            :key="food.code" 
            class="food-card group"
          >
            <div class="card-inner">
              <!-- Image Section -->
              <div class="image-box">
                <img 
                  v-if="food.imageUrl" 
                  :src="food.imageUrl" 
                  :alt="food.name"
                  class="food-img"
                  loading="lazy"
                  @error="handleImgError"
                />
                <div v-else class="img-placeholder">
                  <span class="material-symbols-outlined text-3xl opacity-10">fastfood</span>
                </div>
                
                <!-- Nutriscore Badge (Pill style) -->
                <div v-if="food.nutriscoreGrade && ['a', 'b', 'c', 'd', 'e'].includes(food.nutriscoreGrade.toLowerCase())" class="nutriscore-pill" :class="'pill-' + food.nutriscoreGrade">
                  <span class="pill-text">Nutri-Score</span>
                  <span class="pill-circle">{{ food.nutriscoreGrade.toUpperCase() }}</span>
                </div>
              </div>

              <!-- Info Section -->
              <div class="info-box">
                <div class="text-center mb-1">
                  <h3 class="product-name font-serif text-[15px] font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {{ food.name }}
                  </h3>
                </div>

                <p class="brand-name text-[9px] text-center font-bold uppercase tracking-wider text-secondary mb-4 line-clamp-1">{{ food.brand || 'Global Brand' }}</p>

                <!-- Nutrition Facts -->
                <div class="nutrition-strip">
                  <div class="nut-item">
                     <span class="val">{{ food.nutrients.kcal ?? '--' }}</span>
                     <span class="lab">KCAL</span>
                  </div>
                  <div class="nut-item">
                     <span class="val">{{ food.nutrients.protein ?? '0' }}g</span>
                     <span class="lab">PROTEIN</span>
                  </div>
                  <div class="nut-item">
                     <span class="val">{{ food.nutrients.fat ?? '0' }}g</span>
                     <span class="lab">FAT</span>
                  </div>
                  <div class="nut-item">
                     <span class="val">{{ food.nutrients.carbs ?? '0' }}g</span>
                     <span class="lab">CARBS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Area -->
        <div v-if="totalPages > 1 && !pending && !error" class="mt-16 pt-8 border-t border-black/5 dark:border-white/5">
          <!-- Results Summary -->
          <div class="text-center mb-6 opacity-30 text-[10px] font-black uppercase tracking-widest">
            Showing {{ fromCount }} to {{ toCount }} of {{ totalCount.toLocaleString() }} results
          </div>

          <div class="pagination-area flex items-center justify-between">
            <button 
              class="btn-nav" 
              :disabled="currentPage <= 1"
              @click="goToPage(currentPage - 1)"
            >
              <span class="material-symbols-outlined text-lg">arrow_back</span>
              Sebelumnya
            </button>
            
            <div class="hidden md:flex items-center gap-1">
              <template v-for="p in visiblePages" :key="p">
                <span v-if="p === '...'" class="px-2 opacity-20">...</span>
                <button 
                  v-else 
                  class="page-dot"
                  :class="{ 'active': p === currentPage }"
                  @click="goToPage(p as number)"
                >
                  {{ p }}
                </button>
              </template>
            </div>

            <button 
              class="btn-nav" 
              :disabled="currentPage >= totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Berikutnya
              <span class="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!pending" class="text-center py-20">
        <span class="material-symbols-outlined text-4xl opacity-10 mb-4">search_off</span>
        <p class="text-secondary text-sm">No results found in this region</p>
        <button @click="clearSearch" class="btn-outline-small mt-4">
          Reset Search
        </button>
      </div>
    </main>

    <!-- Footer Space -->
    <footer class="py-12 text-center opacity-20 text-[9px] font-black uppercase tracking-[0.4em]">
      The Nutrition Index • Open Food Data Node
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * Food Nutrition Index Page
 * Premium design based on high-fidelity nutritional registry references.
 */

useSeoMeta({
  title: 'The Nutrition Index — FiGo Nutrition',
  description: 'Explore a curated registry of high-fidelity nutritional data from across the globe.',
})

const { isDark } = useColorMode()
const route = useRoute()
const router = useRouter()

// State
const currentPage = ref(Number(route.query.page) || 1)
const searchQuery = ref((route.query.search as string) || '')
const debouncedSearch = ref(searchQuery.value)
let searchTimeout: any = null

// Data Fetching
const { data, pending, error, refresh } = await useFetch('/api/foods', {
  query: computed(() => ({
    page: currentPage.value,
    limit: 20,
    search: debouncedSearch.value,
  })),
  watch: [currentPage, debouncedSearch],
})

const foods = computed(() => data.value?.foods || [])
const totalCount = computed(() => data.value?.total || 0)
const totalPages = computed(() => data.value?.totalPages || 1)

const fromCount = computed(() => totalCount.value === 0 ? 0 : (currentPage.value - 1) * 20 + 1)
const toCount = computed(() => Math.min(currentPage.value * 20, totalCount.value))

// Interactivity
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = searchQuery.value
    currentPage.value = 1
    updateRoute()
  }, 1000)
}

function clearSearch() {
  searchQuery.value = ''
  debouncedSearch.value = ''
  currentPage.value = 1
  updateRoute()
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  updateRoute()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function updateRoute() {
  router.replace({
    query: {
      ...route.query,
      page: currentPage.value > 1 ? currentPage.value : undefined,
      search: searchQuery.value || undefined,
    }
  })
}

function handleImgError(e: any) {
  e.target.style.display = 'none'
  e.target.parentElement.classList.add('no-img')
}

// Pagination display logic
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const tp = totalPages.value
  const cp = currentPage.value
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('...')
    const start = Math.max(2, cp - 1)
    const end = Math.min(tp - 1, cp + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (cp < tp - 2) pages.push('...')
    pages.push(tp)
  }
  return pages
})
</script>

<style scoped>
.foods-page {
  transition: background-color 0.4s ease;
  min-height: 100vh;
}

/* Typography */
.font-serif {
  font-family: 'Playfair Display', serif;
}

/* Header */
.light-mode { background: #fdfdfd; color: #1a1a1a; }
.dark-mode { background: #111418; color: #e1e1e1; } /* Darker background matching screenshot */

.text-secondary {
  color: inherit;
  opacity: 0.6;
}

/* Controls */
.sticky-controls {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
.light-mode .sticky-controls { background: rgba(253, 253, 253, 0.85); }
.dark-mode .sticky-controls { background: rgba(17, 20, 24, 0.85); }

/* Search */
.search-input {
  width: 100%;
  background: transparent;
  border: none;
  padding: 8px 0;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  color: inherit;
  opacity: 0.8;
}
.search-input::placeholder {
  opacity: 0.5;
}
.search-underline {
  height: 1px;
  background: currentColor;
  opacity: 0.2;
  transition: all 0.3s;
}
.search-input:focus + .search-underline { opacity: 0.8; }

/* Food Grid - 5 columns */
.food-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (min-width: 768px) {
  .food-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
}
@media (min-width: 1024px) {
  .food-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
}

.food-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
  background: #ffffff;
  color: #1a1a1a;
}
.dark-mode .food-card { background: #1c2128; border-color: transparent; color: #ffffff; }

.food-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
.light-mode .food-card:hover { box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

.card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Image Box */
.image-box {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #d4cfc3; /* Matches the beige background in screenshot for images */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.dark-mode .image-box { background: #262c33; }

.food-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 16px;
  transition: transform 0.6s ease;
  filter: drop-shadow(0 10px 10px rgba(0,0,0,0.2));
}
.food-card:hover .food-img { transform: scale(1.04); }

/* Nutriscore Pill */
.nutriscore-pill {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ffffff;
  color: #111;
  border-radius: 99px;
  padding: 3px 4px 3px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 8px;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.pill-text {
  opacity: 0.9;
  letter-spacing: -0.02em;
}
.pill-circle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 900;
  color: #fff;
}
.pill-a .pill-circle { background: #008143; }
.pill-b .pill-circle { background: #85bb2f; }
.pill-c .pill-circle { background: #fecb02; color: #000; }
.pill-d .pill-circle { background: #ee8100; }
.pill-e .pill-circle { background: #e63e11; }

/* Info Box */
.info-box {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Nutrition Strip */
.nutrition-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-top: auto;
}

.nut-item {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  background: #d4cfc3;
  border-radius: 4px;
  text-align: center;
  color: #111;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.dark-mode .nut-item { background: #262c33; color: #fff; }

.val { font-size: 11px; font-weight: 800; line-height: 1.1; }
.lab { font-size: 7px; font-weight: 800; opacity: 0.6; margin-top: 2px; }

/* Pagination */
.btn-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(0,0,0,0.1);
  transition: all 0.2s;
}
.dark-mode .btn-nav { border-color: rgba(255,255,255,0.1); }

.btn-nav:hover:not(:disabled) {
  background: rgba(0,0,0,0.05);
}
.dark-mode .btn-nav:hover:not(:disabled) { background: rgba(255,255,255,0.05); }

.btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }

.page-dot {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.page-dot:hover { background: rgba(0,0,0,0.05); }
.dark-mode .page-dot:hover { background: rgba(255,255,255,0.05); }

.page-dot.active { background: #000; color: #fff; }
.dark-mode .page-dot.active { background: #fff; color: #000; }

/* Utils */
.no-scrollbar::-webkit-scrollbar { display: none; }
.skeleton-card { background: rgba(0,0,0,0.05); }
.dark-mode .skeleton-card { background: rgba(255,255,255,0.05); }

.btn-outline-small {
  padding: 8px 24px;
  border-radius: 99px;
  border: 1px solid currentColor;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}
</style>

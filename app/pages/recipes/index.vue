<template>
  <div class="recipe-list-page" :class="isDark ? 'dark-mode' : 'light-mode'">
    
    <!-- Header -->
    <div class="header">
      <h1 class="header-title">Resep Nusantara</h1>
      <p class="header-sub">Koleksi {{ total.toLocaleString('id-ID') }} Resep Asli Indonesia</p>
    </div>

    <!-- Search -->
    <div class="search-wrap">
      <div class="search-box">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari resep favormu..."
          class="search-input"
          @input="onSearchInput"
        />
        <button v-if="searchQuery" @click="clearSearch" class="search-clear">
          <span class="material-symbols-outlined" style="font-size:16px">close</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="state-center">
      <div class="spinner"></div>
      <p class="state-text">Memuat resep...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-center">
      <p class="state-text" style="color:#ef4444">Gagal memuat data</p>
      <button @click="refresh()" class="btn-outline" style="margin-top:12px">Coba Lagi</button>
    </div>

    <!-- Grid -->
    <div v-else class="grid">
      <NuxtLink
        v-for="recipe in recipes"
        :key="recipe.idx"
        :to="`/recipes/${recipe.idx}`"
        class="card"
      >
        <!-- Ikon kecil di kiri atas -->
        <span class="card-emoji">{{ getIcon(recipe.idx) }}</span>

        <!-- Judul resep -->
        <h3 class="card-title">{{ recipe.title }}</h3>

        <!-- Meta info -->
        <div class="card-meta">
          <span class="meta-item">
            <span class="material-symbols-outlined meta-icon">grocery</span>
            {{ recipe.numIngredients }} BAHAN
          </span>
          <span class="meta-item">
            <span class="material-symbols-outlined meta-icon">format_list_numbered</span>
            {{ recipe.numSteps }} LANGKAH
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty -->
    <div v-if="!pending && recipes.length === 0 && debouncedSearchQuery" class="state-center">
      <p class="state-text">Resep tidak ditemukan</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && !pending && !error" class="pagination">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1" class="page-btn">
        <span class="material-symbols-outlined" style="font-size:16px">chevron_left</span>
      </button>
      <template v-for="p in visiblePages" :key="p">
        <span v-if="p === '...'" class="page-dots">...</span>
        <button v-else @click="goToPage(p as number)" class="page-btn" :class="{ active: p === currentPage }">{{ p }}</button>
      </template>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="page-btn">
        <span class="material-symbols-outlined" style="font-size:16px">chevron_right</span>
      </button>
      <span class="page-info">Hal {{ currentPage }} / {{ totalPages.toLocaleString('id-ID') }}</span>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>© {{ new Date().getFullYear() }} Resep Nusantara</span>
      <div class="footer-links">
        <span>Tentang Kami</span>
        <span>Kontak</span>
        <span>Syarat & Ketentuan</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
/**
 * Halaman daftar resep - card compact: ikon kecil di kiri atas, judul besar
 */
useSeoMeta({
  title: 'Resep Nusantara — FiGo',
  description: 'Koleksi 66.000+ resep masakan Indonesia lengkap dengan bahan dan langkah memasak.',
})

const { isDark } = useColorMode()
const route = useRoute()
const router = useRouter()

const foodIcons = ['🍳', '🍲', '🍛', '🥘', '🫕', '🍜', '🥗', '🍝', '🍤', '🥩', '🍗', '🐟', '🥚', '🧆', '🌮', '🍙', '🍚', '🥟', '🫔', '🍢']

function getIcon(idx: number) {
  return foodIcons[idx % foodIcons.length]
}

// State
const currentPage = ref(Number(route.query.page) || 1)
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Fetch
const { data, pending, error, refresh } = await useFetch('/api/recipes', {
  query: computed(() => ({
    page: currentPage.value,
    limit: 20,
    search: debouncedSearchQuery.value,
  })),
  watch: [currentPage, debouncedSearchQuery],
})

const recipes = computed(() => data.value?.recipes || [])
const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => data.value?.totalPages || 1)

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

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  router.replace({ query: { ...route.query, page: page > 1 ? page : undefined } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = searchQuery.value
    currentPage.value = 1
  }, 2000)
}

function clearSearch() {
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  currentPage.value = 1
}
</script>

<style scoped>
.recipe-list-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 100px 24px 60px;
  min-height: 100vh;
  color: #e8e8e8;
}

/* Header */
.header { text-align: center; margin-bottom: 20px; }
.header-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 32px;
  font-weight: 700;
  color: #f0ebe0;
  margin: 0 0 4px;
}
.header-sub { font-size: 12px; color: #888; margin: 0; }

/* Search */
.search-wrap { max-width: 480px; margin: 0 auto 28px; }
.search-box { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; font-size: 18px; color: #555; }
.search-input {
  width: 100%;
  padding: 10px 36px 10px 40px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #333;
  color: #ccc;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}
.search-input::placeholder { color: #555; }
.search-input:focus { border-bottom-color: #888; }
.search-clear {
  position: absolute; right: 4px;
  background: none; border: none; color: #555; cursor: pointer; padding: 4px; display: flex;
}
.search-clear:hover { color: #aaa; }

/* Grid — 4 kolom */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .grid { grid-template-columns: 1fr; } }

/* Card — compact, ikon kecil kiri atas */
.card {
  background: #222;
  border: 1px solid #2e2e2e;
  border-radius: 10px;
  padding: 14px 16px 16px;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: border-color 0.2s, transform 0.15s;
}
.card:hover {
  border-color: #444;
  transform: translateY(-2px);
}
.card-emoji {
  font-size: 28px;
  line-height: 1;
  margin-bottom: 12px;
  filter: drop-shadow(0 1px 4px rgba(0,0,0,0.4));
}
.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #f0ebe0;
  margin: 0 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 600;
  color: #777;
  letter-spacing: 0.03em;
}
.meta-icon {
  font-size: 12px;
  color: #666;
}

/* States */
.state-center { display: flex; flex-direction: column; align-items: center; padding: 80px 0; }
.state-text { font-size: 13px; color: #666; }
.spinner {
  width: 32px; height: 32px;
  border: 2px solid #333; border-top-color: #888; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 40px; }
.page-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid #333; border-radius: 6px; background: transparent;
  color: #888; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #555; color: #e8e8e8; }
.page-btn:disabled { opacity: 0.2; cursor: not-allowed; }
.page-btn.active { background: #e8e8e8; color: #111; border-color: #e8e8e8; }
.page-dots { font-size: 12px; color: #555; padding: 0 4px; }
.page-info { font-size: 10px; color: #555; margin-left: 8px; }

/* Button */
.btn-outline {
  padding: 8px 16px; border: 1px solid #444; border-radius: 6px;
  background: transparent; color: #ccc; font-size: 12px; font-weight: 600; cursor: pointer;
}
.btn-outline:hover { border-color: #888; color: #fff; }

/* Footer */
.footer {
  margin-top: 48px; padding-top: 20px; border-top: 1px solid #222;
  display: flex; align-items: center; justify-content: space-between;
  font-size: 10px; color: #444;
}
.footer-links { display: flex; gap: 16px; }
@media (max-width: 640px) { .footer { flex-direction: column; gap: 8px; } }

/* ======= LIGHT MODE ======= */
.light-mode { color: #333; }
.light-mode .header-title { color: #1a1a1a; }
.light-mode .header-sub { color: #999; }
.light-mode .search-input { border-bottom-color: #ddd; color: #333; }
.light-mode .search-input::placeholder { color: #aaa; }
.light-mode .search-input:focus { border-bottom-color: #666; }
.light-mode .search-icon { color: #bbb; }
.light-mode .card { background: #fff; border-color: #e8e8e8; }
.light-mode .card:hover { border-color: #ccc; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.light-mode .card-title { color: #1a1a1a; }
.light-mode .meta-item { color: #999; }
.light-mode .meta-icon { color: #bbb; }
.light-mode .page-btn { border-color: #ddd; color: #888; }
.light-mode .page-btn:hover:not(:disabled) { border-color: #999; color: #333; }
.light-mode .page-btn.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
.light-mode .page-dots { color: #ccc; }
.light-mode .page-info { color: #bbb; }
.light-mode .footer { border-top-color: #eee; color: #bbb; }
.light-mode .spinner { border-color: #e5e5e5; border-top-color: #999; }
</style>

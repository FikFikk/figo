<template>
  <div class="stream-root">

    <!-- ═══ PIN GATE ═══ -->
    <div v-if="!unlocked" class="pin-gate">
      <div class="pin-card">
        <div class="pin-icon">🔒</div>
        <h2 class="pin-title">FiGo Bioskop</h2>
        <p class="pin-subtitle">Masukkan PIN untuk mengakses</p>
        <div class="pin-input-wrap">
          <input
            v-model="pinInput"
            type="password"
            inputmode="numeric"
            maxlength="10"
            placeholder="Masukkan PIN..."
            class="pin-input"
            autofocus
            @keyup.enter="submitPin"
          />
        </div>
        <p v-if="pinError" class="pin-error">{{ pinError }}</p>
        <button class="pin-submit" :disabled="pinLoading" @click="submitPin">
          <span v-if="pinLoading">Memverifikasi...</span>
          <span v-else>Masuk →</span>
        </button>
      </div>
    </div>

    <!-- ═══ MAIN APP (hanya tampil setelah unlock) ═══ -->
    <template v-else>

    <!-- ═══ SEARCH BAR ═══ -->
    <div class="search-bar">
      <div class="search-inner">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchSource === 'lk21' ? 'Cari film Indonesia di LK21...' : 'Cari film, series, anime...'"
          class="search-input"
          @input="onSearch"
        />
        <button v-if="searchQuery" class="search-clear" @click="clearSearch">✕</button>
      </div>
    </div>

    <!-- ═══ SEARCH FILTER SIDEBAR ═══ -->
    <Transition name="slide-right">
      <div v-if="isSearchActive" class="filter-sidebar">
        <h3 class="filter-title">Filter</h3>
        
        <div class="filter-group">
          <label class="filter-label">Kategori</label>
          <div class="category-tabs">
            <button 
              :class="['cat-tab', { active: searchFilters.category === 'all' }]" 
              @click="searchFilters.category = 'all'; applyFilters()"
            >Semua</button>
            <button 
              :class="['cat-tab', { active: searchFilters.category === 'movie' }]" 
              @click="searchFilters.category = 'movie'; applyFilters()"
            >Film</button>
            <button 
              :class="['cat-tab', { active: searchFilters.category === 'series' }]" 
              @click="searchFilters.category = 'series'; applyFilters()"
            >Series</button>
            <button 
              :class="['cat-tab', { active: searchFilters.category === 'anime' }]" 
              @click="searchFilters.category = 'anime'; applyFilters()"
            >Anime</button>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Genre</label>
          <select v-model="searchFilters.genre" class="filter-select" @change="applyFilters">
            <option value="">Semua Genre</option>
            <option value="action">Action</option>
            <option value="comedy">Comedy</option>
            <option value="drama">Drama</option>
            <option value="horror">Horror</option>
            <option value="romance">Romance</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="thriller">Thriller</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Tahun</label>
          <select v-model="searchFilters.year" class="filter-select" @change="applyFilters">
            <option value="">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
        </div>

        <button class="filter-reset" @click="resetFilters">Reset Filter</button>
      </div>
    </Transition>

    <!-- ═══ SEARCH RESULTS ═══ -->
    <template v-if="searchQuery.length > 1">
      <div v-if="searchLoading" class="center-loader"><span class="loader-spin"/></div>
      <div v-else-if="searchResults.length" class="search-results-grid" :class="{ 'with-sidebar': isSearchActive }">
        <div
          v-for="item in searchResults"
          :key="item.id + item.type"
          class="poster-card"
          @click="openDetail(item)"
        >
          <div class="poster-wrap">
            <img :src="item.poster" :alt="item.title" class="poster-img" loading="lazy" />
            <div class="poster-type-badge">{{ item.type === 'movie' ? 'FILM' : item.type === 'series' ? 'SERIES' : 'ANIME' }}</div>
            <!-- Badge sumber: LK21 vs TMDB -->
            <div v-if="(item as any).source === 'lk21'" class="poster-source-badge">ID</div>
            <div class="poster-overlay">
              <div class="poster-rating">★ {{ item.rating || 'N/A' }}</div>
            </div>
          </div>
          <div class="poster-title">{{ item.title }}</div>
          <div class="poster-year">{{ item.year }}</div>
        </div>
      </div>
      <!-- Load More -->
      <div v-if="searchResults.length && searchHasMore" class="load-more-wrap">
        <button class="load-more-btn" :disabled="searchLoadingMore" @click="loadMoreResults">
          <span v-if="searchLoadingMore" class="loader-spin small" />
          <span v-else>Muat Lebih Banyak</span>
        </button>
      </div>
      <div v-else-if="!searchLoading && !searchResults.length" class="empty-state">Tidak ada hasil untuk "{{ searchQuery }}"</div>
    </template>

    <!-- ═══ MAIN CONTENT (home) ═══ -->
    <template v-else>
      <!-- Hero Banner -->
      <div v-if="hero" class="hero" :style="{ backgroundImage: `url(${hero.backdrop})` }">
        <div class="hero-gradient"/>
        <div class="hero-content">
          <div class="hero-meta">
            <span class="hero-badge">{{ hero.type === 'movie' ? 'FILM' : hero.type === 'tv' ? 'SERIES' : 'SERIES' }}</span>
            <span class="hero-rating">★ {{ hero.rating }}</span>
            <span class="hero-year">{{ hero.year }}</span>
          </div>
          <h1 class="hero-title">{{ hero.title }}</h1>
          <p class="hero-summary">{{ hero.summary?.slice(0, 140) }}{{ hero.summary?.length > 140 ? '...' : '' }}</p>
          <div class="hero-actions">
            <button class="btn-play" @click="openDetail(hero)">
              <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon"><polygon points="5,3 19,12 5,21"/></svg>
              Putar
            </button>
            <button class="btn-info" @click="openDetail(hero)">
              <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              Info
            </button>
          </div>
        </div>
      </div>

      <!-- Rows -->
      <div class="rows-container">
        <div v-for="row in rows" :key="row.key" class="content-row">
          <h2 class="row-title">{{ row.label }}</h2>
          <div v-if="row.loading" class="row-loading">
            <div v-for="i in 6" :key="i" class="skeleton-card"/>
          </div>
          <div v-else-if="row.items.length" class="row-scroll">
            <div
              v-for="item in row.items"
              :key="item.id + item.type"
              class="poster-card"
              @click="openDetail(item)"
            >
              <div class="poster-wrap">
                <img :src="item.poster" :alt="item.title" class="poster-img" loading="lazy" />
                <div class="poster-overlay">
                  <div class="poster-rating">★ {{ item.rating }}</div>
                </div>
              </div>
              <div class="poster-title">{{ item.title }}</div>
              <div class="poster-year">{{ item.year }}</div>
            </div>
          </div>
          <div v-else class="row-empty">Gagal memuat</div>
        </div>
      </div>
    </template>

    <!-- ═══ DETAIL MODAL ═══ -->
    <Transition name="modal-fade">
      <div v-if="detail" class="modal-backdrop" @click.self="closeDetail">
        <div class="modal-box">
          <!-- Hero backdrop -->
          <div class="modal-hero" :style="detail.movie?.backdrop ? { backgroundImage: `url(${detail.movie.backdrop})` } : {}">
            <div class="modal-hero-gradient"/>
            <button class="modal-close" @click="closeDetail">✕</button>
            <div class="modal-hero-info">
              <h2 class="modal-title">{{ detail.movie?.title }}</h2>
              <div class="modal-meta">
                <span class="meta-rating">★ {{ detail.movie?.rating }}</span>
                <span class="meta-year">{{ detail.movie?.year }}</span>
                <span v-if="detail.movie?.runtime" class="meta-dur">{{ detail.movie.runtime }} mnt</span>
                <span v-if="detail.movie?.seasons" class="meta-dur">{{ detail.movie.seasons }} Season</span>
                <span v-if="detail.movie?.status" class="meta-status">{{ detail.movie.status }}</span>
              </div>
              <div v-if="detail.movie?.genres?.length" class="modal-genres">
                <span v-for="g in detail.movie.genres" :key="g" class="genre-chip">{{ g }}</span>
              </div>
              <p class="modal-summary">{{ detail.movie?.summary }}</p>
              <button class="btn-play modal-play-btn" @click="startPlayer">
                <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon"><polygon points="5,3 19,12 5,21"/></svg>
                {{ detail.movie?.type === 'movie' ? 'Putar Film' : 'Putar S01E01' }}
              </button>
            </div>
          </div>

          <!-- Cast -->
          <div v-if="detail.cast?.length" class="cast-section">
            <h3 class="section-title">Pemeran</h3>
            <div class="cast-scroll">
              <div v-for="c in detail.cast" :key="c.id" class="cast-card">
                <img v-if="c.photo" :src="c.photo" :alt="c.name" class="cast-photo" />
                <div v-else class="cast-photo cast-placeholder">{{ c.name[0] }}</div>
                <div class="cast-name">{{ c.name }}</div>
                <div class="cast-char">{{ c.character }}</div>
              </div>
            </div>
          </div>

          <!-- Episodes (series) -->
          <div v-if="detail.movie?.type === 'series' || detail.movie?.type === 'tv'" class="episodes-section">
            <h3 class="section-title">Episode</h3>
            <!-- Season pills -->
            <div v-if="detail.movie?.seasons > 1" class="season-pills">
              <button
                v-for="s in detail.movie.seasons"
                :key="s"
                :class="['season-pill', { active: activeSeason === s }]"
                @click="selectSeason(s)"
              >Season {{ s }}</button>
            </div>
            <!-- Episode list -->
            <div v-if="episodesLoading" class="center-loader"><span class="loader-spin"/></div>
            <div v-else class="episode-list">
              <div
                v-for="ep in episodes"
                :key="ep.ep"
                :class="['ep-row', { 'ep-active': activeEp?.ep === ep.ep }]"
                @click="playEp(ep)"
              >
                <div v-if="ep.still" class="ep-thumb">
                  <img :src="ep.still" :alt="ep.title" loading="lazy" />
                  <svg class="ep-thumb-play" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                </div>
                <div v-else class="ep-num">E{{ ep.ep }}</div>
                <div class="ep-info">
                  <div class="ep-title">{{ ep.title || `Episode ${ep.ep}` }}</div>
                  <div class="ep-desc">{{ ep.overview }}</div>
                </div>
                <svg class="ep-play-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══ PLAYER MODAL ═══ -->
    <Transition name="modal-fade">
      <div v-if="playerUrl || streamLoading" class="player-backdrop" @click.self="closePlayer">
        <div class="player-box">
          <button class="player-close" @click="closePlayer">✕</button>
          <div class="player-title">
            {{ playerLabel }}
          </div>
          <div class="player-wrap">
            <!-- Loading Overlay -->
            <div v-if="streamLoading" class="player-loading-overlay">
              <span class="loader-spin large" />
              <p class="loading-text">Menyiapkan stream FiGo Proxy...</p>
            </div>
            <!-- HLS Native Video Player -->
            <video
              v-else-if="playerUrl && playerUrl.includes('.m3u8')"
              :src="playerUrl"
              class="player-frame"
              controls
              autoplay
              playsinline
            />
            <!-- Iframe Embed Player -->
            <iframe
              v-else-if="playerUrl"
              :src="playerUrl"
              class="player-frame"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            />
          </div>
          <!-- Fallback sources -->
          <div v-if="!streamLoading" class="player-sources">
            <span class="sources-label">Sumber lain:</span>
            <button
              v-for="src in altSources"
              :key="src.name"
              :class="['src-btn', { active: activeSrc === src.name }]"
              @click="switchSource(src)"
            >{{ src.name }}</button>
          </div>
          <!-- Scraper logs -->
          <div v-if="scrapingLogs.length" class="scraper-logs">
            <div class="logs-header">📋 Log Proses Ekstraksi Scraper:</div>
            <div class="logs-body">
              <div v-for="(log, idx) in scrapingLogs" :key="idx" class="log-line">{{ log }}</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    </template><!-- end v-else unlocked -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

// ─── Types ───────────────────────────────────────────────────────────────────
interface CatalogItem {
  id: number
  title: string
  year: string
  rating: number
  poster: string
  backdrop: string
  summary: string
  type: string // 'movie' | 'series' | 'tv'
  seasons?: number
}

interface Detail {
  movie: CatalogItem & { runtime?: number; genres?: string[]; status?: string; tagline?: string; seasons?: number; episodes?: number }
  cast: { id: number; name: string; character: string; photo: string }[]
}

interface Episode {
  ep: number
  title: string
  overview: string
  season: number
  still?: string
  air_date?: string
  rating?: number
}

interface Row {
  key: string
  label: string
  loading: boolean
  items: CatalogItem[]
}

// ─── State ───────────────────────────────────────────────────────────────────
const rows = ref<Row[]>([
  { key: 'trending',  label: 'Trending Minggu Ini',   loading: true, items: [] },
  { key: 'new',       label: 'Baru Ditambahkan',       loading: true, items: [] },
  { key: 'netflix',   label: 'Netflix Originals',      loading: true, items: [] },
  { key: 'movies',    label: 'Film Populer',            loading: true, items: [] },
  { key: 'anime',     label: 'Anime',                  loading: true, items: [] },
])

const heroes = ref<CatalogItem[]>([]) // Array for carousel
const heroIndex = ref(0)
const hero = computed(() => heroes.value[heroIndex.value] || null)
let heroCarouselTimer: ReturnType<typeof setInterval> | null = null
const detail = ref<Detail | null>(null)
const activeSeason = ref(1)
const episodes = ref<Episode[]>([])
const episodesLoading = ref(false)
const activeEp = ref<Episode | null>(null)

const playerUrl = ref<string | null>(null)
const playerLabel = ref('')
const activeSrc = ref('vidsrc.me')
const streamLoading = ref(false)

const searchQuery = ref('')
const searchResults = ref<CatalogItem[]>([])
const searchSource = ref<'tmdb' | 'lk21'>('tmdb') // Default: TMDB global
const searchLoading = ref(false)
const searchPage = ref(1)
const searchHasMore = ref(false)
const searchLoadingMore = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

// Search filters
const searchFilters = ref({
  category: 'all', // all | movie | series | anime
  genre: '',
  year: ''
})

const isSearchActive = computed(() => searchQuery.value.length > 1)

// ─── Sources (embed providers) ────────────────────────────────────────────────
function buildSources(item: CatalogItem, season = 1, ep = 1) {
  const { id, type: t } = item
  
  // Anime type: pattern-based embed generator (no scraping)
  if (t === 'anime') {
    return buildAnimeEmbedSources(item.title, ep)
  }
  
  // Movie/Series: TMDB-based embeds
  return [
    { name: 'vidsrc.me',       url: t === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${id}` : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${ep}` },
    { name: 'vidsrc.to',       url: t === 'movie' ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${season}/${ep}` },
    { name: 'vidsrc.xyz',      url: t === 'movie' ? `https://vidsrc.xyz/embed/movie/${id}` : `https://vidsrc.xyz/embed/tv/${id}/${season}/${ep}` },
    { name: 'embed.su',        url: t === 'movie' ? `https://embed.su/embed/movie/${id}` : `https://embed.su/embed/tv/${id}/${season}/${ep}` },
    { name: '2embed',          url: t === 'movie' ? `https://www.2embed.cc/embed/${id}` : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${ep}` },
    { name: 'vidplayer.live',  url: t === 'movie' ? `https://vidplayer.live/movie/${id}` : `https://vidplayer.live/tv/${id}/${season}/${ep}` },
    { name: 'abyssplayer.com', url: t === 'movie' ? `https://abyssplayer.com/movie/${id}` : `https://abyssplayer.com/tv/${id}/${season}/${ep}` },
    { name: 'nontonaja.live',  url: t === 'movie' ? `https://nontonaja.live/embed/movie/${id}` : `https://nontonaja.live/embed/tv/${id}/${season}/${ep}` },
    { name: 'autoembed.cc',    url: t === 'movie' ? `https://autoembed.cc/movie/tmdb/${id}` : `https://autoembed.cc/tv/tmdb/${id}-${season}-${ep}` },
  ]
}

function buildAnimeEmbedSources(title: string, episode: number) {
  // Slugify: lowercase, replace non-alphanumeric with hyphen, trim edges
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  return [
    { name: '2Anime', url: `https://2anime.xyz/watch/${slug}-episode-${episode}` },
    { name: 'GogoAnime', url: `https://gogoanime3.co/${slug}-episode-${episode}` },
    { name: 'AnimeSuge', url: `https://animesuge.to/watch/${slug}-${episode}` },
    { name: '9Anime', url: `https://9animetv.to/watch/${slug}-episode-${episode}` },
    { name: 'Zoro', url: `https://hianime.to/watch/${slug}-${episode}` },
  ]
}


const currentItem = ref<CatalogItem | null>(null)
const currentSeason = ref(1)
const currentEp = ref(1)

// Multi-scraper proxy URLs
const lk21ProxyUrl = ref<string | null>(null)
const indoxxiProxyUrl = ref<string | null>(null)
const scrapingLogs = ref<string[]>([])

const altSources = computed(() => {
  const allSources: { name: string; url: string; isHls?: boolean }[] = []
  
  // 1. FiGo Proxy scrapers (LK21, INDOXXI) — PRIORITAS PALING KIRI
  if (lk21ProxyUrl.value) {
    allSources.push({
      name: 'FiGo Proxy (LK21)',
      url: lk21ProxyUrl.value,
      isHls: true
    })
  }
  
  if (indoxxiProxyUrl.value) {
    allSources.push({
      name: 'FiGo Proxy (INDOXXI)',
      url: indoxxiProxyUrl.value,
      isHls: true
    })
  }
  
  // 2. TMDB Proxy (movie only, direct MP4)
  if (currentItem.value?.type === 'movie' && currentItem.value.id) {
    allSources.push({
      name: 'TMDB Proxy',
      url: `https://tmdbprxy.pixtive.tech/api/movie/${currentItem.value.id}/stream.mp4`,
      isHls: false
    })
  }
  
  // 3. Embed universal sources (vidsrc, 2embed, dll)
  if (currentItem.value) {
    const embedSources = buildSources(currentItem.value, currentSeason.value, currentEp.value).map(s => ({ ...s, isHls: false }))
    allSources.push(...embedSources)
  }
  
  // 3. Fallback legacy sources (rebahin, lk21 old)
  if (detail.value?.movie) {
    const m = detail.value.movie as any
    if (m.source === 'rebahin' && m.hlsServers) {
      Object.entries(m.hlsServers).forEach(([name, url]) => {
        allSources.push({
          name: `FiGo Proxy (${name})`,
          url: url as string,
          isHls: true
        })
      })
    }
    if (m.source === 'lk21' && m.embedUrls) {
      m.embedUrls.forEach((url: string, idx: number) => {
        allSources.push({
          name: `LK21 Server ${idx + 1}`,
          url: url,
          isHls: false
        })
      })
    }
  }
  
  return allSources
})

// ─── Load rows ────────────────────────────────────────────────────────────────
async function loadRow(key: string) {
  const row = rows.value.find(r => r.key === key)
  if (!row) return
  try {
    const endpointMap: Record<string, string> = {
      trending: '/api/trending',
      new:      '/api/new',
      netflix:  '/api/netflix',
      movies:   '/api/movies',
      anime:    '/api/anime',
    }
    const data: any = await $fetch(endpointMap[key])
    row.items = (data.results || []) as CatalogItem[]
    if (heroes.value.length === 0 && row.key === 'trending' && row.items.length) {
      // Populate hero carousel from trending (up to 5 items)
      const pool = row.items.filter(i => i.backdrop)
      heroes.value = pool.slice(0, 5)
      startHeroCarousel()
    }
  } catch {
    row.items = []
  } finally {
    row.loading = false
  }
}

// ─── PIN Gate ─────────────────────────────────────────────────────────────────
const unlocked = ref(false)
const pinInput = ref('')
const pinError = ref('')
const pinLoading = ref(false)

async function checkStatus() {
  try {
    const data: any = await $fetch('/api/stream/status')
    unlocked.value = data.unlocked === true
  } catch {
    unlocked.value = false
  }
}

async function submitPin() {
  if (!pinInput.value.trim()) return
  pinLoading.value = true
  pinError.value = ''
  try {
    await $fetch('/api/stream/verify', {
      method: 'POST',
      body: { pin: pinInput.value.trim() },
    })
    unlocked.value = true
    pinInput.value = ''
    // Load rows setelah unlock
    rows.value.forEach(r => { r.loading = true; r.items = [] })
    rows.value.forEach(r => loadRow(r.key))
  } catch {
    pinError.value = 'PIN salah. Coba lagi.'
  } finally {
    pinLoading.value = false
  }
}

// ─── Hero Carousel ────────────────────────────────────────────────────────────
function startHeroCarousel() {
  if (heroCarouselTimer) clearInterval(heroCarouselTimer)
  if (heroes.value.length <= 1) return
  
  heroCarouselTimer = setInterval(() => {
    heroIndex.value = (heroIndex.value + 1) % heroes.value.length
  }, 5000) // Rotate every 5s
}

function stopHeroCarousel() {
  if (heroCarouselTimer) {
    clearInterval(heroCarouselTimer)
    heroCarouselTimer = null
  }
}

onMounted(() => {
  loadURLParams() // Load search state from URL
  checkStatus().then(() => {
    if (unlocked.value) {
      rows.value.forEach(r => loadRow(r.key))
    }
  })
})

onBeforeUnmount(() => {
  stopHeroCarousel()
})

// ─── URL Persist & Filters ────────────────────────────────────────────────────
function updateURLParams() {
  const params = new URLSearchParams()
  if (searchQuery.value) params.set('q', searchQuery.value)
  if (searchFilters.value.category !== 'all') params.set('category', searchFilters.value.category)
  if (searchFilters.value.genre) params.set('genre', searchFilters.value.genre)
  if (searchFilters.value.year) params.set('year', searchFilters.value.year)
  
  const newURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname
  window.history.replaceState({}, '', newURL)
}

function loadURLParams() {
  const params = new URLSearchParams(window.location.search)
  const q = params.get('q')
  const category = params.get('category')
  const genre = params.get('genre')
  const year = params.get('year')
  
  if (q) searchQuery.value = q
  if (category) searchFilters.value.category = category
  if (genre) searchFilters.value.genre = genre
  if (year) searchFilters.value.year = year
  
  // Trigger search if query exists
  if (q) onSearch()
}

function applyFilters() {
  updateURLParams()
  // Re-run search with new filters
  if (searchQuery.value.length > 1) {
    fetchSearch(searchQuery.value, 1, false)
  }
}

function resetFilters() {
  searchFilters.value.category = 'all'
  searchFilters.value.genre = ''
  searchFilters.value.year = ''
  applyFilters()
}

// ─── Search ──────────────────────────────────────────────────────────────────
function normalizeLK21(item: any): CatalogItem {
  return {
    id: item.url.replace(/^\//, ''),
    title: item.title,
    poster: item.poster || '/placeholder.jpg',
    year: extractYear(item.title),
    rating: 0,
    type: 'movie',
    source: 'lk21',
    lk21Url: `https://tv11.lk21official.cc${item.url}`
  } as any
}

async function fetchSearch(query: string, page = 1, append = false) {
  try {
    const qLower = query.toLowerCase().trim()

    const [tmdbData, lk21Data]: [any, any] = await Promise.allSettled([
      $fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`),
      $fetch(`/api/lk21/search?q=${encodeURIComponent(query)}&page=${page}`)
    ]).then(([t, l]) => [
      t.status === 'fulfilled' ? t.value : { results: [], total_pages: 1 },
      l.status === 'fulfilled' ? l.value : { results: [] }
    ])

    const tmdbResults: CatalogItem[] = ((tmdbData.results || []) as CatalogItem[]).filter(item => 
      item.title && item.title.toLowerCase().includes(qLower)
    )
    const lk21Results: CatalogItem[] = ((lk21Data.results || []).map(normalizeLK21)).filter((item: any) => 
      item.title && item.title.toLowerCase().includes(qLower)
    )

    // Combined filtered results
    let merged = [...tmdbResults, ...lk21Results]
    
    // Apply category filter
    if (searchFilters.value.category !== 'all') {
      merged = merged.filter(item => item.type === searchFilters.value.category)
    }
    
    // Apply year filter
    if (searchFilters.value.year) {
      merged = merged.filter(item => item.year?.toString() === searchFilters.value.year)
    }
    
    // Note: Genre filter butuh API support (TMDB genre IDs), skip untuk sekarang

    if (append) {
      searchResults.value = [...searchResults.value, ...merged]
    } else {
      searchResults.value = merged
    }

    // Has more jika TMDB/LK21 return halaman berikutnya
    searchHasMore.value = (tmdbData.total_pages || 1) > page || lk21Results.length > 0
    searchPage.value = page
  } catch {
    if (!append) searchResults.value = []
  }
}

function onSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    searchHasMore.value = false
    updateURLParams() // Clear URL params when search cleared
    return
  }
  searchLoading.value = true
  searchPage.value = 1
  updateURLParams() // Update URL with search query
  searchTimer = setTimeout(async () => {
    await fetchSearch(searchQuery.value, 1, false)
    searchLoading.value = false
  }, 500)
}

async function loadMoreResults() {
  if (searchLoadingMore.value || !searchHasMore.value) return
  searchLoadingMore.value = true
  await fetchSearch(searchQuery.value, searchPage.value + 1, true)
  searchLoadingMore.value = false
}

function switchSearchSource(source: 'tmdb' | 'lk21') {
  searchSource.value = source
  if (searchQuery.value.length >= 2) onSearch()
}

// Helper: extract tahun dari title (e.g. "Toy Story 5 (2026)" → "2026")
function extractYear(title: string): string {
  const match = title.match(/\((\d{4})\)/)
  return match ? match[1] : ''
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  resetFilters()
}

// ─── Detail ───────────────────────────────────────────────────────────────────
async function openDetail(item: CatalogItem) {
  detail.value = null
  activeSeason.value = 1
  episodes.value = []
  activeEp.value = null
  // Tutup search saat modal buka
  searchQuery.value = ''
  searchResults.value = []
  
  // Lock body scroll
  document.body.style.overflow = 'hidden'

  // ═══ LK21 SOURCE ═══
  if ((item as any).source === 'lk21') {
    playerLabel.value = item.title || 'Streaming'
    streamLoading.value = true
    try {
      const lk21Url = (item as any).lk21Url
      const isRebahin = lk21Url.includes('rebahin')
      
      if (isRebahin) {
        const streamData: any = await $fetch(`/api/stream/rebahin-proxy?url=${encodeURIComponent(lk21Url)}`)
        
        detail.value = {
          movie: {
            ...item,
            hlsServers: streamData.servers || {},
            source: 'rebahin'
          } as any,
          cast: []
        }
        
        const serverNames = Object.keys(streamData.servers || {})
        if (serverNames.length > 0) {
          const firstServer = serverNames[0]
          playHLS({ 
            url: streamData.servers[firstServer], 
            label: firstServer 
          })
        }
      } else {
        const streamData: any = await $fetch(`/api/lk21/stream?url=${encodeURIComponent(lk21Url)}`)
        
        detail.value = {
          movie: {
            ...item,
            embedUrls: streamData.embed_urls || [],
            source: 'lk21'
          } as any,
          cast: []
        }
        
        if (streamData.embed_urls?.length > 0) {
          playVideo({ embedUrl: streamData.embed_urls[0] })
        }
      }
    } catch (err) {
      console.error('LK21/Rebahin stream fetch error:', err)
      detail.value = { movie: item as any, cast: [] }
    } finally {
      streamLoading.value = false
    }
    return
  }

  // ═══ TMDB SOURCE (existing logic) ═══
  const isSeries = item.type !== 'movie'
  const endpointBase = isSeries ? '/api/netflix/detail' : '/api/movies/detail'

  try {
    const d: any = await $fetch(`${endpointBase}?id=${item.id}`)
    detail.value = {
      movie: { ...item, ...(d.movie || d) },
      cast: d.cast || [],
    }
    if (isSeries) {
      await loadEpisodes(item.id, 1)
    }
  } catch {
    // Fallback minimal
    detail.value = { movie: item as any, cast: [] }
    if (isSeries) loadEpisodes(item.id, 1)
  }
}

function closeDetail() {
  detail.value = null
  episodes.value = []
  // Unlock body scroll
  document.body.style.overflow = ''
}

// ─── Episodes ─────────────────────────────────────────────────────────────────
async function loadEpisodes(tmdbId: number, season: number) {
  episodesLoading.value = true
  episodes.value = []
  try {
    const data: any = await $fetch(`/api/season?id=${tmdbId}&season=${season}`)
    episodes.value = (data.episodes || []) as Episode[]
  } catch {
    // Generate placeholder episodes if endpoint fails
    const total = detail.value?.movie?.episodes || 10
    episodes.value = Array.from({ length: Math.min(total, 24) }, (_, i) => ({
      ep: i + 1,
      title: `Episode ${i + 1}`,
      overview: '',
      season,
    }))
  } finally {
    episodesLoading.value = false
  }
}

async function selectSeason(s: number) {
  activeSeason.value = s
  activeEp.value = null
  if (detail.value?.movie) {
    await loadEpisodes(detail.value.movie.id, s)
  }
}

// ─── Player ───────────────────────────────────────────────────────────────────
function startPlayer() {
  if (!detail.value?.movie) return
  const item = detail.value.movie as CatalogItem
  if (item.type === 'movie') {
    openPlayer(item, 1, 1)
  } else {
    const ep = episodes.value[0] || { ep: 1, season: 1, title: 'Episode 1', overview: '' }
    playEp(ep)
  }
}

function playEp(ep: Episode) {
  if (!detail.value?.movie) return
  activeEp.value = ep
  openPlayer(detail.value.movie as CatalogItem, activeSeason.value, ep.ep)
}

function playVideo(opts: { embedUrl: string }) {
  // Direct embed URL dari LK21
  playerUrl.value = opts.embedUrl
  playerLabel.value = detail.value?.movie?.title || 'Streaming'
  activeSrc.value = 'LK21'
}

function playHLS(opts: { url: string; label: string }) {
  // HLS m3u8 URL dari proxy - pass ke player sebagai HLS stream
  playerUrl.value = opts.url
  playerLabel.value = detail.value?.movie?.title || 'Streaming'
  activeSrc.value = opts.label
}

async function openPlayer(item: CatalogItem, season: number, ep: number) {
  currentItem.value = item
  currentSeason.value = season
  currentEp.value = ep
  lk21ProxyUrl.value = null
  indoxxiProxyUrl.value = null
  scrapingLogs.value = []
  streamLoading.value = false
  
  const addLog = (msg: string) => {
    console.log(`[FiGo Scraper Log] ${msg}`)
    scrapingLogs.value.push(msg)
  }

  playerLabel.value = item.type === 'movie'
    ? item.title
    : `${item.title} — S${String(season).padStart(2,'0')}E${String(ep).padStart(2,'0')}`

  // 1. Embed langsung sebagai fallback instant
  const srcs = buildSources(item, season, ep)
  activeSrc.value = srcs[0].name
  playerUrl.value = srcs[0].url

  addLog(`Memulai pencarian stream untuk: "${item.title}"`)
  addLog(`[Embed Direct] Sumber embed universal (${srcs[0].name}) langsung aktif diawal.`)
  addLog(`[Embed Options] ${srcs.length} embed tersedia: ${srcs.map(s => s.name).join(', ')}`)

  // 2. Background scraping paralel LK21 + Embed validation
  await Promise.all([
    runBackgroundScraper(item, season, ep, addLog),
    validateEmbedSources(srcs, addLog)
  ])
}

async function validateEmbedSources(sources: { name: string; url: string }[], addLog: (msg: string) => void) {
  addLog(`[Embed Validation] Memulai pengecekan ${sources.length} embed sources...`)
  
  const results = await Promise.allSettled(
    sources.map(async (src) => {
      try {
        // HEAD request dengan timeout 5s untuk cek reachability
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(src.url, {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors' // Bypass CORS untuk embed check
        })
        
        clearTimeout(timeout)
        
        // no-cors mode selalu return opaque response (status 0), tapi kalau fetch sukses berarti reachable
        return { name: src.name, status: 'reachable' }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return { name: src.name, status: 'timeout' }
        }
        return { name: src.name, status: 'failed', error: err.message }
      }
    })
  )
  
  results.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      const { name, status, error } = result.value as any
      if (status === 'reachable') {
        addLog(`[Embed] ✓ ${name} — tersedia`)
      } else if (status === 'timeout') {
        addLog(`[Embed] ⏱ ${name} — timeout (>5s)`)
      } else {
        addLog(`[Embed] ✗ ${name} — gagal (${error || 'unreachable'})`)
      }
    } else {
      addLog(`[Embed] ✗ ${sources[idx].name} — error validasi`)
    }
  })
}

async function runBackgroundScraper(item: CatalogItem, season: number, ep: number, addLog: (msg: string) => void) {
  // Promise LK21
  const lk21Promise = (async () => {
    try {
      addLog(`[LK21 Search] Mencari film "${item.title}" di database LK21...`)
      const searchRes: any = await $fetch(`/api/lk21/search?q=${encodeURIComponent(item.title)}`)
      const lk21Match = (searchRes.results || [])[0]
      if (lk21Match && lk21Match.url) {
        addLog(`[LK21 Match] Ditemukan match internal: "${lk21Match.title}" (${lk21Match.url})`)
        const targetUrl = lk21Match.url.startsWith('http') ? lk21Match.url : `https://tv11.lk21official.cc${lk21Match.url}`
        const lk21Stream: any = await $fetch(`/api/stream/lk21-proxy?url=${encodeURIComponent(targetUrl)}`)
        if (lk21Stream.success && lk21Stream.proxy_url) {
          addLog(`[LK21 HLS Proxy] Sukses ekstraksi dari match! Proxy URL siap.`)
          addLog(`[FiGo Proxy LK21] Berhasil mengambil stream HLS (URL: ${lk21Stream.proxy_url})`)
          lk21ProxyUrl.value = lk21Stream.proxy_url
        } else {
          addLog(`[LK21 HLS Proxy] Match ditemukan tapi gagal ekstrak HLS stream.`)
        }
      } else {
        addLog(`[LK21 Search] Film "${item.title}" tidak ditemukan di database LK21.`)
      }
    } catch (e: any) {
      addLog(`[LK21 Search] Error: ${e.message || e}`)
    }
  })()

  // INDOXXI scraper disabled — morencius.com pakai JS obfuscation yang butuh headless browser
  // const indoxxiPromise = (async () => { ... })()
  
  // Tunggu LK21 selesai
  await lk21Promise
  // await Promise.allSettled([lk21Promise, indoxxiPromise])
}

function switchSource(src: { name: string; url: string; isHls?: boolean }) {
  activeSrc.value = src.name
  playerUrl.value = src.url
}

function closePlayer() {
  playerUrl.value = null
  streamLoading.value = false
}
</script>

<style scoped>
/* ─── Root ─────────────────────────────────────────────────────── */
.stream-root {
  background: var(--bg-main, #141414);
  min-height: 100vh;
  color: var(--text-main, #fff);
  font-family: 'Netflix Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  overflow-x: hidden;
  --modal-bg: #181818;
  --modal-backdrop: rgba(0, 0, 0, 0.8);
  --card-bg: #1e1e1e;
  --card-border: #2a2a2a;
  --player-bg: #000;
  --player-controls-bg: rgba(0, 0, 0, 0.9);
  --text-secondary: #aaa;
  --text-muted: #666;
}

:global(html.light) .stream-root {
  --bg-main: #f8fafc;
  --text-main: #0f172a;
  --modal-bg: #ffffff;
  --modal-backdrop: rgba(15, 23, 42, 0.8);
  --card-bg: #ffffff;
  --card-border: #e2e8f0;
  --player-bg: #f1f5f9;
  --player-controls-bg: rgba(255, 255, 255, 0.95);
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
}

/* ─── PIN Gate ─────────────────────────────────────────────── */
.pin-gate {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #141414;
  padding: 24px;
}
.pin-card {
  background: #1e1e1e;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 36px 28px;
  text-align: center;
  max-width: 320px;
  width: 100%;
}
.pin-icon { font-size: 48px; margin-bottom: 12px; }
.pin-title { font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 6px; }
.pin-subtitle { font-size: 13px; color: #888; margin: 0 0 20px; }
.pin-input-wrap { margin-bottom: 12px; }
.pin-input {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 10px;
  color: #fff;
  font-size: 18px;
  letter-spacing: 4px;
  padding: 14px 16px;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  transition: border-color .15s;
}
.pin-input:focus { border-color: #e50914; }
.pin-input::placeholder { letter-spacing: 0; color: #555; font-size: 14px; }
.pin-error { color: #e50914; font-size: 13px; margin: 0 0 12px; }
.pin-submit {
  width: 100%;
  background: #e50914;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
}
.pin-submit:hover { background: #f40612; }
.pin-submit:disabled { background: #555; cursor: not-allowed; }

/* ─── Search Bar ────────────────────────────────────────────────── */
.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--search-bg-fade, linear-gradient(rgba(20,20,20,0.95), rgba(20,20,20,0)));
  padding: 12px 16px 8px;
  backdrop-filter: blur(8px);
}
:global(html.light) .search-bar {
  --search-bg-fade: linear-gradient(rgba(248,250,252,0.95), rgba(248,250,252,0));
}
.search-inner {
  display: flex;
  align-items: center;
  background: var(--search-box-bg, #2a2a2a);
  border: 1px solid var(--search-box-border, #3a3a3a);
  border-radius: 12px;
  padding: 0 12px;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
:global(html.light) .search-inner {
  --search-box-bg: #ffffff;
  --search-box-border: #e2e8f0;
}
.search-icon { width: 18px; height: 18px; color: #999; flex-shrink: 0; }
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: inherit;
  font-size: 15px;
  padding: 11px 0;
}
.search-input::placeholder { color: #888; }
.search-clear {
  background: none;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

/* ─── Source Toggle ───────────────────────────────────────────────── */
.search-source-toggle {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}
.source-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #999;
}
.source-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}
.source-btn.active {
  background: rgba(229, 9, 20, 0.2);
  border-color: rgba(229, 9, 20, 0.5);
  color: #fff;
  transform: scale(1.05);
}

/* ─── Search Results ────────────────────────────────────────────── */
.search-results-grid {
  position: relative;
  z-index: 50; /* Di bawah search-bar (100), di atas konten biasa (0) */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px 16px 24px;
  transition: margin-left 0.3s ease;
}
.search-results-grid.with-sidebar {
  margin-left: 240px; /* Width of filter sidebar */
}
@media (min-width: 640px) {
  .search-results-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (min-width: 1024px) {
  .search-results-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  .search-results-grid.with-sidebar {
    grid-template-columns: repeat(5, 1fr);
  }
}
@media (max-width: 768px) {
  .search-results-grid.with-sidebar {
    margin-left: 0;
  }
}

/* ─── Filter Sidebar ──────────────────────────────────────────────── */
.filter-sidebar {
  position: fixed;
  left: 0;
  top: 80px; /* Below search bar */
  width: 240px;
  height: calc(100vh - 80px);
  background: #1a1a1a;
  border-right: 1px solid #333;
  padding: 20px;
  z-index: 40;
  overflow-y: auto;
}
.filter-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
}
.filter-group {
  margin-bottom: 20px;
}
.filter-label {
  display: block;
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.category-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.cat-tab {
  background: #2a2a2a;
  border: 1px solid #444;
  color: #ccc;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.cat-tab:hover {
  background: #333;
  border-color: #555;
}
.cat-tab.active {
  background: #0066ff;
  border-color: #0066ff;
  color: #fff;
  font-weight: 600;
}
.filter-select {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #444;
  color: #ccc;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.filter-select:hover {
  border-color: #555;
}
.filter-select:focus {
  outline: none;
  border-color: #0066ff;
}
.filter-reset {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #444;
  color: #ccc;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}
.filter-reset:hover {
  background: #333;
  color: #fff;
}

/* Slide transition for filter sidebar */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .filter-sidebar {
    width: 100%;
    height: auto;
    position: relative;
    top: 0;
    border-right: none;
    border-bottom: 1px solid #333;
  }
}
.empty-state {
  text-align: center;
  color: #666;
  padding: 48px 16px;
  font-size: 15px;
}

/* ─── Load More ──────────────────────────────────────────────────── */
.load-more-wrap {
  display: flex;
  justify-content: center;
  padding: 24px 16px;
}
.load-more-btn {
  background: #222;
  border: 1px solid #444;
  color: #ccc;
  border-radius: 10px;
  padding: 12px 32px;
  font-size: 14px;
  cursor: pointer;
  transition: background .15s, color .15s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.load-more-btn:hover:not(:disabled) { background: #333; color: #fff; }
.load-more-btn:disabled { opacity: .5; cursor: not-allowed; }

/* ─── Poster Source Badge ─────────────────────────────────────────── */
.poster-source-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 14px;
  background: rgba(0,0,0,.6);
  border-radius: 6px;
  padding: 2px 4px;
  line-height: 1;
}

/* ─── Hero Banner ───────────────────────────────────────────────── */
.hero {
  position: relative;
  height: 56vw;
  min-height: 220px;
  max-height: 420px;
  background-size: cover;
  background-position: center top;
  transition: background-image 0.8s ease-in-out; /* Smooth carousel transition */
}
.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #141414 0%, #14141488 60%, transparent 100%);
}
.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 16px 20px;
}
.hero-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.hero-badge {
  background: #e50914;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 2px 7px;
  border-radius: 3px;
}
.hero-rating { color: #f5c518; font-size: 13px; font-weight: 600; }
.hero-year { color: #aaa; font-size: 13px; }
.hero-title {
  font-size: clamp(22px, 6vw, 36px);
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 8px;
  text-shadow: 0 2px 8px #000a;
}
.hero-summary {
  color: #ccc;
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hero-actions { display: flex; gap: 10px; }
.btn-play {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 5px;
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
}
.btn-play:active { background: #ddd; }
.btn-info {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #ffffff33;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(4px);
}
.btn-icon { width: 16px; height: 16px; }

/* ─── Rows ──────────────────────────────────────────────────────── */
.rows-container { padding: 8px 0 40px; }
.content-row { margin-bottom: 4px; }
.row-title {
  font-size: 16px;
  font-weight: 700;
  padding: 10px 16px 6px;
  margin: 0;
  color: #e5e5e5;
}
.row-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 16px 12px;
  scrollbar-width: none;
}
.row-scroll::-webkit-scrollbar { display: none; }
.row-loading {
  display: flex;
  gap: 8px;
  padding: 4px 16px 12px;
  overflow: hidden;
}
.skeleton-card {
  flex-shrink: 0;
  width: 100px;
  height: 150px;
  background: linear-gradient(90deg, #222 25%, #333 50%, #222 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.row-empty { padding: 8px 16px; color: #555; font-size: 13px; }

/* ─── Poster Card ───────────────────────────────────────────────── */
.poster-card {
  flex-shrink: 0;
  width: 100px;
  cursor: pointer;
}
.search-results-grid .poster-card { 
  width: 100%; 
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.poster-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 8px;
  overflow: hidden;
  background: #222;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.poster-img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  display: block; 
}
.poster-type-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 14px;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.8));
}
.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 30%, transparent 70%);
  opacity: 0;
  transition: opacity .2s;
  display: flex;
  align-items: flex-end;
  padding: 6px;
}
.poster-card:hover .poster-overlay,
.poster-card:active .poster-overlay { opacity: 1; }
.poster-rating { font-size: 11px; color: #f5c518; font-weight: 600; }
.poster-title {
  font-size: 12px;
  font-weight: 600;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.poster-year { font-size: 11px; opacity: 0.7; }

/* ─── Modal ─────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: #000000cc;
  z-index: 9999; /* Overlay semua (sidebar, header, dll) */
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.modal-box {
  background: #181818;
  width: 100%;
  max-height: 92vh;
  border-radius: 16px 16px 0 0;
  overflow-y: auto;
  scrollbar-width: none;
}
.modal-box::-webkit-scrollbar { display: none; }

/* Modal hero */
.modal-hero {
  position: relative;
  height: 52vw;
  min-height: 200px;
  max-height: 300px;
  background-size: cover;
  background-position: center top;
  background-color: #222;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}
.modal-hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #181818 0%, #18181888 60%, transparent 100%);
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #000000bb;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 16px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-hero-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px 16px;
}
.modal-title {
  font-size: clamp(18px, 5vw, 28px);
  font-weight: 700;
  margin: 0 0 6px;
  text-shadow: 0 1px 6px #000;
}
.modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}
.meta-rating { color: #f5c518; font-weight: 600; }
.meta-year, .meta-dur { color: #aaa; }
.meta-status {
  color: #46d369;
  font-weight: 600;
}
.modal-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.genre-chip {
  background: #333;
  color: #ccc;
  font-size: 11px;
  padding: 2px 9px;
  border-radius: 20px;
}
.modal-summary {
  font-size: 13px;
  color: #ccc;
  line-height: 1.5;
  margin: 0 0 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.modal-play-btn { width: 100%; justify-content: center; }

/* Cast */
.cast-section { padding: 16px 16px 8px; }
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #e5e5e5;
}
.cast-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.cast-scroll::-webkit-scrollbar { display: none; }
.cast-card { flex-shrink: 0; width: 64px; text-align: center; }
.cast-photo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin: 0 auto 5px;
  background: #333;
}
.cast-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #aaa;
  background: #2a2a2a;
}
.cast-name { font-size: 10px; color: #ddd; font-weight: 600; line-height: 1.3; }
.cast-char { font-size: 10px; color: #888; line-height: 1.3; }

/* Episodes */
.episodes-section { padding: 16px 16px 24px; }
.season-pills {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  margin-bottom: 14px;
  padding-bottom: 4px;
}
.season-pills::-webkit-scrollbar { display: none; }
.season-pill {
  flex-shrink: 0;
  background: #2a2a2a;
  color: #aaa;
  border: 1px solid #3a3a3a;
  border-radius: 20px;
  padding: 5px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all .15s;
}
.season-pill.active {
  background: #e50914;
  color: #fff;
  border-color: #e50914;
}
.episode-list { display: flex; flex-direction: column; gap: 2px; }
.ep-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s;
}
.ep-row:active, .ep-row.ep-active { background: #2a2a2a; }
.ep-num {
  flex-shrink: 0;
  width: 36px;
  text-align: center;
  font-size: 13px;
  color: #777;
  font-weight: 600;
}
.ep-thumb {
  flex-shrink: 0;
  width: 120px;
  height: 68px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  background: #1a1a1a;
}
.ep-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ep-thumb-play {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 24px;
  height: 24px;
  color: #fff;
  opacity: 0;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,.6));
  transition: opacity .15s;
}
.ep-row:hover .ep-thumb-play,
.ep-row.ep-active .ep-thumb-play { opacity: 1; }
.ep-info { flex: 1; min-width: 0; }
.ep-title { font-size: 13px; font-weight: 600; color: #e5e5e5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ep-desc { font-size: 11px; color: #888; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ep-play-icon { width: 18px; height: 18px; color: #666; flex-shrink: 0; }
.ep-row.ep-active .ep-play-icon { color: #e50914; }

/* ─── Player ─────────────────────────────────────────────────────── */
.player-backdrop {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 600; /* Tertinggi — player penuh layar */
  display: flex;
  flex-direction: column;
}
.player-box {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.player-close {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #000000bb;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}
.player-title {
  padding: 14px 16px 8px 56px;
  font-size: 13px;
  color: #aaa;
  font-weight: 600;
  background: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.player-wrap {
  flex: 1;
  position: relative;
  background: #000;
}
.player-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #0d0e12;
  color: #888;
  z-index: 10;
}
.loading-text {
  font-size: 13px;
  font-weight: 500;
  color: #aaa;
}
.loader-spin.large {
  width: 40px;
  height: 40px;
  border-width: 3px;
}
.player-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}
.player-sources {
  background: #111;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}
.player-sources::-webkit-scrollbar { display: none; }
.sources-label { color: #666; font-size: 12px; flex-shrink: 0; }
.src-btn {
  flex-shrink: 0;
  background: #222;
  color: #aaa;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all .15s;
}
.src-btn.active {
  background: #e50914;
  color: #fff;
  border-color: #e50914;
}

/* ─── Misc ──────────────────────────────────────────────────────── */
.center-loader {
  display: flex;
  justify-content: center;
  padding: 32px;
}
.loader-spin {
  display: inline-block;
  width: 28px;
  height: 28px;
  border: 3px solid #333;
  border-top-color: #e50914;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Transitions ───────────────────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: all .25s ease; }
.modal-fade-enter-from { opacity: 0; transform: translateY(40px); }
.modal-fade-leave-to   { opacity: 0; transform: translateY(40px); }

/* ─── Scraper Logs ──────────────────────────────────────────────── */
.scraper-logs {
  background: var(--player-bg);
  border-top: 1px solid var(--card-border);
  padding: 10px 14px;
  font-family: monospace;
  font-size: 11px;
  max-height: 120px;
  overflow-y: auto;
}
.logs-header {
  color: #fbbf24;
  font-weight: bold;
  margin-bottom: 6px;
}
.logs-body {
  color: var(--text-secondary);
}
.log-line {
  margin: 2px 0;
  line-height: 1.4;
}

/* ─── Filter Sidebar ─────────────────────────────────────────────── */
.filter-sidebar {
  position: fixed;
  left: 0;
  top: 80px; /* Below search bar */
  width: 240px;
  height: calc(100vh - 80px);
  background: #141414;
  border-right: 1px solid #2a2a2a;
  padding: 20px;
  overflow-y: auto;
  z-index: 90;
}

.filter-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.category-tabs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cat-tab {
  background: #222;
  border: 1px solid #333;
  color: #aaa;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.cat-tab:hover {
  background: #2a2a2a;
  border-color: #444;
  color: #fff;
}

.cat-tab.active {
  background: #e50914;
  border-color: #e50914;
  color: #fff;
  font-weight: 600;
}

.filter-select {
  width: 100%;
  background: #222;
  border: 1px solid #333;
  color: #fff;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: #444;
}

.filter-select:focus {
  outline: none;
  border-color: #e50914;
}

.filter-reset {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #444;
  color: #aaa;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.filter-reset:hover {
  background: #333;
  color: #fff;
}

/* Search results with sidebar */
.search-results-grid.with-sidebar {
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}

/* Slide-right transition for filter sidebar */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .filter-sidebar {
    width: 100%;
    left: 0;
    z-index: 95;
  }
  
  .search-results-grid.with-sidebar {
    margin-left: 0;
  }
}
</style>

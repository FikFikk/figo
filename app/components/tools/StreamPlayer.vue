<template>
  <div class="stream-root">
    <!-- ═══ SEARCH BAR ═══ -->
    <div class="search-bar">
      <div class="search-inner">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari film, series, anime..."
          class="search-input"
          @input="onSearch"
        />
        <button v-if="searchQuery" class="search-clear" @click="clearSearch">✕</button>
      </div>
    </div>

    <!-- ═══ SEARCH RESULTS ═══ -->
    <template v-if="searchQuery.length > 1">
      <div v-if="searchLoading" class="center-loader"><span class="loader-spin"/></div>
      <div v-else-if="searchResults.length" class="search-results-grid">
        <div
          v-for="item in searchResults"
          :key="item.id + item.type"
          class="poster-card"
          @click="openDetail(item)"
        >
          <div class="poster-wrap">
            <img :src="item.poster" :alt="item.title" class="poster-img" loading="lazy" />
            <div class="poster-type-badge">{{ item.type === 'movie' ? '🎬' : item.type === 'series' ? '📺' : '🎌' }}</div>
            <div class="poster-overlay">
              <div class="poster-rating">★ {{ item.rating }}</div>
            </div>
          </div>
          <div class="poster-title">{{ item.title }}</div>
          <div class="poster-year">{{ item.year }}</div>
        </div>
      </div>
      <div v-else class="empty-state">Tidak ada hasil untuk "{{ searchQuery }}"</div>
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
                <div class="ep-num">E{{ ep.ep }}</div>
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
      <div v-if="playerUrl" class="player-backdrop" @click.self="closePlayer">
        <div class="player-box">
          <button class="player-close" @click="closePlayer">✕</button>
          <div class="player-title">
            {{ playerLabel }}
          </div>
          <div class="player-wrap">
            <iframe
              :src="playerUrl"
              class="player-frame"
              allowfullscreen
              referrerpolicy="origin"
              allow="autoplay; fullscreen; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
          <!-- Fallback sources -->
          <div class="player-sources">
            <span class="sources-label">Sumber lain:</span>
            <button
              v-for="src in altSources"
              :key="src.name"
              :class="['src-btn', { active: activeSrc === src.name }]"
              @click="switchSource(src)"
            >{{ src.name }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

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
}

interface Row {
  key: string
  label: string
  loading: boolean
  items: CatalogItem[]
}

// ─── State ───────────────────────────────────────────────────────────────────
const rows = ref<Row[]>([
  { key: 'trending',  label: '🔥 Trending Minggu Ini',   loading: true, items: [] },
  { key: 'new',       label: '🆕 Baru Ditambahkan',       loading: true, items: [] },
  { key: 'netflix',   label: '🎬 Netflix Originals',      loading: true, items: [] },
  { key: 'movies',    label: '🍿 Film Populer',            loading: true, items: [] },
  { key: 'anime',     label: '🎌 Anime',                  loading: true, items: [] },
])

const hero = ref<CatalogItem | null>(null)
const detail = ref<Detail | null>(null)
const activeSeason = ref(1)
const episodes = ref<Episode[]>([])
const episodesLoading = ref(false)
const activeEp = ref<Episode | null>(null)

const playerUrl = ref<string | null>(null)
const playerLabel = ref('')
const activeSrc = ref('vidsrc.to')

const searchQuery = ref('')
const searchResults = ref<CatalogItem[]>([])
const searchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

// ─── Sources (embed providers) ────────────────────────────────────────────────
function buildSources(item: CatalogItem, season = 1, ep = 1) {
  const t = item.type === 'movie' ? 'movie' : 'tv'
  const id = item.id
  return [
    { name: 'vidsrc.to',       url: t === 'movie' ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${season}/${ep}` },
    { name: 'vidsrc.me',       url: t === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${id}` : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${ep}` },
    { name: 'multiembed',      url: t === 'movie' ? `https://multiembed.mov/?video_id=${id}&tmdb=1` : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${ep}` },
    { name: '2embed',          url: t === 'movie' ? `https://www.2embed.cc/embed/${id}` : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${ep}` },
    { name: 'embedsu',         url: t === 'movie' ? `https://embed.su/embed/movie/${id}` : `https://embed.su/embed/tv/${id}/${season}/${ep}` },
  ]
}

const currentItem = ref<CatalogItem | null>(null)
const currentSeason = ref(1)
const currentEp = ref(1)

const altSources = computed(() => {
  if (!currentItem.value) return []
  return buildSources(currentItem.value, currentSeason.value, currentEp.value)
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
    if (!hero.value && row.key === 'trending' && row.items.length) {
      // Pick random hero from trending
      const pool = row.items.filter(i => i.backdrop)
      hero.value = pool[Math.floor(Math.random() * pool.length)] || row.items[0]
    }
  } catch {
    row.items = []
  } finally {
    row.loading = false
  }
}

onMounted(() => {
  rows.value.forEach(r => loadRow(r.key))
})

// ─── Search ──────────────────────────────────────────────────────────────────
function onSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  if (searchQuery.value.length < 2) { searchResults.value = []; return }
  searchLoading.value = true
  searchTimer = setTimeout(async () => {
    try {
      const data: any = await $fetch(`/api/trending?q=${encodeURIComponent(searchQuery.value)}`)
      searchResults.value = (data.results || []) as CatalogItem[]
    } catch {
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 500)
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

// ─── Detail ───────────────────────────────────────────────────────────────────
async function openDetail(item: CatalogItem) {
  detail.value = null
  activeSeason.value = 1
  episodes.value = []
  activeEp.value = null

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

function openPlayer(item: CatalogItem, season: number, ep: number) {
  currentItem.value = item
  currentSeason.value = season
  currentEp.value = ep
  activeSrc.value = 'vidsrc.to'
  const srcs = buildSources(item, season, ep)
  playerUrl.value = srcs[0].url
  playerLabel.value = item.type === 'movie'
    ? item.title
    : `${item.title} — S${String(season).padStart(2,'0')}E${String(ep).padStart(2,'0')}`
}

function switchSource(src: { name: string; url: string }) {
  activeSrc.value = src.name
  playerUrl.value = src.url
}

function closePlayer() {
  playerUrl.value = null
}
</script>

<style scoped>
/* ─── Root ─────────────────────────────────────────────────────── */
.stream-root {
  background: #141414;
  min-height: 100vh;
  color: #fff;
  font-family: 'Netflix Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  overflow-x: hidden;
}

/* ─── Search Bar ────────────────────────────────────────────────── */
.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(#141414ee, #14141400);
  padding: 12px 16px 8px;
}
.search-inner {
  display: flex;
  align-items: center;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 0 12px;
  gap: 8px;
}
.search-icon { width: 18px; height: 18px; color: #999; flex-shrink: 0; }
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 15px;
  padding: 11px 0;
}
.search-input::placeholder { color: #666; }
.search-clear {
  background: none;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

/* ─── Search Results ────────────────────────────────────────────── */
.search-results-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 12px 16px 24px;
}
.empty-state {
  text-align: center;
  color: #666;
  padding: 48px 16px;
  font-size: 15px;
}

/* ─── Hero Banner ───────────────────────────────────────────────── */
.hero {
  position: relative;
  height: 56vw;
  min-height: 220px;
  max-height: 420px;
  background-size: cover;
  background-position: center top;
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
.search-results-grid .poster-card { width: 100%; }
.poster-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 6px;
  overflow: hidden;
  background: #222;
  margin-bottom: 6px;
}
.poster-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.poster-type-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 14px;
  filter: drop-shadow(0 1px 3px #000);
}
.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #000b 30%, transparent 70%);
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
  font-size: 11px;
  font-weight: 600;
  color: #e5e5e5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.poster-year { font-size: 10px; color: #888; }

/* ─── Modal ─────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: #000000cc;
  z-index: 200;
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
  background-position: center;
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
  z-index: 300;
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
</style>

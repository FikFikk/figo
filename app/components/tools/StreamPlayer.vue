<template>
  <div class="space-y-8">
    <!-- ===================== PIN GATE ===================== -->
    <div
      v-if="!unlocked"
      class="glass-panel rounded-xl p-6 md:p-10 max-w-md mx-auto text-center"
      :class="isDark ? 'border border-white/5' : 'border border-slate-100'"
    >
      <div
        class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
        :class="isDark ? 'bg-primary/15' : 'bg-blue-50'"
      >
        <span class="material-symbols-outlined text-3xl text-primary">lock</span>
      </div>

      <h2 class="font-headline font-black text-xl mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">
        Bioskop Terkunci
      </h2>
      <p class="text-xs mb-8 opacity-60" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
        Masukkan PIN untuk membuka katalog. Akses tersimpan 1 hari di perangkat ini.
      </p>

      <form @submit.prevent="submitPin" class="space-y-4">
        <input
          v-model="pinInput"
          type="password"
          inputmode="numeric"
          autocomplete="off"
          placeholder="• • • • • •"
          :disabled="verifying"
          class="w-full text-center tracking-[0.5em] text-lg font-bold rounded-xl px-4 py-3.5 outline-none transition-all focus:ring-2 focus:ring-primary/40"
          :class="isDark
            ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-600'
            : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-300'"
        />
        <p v-if="errorMsg" class="text-xs font-bold text-red-500">{{ errorMsg }}</p>
        <button
          type="submit"
          :disabled="verifying || !pinInput.trim()"
          class="w-full bg-primary text-on-primary rounded-xl font-headline font-bold py-3.5 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="verifying" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          <span class="material-symbols-outlined text-lg" v-else>lock_open</span>
          {{ verifying ? 'Memeriksa...' : 'Buka Katalog' }}
        </button>
      </form>
    </div>

    <!-- ===================== KATALOG ===================== -->
    <template v-else>
      <!-- Header + Search + Lock -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" :class="isDark ? 'bg-primary/15' : 'bg-blue-50'">
            <span class="material-symbols-outlined text-xl text-primary">movie</span>
          </div>
          <div class="min-w-0">
            <h2 class="font-headline font-black text-lg leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">FiGo Bioskop</h2>
            <p class="text-[10px] md:text-xs opacity-60" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Jelajahi film &amp; series</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative flex-1 sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-50">search</span>
            <input
              v-model="searchQuery"
              @keyup.enter="runSearch"
              type="search"
              placeholder="Cari judul..."
              class="w-full rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/40"
              :class="isDark
                ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-600'
                : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400'"
            />
          </div>
          <button
            @click="lock"
            class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            :class="isDark ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'"
            title="Kunci kembali"
          >
            <span class="material-symbols-outlined text-base">lock</span>
          </button>
        </div>
      </div>

      <!-- Tab Kategori -->
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="switchTab(tab.key)"
          class="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
          :class="activeTab === tab.key
            ? 'bg-primary text-on-primary shadow-sm'
            : (isDark ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800')"
        >
          <span class="material-symbols-outlined text-sm">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- TMDB API Key warning (hanya untuk tab movies & netflix) -->
      <div
        v-if="(activeTab === 'movies' || activeTab === 'netflix') && noApiKey"
        class="flex items-start gap-3 p-4 rounded-xl text-sm"
        :class="isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-800'"
      >
        <span class="material-symbols-outlined text-lg flex-shrink-0 mt-0.5">warning</span>
        <div>
          <p class="font-bold mb-0.5">TMDB_API_KEY belum dikonfigurasi</p>
          <p class="text-[11px] opacity-80">Daftar gratis di <a href="https://www.themoviedb.org/settings/api" target="_blank" class="underline">themoviedb.org</a> lalu tambahkan <code class="px-1 rounded bg-black/10">TMDB_API_KEY=xxx</code> di file <code class="px-1 rounded bg-black/10">.env</code> project.</p>
        </div>
      </div>

      <!-- Loading grid -->
      <div v-if="loadingList" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div v-for="n in 10" :key="n" class="aspect-[2/3] rounded-xl animate-pulse" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
      </div>

      <!-- Grid poster -->
      <div v-else-if="items.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <button
          v-for="item in items"
          :key="item.id"
          @click="openItem(item)"
          class="group text-left relative rounded-xl overflow-hidden aspect-[2/3] focus:outline-none focus:ring-2 focus:ring-primary/60 transition-transform hover:scale-[1.03]"
          :class="isDark ? 'bg-white/5' : 'bg-slate-100'"
        >
          <img
            v-if="item.poster"
            :src="item.poster"
            :alt="item.title"
            loading="lazy"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl opacity-30">image</span>
          </div>

          <!-- Type badge (Film / Series) -->
          <div class="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide"
            :class="item.type === 'movie'
              ? 'bg-blue-500/90 text-white'
              : 'bg-red-600/90 text-white'"
          >
            {{ item.type === 'movie' ? 'Film' : 'Series' }}
          </div>

          <!-- Rating badge -->
          <div v-if="item.rating" class="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[11px]">star</span>{{ item.rating.toFixed(1) }}
          </div>

          <!-- Overlay info saat hover -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <p class="text-white text-xs font-bold line-clamp-2">{{ item.title }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="item.year" class="text-[10px] text-gray-300">{{ item.year }}</span>
              <span v-if="item.seasons" class="text-[10px] text-gray-400">{{ item.seasons }} season</span>
            </div>
          </div>
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="!loadingList && !noApiKey" class="text-center py-16 opacity-50">
        <span class="material-symbols-outlined text-5xl mb-2 block">search_off</span>
        <p class="text-sm">Tidak ada hasil.</p>
      </div>
    </template>

    <!-- ===================== MODAL DETAIL + PLAYER ===================== -->
    <Teleport to="body">
      <div
        v-if="detail"
        class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 md:p-8 bg-black/70 backdrop-blur-sm"
        @click.self="closeDetail"
      >
        <div
          class="relative w-full max-w-3xl rounded-2xl overflow-hidden my-auto"
          :class="isDark ? 'bg-neutral-900 border border-white/10' : 'bg-white border border-slate-200'"
        >
          <!-- Close -->
          <button
            @click="closeDetail"
            class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>

          <!-- Backdrop / Player -->
          <div class="relative aspect-video bg-black flex items-center justify-center">
            <video
              v-if="activeSrc"
              :src="activeSrc"
              controls
              autoplay
              playsinline
              preload="metadata"
              class="w-full h-full"
              @error="onVideoError"
            ></video>
            <template v-else>
              <img
                v-if="detail.movie?.backdrop || detail.movie?.poster || detail.show?.backdrop || detail.show?.poster"
                :src="detail.movie?.backdrop || detail.movie?.poster || detail.show?.backdrop || detail.show?.poster"
                :alt="detail.movie?.title || detail.show?.title"
                class="w-full h-full object-cover opacity-60"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="material-symbols-outlined text-6xl text-white/70">movie</span>
              </div>
            </template>
          </div>

          <div class="p-5 md:p-6 max-h-[55vh] overflow-y-auto">
            <!-- Judul & Meta -->
            <h3 class="font-headline font-black text-xl mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ detail.movie?.title || detail.show?.title }}
            </h3>

            <!-- Tagline -->
            <p v-if="detail.movie?.tagline || detail.show?.tagline" class="text-xs italic opacity-50 mb-2">
              "{{ detail.movie?.tagline || detail.show?.tagline }}"
            </p>

            <div class="flex flex-wrap items-center gap-2 text-xs mb-3 opacity-70">
              <span v-if="detailRating" class="text-amber-500 font-bold flex items-center gap-0.5">
                <span class="material-symbols-outlined text-sm">star</span>{{ detailRating }}
              </span>
              <span v-if="detailYear">{{ detailYear }}</span>
              <span v-if="detail.movie?.runtime">· {{ detail.movie.runtime }} menit</span>
              <span v-if="detail.show?.seasons">· {{ detail.show.seasons }} season, {{ detail.show.episodes }} episode</span>
              <span v-if="detailNetworks">· {{ detailNetworks }}</span>
              <span
                v-for="g in detailGenres"
                :key="g"
                class="px-2 py-0.5 rounded-full"
                :class="isDark ? 'bg-white/10' : 'bg-slate-100'"
              >{{ g }}</span>
            </div>

            <p v-if="detailSummary" class="text-sm opacity-70 mb-5 leading-relaxed">{{ detailSummary }}</p>

            <p v-if="playerError" class="text-xs font-bold text-red-500 mb-4">{{ playerError }}</p>

            <!-- Cast (khusus TMDB) -->
            <div v-if="detail.cast?.length" class="mb-5">
              <p class="text-xs font-bold mb-3 opacity-60 uppercase tracking-wide">Pemeran Utama</p>
              <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                <div
                  v-for="c in detail.cast"
                  :key="c.id"
                  class="flex-shrink-0 w-16 text-center"
                >
                  <div class="w-14 h-14 mx-auto rounded-full overflow-hidden mb-1" :class="isDark ? 'bg-white/10' : 'bg-slate-100'">
                    <img v-if="c.photo" :src="c.photo" :alt="c.name" class="w-full h-full object-cover" />
                    <span v-else class="material-symbols-outlined text-2xl opacity-30 flex items-center justify-center h-full">person</span>
                  </div>
                  <p class="text-[10px] font-bold line-clamp-1" :class="isDark ? 'text-white' : 'text-slate-800'">{{ c.name }}</p>
                  <p class="text-[9px] opacity-50 line-clamp-1">{{ c.character }}</p>
                </div>
              </div>
            </div>

            <!-- Film (TMDB): direct link play -->
            <div v-if="detail.movie" class="mb-5 p-3 rounded-xl" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
              <p class="text-xs font-bold mb-2" :class="isDark ? 'text-gray-300' : 'text-slate-600'">
                Putar Film via Direct Link
              </p>
              <div class="flex flex-col sm:flex-row gap-2">
                <input
                  v-model="manualUrl"
                  type="url"
                  placeholder="Tempel direct link film (MP4, M3U8)..."
                  class="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/40"
                  :class="isDark
                    ? 'bg-black/30 border border-white/10 text-white placeholder:text-gray-600'
                    : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400'"
                />
                <button
                  @click="playManual"
                  :disabled="!manualUrl.trim()"
                  class="bg-primary text-on-primary rounded-lg font-bold px-4 py-2 text-sm transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1"
                >
                  <span class="material-symbols-outlined text-base">play_arrow</span>Putar
                </button>
              </div>
            </div>

            <!-- Series (TVMaze/Netflix): episode panel -->
            <div v-if="detail.show" class="mb-5">
              <!-- Putar episode via direct link -->
              <div v-if="currentEpisode" class="mb-4 p-3 rounded-xl" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
                <p class="text-xs font-bold mb-2" :class="isDark ? 'text-gray-300' : 'text-slate-600'">
                  Memutar: {{ currentEpisode.code }} — {{ currentEpisode.title }}
                </p>
                <div class="flex flex-col sm:flex-row gap-2">
                  <input
                    v-model="manualUrl"
                    type="url"
                    placeholder="Tempel direct link episode ini..."
                    class="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/40"
                    :class="isDark
                      ? 'bg-black/30 border border-white/10 text-white placeholder:text-gray-600'
                      : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400'"
                  />
                  <button
                    @click="playManual"
                    :disabled="!manualUrl.trim()"
                    class="bg-primary text-on-primary rounded-lg font-bold px-4 py-2 text-sm transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1"
                  >
                    <span class="material-symbols-outlined text-base">play_arrow</span>Putar
                  </button>
                </div>
              </div>

              <!-- Season tabs -->
              <div v-if="seasons.length" class="space-y-4">
                <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button
                    v-for="s in seasons"
                    :key="s.season"
                    @click="activeSeason = s.season"
                    class="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                    :class="activeSeason === s.season
                      ? 'bg-primary text-on-primary'
                      : (isDark ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900')"
                  >
                    Season {{ s.season }}
                  </button>
                </div>

                <!-- Episode list -->
                <div class="space-y-2">
                  <button
                    v-for="ep in activeEpisodes"
                    :key="ep.id"
                    @click="selectEpisode(ep)"
                    class="w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all group"
                    :class="currentEpisode?.id === ep.id
                      ? (isDark ? 'bg-primary/20 border border-primary/30' : 'bg-primary/10 border border-primary/20')
                      : (isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50')"
                  >
                    <div class="relative w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black/20">
                      <img v-if="ep.still" :src="ep.still" :alt="ep.title" loading="lazy" class="w-full h-full object-cover" />
                      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <span class="material-symbols-outlined text-white">play_arrow</span>
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-bold flex items-center gap-1.5" :class="isDark ? 'text-white' : 'text-slate-900'">
                        <span class="text-primary">{{ ep.code }}</span>
                        <span class="truncate">{{ ep.title }}</span>
                      </p>
                      <p v-if="ep.summary" class="text-[11px] opacity-50 line-clamp-2 mt-0.5">{{ ep.summary }}</p>
                      <span v-if="ep.runtime" class="text-[10px] opacity-40">{{ ep.runtime }} min</span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Netflix series: tidak ada episode list (TMDB tidak return episodes di /tv detail tanpa season endpoint) -->
              <div v-else-if="detail.show.seasons === undefined || detail.show.type === 'tmdb-series'" class="p-4 rounded-xl text-center opacity-50" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
                <span class="material-symbols-outlined text-2xl mb-1 block">info</span>
                <p class="text-xs">{{ detail.show.seasons }} season tersedia. Gunakan direct link untuk memutar episode.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { isDark } = useColorMode()

// --- Tipe ---
interface CatalogShow {
  id: number
  title: string
  year: string
  rating: number
  poster: string
  backdrop: string
  summary: string
  network: string
  genres: string[]
}
interface CatalogEpisode {
  id: number
  title: string
  season: number
  number: number
  code: string
  runtime: number
  still: string
  summary: string
}
interface SeasonGroup {
  season: number
  episodes: CatalogEpisode[]
}

// Tipe item generik (TVMaze show atau TMDB movie/series)
interface CatalogItem {
  id: number
  title: string
  year: string
  rating: number
  votes?: number
  poster: string
  backdrop: string
  summary: string
  genres: string[]
  type: 'show' | 'movie' | 'series'   // show = TVMaze, movie/series = TMDB
  network?: string                      // TVMaze
  networks?: string[]                   // TMDB series
  seasons?: number
  episodes?: number
  runtime?: number
  status?: string
  tagline?: string
}

interface CastMember {
  id: number
  name: string
  character: string
  photo: string
}

// Detail bisa dari TVMaze (show+seasons) atau TMDB (movie/series + cast)
interface ShowDetail {
  show?: CatalogShow & { seasons?: number; episodes?: number; networks?: string[]; tagline?: string; type?: string }
  seasons?: SeasonGroup[]
}
interface MovieDetail {
  movie?: CatalogItem
  cast?: CastMember[]
}
type AnyDetail = ShowDetail & MovieDetail

// --- Tabs ---
const tabs = [
  { key: 'series',  label: 'Series',         icon: 'tv'           },
  { key: 'movies',  label: 'Film Trending',   icon: 'theaters'     },
  { key: 'netflix', label: 'Netflix',         icon: 'smart_display' },
]

// --- PIN gate ---
const unlocked   = ref(false)
const pinInput   = ref('')
const verifying  = ref(false)
const errorMsg   = ref('')

// --- State katalog ---
const activeTab   = ref('series')
const items       = ref<CatalogItem[]>([])
const loadingList = ref(false)
const searchQuery = ref('')
const noApiKey    = ref(false)

// --- Detail / player ---
const detail         = ref<AnyDetail | null>(null)
const seasons        = ref<SeasonGroup[]>([])
const activeSeason   = ref<number>(1)
const currentEpisode = ref<CatalogEpisode | null>(null)
const manualUrl      = ref('')
const activeSrc      = ref('')
const playerError    = ref('')

const activeEpisodes = computed(() =>
  seasons.value.find(s => s.season === activeSeason.value)?.episodes || []
)

// Computed helper untuk modal detail (handle TVMaze & TMDB dalam satu template)
const detailRating  = computed(() => {
  const r = detail.value?.movie?.rating ?? detail.value?.show?.rating
  return r ? r.toFixed(1) : null
})
const detailYear    = computed(() => detail.value?.movie?.year   || detail.value?.show?.year)
const detailSummary = computed(() => detail.value?.movie?.summary || detail.value?.show?.summary)
const detailGenres  = computed(() => detail.value?.movie?.genres  || detail.value?.show?.genres || [])
const detailNetworks = computed(() => {
  const nets = detail.value?.show?.networks || (detail.value?.show?.network ? [detail.value.show.network] : [])
  return nets.join(', ') || null
})

// --- Mount: cek status lock ---
onMounted(async () => {
  try {
    const res = await $fetch<{ unlocked: boolean }>('/api/stream/status')
    unlocked.value = res.unlocked
    if (unlocked.value) await loadTab('series')
  } catch {
    unlocked.value = false
  }
})

// --- PIN ---
async function submitPin() {
  const pin = pinInput.value.trim()
  if (!pin || verifying.value) return
  verifying.value = true
  errorMsg.value  = ''
  try {
    await $fetch('/api/stream/verify', { method: 'POST', body: { pin } })
    unlocked.value = true
    pinInput.value = ''
    await loadTab('series')
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.statusMessage || 'PIN salah.'
  } finally {
    verifying.value = false
  }
}

async function lock() {
  try { await $fetch('/api/stream/lock', { method: 'POST' }) } catch { /* abaikan */ }
  unlocked.value = false
  items.value    = []
  closeDetail()
}

// --- Tab switch ---
async function switchTab(key: string) {
  if (activeTab.value === key && items.value.length) return
  activeTab.value   = key
  searchQuery.value = ''
  noApiKey.value    = false
  await loadTab(key)
}

async function loadTab(key: string) {
  loadingList.value = true
  items.value       = []
  noApiKey.value    = false

  try {
    if (key === 'series') {
      const res = await $fetch<{ results: CatalogItem[] }>('/api/catalog')
      // TVMaze shows — set type=show untuk mapping
      items.value = (res.results || []).map(s => ({ ...s, type: 'show' as const }))
    } else if (key === 'movies') {
      const res = await $fetch<{ results: CatalogItem[]; total: number }>('/api/movies')
      items.value = res.results || []
      if (!items.value.length) noApiKey.value = true
    } else if (key === 'netflix') {
      const res = await $fetch<{ results: CatalogItem[]; total: number }>('/api/netflix')
      items.value = res.results || []
      if (!items.value.length) noApiKey.value = true
    }
  } catch {
    items.value    = []
    noApiKey.value = activeTab.value !== 'series'
  } finally {
    loadingList.value = false
  }
}

// --- Search ---
async function runSearch() {
  const q = searchQuery.value.trim()
  if (!q) {
    await loadTab(activeTab.value)
    return
  }
  loadingList.value = true
  noApiKey.value    = false
  try {
    if (activeTab.value === 'series') {
      const res = await $fetch<{ results: CatalogItem[] }>('/api/catalog', { query: { q } })
      items.value = (res.results || []).map(s => ({ ...s, type: 'show' as const }))
    } else if (activeTab.value === 'movies') {
      const res = await $fetch<{ results: CatalogItem[] }>('/api/movies', { query: { q } })
      items.value = res.results || []
    } else if (activeTab.value === 'netflix') {
      const res = await $fetch<{ results: CatalogItem[] }>('/api/netflix', { query: { q } })
      items.value = res.results || []
    }
  } catch {
    items.value = []
  } finally {
    loadingList.value = false
  }
}

// --- Open detail ---
async function openItem(item: CatalogItem) {
  detail.value         = null
  activeSrc.value      = ''
  currentEpisode.value = null
  manualUrl.value      = ''
  playerError.value    = ''
  seasons.value        = []

  try {
    if (item.type === 'show') {
      // TVMaze — endpoint /api/catalog/:id
      const res = await $fetch<ShowDetail>(`/api/catalog/${item.id}`)
      detail.value  = res
      seasons.value = res.seasons || []
      activeSeason.value = seasons.value[0]?.season ?? 1
    } else if (item.type === 'movie') {
      // TMDB Movie
      const res = await $fetch<MovieDetail>(`/api/movies/detail?id=${item.id}`)
      detail.value = res
    } else if (item.type === 'series') {
      // TMDB Series (Netflix)
      const res = await $fetch<MovieDetail>(`/api/netflix/detail?id=${item.id}`)
      // Wrap ke show supaya template menampilkan season info
      detail.value = {
        show: {
          ...(res.movie as any),
          type: 'tmdb-series',
        },
        cast: res.cast,
        seasons: [],
      }
    }
  } catch {
    playerError.value = 'Gagal memuat detail.'
    detail.value = {
      show: item as any,
      seasons: [],
    }
  }
}

function closeDetail() {
  detail.value         = null
  seasons.value        = []
  activeSrc.value      = ''
  currentEpisode.value = null
  manualUrl.value      = ''
  playerError.value    = ''
}

function selectEpisode(ep: CatalogEpisode) {
  currentEpisode.value = ep
  activeSrc.value      = ''
  manualUrl.value      = ''
  playerError.value    = ''
}

function playManual() {
  const url = manualUrl.value.trim()
  if (!url) return
  playerError.value = ''
  activeSrc.value   = `/api/stream/proxy?url=${encodeURIComponent(url)}`
}

function onVideoError() {
  playerError.value = 'Gagal memutar. Link mungkin expired, terkunci, atau sumber tidak diizinkan.'
}
</script>

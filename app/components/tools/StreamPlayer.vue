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
            <p class="text-[10px] md:text-xs opacity-60" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Jelajahi film & series</p>
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

      <!-- Loading grid -->
      <div v-if="loadingList" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div v-for="n in 10" :key="n" class="aspect-[2/3] rounded-xl animate-pulse" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>
      </div>

      <!-- Grid poster (Netflix-style) -->
      <div v-else-if="shows.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <button
          v-for="show in shows"
          :key="show.id"
          @click="openShow(show.id)"
          class="group text-left relative rounded-xl overflow-hidden aspect-[2/3] focus:outline-none focus:ring-2 focus:ring-primary/60 transition-transform hover:scale-[1.03]"
          :class="isDark ? 'bg-white/5' : 'bg-slate-100'"
        >
          <img
            v-if="show.poster"
            :src="show.poster"
            :alt="show.title"
            loading="lazy"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl opacity-30">image</span>
          </div>

          <!-- Overlay info saat hover -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <p class="text-white text-xs font-bold line-clamp-2">{{ show.title }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="show.year" class="text-[10px] text-gray-300">{{ show.year }}</span>
            </div>
          </div>

          <!-- Rating badge -->
          <div v-if="show.rating" class="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[11px]">star</span>{{ show.rating.toFixed(1) }}
          </div>
        </button>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-16 opacity-50">
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
                v-if="detail.show?.backdrop || detail.show?.poster"
                :src="detail.show.backdrop || detail.show.poster"
                :alt="detail.show?.title"
                class="w-full h-full object-cover opacity-60"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="material-symbols-outlined text-6xl text-white/70">movie</span>
              </div>
            </template>
          </div>

          <div class="p-5 md:p-6 max-h-[55vh] overflow-y-auto">
            <h3 class="font-headline font-black text-xl mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ detail.show?.title }}
            </h3>
            <div class="flex flex-wrap items-center gap-2 text-xs mb-3 opacity-70">
              <span v-if="detail.show?.rating" class="text-amber-500 font-bold flex items-center gap-0.5">
                <span class="material-symbols-outlined text-sm">star</span>{{ detail.show.rating.toFixed(1) }}
              </span>
              <span v-if="detail.show?.year">{{ detail.show.year }}</span>
              <span v-if="detail.show?.network">· {{ detail.show.network }}</span>
              <span v-for="g in (detail.show?.genres || [])" :key="g" class="px-2 py-0.5 rounded-full" :class="isDark ? 'bg-white/10' : 'bg-slate-100'">{{ g }}</span>
            </div>
            <p v-if="detail.show?.summary" class="text-sm opacity-70 mb-5 leading-relaxed">{{ detail.show.summary }}</p>

            <p v-if="playerError" class="text-xs font-bold text-red-500 mb-4">{{ playerError }}</p>

            <!-- Putar episode via direct link (kamu yang sediakan URL-nya) -->
            <div v-if="currentEpisode" class="mb-5 p-3 rounded-xl" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
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
interface ShowDetail {
  show: CatalogShow
  seasons: SeasonGroup[]
}

// --- PIN gate ---
const unlocked = ref(false)
const pinInput = ref('')
const verifying = ref(false)
const errorMsg = ref('')

// --- Katalog ---
const shows = ref<CatalogShow[]>([])
const loadingList = ref(false)
const searchQuery = ref('')

// --- Detail / player ---
const detail = ref<ShowDetail | null>(null)
const seasons = ref<SeasonGroup[]>([])
const activeSeason = ref<number>(1)
const currentEpisode = ref<CatalogEpisode | null>(null)
const manualUrl = ref('')
const activeSrc = ref('')
const playerError = ref('')

const activeEpisodes = computed(() =>
  seasons.value.find(s => s.season === activeSeason.value)?.episodes || []
)

// Cek status unlock saat mount (cookie mungkin masih valid)
onMounted(async () => {
  try {
    const res = await $fetch<{ unlocked: boolean }>('/api/stream/status')
    unlocked.value = res.unlocked
    if (unlocked.value) await loadTrending()
  } catch {
    unlocked.value = false
  }
})

async function submitPin() {
  const pin = pinInput.value.trim()
  if (!pin || verifying.value) return
  verifying.value = true
  errorMsg.value = ''
  try {
    await $fetch('/api/stream/verify', { method: 'POST', body: { pin } })
    unlocked.value = true
    pinInput.value = ''
    await loadTrending()
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.statusMessage || 'PIN salah.'
  } finally {
    verifying.value = false
  }
}

async function lock() {
  try {
    await $fetch('/api/stream/lock', { method: 'POST' })
  } catch { /* abaikan — tetap lock di UI */ }
  unlocked.value = false
  shows.value = []
  closeDetail()
}

async function loadTrending() {
  loadingList.value = true
  try {
    const res = await $fetch<{ results: CatalogShow[] }>('/api/catalog')
    shows.value = res.results || []
  } catch {
    shows.value = []
  } finally {
    loadingList.value = false
  }
}

async function runSearch() {
  const q = searchQuery.value.trim()
  if (!q) {
    await loadTrending()
    return
  }
  loadingList.value = true
  try {
    const res = await $fetch<{ results: CatalogShow[] }>('/api/catalog', { query: { q } })
    shows.value = res.results || []
  } catch {
    shows.value = []
  } finally {
    loadingList.value = false
  }
}

async function openShow(id: number) {
  detail.value = null
  activeSrc.value = ''
  currentEpisode.value = null
  manualUrl.value = ''
  playerError.value = ''
  try {
    const res = await $fetch<ShowDetail>(`/api/catalog/${id}`)
    detail.value = res
    seasons.value = res.seasons || []
    activeSeason.value = seasons.value[0]?.season ?? 1
  } catch {
    playerError.value = 'Gagal memuat detail.'
    detail.value = { show: { id } as CatalogShow, seasons: [] }
  }
}

function closeDetail() {
  detail.value = null
  seasons.value = []
  activeSrc.value = ''
  currentEpisode.value = null
  manualUrl.value = ''
  playerError.value = ''
}

function selectEpisode(ep: CatalogEpisode) {
  currentEpisode.value = ep
  activeSrc.value = ''
  manualUrl.value = ''
  playerError.value = ''
}

// Putar direct link yang ditempel user lewat proxy server (Range/seeking didukung)
function playManual() {
  const url = manualUrl.value.trim()
  if (!url) return
  playerError.value = ''
  activeSrc.value = `/api/stream/proxy?url=${encodeURIComponent(url)}`
}

function onVideoError() {
  playerError.value = 'Gagal memutar. Link mungkin expired, terkunci, atau sumber tidak diizinkan.'
}
</script>

<template>
  <div
    ref="tvContainerRef"
    class="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-[#06080d] text-slate-100 select-none font-sans"
    :class="{ 'cursor-none': isInactive && isPlaying }"
    @mousemove="handleActivity"
    @keydown="handleKeydown"
  >
    <!-- Background Ambient Glow & Islamic Ornament Watermark -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <!-- Glow Emerald Kiri Atas -->
      <div
        class="absolute -top-32 -left-32 size-[600px] rounded-full bg-emerald-600/15 blur-[140px] transition-transform duration-1000"
        :class="{ 'scale-125 opacity-90': isPlaying, 'scale-100 opacity-40': !isPlaying }"
      />
      <!-- Glow Biru Safir Kanan Bawah -->
      <div
        class="absolute -bottom-40 -right-40 size-[700px] rounded-full bg-blue-600/10 blur-[160px] transition-transform duration-1000"
        :class="{ 'scale-110 opacity-70': isPlaying, 'scale-100 opacity-30': !isPlaying }"
      />
      <!-- Pola Geometris Islami Samar (Subtle Star Pattern) -->
      <div class="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.04)_1.5px,transparent_1.5px)] [background-size:36px_36px] opacity-70" />
    </div>

    <!-- ============================================================== -->
    <!-- BARIS ATAS: HEADER SMART TV (BRANDING, JAM DIGITAL & KONTROL) -->
    <!-- ============================================================== -->
    <header
      class="relative z-20 flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8 transition-opacity duration-300"
      :class="{ 'opacity-0': isInactive && isPlaying, 'opacity-100': !isInactive || !isPlaying }"
    >
      <!-- Sisi Kiri: Branding FiGo Quran TV -->
      <div class="flex items-center gap-3">
        <div class="grid size-10 place-items-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
          <span class="material-symbols-outlined text-2xl">tv_gen</span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold tracking-wider uppercase text-white">FiGo Quran</span>
            <span class="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 tracking-wider">TV MODE</span>
          </div>
          <p class="text-xs text-slate-400">Rasm Utsmani Standar Indonesia • Audio Studio</p>
        </div>
      </div>

      <!-- Sisi Tengah: Jam Dinding Digital Real-time untuk Display Ruangan / Smart TV -->
      <div class="hidden md:flex flex-col items-center">
        <div class="font-mono text-2xl lg:text-3xl font-bold tracking-widest text-emerald-300 drop-shadow-sm">
          {{ currentTimeStr }}
        </div>
        <div class="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
          {{ currentDateStr }}
        </div>
      </div>

      <!-- Sisi Kanan: Tombol Kendali Layar Penuh & Tutup -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Toggle Layar Penuh (Browser Fullscreen API) -->
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer backdrop-blur-md"
          :title="isFullscreen ? 'Keluar Layar Penuh (F)' : 'Layar Penuh TV (F)'"
          @click="toggleFullscreen"
        >
          <span class="material-symbols-outlined text-lg">{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</span>
          <span class="hidden sm:inline">{{ isFullscreen ? 'Layar Biasa' : 'Layar Penuh' }}</span>
        </button>

        <!-- Tombol Keluar dari TV Mode -->
        <button
          type="button"
          class="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 transition cursor-pointer backdrop-blur-md"
          title="Keluar dari Mode TV (Esc)"
          @click="emit('close')"
        >
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
    </header>

    <!-- ============================================================== -->
    <!-- AREA UTAMA DASHBOARD: 2-KOLOM SINEMATIK (16:9 RATIO LAYAR BESAR) -->
    <!-- ============================================================== -->
    <main class="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center px-6 sm:px-10 lg:px-14 py-4 min-h-0 overflow-y-auto no-scrollbar">
      <!-- ========================================================== -->
      <!-- SISI KIRI: MUSIC PLAYER HUB (VINYL ORNAMENT, METADATA & KENDALI) -->
      <!-- ========================================================== -->
      <div class="lg:col-span-5 xl:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
        <!-- Vinyl Ornamen Kaligrafi Surah (Berputar saat Audio Dimainkan) -->
        <div class="relative group">
          <!-- Piringan Luar Glassmorphism -->
          <div
            class="relative size-44 sm:size-56 md:size-64 rounded-full p-2.5 bg-gradient-to-br from-emerald-500/20 via-white/5 to-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
          >
            <!-- Cincin Vinyl Berputar -->
            <div
              class="size-full rounded-full border border-dashed border-emerald-500/40 p-3.5 flex items-center justify-center"
              :class="{ 'animate-spin-slow': isPlaying }"
            >
              <!-- Lingkaran Inti Piringan Musik -->
              <div class="size-full rounded-full bg-gradient-to-br from-slate-900 to-black border border-emerald-500/30 flex flex-col items-center justify-center p-4 relative shadow-inner">
                <!-- Kaligrafi Nama Surah Arab -->
                <span class="font-arabic text-3xl sm:text-4xl text-emerald-400 drop-shadow-md select-text">
                  {{ activeSurah?.nama }}
                </span>
                <!-- Nomor Surah -->
                <span class="mt-1 font-mono text-[11px] font-bold text-emerald-500/90 tracking-wider">
                  SURAH {{ activeSurah?.nomor }}
                </span>
                <!-- Titik Lubang Tengah Vinyl -->
                <div class="size-4 rounded-full bg-slate-950 border border-emerald-500/60 mt-1 shadow-inner" />
              </div>
            </div>

            <!-- Gelombang Suara Animasi Saat Play -->
            <div
              v-if="isPlaying"
              class="absolute -bottom-3 inset-x-0 mx-auto w-max px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 text-[11px] font-semibold text-emerald-300"
            >
              <span class="material-symbols-outlined text-sm animate-pulse">graphic_eq</span>
              <span>Sedang Tilawah</span>
            </div>
          </div>
        </div>

        <!-- Info Surah & Qari -->
        <div class="space-y-2 w-full max-w-sm">
          <div class="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
            <span class="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
              QS {{ activeSurah?.nomor }}:{{ playingAyat || 1 }}
            </span>
            <span class="rounded-xl border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              {{ activeSurah?.tempatTurun }} • {{ activeSurah?.jumlahAyat }} Ayat
            </span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
            Surah {{ activeSurah?.namaLatin }}
          </h2>

          <p class="text-xs text-slate-400">
            Arti: <strong class="text-slate-200">{{ activeSurah?.arti }}</strong>
          </p>

          <!-- Qari Aktif -->
          <div class="pt-2 flex items-center justify-center lg:justify-start gap-2.5">
            <div class="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span class="text-xs font-semibold text-emerald-300">
              {{ currentQariName }}
            </span>
          </div>
        </div>

        <!-- Kendali Cepat Pemutar di Sisi Kiri (TV Controller) -->
        <div class="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl space-y-3">
          <!-- Timeline Slider -->
          <div class="space-y-1.5">
            <div class="relative w-full h-2 cursor-pointer flex items-center group/seek">
              <input
                type="range"
                min="0"
                :max="audioDuration || 100"
                step="0.1"
                :value="currentAudioTime"
                class="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer"
                @input="handleSeekInput(Number(($event.target as HTMLInputElement).value))"
                @change="handleSeekChange(Number(($event.target as HTMLInputElement).value))"
              />
              <div class="absolute inset-x-0 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full" :style="{ width: `${audioProgressPercent}%` }" />
              </div>
              <div
                class="absolute size-3 rounded-full bg-white shadow-md ring-2 ring-emerald-400 -translate-x-1/2 pointer-events-none"
                :style="{ left: `${audioProgressPercent}%` }"
              />
            </div>

            <!-- Running Time / Total Duration -->
            <div class="flex items-center justify-between text-[11px] font-mono font-medium text-slate-400">
              <span class="text-emerald-400 font-bold">{{ formatAudioTime(currentAudioTime) }}</span>
              <span>{{ formatAudioTime(audioDuration) }}</span>
            </div>
          </div>

          <!-- Tombol Kendali Musik -->
          <div class="flex items-center justify-center gap-3">
            <!-- Mode Lanjut vs Per Ayat -->
            <button
              type="button"
              class="grid size-9 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              :class="playMode === 'continuous' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : ''"
              :title="playMode === 'continuous' ? 'Mode: Lanjut Mulus Studio' : 'Mode: Per Ayat'"
              @click="togglePlayMode"
            >
              <span class="material-symbols-outlined text-lg">{{ playMode === 'continuous' ? 'all_inclusive' : 'filter_1' }}</span>
            </button>

            <!-- Ayat Sebelumnya -->
            <button
              type="button"
              class="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              title="Ayat Sebelumnya (Panah Kiri)"
              @click="skipPreviousAyat"
            >
              <span class="material-symbols-outlined text-xl">skip_previous</span>
            </button>

            <!-- Play / Pause Utama -->
            <button
              type="button"
              class="grid size-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition cursor-pointer"
              :title="isPlaying ? 'Jeda Audio (Spasi)' : 'Putar Audio (Spasi)'"
              @click="togglePlay"
            >
              <span class="material-symbols-outlined text-2xl font-bold">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
            </button>

            <!-- Ayat Selanjutnya -->
            <button
              type="button"
              class="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              title="Ayat Selanjutnya (Panah Kanan)"
              @click="skipNextAyat"
            >
              <span class="material-symbols-outlined text-xl">skip_next</span>
            </button>

            <!-- Ganti Surah / Daftar Cepat -->
            <button
              type="button"
              class="grid size-9 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              title="Pilih Surah Lain"
              @click="emit('openSurahList')"
            >
              <span class="material-symbols-outlined text-lg">format_list_bulleted</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================== -->
      <!-- SISI KANAN: THE ACTIVE AYAT SPOTLIGHT (SINEMATIK & BESAR) -->
      <!-- ========================================================== -->
      <div class="lg:col-span-7 xl:col-span-8 flex flex-col justify-center h-full min-h-[380px] sm:min-h-[460px]">
        <div class="relative w-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden flex flex-col justify-between">
          <!-- Aksen Garis Emas Puncak Kartu -->
          <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

          <!-- Header Kartu Ayat Aktif -->
          <div class="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
            <div class="flex items-center gap-2">
              <span class="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                AYAT {{ activeAyatNumber }}
              </span>
              <span class="text-xs text-slate-400 font-medium">
                dari {{ activeSurah?.jumlahAyat }} Ayat
              </span>
            </div>

            <!-- Petunjuk Tombol Remote Smart TV -->
            <div class="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span class="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10">Spasi</span> Putar/Jeda
              <span class="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10">◀ ▶</span> Ganti Ayat
              <span class="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10">F</span> Layar Penuh
            </div>
          </div>

          <!-- Transisi Teks Ayat yang Halus (Smooth Cross-fade saat Berganti) -->
          <Transition name="ayat-fade" mode="out-in">
            <div :key="activeAyatNumber" class="space-y-6 sm:space-y-8 my-auto">
              <!-- Teks Arab Rasm Utsmani Berukuran Besar (Ultra-Legible dari Sofa TV) -->
              <div class="text-right" dir="rtl">
                <p
                  class="font-arabic font-normal tracking-wide text-white leading-[2.4] sm:leading-[2.6] select-text drop-shadow-md text-3xl sm:text-4xl md:text-5xl lg:text-[46px]"
                >
                  {{ activeAyatData?.teksArab }}

                  <!-- Medali Nomor Ayat Emas/Emerald -->
                  <span
                    class="inline-flex items-center justify-center size-10 sm:size-12 mx-2 sm:mx-3 align-middle select-none relative text-emerald-400 shrink-0"
                    dir="ltr"
                  >
                    <svg class="size-full absolute inset-0 drop-shadow-md" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.5" stroke-dasharray="1.5 2.5" />
                      <path
                        d="M20 3 L24.5 7.5 L31 7.5 L32.5 14 L37 18.5 L35 24.5 L37 30 L31 32.5 L29 37 L20 35 L11 37 L9 32.5 L3 30 L5 24.5 L3 18.5 L7.5 14 L9 7.5 L15.5 7.5 Z"
                        stroke="currentColor"
                        stroke-width="1.2"
                        fill="currentColor"
                        fill-opacity="0.12"
                      />
                      <circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.8" />
                    </svg>
                    <span class="font-arabic font-bold text-xs sm:text-sm pt-0.5 text-emerald-300 relative z-10 leading-none">
                      {{ toArabicDigits(activeAyatNumber) }}
                    </span>
                  </span>
                </p>
              </div>

              <!-- Transliterasi Latin Fonetik Standar (Tegak & Jelas) -->
              <div v-if="activeAyatData?.teksLatin" class="pt-2">
                <p class="font-sans font-medium text-emerald-400 text-sm sm:text-base md:text-lg leading-relaxed tracking-wide select-text">
                  {{ activeAyatData.teksLatin }}
                </p>
              </div>

              <!-- Terjemahan Resmi Kemenag RI -->
              <div v-if="activeAyatData?.teksIndonesia" class="border-t border-white/[0.08] pt-4">
                <p class="font-sans text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed select-text">
                  {{ activeAyatData.teksIndonesia }}
                </p>
              </div>
            </div>
          </Transition>

          <!-- Footer Kartu: Navigasi Cepat Antara Ayat -->
          <div class="flex items-center justify-between border-t border-white/[0.08] pt-4 mt-6 text-xs text-slate-400">
            <button
              type="button"
              class="flex items-center gap-1 hover:text-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="activeAyatNumber <= 1"
              @click="skipPreviousAyat"
            >
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              <span>Sebelumnya</span>
            </button>

            <span class="font-mono text-[11px] text-slate-500">
              Gunakan remote atau keyboard
            </span>

            <button
              type="button"
              class="flex items-center gap-1 hover:text-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="activeAyatNumber >= (activeSurah?.jumlahAyat || 1)"
              @click="skipNextAyat"
            >
              <span>Selanjutnya</span>
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Baris Footer Sederhana & Ramah TV -->
    <footer
      class="relative z-20 flex items-center justify-between px-6 pb-5 sm:px-10 sm:pb-6 text-xs text-slate-500 transition-opacity duration-300"
      :class="{ 'opacity-0': isInactive && isPlaying, 'opacity-100': !isInactive || !isPlaying }"
    >
      <div class="flex items-center gap-2">
        <span class="size-2 rounded-full bg-emerald-500" />
        <span>Audio Sinkron Otomatis Mengikuti Detik Tilawah Syeikh Yasser Al-Dosari</span>
      </div>
      <div>
        Tekan <kbd class="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">Esc</kbd> untuk menutup
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuran, toArabicDigits } from '~/composables/useQuran'
import type { SurahDetail } from '~/types/quran'

const props = defineProps<{
  currentSurah?: SurahDetail | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'openSurahList'): void
}>()

const {
  currentSurah: composableSurah,
  playingAyat,
  isPlaying,
  playMode,
  currentTime,
  duration,
  selectedQari,
  availableQaris,
  togglePlayMode,
  playAyat,
  playFullSurah,
  skipNextAyat,
  skipPreviousAyat,
  pauseAudio,
  resumeAudio,
  seekAudio,
  previewSeek,
  formatAudioTime
} = useQuran()

// Surah Aktif (Menggabungkan Prop dan Composable State)
const activeSurah = computed(() => {
  return props.currentSurah || composableSurah.value
})

// Referensi Kontainer untuk Browser Fullscreen API
const tvContainerRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

// Jam Dinding Digital Real-time untuk Smart Display
const currentTimeStr = ref('')
const currentDateStr = ref('')
let clockTimer: any = null

const updateClock = () => {
  const now = new Date()
  currentTimeStr.value = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentDateStr.value = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Inactivity Auto-dim: sembunyikan kursor dan tombol saat memutar tilawah di TV jika tidak ada pergerakan
const isInactive = ref(false)
let inactivityTimer: any = null

const handleActivity = () => {
  isInactive.value = false
  if (inactivityTimer) clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    isInactive.value = true
  }, 4500)
}

// Ayat Aktif yang Sedang Ditampilkan
const activeAyatNumber = computed(() => {
  return playingAyat.value || 1
})

const activeAyatData = computed(() => {
  const s = activeSurah.value
  if (!s || !s.ayat || s.ayat.length === 0) return null
  const num = activeAyatNumber.value
  return s.ayat.find((a) => a.nomorAyat === num) || s.ayat[0]
})

const currentQariName = computed(() => {
  const q = availableQaris.value.find((item) => item.code === selectedQari.value)
  return q ? q.name : 'Syeikh Yasser Al-Dosari'
})

// Logika Seekbar Garis Waktu
const isDraggingSeek = ref(false)
const localSeekTime = ref(0)

const currentAudioTime = computed(() => {
  return isDraggingSeek.value ? localSeekTime.value : currentTime.value
})

const audioDuration = computed(() => {
  return duration.value || 0
})

const audioProgressPercent = computed(() => {
  if (!audioDuration.value || audioDuration.value <= 0) return 0
  const pct = (currentAudioTime.value / audioDuration.value) * 100
  return Math.max(0, Math.min(100, pct))
})

const handleSeekInput = (val: number) => {
  isDraggingSeek.value = true
  localSeekTime.value = val
  previewSeek(val)
}

const handleSeekChange = (val: number) => {
  isDraggingSeek.value = false
  seekAudio(val)
}

const togglePlay = () => {
  const s = activeSurah.value
  if (!s) return
  if (isPlaying.value) {
    pauseAudio()
  } else if (playingAyat.value) {
    resumeAudio()
  } else {
    playFullSurah(s.nomor)
  }
}

// Fitur Layar Penuh (Browser Fullscreen API)
const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      if (tvContainerRef.value?.requestFullscreen) {
        await tvContainerRef.value.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    }
  } catch (err) {
    console.warn('Fullscreen ditolak peramban:', err)
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// Penanganan Tombol Keyboard & Remote Control Smart TV
const handleKeydown = (event: KeyboardEvent) => {
  handleActivity()
  if (event.key === ' ' || event.code === 'Space') {
    event.preventDefault()
    togglePlay()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    skipNextAyat()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    skipPreviousAyat()
  } else if (event.key === 'f' || event.key === 'F') {
    event.preventDefault()
    toggleFullscreen()
  } else if (event.key === 'Escape') {
    if (!document.fullscreenElement) {
      emit('close')
    }
  }
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  handleActivity()

  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  // Otomatis mulai putar tilawah saat masuk Mode TV jika belum berputar
  const s = activeSurah.value
  if (!isPlaying.value && s) {
    if (playingAyat.value) {
      resumeAudio()
    } else {
      playFullSurah(s.nomor)
    }
  }
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (inactivityTimer) clearTimeout(inactivityTimer)
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)

  // Keluar dari fullscreen jika masih aktif saat komponen ditutup
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {})
  }
})
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 40s linear infinite;
}

/* Transisi Halus Pergantian Ayat (Sinematik Cross-fade) */
.ayat-fade-enter-active,
.ayat-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.ayat-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.99);
}

.ayat-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.99);
}
</style>

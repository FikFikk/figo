import { ref, computed } from 'vue'
import type { SurahSummary, SurahDetail, JuzItem, QariOption } from '~/types/quran'

export const QARI_OPTIONS: QariOption[] = [
  { id: '06', code: '06', name: 'Syeikh Yasser Al-Dosari', role: 'Imam Masjidil Haram' },
  { id: '05', code: '05', name: 'Syeikh Misyari Rasyid Al-Afasy', role: 'Imam Kuwait' },
  { id: '03', code: '03', name: 'Syeikh Abdurrahman As-Sudais', role: 'Imam Besar Masjidil Haram' },
  { id: '01', code: '01', name: 'Syeikh Abdullah Al-Juhany', role: 'Imam Masjidil Haram' },
  { id: '02', code: '02', name: 'Syeikh Abdul Muhsin Al-Qasim', role: 'Imam Masjid Nabawi' },
  { id: '04', code: '04', name: 'Syeikh Ibrahim Al-Dossari', role: 'Qari Internasional' }
]

export interface LastReadItem {
  surahNumber: number
  surahName: string
  ayatNumber: number
  timestamp: number
}

export interface AyatTimestamp {
  ayat: number
  start: number
  end: number
}

// 1. Pemutar Audio Surah Utuh (Full Continuous Studio Audio - 100% Gapless & Smooth Tanpa Nyandet)
let fullAudioPlayer: HTMLAudioElement | null = null
const currentFullSurahNumber = ref<number | null>(null)
let yasserTimestamps: Record<string, AyatTimestamp[]> = {}
let targetSingleAyat: number | null = null

// Jeda antisipasi lirik (0.5 detik): menampilkan teks ayat berikutnya saat pelafalan ayat sebelumnya selesai
// dan qari sedang mengambil jeda napas (waqaf), memberi waktu jeda visual bagi pembaca agar ritme membaca selaras
const LYRIC_LEAD_TIME = 0.5

// State Reaktif Waktu Pemutaran Audio (Quran.com Style Timeline)
const currentTime = ref(0)
const duration = ref(0)
const isSeeking = ref(false)

// 2. Dual-Deck Audio Engine untuk Qari Streaming Online
let deckA: HTMLAudioElement | null = null
let deckB: HTMLAudioElement | null = null
let activeDeckKey: 'A' | 'B' = 'A'
let checkTimer: any = null
let hasTriggeredEarly = false

// State Singleton Global untuk Al-Qur'an (Dibagikan ke Halaman & Mode Smart TV)
const surahs = ref<SurahSummary[]>([])
const juzs = ref<JuzItem[]>([])
const currentSurah = ref<SurahDetail | null>(null)
const loading = ref(false)
const selectedQari = ref('06') // Bawaan utama: Syeikh Yasser Al-Dosari (Lokal)
const lastRead = ref<LastReadItem | null>(null)
const isOnline = ref(true)
const onlineApiFailed = ref(false)
const playingAyat = ref<number | null>(null)
const isPlaying = ref(false)
const playMode = ref<'continuous' | 'single'>('continuous')

export function useQuran() {
  const togglePlayMode = () => {
    playMode.value = playMode.value === 'continuous' ? 'single' : 'continuous'
    if (import.meta.client) {
      localStorage.setItem('figo_quran_playmode', playMode.value)
    }
  }

  const initDecks = () => {
    if (!import.meta.client) return
    if (!fullAudioPlayer) {
      fullAudioPlayer = new Audio()
      fullAudioPlayer.preload = 'auto'

      fullAudioPlayer.ontimeupdate = () => {
        if (!fullAudioPlayer || isSeeking.value) return
        if (!currentSurah.value) return

        // Validasi ketat: pastikan berkas audio yang sedang berputar adalah surah yang aktif
        const surahStr = String(currentSurah.value.nomor).padStart(3, '0')
        if (!fullAudioPlayer.src.includes(`${surahStr}.mp3`)) return

        const cur = fullAudioPlayer.currentTime
        currentTime.value = cur
        if (fullAudioPlayer.duration && !isNaN(fullAudioPlayer.duration) && fullAudioPlayer.duration > 0) {
          duration.value = fullAudioPlayer.duration
        }

        const segList = yasserTimestamps[String(currentSurah.value.nomor)] || []
        const matchTime = cur + LYRIC_LEAD_TIME
        let matched = segList.find((s) => matchTime >= s.start && matchTime < s.end)
        if (!matched && cur >= (segList[segList.length - 1]?.start || 0)) {
          matched = segList[segList.length - 1]
        }

        // Hentikan pemutaran jika mode per ayat aktif dan ayat target telah selesai
        if (playMode.value === 'single' && targetSingleAyat !== null) {
          const activeSeg = segList.find((s) => s.ayat === targetSingleAyat)
          if (activeSeg && cur >= activeSeg.end) {
            fullAudioPlayer.pause()
            isPlaying.value = false
            targetSingleAyat = null
            return
          }
        }

        if (matched && playingAyat.value !== matched.ayat) {
          playingAyat.value = matched.ayat
        }
      }

      fullAudioPlayer.onended = () => {
        stopAudio()
      }

      fullAudioPlayer.onerror = () => {
        const surah = currentSurah.value
        const surahStr = surah ? String(surah.nomor).padStart(3, '0') : ''
        const cdnUrl = surah?.audioFull?.['06'] || (surahStr ? `https://cdn.equran.id/audio-full/Yasser-Al-Dosari/${surahStr}.mp3` : '')

        // Jika berkas lokal belum diunduh ke server, otomatis alihkan ke CDN online Equran ID
        if (cdnUrl && fullAudioPlayer && fullAudioPlayer.src && !fullAudioPlayer.src.includes('cdn.equran.id')) {
          console.warn(`[Quran Audio] Berkas lokal belum tersedia di server, beralih ke CDN online: ${cdnUrl}`)
          fullAudioPlayer.src = cdnUrl
          seekAndPlayFull(currentTime.value, true)
          return
        }

        console.warn('Gagal memuat audio quran baik lokal maupun online.')
        onlineApiFailed.value = true
        stopAudio()
      }
    }

    if (!deckA) {
      deckA = new Audio()
      deckA.preload = 'auto'
      deckA.ontimeupdate = () => {
        if (selectedQari.value !== '06' && !isSeeking.value && deckA) {
          currentTime.value = deckA.currentTime
          if (deckA.duration && !isNaN(deckA.duration)) duration.value = deckA.duration
        }
      }
    }
    if (!deckB) {
      deckB = new Audio()
      deckB.preload = 'auto'
      deckB.ontimeupdate = () => {
        if (selectedQari.value !== '06' && !isSeeking.value && deckB) {
          currentTime.value = deckB.currentTime
          if (deckB.duration && !isNaN(deckB.duration)) duration.value = deckB.duration
        }
      }
    }
  }

  const initConnectivity = () => {
    if (import.meta.client) {
      isOnline.value = navigator.onLine
      window.addEventListener('online', () => {
        isOnline.value = true
        onlineApiFailed.value = false
      })
      window.addEventListener('offline', () => {
        isOnline.value = false
        selectedQari.value = '06'
      })
    }
  }

  // Daftar Qari yang tersedia secara dinamis
  const availableQaris = computed<QariOption[]>(() => {
    if (!isOnline.value || onlineApiFailed.value) {
      return [
        {
          id: '06',
          code: '06',
          name: 'Syeikh Yasser Al-Dosari',
          role: 'Imam Masjidil Haram (Lokal • Studio Smooth)'
        }
      ]
    }

    return QARI_OPTIONS.map((q) => {
      if (q.code === '06') {
        return { ...q, role: `${q.role} • Lokal` }
      }
      return { ...q, role: `${q.role} • Online` }
    })
  })

  const loadIndices = async () => {
    try {
      const [surahRes, juzRes, timeRes] = await Promise.all([
        $fetch<SurahSummary[]>('/dataset/quran/surah_index.json'),
        $fetch<JuzItem[]>('/dataset/quran/juz_index.json'),
        $fetch<Record<string, AyatTimestamp[]>>('/dataset/quran/yasser_timestamps.json?v=20260927')
      ])
      surahs.value = surahRes || []
      juzs.value = juzRes || []
      yasserTimestamps = timeRes || {}

      if (currentSurah.value && selectedQari.value === '06') {
        const segList = yasserTimestamps[String(currentSurah.value.nomor)] || []
        if (segList.length > 0) {
          duration.value = segList[segList.length - 1].end
        }
      }
    } catch (e) {
      console.error('Gagal memuat indeks Al-Qur\'an:', e)
    }
  }

  const loadSurah = async (number: number) => {
    // Pastikan pemutaran audio surah sebelumnya dihentikan total saat memuat surah baru
    stopAudio()
    loading.value = true
    try {
      const data = await $fetch<SurahDetail>(`/dataset/quran/surah/${number}.json`)
      currentSurah.value = data
      if (selectedQari.value === '06') {
        const segList = yasserTimestamps[String(number)] || []
        if (segList.length > 0) {
          duration.value = segList[segList.length - 1].end
        }
      }
      currentTime.value = 0
      return data
    } catch (e) {
      console.error(`Gagal memuat Surah ${number}:`, e)
      return null
    } finally {
      loading.value = false
    }
  }

  const loadStorage = () => {
    initConnectivity()
    if (import.meta.client) {
      const savedQari = localStorage.getItem('figo_quran_qari')
      if (savedQari && QARI_OPTIONS.some((q) => q.code === savedQari)) {
        selectedQari.value = savedQari
      }
      const savedMode = localStorage.getItem('figo_quran_playmode')
      if (savedMode === 'continuous' || savedMode === 'single') {
        playMode.value = savedMode
      }
      const savedLastRead = localStorage.getItem('figo_quran_last_read')
      if (savedLastRead) {
        try {
          lastRead.value = JSON.parse(savedLastRead)
        } catch { /* Abaikan error parsing JSON */ }
      }
    }
  }

  const setQari = (code: string) => {
    selectedQari.value = code
    if (import.meta.client) {
      localStorage.setItem('figo_quran_qari', code)
    }
    if (isPlaying.value && currentSurah.value && playingAyat.value) {
      const current = playingAyat.value
      stopAudio()
      playAyat(currentSurah.value.nomor, current)
    } else {
      stopAudio()
    }
  }

  const saveLastRead = (surahNumber: number, surahName: string, ayatNumber: number) => {
    const item: LastReadItem = {
      surahNumber,
      surahName,
      ayatNumber,
      timestamp: Date.now()
    }
    lastRead.value = item
    if (import.meta.client) {
      localStorage.setItem('figo_quran_last_read', JSON.stringify(item))
    }
  }

  const stopAudio = () => {
    if (checkTimer) {
      clearInterval(checkTimer)
      checkTimer = null
    }
    if (fullAudioPlayer) {
      fullAudioPlayer.pause()
      try {
        fullAudioPlayer.currentTime = 0
      } catch { /* Abaikan jika audio belum siap */ }
    }
    if (deckA) {
      deckA.pause()
      deckA.onended = null
      deckA.onerror = null
      try {
        deckA.currentTime = 0
      } catch { /* Abaikan */ }
    }
    if (deckB) {
      deckB.pause()
      deckB.onended = null
      deckB.onerror = null
      try {
        deckB.currentTime = 0
      } catch { /* Abaikan */ }
    }
    currentFullSurahNumber.value = null
    playingAyat.value = null
    isPlaying.value = false
    hasTriggeredEarly = false
    targetSingleAyat = null
    currentTime.value = 0
  }

  const pauseAudio = () => {
    if (fullAudioPlayer && !fullAudioPlayer.paused) {
      fullAudioPlayer.pause()
    }
    if (deckA && !deckA.paused) {
      deckA.pause()
    }
    if (deckB && !deckB.paused) {
      deckB.pause()
    }
    isPlaying.value = false
  }

  const resumeAudio = () => {
    initDecks()
    if (selectedQari.value === '06') {
      if (!currentSurah.value) return
      const surahStr = String(currentSurah.value.nomor).padStart(3, '0')

      // Pastikan berkas audio yang terpasang memang benar surah yang aktif
      if (!fullAudioPlayer || !fullAudioPlayer.src.includes(`/full/${surahStr}.mp3`) || currentFullSurahNumber.value !== currentSurah.value.nomor) {
        playAyat(currentSurah.value.nomor, playingAyat.value || 1)
        return
      }

      fullAudioPlayer.play().then(() => {
        isPlaying.value = true
      }).catch((err) => {
        console.warn('Gagal melanjutkan full audio:', err)
      })
      return
    }

    const curDeck = activeDeckKey === 'A' ? deckA : deckB
    if (curDeck && playingAyat.value && currentSurah.value) {
      curDeck.play().then(() => {
        isPlaying.value = true
      }).catch((err) => {
        console.warn('Gagal melanjutkan online audio:', err)
      })
    }
  }

  // Fungsi utilitas seek aman yang menunggu metadata siap jika audio baru dimuat
  const seekAndPlayFull = (targetTime: number, isNewSrc = false) => {
    if (!fullAudioPlayer) return

    const doSeekAndPlay = () => {
      try {
        if (targetTime > 0) {
          fullAudioPlayer!.currentTime = targetTime
        } else {
          fullAudioPlayer!.currentTime = 0
        }
      } catch (e) {
        console.warn('Gagal set currentTime audio studio:', e)
      }
      fullAudioPlayer!.play().then(() => {
        isPlaying.value = true
      }).catch((err) => {
        console.warn('Autoplay audio studio ditolak peramban:', err)
        isPlaying.value = false
      })
    }

    // Jika sumber berkas audio baru diganti, tunggu metadata baru agar tidak memakai cache berkas sebelumnya
    if (!isNewSrc && fullAudioPlayer.readyState >= 1) {
      doSeekAndPlay()
    } else {
      let isHandled = false
      const onReady = () => {
        if (isHandled) return
        isHandled = true
        fullAudioPlayer?.removeEventListener('loadedmetadata', onReady)
        fullAudioPlayer?.removeEventListener('canplay', onReady)
        doSeekAndPlay()
      }
      fullAudioPlayer.addEventListener('loadedmetadata', onReady, { once: true })
      fullAudioPlayer.addEventListener('canplay', onReady, { once: true })
      fullAudioPlayer.load()
    }
  }

  // Preview Seek Saat Pengguna Menyeret (Drag/Scrub) Seekbar
  const previewSeek = (targetSeconds: number) => {
    isSeeking.value = true
    currentTime.value = targetSeconds
    if (selectedQari.value === '06' && currentSurah.value) {
      const segList = yasserTimestamps[String(currentSurah.value.nomor)] || []
      const matchTime = targetSeconds + LYRIC_LEAD_TIME
      let matched = segList.find((s) => matchTime >= s.start && matchTime < s.end)
      if (!matched && targetSeconds >= (segList[segList.length - 1]?.start || 0)) {
        matched = segList[segList.length - 1]
      }
      if (matched && playingAyat.value !== matched.ayat) {
        playingAyat.value = matched.ayat
      }
    }
  }

  // Lompat Langsung ke Detik/Menit Tertentu (Seek Audio)
  const seekAudio = (targetSeconds: number) => {
    initDecks()
    isSeeking.value = false
    currentTime.value = targetSeconds

    if (selectedQari.value === '06') {
      if (!currentSurah.value) return
      const surahStr = String(currentSurah.value.nomor).padStart(3, '0')
      const targetFullSrc = `/audio/quran/06/full/${surahStr}.mp3`
      const isNewSurah = currentFullSurahNumber.value !== currentSurah.value.nomor || !fullAudioPlayer!.src.includes(`${surahStr}.mp3`)

      if (isNewSurah) {
        fullAudioPlayer!.src = targetFullSrc
        currentFullSurahNumber.value = currentSurah.value.nomor
      }

      const segList = yasserTimestamps[String(currentSurah.value.nomor)] || []
      const matchTime = targetSeconds + LYRIC_LEAD_TIME
      let matched = segList.find((s) => matchTime >= s.start && matchTime < s.end)
      if (!matched && targetSeconds >= (segList[segList.length - 1]?.start || 0)) {
        matched = segList[segList.length - 1]
      }
      if (matched) {
        playingAyat.value = matched.ayat
        if (playMode.value === 'single') {
          targetSingleAyat = matched.ayat
        } else {
          targetSingleAyat = null
        }
      }

      seekAndPlayFull(targetSeconds, isNewSurah)
      return
    }

    // Untuk Qari streaming online: seek pada audio deck aktif
    const curDeck = activeDeckKey === 'A' ? deckA : deckB
    if (curDeck && curDeck.duration) {
      curDeck.currentTime = Math.min(targetSeconds, curDeck.duration)
      if (!isPlaying.value) {
        curDeck.play().then(() => {
          isPlaying.value = true
        }).catch(() => {})
      }
    }
  }

  // Pemutaran Utama: Membedakan Mode Lanjut-Lanjut (Studio Gapless) vs Mode Per Ayat (Hafalan)
  const playAyat = (surahNumber: number, ayatNumber: number) => {
    if (!currentSurah.value) return
    initDecks()

    // 1. Toggle Jeda / Lanjutkan HANYA jika surah yang diputar SAMA PERSIS dan nomor ayat sama
    const isSameSurahAndAyat = currentFullSurahNumber.value === surahNumber && playingAyat.value === ayatNumber

    if (isSameSurahAndAyat && isPlaying.value) {
      pauseAudio()
      return
    }
    if (isSameSurahAndAyat && !isPlaying.value) {
      resumeAudio()
      return
    }

    // 2. KELOMPOK UTAMA: Syeikh Yasser Al-Dosari (Audio Studio Full Lokal / CDN Fallback)
    if (selectedQari.value === '06') {
      const surahStr = String(surahNumber).padStart(3, '0')
      const targetFullSrc = `/audio/quran/06/full/${surahStr}.mp3`

      if (deckA && !deckA.paused) deckA.pause()
      if (deckB && !deckB.paused) deckB.pause()

      const isNewSurah = currentFullSurahNumber.value !== surahNumber || !fullAudioPlayer!.src.includes(`${surahStr}.mp3`)

      // Pasang berkas rekaman surah penuh jika belum aktif atau berganti surah
      if (isNewSurah) {
        fullAudioPlayer!.src = targetFullSrc
        currentFullSurahNumber.value = surahNumber
      }

      // Cari titik awal (detik) ayat ini pada rekaman utuh
      const list = yasserTimestamps[String(surahNumber)] || []
      const segment = list.find((s) => s.ayat === ayatNumber)
      const seekTarget = segment ? segment.start : 0

      if (list.length > 0) {
        duration.value = list[list.length - 1].end
      }

      playingAyat.value = ayatNumber
      currentTime.value = seekTarget

      if (playMode.value === 'single') {
        targetSingleAyat = ayatNumber
      } else {
        targetSingleAyat = null
      }

      seekAndPlayFull(seekTarget, isNewSurah)
      return
    }

    // 3. KELOMPOK STREAMING ONLINE (Qari Lain: Alafasy, Sudais, Al-Juhany, dll.)
    if (fullAudioPlayer && !fullAudioPlayer.paused) {
      fullAudioPlayer.pause()
    }

    const currentDeck = activeDeckKey === 'A' ? deckA : deckB
    const standByDeck = activeDeckKey === 'A' ? deckB : deckA

    const target = currentSurah.value.ayat.find((a) => a.nomorAyat === ayatNumber)
    const qariUrl = target?.audio?.[selectedQari.value] || `https://everyayah.com/data/Alafasy_128kbps/${String(surahNumber).padStart(3, '0')}${String(ayatNumber).padStart(3, '0')}.mp3`

    currentDeck.src = qariUrl
    currentDeck.volume = 1.0
    playingAyat.value = ayatNumber
    isPlaying.value = true

    currentDeck.onerror = () => {
      console.warn('Qari online gagal dimuat, mengalihkan otomatis ke Syeikh Yasser Al-Dosari studio audio.')
      onlineApiFailed.value = true
      selectedQari.value = '06'
      playAyat(surahNumber, ayatNumber)
    }

    currentDeck.onended = () => {
      if (playMode.value === 'single') {
        stopAudio()
        return
      }
      const nextAyat = ayatNumber + 1
      if (currentSurah.value && nextAyat <= currentSurah.value.jumlahAyat) {
        activeDeckKey = activeDeckKey === 'A' ? 'B' : 'A'
        playAyat(surahNumber, nextAyat)
      } else {
        stopAudio()
      }
    }

    currentDeck.play().then(() => {
      if (playMode.value === 'continuous') {
        const nextAyat = ayatNumber + 1
        if (currentSurah.value && nextAyat <= currentSurah.value.jumlahAyat) {
          const nextTarget = currentSurah.value.ayat.find((a) => a.nomorAyat === nextAyat)
          const nextUrl = nextTarget?.audio?.[selectedQari.value]
          if (nextUrl && standByDeck.src !== nextUrl) {
            standByDeck.src = nextUrl
            standByDeck.preload = 'auto'
            standByDeck.load()
          }
        }
      }
    }).catch(() => {
      isPlaying.value = false
    })
  }

  const playFullSurah = (surahNumber: number) => {
    if (!currentSurah.value) return
    playMode.value = 'continuous'
    playAyat(surahNumber, 1)
  }

  const skipNextAyat = () => {
    if (!currentSurah.value) return
    const next = (playingAyat.value || 0) + 1
    if (next <= currentSurah.value.jumlahAyat) {
      playAyat(currentSurah.value.nomor, next)
    }
  }

  const skipPreviousAyat = () => {
    if (!currentSurah.value) return
    const prev = (playingAyat.value || 2) - 1
    if (prev >= 1) {
      playAyat(currentSurah.value.nomor, prev)
    }
  }

  return {
    surahs,
    juzs,
    currentSurah,
    currentFullSurahNumber,
    loading,
    selectedQari,
    availableQaris,
    isOnline,
    onlineApiFailed,
    lastRead,
    playingAyat,
    isPlaying,
    playMode,
    currentTime,
    duration,
    isSeeking,
    togglePlayMode,
    loadIndices,
    loadSurah,
    loadStorage,
    setQari,
    saveLastRead,
    playAyat,
    playFullSurah,
    skipNextAyat,
    skipPreviousAyat,
    pauseAudio,
    resumeAudio,
    stopAudio,
    seekAudio,
    previewSeek,
    formatAudioTime
  }
}

// Format Waktu Audio: jika >= 1 jam (3600 detik) tampilkan Jam:Menit:Detik (cth: 1:08:35 / 1:12:54), jika belum 1 jam tampilkan Menit:Detik tanpa angka jam (cth: 46:39)
export const formatAudioTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00'
  const totalSecs = Math.floor(seconds)

  // Hanya jika durasi sudah mencapai atau melebihi 1 jam (3600 detik) tampilkan jam
  if (totalSecs >= 3600) {
    const hrs = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Jika di bawah 1 jam, format langsung menit:detik tanpa prefix jam
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// Konversi angka Latin ke angka Arab Timur (Eastern Arabic Numerals)
export const toArabicDigits = (num: number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return String(num).replace(/[0-9]/g, (digit) => arabicDigits[parseInt(digit, 10)])
}

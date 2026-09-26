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
let currentFullSurahNumber: number | null = null
let yasserTimestamps: Record<string, AyatTimestamp[]> = {}

// 2. Dual-Deck Audio Engine untuk Qari Streaming Online
let deckA: HTMLAudioElement | null = null
let deckB: HTMLAudioElement | null = null
let activeDeckKey: 'A' | 'B' = 'A'
let checkTimer: any = null
let hasTriggeredEarly = false

export function useQuran() {
  const surahs = ref<SurahSummary[]>([])
  const juzs = ref<JuzItem[]>([])
  const currentSurah = ref<SurahDetail | null>(null)
  const loading = ref(false)
  const selectedQari = ref('06') // Bawaan utama: Syeikh Yasser Al-Dosari (Lokal)

  const lastRead = ref<LastReadItem | null>(null)

  // Status Konektivitas Jaringan & Ketersediaan API Online
  const isOnline = ref(true)
  const onlineApiFailed = ref(false)

  // Status Pemutaran Audio
  const playingAyat = ref<number | null>(null)
  const isPlaying = ref(false)
  const playMode = ref<'continuous' | 'single'>('continuous')

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
    }
    if (!deckA) {
      deckA = new Audio()
      deckA.preload = 'auto'
    }
    if (!deckB) {
      deckB = new Audio()
      deckB.preload = 'auto'
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
        $fetch<Record<string, AyatTimestamp[]>>('/dataset/quran/yasser_timestamps.json')
      ])
      surahs.value = surahRes || []
      juzs.value = juzRes || []
      yasserTimestamps = timeRes || {}
    } catch (e) {
      console.error('Gagal memuat indeks Al-Qur\'an:', e)
    }
  }

  const loadSurah = async (number: number) => {
    loading.value = true
    try {
      const data = await $fetch<SurahDetail>(`/dataset/quran/surah/${number}.json`)
      currentSurah.value = data
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
    }
    if (deckA) {
      deckA.pause()
      deckA.onended = null
      deckA.onerror = null
    }
    if (deckB) {
      deckB.pause()
      deckB.onended = null
      deckB.onerror = null
    }
    playingAyat.value = null
    isPlaying.value = false
    hasTriggeredEarly = false
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
    if (selectedQari.value === '06' && playMode.value === 'continuous' && fullAudioPlayer && fullAudioPlayer.src) {
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
  const seekAndPlayFull = (targetTime: number) => {
    if (!fullAudioPlayer) return

    const doSeekAndPlay = () => {
      try {
        fullAudioPlayer!.currentTime = targetTime
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

    if (fullAudioPlayer.readyState >= 1) {
      doSeekAndPlay()
    } else {
      const onMetadata = () => {
        doSeekAndPlay()
      }
      fullAudioPlayer.addEventListener('loadedmetadata', onMetadata, { once: true })
      fullAudioPlayer.load()
    }
  }

  // Pemutaran Utama: Membedakan Mode Lanjut-Lanjut (Studio Gapless) vs Mode Per Ayat (Hafalan)
  const playAyat = (surahNumber: number, ayatNumber: number) => {
    if (!currentSurah.value) return
    initDecks()

    // 1. Toggle Jeda / Lanjutkan jika menekan tombol pada ayat yang sama
    if (playingAyat.value === ayatNumber && isPlaying.value) {
      pauseAudio()
      return
    }
    if (playingAyat.value === ayatNumber && !isPlaying.value) {
      resumeAudio()
      return
    }

    // 2. KELOMPOK UTAMA: Syeikh Yasser Al-Dosari (Audio Lokal Studio)
    if (selectedQari.value === '06') {
      const surahStr = String(surahNumber).padStart(3, '0')
      const ayatStr = String(ayatNumber).padStart(3, '0')

      // OPSI A: MODE PER AYAT (Stell Per Ayat / Muraja'ah Hafalan)
      // Memutar hanya ayat yang dipilih lalu berhenti secara anggun
      if (playMode.value === 'single') {
        if (fullAudioPlayer && !fullAudioPlayer.paused) {
          fullAudioPlayer.pause()
        }

        const singleSrc = `/audio/quran/06/${surahStr}${ayatStr}.mp3`
        const targetDeck = deckA!
        targetDeck.src = singleSrc
        playingAyat.value = ayatNumber
        isPlaying.value = true

        targetDeck.onended = () => {
          stopAudio()
        }
        targetDeck.onerror = () => {
          console.warn('Gagal memutar berkas per ayat:', singleSrc)
          stopAudio()
        }
        targetDeck.play().catch(() => {
          isPlaying.value = false
        })
        return
      }

      // OPSI B: MODE LANJUT-LANJUT (Continuous Studio Audio - 100% Smooth Tanpa Nyandet)
      // Menggunakan 1 berkas rekaman surah utuh tanpa potongan, dipadu timestamp presisi milidetik
      if (deckA && !deckA.paused) deckA.pause()
      if (deckB && !deckB.paused) deckB.pause()

      const targetFullSrc = `/audio/quran/06/full/${surahStr}.mp3`

      // Pasang berkas rekaman surah penuh jika belum aktif
      if (currentFullSurahNumber !== surahNumber || !fullAudioPlayer!.src.includes(`/full/${surahStr}.mp3`)) {
        fullAudioPlayer!.src = targetFullSrc
        currentFullSurahNumber = surahNumber
      }

      // Cari titik awal (detik) ayat ini pada rekaman utuh
      const list = yasserTimestamps[String(surahNumber)] || []
      const segment = list.find((s) => s.ayat === ayatNumber)
      const seekTarget = segment ? segment.start : 0

      playingAyat.value = ayatNumber
      seekAndPlayFull(seekTarget)

      // Sinkronisasi otomatis nomor ayat aktif & auto-scroll mengikuti waktu audio rekaman studio
      fullAudioPlayer!.ontimeupdate = () => {
        if (!isPlaying.value || !currentSurah.value) return
        const cur = fullAudioPlayer!.currentTime
        const segList = yasserTimestamps[String(currentSurah.value.nomor)] || []
        const matched = segList.find((s) => cur >= s.start && cur < s.end)
        if (matched && playingAyat.value !== matched.ayat) {
          playingAyat.value = matched.ayat
        }
      }

      fullAudioPlayer!.onended = () => {
        stopAudio()
      }

      fullAudioPlayer!.onerror = () => {
        console.warn('Gagal memuat full audio lokal, mencoba fallback online...')
        onlineApiFailed.value = true
        stopAudio()
      }
      return
    }

    // 3. KELOMPOK STREAMING ONLINE (Qari Lain: Alafasy, Sudais, Al-Juhany, dll.)
    if (fullAudioPlayer && !fullAudioPlayer.paused) {
      fullAudioPlayer.pause()
    }

    const currentDeck = activeDeckKey === 'A' ? deckA! : deckB!
    const standByDeck = activeDeckKey === 'A' ? deckB! : deckA!

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
      if (selectedQari.value === '06' && playMode.value === 'continuous' && fullAudioPlayer) {
        const segList = yasserTimestamps[String(currentSurah.value.nomor)] || []
        const segment = segList.find((s) => s.ayat === next)
        if (segment) {
          playingAyat.value = next
          seekAndPlayFull(segment.start)
          return
        }
      }
      playAyat(currentSurah.value.nomor, next)
    }
  }

  const skipPreviousAyat = () => {
    if (!currentSurah.value) return
    const prev = (playingAyat.value || 2) - 1
    if (prev >= 1) {
      if (selectedQari.value === '06' && playMode.value === 'continuous' && fullAudioPlayer) {
        const segList = yasserTimestamps[String(currentSurah.value.nomor)] || []
        const segment = segList.find((s) => s.ayat === prev)
        if (segment) {
          playingAyat.value = prev
          seekAndPlayFull(segment.start)
          return
        }
      }
      playAyat(currentSurah.value.nomor, prev)
    }
  }

  return {
    surahs,
    juzs,
    currentSurah,
    loading,
    selectedQari,
    availableQaris,
    isOnline,
    onlineApiFailed,
    lastRead,
    playingAyat,
    isPlaying,
    playMode,
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
    stopAudio
  }
}

// Konversi angka Latin ke angka Arab Timur (Eastern Arabic Numerals)
export const toArabicDigits = (num: number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return String(num).replace(/[0-9]/g, (digit) => arabicDigits[parseInt(digit, 10)])
}

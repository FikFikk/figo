import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.resolve('public/audio/quran/06')
const OUT_FULL_DIR = path.resolve('public/audio/quran/06/full')
fs.mkdirSync(OUT_DIR, { recursive: true })
fs.mkdirSync(OUT_FULL_DIR, { recursive: true })

const tasks = []

// Kumpulkan tugas unduhan untuk seluruh 114 surah (6.236 ayat) dan 114 surah utuh
for (let s = 1; s <= 114; s++) {
  const surahPath = path.resolve(`public/dataset/quran/surah/${s}.json`)
  if (!fs.existsSync(surahPath)) continue
  const data = JSON.parse(fs.readFileSync(surahPath, 'utf-8'))
  const surahStr = String(s).padStart(3, '0')

  // Unduhan audio surah penuh
  const fullFilename = `${surahStr}.mp3`
  const fullTarget = path.join(OUT_FULL_DIR, fullFilename)
  const fullUrl = data.audioFull?.['06'] || `https://cdn.equran.id/audio-full/Yasser-Al-Dosari/${fullFilename}`
  tasks.push({ url: fullUrl, target: fullTarget, label: `Surah ${s} Full` })

  // Unduhan audio per ayat
  for (const item of data.ayat) {
    const ayatStr = String(item.nomorAyat).padStart(3, '0')
    const filename = `${surahStr}${ayatStr}.mp3`
    const target = path.join(OUT_DIR, filename)
    const url = item.audio?.['06'] || `https://cdn.equran.id/audio-partial/Yasser-Al-Dosari/${filename}`
    tasks.push({ url, target, label: `QS ${s}:${item.nomorAyat}` })
  }
}

console.log(`Total target berkas audio Syeikh Yasser Al-Dosari: ${tasks.length}`)

// Worker pool dengan konkurensi terkontrol (12 thread paralel)
const CONCURRENCY = 12
let completed = 0
let skipped = 0
let failed = 0

async function downloadFile(task) {
  if (fs.existsSync(task.target) && fs.statSync(task.target).size > 1024) {
    skipped++
    return
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(task.url, { headers: { 'User-Agent': 'Mozilla/5.0 (FiGo Quran Downloader)' } })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const arrayBuffer = await res.arrayBuffer()
      fs.writeFileSync(task.target, Buffer.from(arrayBuffer))
      completed++
      return
    } catch (e) {
      if (attempt === 3) {
        failed++
        console.error(`Gagal mengunduh ${task.label} (${task.url}): ${e.message}`)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
      }
    }
  }
}

async function runWorker(iterator) {
  for (const [, task] of iterator) {
    await downloadFile(task)
    const totalProcessed = completed + skipped + failed
    if (totalProcessed % 200 === 0 || totalProcessed === tasks.length) {
      console.log(`Progres: ${totalProcessed}/${tasks.length} (${Math.round((totalProcessed / tasks.length) * 100)}%) - Diunduh: ${completed}, Dilewati: ${skipped}, Gagal: ${failed}`)
    }
  }
}

const iterator = tasks.entries()
const workers = Array.from({ length: CONCURRENCY }, () => runWorker(iterator))
await Promise.all(workers)

console.log(`\nSelesai! Berkas diunduh: ${completed}, Dilewati: ${skipped}, Gagal: ${failed}`)

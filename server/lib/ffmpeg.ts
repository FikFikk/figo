// ============================================================
// ffmpeg — manual merge video+audio fragments
// ============================================================

import { spawn } from 'child_process'
import { basename } from 'path'
import { existsSync, unlinkSync, statSync, copyFileSync } from 'fs'
import { getBinaryPath } from './ytdlp'

/**
 * Manual merge dengan ffmpeg jika yt-dlp merge gagal.
 * Gabungkan video + audio fragments menjadi satu file mp4.
 */
export function manualMerge(fragments: string[], outputPath: string, ffmpegPath: string): Promise<void> {
  const execute = (path: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (fragments.length < 2) {
        // Hanya 1 file — copy langsung
        const src = fragments[0]
        if (src) {
          try {
            copyFileSync(src, outputPath)
            return resolve()
          } catch (e: any) {
            return reject(new Error(`Copy gagal: ${e.message}`))
          }
        }
        return reject(new Error('Tidak ada fragment untuk di-merge'))
      }

      // Identifikasi video vs audio secara lebih akurat (Ekstensi > Ukuran)
      const AUDIO_EXTS = ['.m4a', '.mp3', '.opus', '.aac', '.ogg']
      const withInfo = fragments.map(f => {
        try {
          const size = statSync(f).size
          const isKnownAudio = AUDIO_EXTS.some(ae => f.toLowerCase().endsWith(ae))
          return { path: f, size, isKnownAudio }
        }
        catch { return { path: f, size: 0, isKnownAudio: false } }
      })

      // Cari mana yang Audio: utamakan ekstensi, fallback ke ukuran terkecil
      let audioIdx = withInfo.findIndex(i => i.isKnownAudio)
      if (audioIdx === -1) {
        const sortedBySize = [...withInfo].sort((a, b) => a.size - b.size)
        audioIdx = withInfo.indexOf(sortedBySize[0]!)
      }

      const audioFile = withInfo[audioIdx]!.path
      const videoFile = withInfo.find((_, idx) => idx !== audioIdx)?.path || ''

      console.log(`[Merge] Video: ${basename(videoFile)} (${(statSync(videoFile).size / 1048576).toFixed(1)}MB)`)
      console.log(`[Merge] Audio: ${basename(audioFile)} (${(statSync(audioFile).size / 1048576).toFixed(1)}MB)`)
      console.log(`[Merge] Output: ${basename(outputPath)}`)

      const args = [
        '-i', videoFile,
        '-i', audioFile,
        '-c:v', 'copy',     // Copy video tanpa re-encode (cepat)
        '-c:a', 'aac',      // Convert audio ke AAC agar kompatibel dengan MP4/Browser
        '-b:a', '192k',     // Bitrate audio
        '-movflags', '+faststart',  // Optimasi streaming
        '-y',               // Overwrite
        outputPath,
      ]

      const child = spawn(path, args)
      let stderr = ''
      child.stderr.on('data', (d) => { stderr += d.toString() })

      const timer = setTimeout(() => {
        child.kill('SIGTERM')
        reject(new Error('ffmpeg merge timeout 120s'))
      }, 120_000)

      child.on('close', (code) => {
        clearTimeout(timer)
        if (code === 0 && existsSync(outputPath)) {
          console.log(`[Merge] Berhasil! → ${basename(outputPath)}`)
          // Hapus fragments setelah merge sukses
          for (const f of fragments) {
            try { unlinkSync(f) } catch {}
          }
          resolve()
        } else {
          const err = new Error(`ffmpeg merge gagal (code ${code}): ${stderr.substring(0, 300)}`)
          ;(err as any).code = code
          reject(err)
        }
      })

      child.on('error', (err) => {
        clearTimeout(timer)
        reject(err)
      })
    })
  }

  return execute(ffmpegPath).catch(async (err) => {
    const isLocal = ffmpegPath.includes('server' + (process.platform === 'win32' ? '\\' : '/') + 'api')
    if (isLocal) {
      console.warn(`[Merge] Local ffmpeg gagal, mencoba system ffmpeg...`)
      return execute('ffmpeg')
    }
    throw err
  })
}

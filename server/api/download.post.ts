// ============================================================
// DOWNLOAD API — Thin router: detect platform → dispatch
// Semua logic platform ada di server/lib/platforms/*
// ============================================================

import { defineEventHandler, readBody, createError } from 'h3'
import { join, basename } from 'path'
import { randomUUID } from 'crypto'
import { readdirSync, statSync } from 'fs'

// Core engine
import { downloadJobs } from '../lib/jobs'
import { isBlocked, normalizeUrl } from '../lib/constants'
import { getDownloadDir, cleanupStaleTempFiles, findDownloadedFile } from '../lib/file-utils'
import { execYtdlp, getBinaryPath } from '../lib/ytdlp'
import { manualMerge } from '../lib/ffmpeg'

// Platform extractors
import { isTwitterUrl, fetchTwitterMedia } from '../lib/platforms/twitter'
import { isTikTokUrl, fetchTikTokMedia } from '../lib/platforms/tiktok'
import { isInstagramUrl, fetchInstagramMedia } from '../lib/platforms/instagram'
import { isYouTubeUrl, fetchYouTubeInfo } from '../lib/platforms/youtube'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const targetUrl = body?.url as string
  const mode = (body?.mode as string) || 'info'
  const formatId = body?.formatId as string | undefined

  if (!targetUrl || typeof targetUrl !== 'string') {
    throw createError({ statusCode: 400, message: 'Harap masukkan URL yang valid.' })
  }

  const url = normalizeUrl(targetUrl)

  if (isBlocked(url)) {
    throw createError({
      statusCode: 403,
      message: 'Akses Ditolak: URL mengandung konten dewasa yang tidak diizinkan.',
    })
  }

  try { new URL(url) } catch {
    throw createError({ statusCode: 400, message: 'Format URL tidak valid.' })
  }

  try {
    // ===================== MODE: INFO =====================
    if (mode === 'info') {
      const startTime = Date.now()

      // ---------- TWITTER/X ----------
      if (isTwitterUrl(url)) {
        try {
          const result = await fetchTwitterMedia(url)
          console.log(`[FetchInfo] Twitter success in ${Date.now() - startTime}ms — ${result.mediaItems.length} media items`)

          // Enrich video tanpa qualities
          const enrichedItems = result.mediaItems.map(item => {
            if (item.type === 'video' && !item.qualities) {
              return { ...item, qualities: [{ height: item.height || 720, url: item.url, filesize: null }] }
            }
            return item
          })

          return {
            success: true, mode: 'info', source: 'twitter',
            id: result.id,
            title: result.title,
            thumb: result.thumb,
            avatar: result.avatar,
            duration: null,
            uploader: result.uploader,
            mediaItems: enrichedItems,
            statistics: result.statistics,
            fetchDuration: Date.now() - startTime,
          }
        } catch (err: any) {
          console.error(`[Twitter] FxTwitter API gagal: ${err.message}`)
          throw createError({ statusCode: 422, message: err.message || 'Gagal mengambil media dari tweet.' })
        }
      }

      // ---------- TIKTOK ----------
      if (isTikTokUrl(url)) {
        try {
          const result = await fetchTikTokMedia(url)
          console.log(`[TikTok] Success: ${result.mediaItems.length} media items`)
          return {
            success: true, mode: 'info', source: 'tiktok',
            id: result.id,
            title: result.title,
            uploader: result.uploader,
            thumb: result.thumb,
            avatar: result.avatar,
            mediaItems: result.mediaItems,
            statistics: result.statistics,
            fetchDuration: Date.now() - startTime,
          }
        } catch (err: any) {
          console.error(`[TikTok] tikwm API gagal: ${err.message}`)
          throw createError({ statusCode: 422, message: err.message || 'Gagal mengambil media dari TikTok.' })
        }
      }

      // ---------- INSTAGRAM ----------
      if (isInstagramUrl(url)) {
        try {
          const result = await fetchInstagramMedia(url)
          return {
            success: true, mode: 'info', source: 'instagram',
            title: result.title,
            uploader: result.uploader,
            thumb: result.thumb,
            avatar: result.avatar,
            mediaItems: result.mediaItems,
            statistics: result.statistics,
            fetchDuration: Date.now() - startTime,
          }
        } catch (err: any) {
          console.error(`[Instagram] Gagal: ${err.message}`)
          throw createError({
            statusCode: 422,
            message: err.message || 'Gagal mengambil media. Pastikan akun tidak di-private.',
          })
        }
      }

      // ---------- DEFAULT: yt-dlp (YouTube + semua platform lain) ----------
      const result = await fetchYouTubeInfo(url)
      const fetchDuration = Date.now() - startTime
      console.log(`[FetchInfo] Success in ${fetchDuration}ms for: ${url}`)

      return {
        success: true, mode: 'info',
        source: result.source,
        title: result.title,
        thumb: result.thumb,
        duration: (result as any).duration || null,
        uploader: result.uploader,
        statistics: result.statistics,
        qualities: (result as any).qualities,
        fetchDuration,
      }
    }

    // ===================== MODE: DOWNLOAD =====================
    if (mode === 'download') {
      const jobId = randomUUID()
      const formatStr = formatId || 'best'
      const isAudioOnly = formatStr.includes('bestaudio') && !formatStr.includes('bestvideo')

      // Deteksi ekstensi dari formatId
      const requestedExtMatch = formatStr.match(/\[ext=([^\]]+)\]/)
      const ext = requestedExtMatch ? requestedExtMatch[1]! : (isAudioOnly ? 'm4a' : 'mp4')

      // Output template — biarkan yt-dlp tentukan ekstensi
      const tmpBase = join(getDownloadDir(), `figo-${jobId}`)
      const tmpFile = `${tmpBase}.%(ext)s`

      const ffmpegPath = getBinaryPath('ffmpeg')

      const uploader = (body?.uploader as string) || 'Unknown'
      const resolution = (body?.resolution as string) || (body?.resolutionLabel as string) || 'Media'
      const mediaId = (body?.mediaId as string) || ''
      const safeUploader = uploader.replace(/[/\\?%*:|"<>@]/g, '').trim()
      const idSuffix = mediaId ? `-[${mediaId}]` : ''
      
      const finalName = `figo-${safeUploader}${idSuffix} (${resolution})`

      downloadJobs.set(jobId, { status: 'processing', ext, title: finalName })

      // Background process (fire-and-forget)
      ;(async () => {
        try {
          // Auto-cleanup debounced (max 1x per 5 menit)
          const cleanup = cleanupStaleTempFiles()
          if (cleanup.cleaned > 0) {
            console.log(`[Cleanup] Hapus ${cleanup.cleaned} file lama, freed ${cleanup.freedMB}MB`)
          }

          console.log(`[Job ${jobId}] Starting: format=${formatStr}`)
          const flags: any = {
            format: formatStr,
            output: tmpFile,
            noWarnings: true,
            noCheckCertificates: true,
            ffmpegLocation: ffmpegPath,
            retries: 5,
            fragmentRetries: 5,
            mergeOutputFormat: isAudioOnly ? undefined : ext,
            postprocessorArgs: ext === 'mp4' ? 'ffmpeg:-c:a aac' : undefined,
            downloaderArgs: 'ffmpeg_i:-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5',
          }

          await execYtdlp(url, flags, 600_000, 'download')
          console.log(`[Job ${jobId}] yt-dlp selesai, verifikasi file...`)

          // Cari file hasil download
          const downloadDir = getDownloadDir()
          let result = findDownloadedFile(downloadDir, jobId)
          let actualFile = result.file

          // Manual merge jika yt-dlp merge gagal tapi fragments ada
          if (!actualFile && result.fragments.length >= 2) {
            console.warn(`[Job ${jobId}] Merge yt-dlp gagal, coba manual merge ke ${ext}...`)
            const mergedPath = join(downloadDir, `figo-${jobId}.${ext}`)
            try {
              await manualMerge(result.fragments, mergedPath, ffmpegPath)
              actualFile = mergedPath
            } catch (mergeErr: any) {
              console.error(`[Job ${jobId}] Manual merge gagal:`, mergeErr.message)
              // Fallback: kirim fragment terbesar
              result.fragments.sort((a, b) => {
                try { return statSync(b).size - statSync(a).size } catch { return 0 }
              })
              actualFile = result.fragments[0] || null
              console.warn(`[Job ${jobId}] Fallback ke fragment terbesar: ${actualFile ? basename(actualFile) : 'none'}`)
            }
          } else if (!actualFile && result.fragments.length === 1) {
            actualFile = result.fragments[0] || null
          }

          if (!actualFile) {
            try {
              const allFiles = readdirSync(downloadDir)
              console.error(`[Job ${jobId}] Files di dir: ${allFiles.join(', ')}`)
            } catch {}
            throw new Error('File hasil download tidak ditemukan.')
          }

          // Deteksi ekstensi aktual
          const actualExt = actualFile.split('.').pop() || ext
          const actualMime = actualExt === 'm4a' || actualExt === 'mp3' || actualExt === 'opus'
            ? 'audio/' + (actualExt === 'm4a' ? 'mp4' : actualExt)
            : 'video/mp4'

          console.log(`[Job ${jobId}] Done! File: ${actualFile} (${actualExt})`)

          downloadJobs.set(jobId, {
            ...(downloadJobs.get(jobId) as any),
            status: 'done',
            filePath: actualFile,
            ext: actualExt,
            mimeType: actualMime,
          })
        } catch (err: any) {
          console.error(`[Job ${jobId}] Error:`, err)
          downloadJobs.set(jobId, {
            ...(downloadJobs.get(jobId) as any),
            status: 'error',
            error: err.message || String(err),
          })
        }
      })()

      return { success: true, mode: 'download', jobId }
    }

    throw createError({ statusCode: 400, message: 'Mode tidak valid.' })

  } catch (err: any) {
    let msg = err.message || String(err)

    if (msg.includes('empty media response')) {
      console.warn('[Figo] IG Private/Blocked Post terdeteksi.')
      msg = 'Video/Foto IG di-private atau server diblokir oleh Instagram.'
    } else {
      console.error('[Download Native Error]', msg.split('\n')[0])
      msg = 'Sistem Error: ' + msg.replace('Native Error: ', '')
    }

    if (err.statusCode) throw err
    throw createError({
      statusCode: (msg.includes('di-private')) ? 422 : 500,
      message: msg,
    })
  }
})

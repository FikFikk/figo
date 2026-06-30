import { defineEventHandler, getQuery, createError } from 'h3'
import { assertUnlocked } from '../../lib/stream-auth'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'

/**
 * GET /api/stream/lk21-proxy?url=https://tv11.lk21official.cc/film-slug
 * Resolve URL film LK21 menjadi proxy.m3u8 fisik asli
 */
export default defineEventHandler(async (event) => {
  assertUnlocked(event)
  const { url } = getQuery(event)
  const filmURL = String(url || '').trim()

  if (!filmURL || !filmURL.startsWith('http')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL LK21 tidak valid'
    })
  }

  try {
    const data: any = await $fetch(`${GO_API}/stream/resolve-lk21?url=${encodeURIComponent(filmURL)}`)
    if (!data.success || !data.proxy_url) {
      throw new Error('Gagal mengekstrak stream m3u8 dari LK21')
    }

    return {
      success: true,
      master_m3u8: data.master_m3u8,
      proxy_url: data.proxy_url
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Gagal mengekstrak stream LK21'
    })
  }
})

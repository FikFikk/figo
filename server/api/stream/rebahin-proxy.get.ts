import { defineEventHandler, getQuery, createError } from 'h3'

const GO_API = process.env.GO_DOWNLOAD_API_URL || 'http://127.0.0.1:5001'
const PUBLIC_GO_API = 'https://go-api.fikfikk.my.id'

/**
 * GET /api/stream/rebahin-proxy?url=https://rebahin.app/film-slug
 * Fetch Rebahin m3u8 URLs dan convert jadi HLS proxy URLs
 */
export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)
  const rebahinURL = String(url || '').trim()

  if (!rebahinURL || !rebahinURL.startsWith('http')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Rebahin URL'
    })
  }

  try {
    // Fetch dari Go backend /stream/rebahin
    const data: any = await $fetch(`${GO_API}/stream/rebahin?url=${encodeURIComponent(rebahinURL)}`)
    
    if (!data.success || !data.servers) {
      throw new Error('No streaming servers found')
    }

    // Transform semua server URLs jadi HLS proxy URLs
    const proxyServers: Record<string, string> = {}
    
    for (const [serverName, m3u8URL] of Object.entries(data.servers)) {
      if (typeof m3u8URL === 'string' && m3u8URL.includes('.m3u8')) {
        // Encode upstream URL ke Base64
        const base64URL = Buffer.from(m3u8URL).toString('base64')
        // Generate HLS proxy URL
        proxyServers[serverName] = `${PUBLIC_GO_API}/hls/${base64URL}/master.m3u8`
      } else {
        // Kalau bukan m3u8, pass through as-is (embed URL)
        proxyServers[serverName] = m3u8URL as string
      }
    }

    return {
      success: true,
      source: data.source,
      servers: proxyServers
    }
  } catch (error: any) {
    console.error('Rebahin proxy error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch Rebahin streams'
    })
  }
})

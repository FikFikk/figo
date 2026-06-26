import { defineEventHandler, getQuery, createError } from 'h3'

// Helper to extract HLS URLs from raw HTML content
function extractHlsFromHtml(html: string): string[] {
  const found: string[] = []
  
  // Regex patterns to match m3u8 files
  const patterns = [
    /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>?]*/gi,
    /"file"\s*:\s*"([^"]+\.m3u8[^"]*)"/gi,
    /"source"\s*:\s*"([^"]+\.m3u8[^"]*)"/gi,
    /src\s*:\s*["']([^"']+\.m3u8[^"']*)["']/gi
  ]

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      const url = match[1] || match[0]
      // Clean up backslashes usually present in escaped JSON strings
      const cleanUrl = url.replace(/\\/g, '')
      if (cleanUrl.startsWith('http') && !found.includes(cleanUrl)) {
        found.push(cleanUrl)
      }
    }
  }
  
  return found
}

// Clean raw player token if embedded in response (for fallback parsing)
function decodeBase64IfPossible(url: string): string | null {
  try {
    const match = url.match(/\/rcp\/([a-zA-Z0-9+/=]+)/)
    if (match && match[1]) {
      const decoded = Buffer.from(match[1], 'base64').toString('ascii')
      if (decoded.includes('http') || decoded.includes('m3u8')) {
        return decoded
      }
    }
  } catch (e) {
    // Ignore decoding errors
  }
  return null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id || query.tmdbId
  const type = query.type || 'movie'
  const season = query.season ? parseInt(query.season as string) : undefined
  const episode = query.episode ? parseInt(query.episode as string) : undefined

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parameter id or tmdbId is required.'
    })
  }

  const tmdbId = String(id)
  
  // Providers list in order of priority
  // vidsrc.me (Priority 1: Fast, lower protection)
  // streamwish.to (Priority 2: Backup)
  const results: any[] = []
  const errors: string[] = []

  // Try Provider 1: vidsrc.me
  try {
    const targetUrl = type === 'tv' 
      ? `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season || 1}&episode=${episode || 1}`
      : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`

    const htmlContent = await $fetch<string>(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://vidsrc.me/'
      },
      timeout: 10000
    })

    const extractedUrls = extractHlsFromHtml(htmlContent)
    
    // Check if there are iframe sources we can follow-up
    const iframeMatches = htmlContent.match(/iframe\s+src="([^"]+)"/i)
    if (iframeMatches && iframeMatches[1] && extractedUrls.length === 0) {
      let iframeUrl = iframeMatches[1]
      if (iframeUrl.startsWith('//')) {
        iframeUrl = 'https:' + iframeUrl
      }
      
      const subHtml = await $fetch<string>(iframeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': targetUrl
        },
        timeout: 10000
      })
      const subExtracted = extractHlsFromHtml(subHtml)
      extractedUrls.push(...subExtracted)
    }

    if (extractedUrls.length > 0) {
      return {
        success: true,
        tmdbId,
        type,
        provider: 'vidsrc.me',
        hls_urls: [...new Set(extractedUrls)],
        timestamp: new Date().toISOString()
      }
    }
    errors.push('vidsrc.me: No stream URLs extracted directly.')
  } catch (err: any) {
    errors.push(`vidsrc.me error: ${err.message || err}`)
  }

  // Fallback Provider 2: vidsrc.to basic extraction (no playwright)
  try {
    const targetUrl = type === 'tv'
      ? `https://vidsrc.to/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`
      : `https://vidsrc.to/embed/movie/${tmdbId}`

    const htmlContent = await $fetch<string>(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://vidsrc.to/'
      },
      timeout: 10000
    })

    const extractedUrls = extractHlsFromHtml(htmlContent)
    
    // Check for intermediate endpoints
    const vsembedMatch = htmlContent.match(/iframe\s+src="([^"]+vsembed\.ru[^"]+)"/i)
    if (vsembedMatch && vsembedMatch[1]) {
      let embedUrl = vsembedMatch[1]
      if (embedUrl.startsWith('//')) {
        embedUrl = 'https:' + embedUrl
      }
      
      const embedHtml = await $fetch<string>(embedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': targetUrl
        },
        timeout: 10000
      })
      
      const embedExtracted = extractHlsFromHtml(embedHtml)
      extractedUrls.push(...embedExtracted)
      
      // Decrypt base64 token if it exists in data-hash attribute or page structure
      const hashMatch = embedHtml.match(/data-hash="([^"]+)"/g)
      if (hashMatch) {
        for (const hashAttr of hashMatch) {
          const matchVal = hashAttr.match(/data-hash="([^"]+)"/)
          if (matchVal && matchVal[1]) {
            const decoded = decodeBase64IfPossible(matchVal[1])
            if (decoded) {
              extractedUrls.push(decoded)
            }
          }
        }
      }
    }

    if (extractedUrls.length > 0) {
      return {
        success: true,
        tmdbId,
        type,
        provider: 'vidsrc.to (static)',
        hls_urls: [...new Set(extractedUrls)],
        timestamp: new Date().toISOString()
      }
    }
    errors.push('vidsrc.to: No static stream URLs extracted.')
  } catch (err: any) {
    errors.push(`vidsrc.to error: ${err.message || err}`)
  }

  // All providers failed
  return {
    success: false,
    tmdbId,
    type,
    provider: 'none',
    hls_urls: [],
    errors,
    timestamp: new Date().toISOString()
  }
})

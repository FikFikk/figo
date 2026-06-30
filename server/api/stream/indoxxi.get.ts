export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const title = query.title as string

  if (!title) {
    return { success: false, error: 'Missing title parameter', logs: [] }
  }

  const BASE_URL = 'http://146.190.87.25'
  const GO_API = 'http://localhost:5001' // Go backend (figo-download-api)
  const logs: string[] = []
  
  try {
    // 1. Search film
    const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(title)}`
    logs.push(`[INDOXXI] Searching: ${searchUrl}`)
    const searchRes = await $fetch<string>(searchUrl, { timeout: 8000 })
    logs.push(`[INDOXXI] Search response received (${searchRes.length} chars)`)
    
    // 2. Extract film URLs dengan title matching
    // Pattern: <a href="..." itemprop="url" title="Permalink to: TITLE" ...>
    const titleNormalized = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    
    // Cari semua link film (dengan atau tanpa trailing slash)
    const allLinks = [...searchRes.matchAll(/<a[^>]*href="(http:\/\/146\.190\.87\.25\/[^"\/]+\/?)"[^>]*title="Permalink to:\s*([^"]+)"/g)]
    
    if (allLinks.length === 0) {
      logs.push(`[INDOXXI] No film links found in search results`)
      return { success: false, error: 'No films found in search results', logs }
    }
    
    logs.push(`[INDOXXI] Found ${allLinks.length} films: ${allLinks.map(m => m[2]).join(', ')}`)
    
    // Filter yang titlenya match (case insensitive, fuzzy)
    let filmUrl = null
    let matchedTitle = null
    for (const match of allLinks) {
      const linkTitle = match[2].toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
      // Match jika ada overlap kata apapun, bukan cuma first word
      const titleWords = titleNormalized.split(/\s+/)
      const linkWords = linkTitle.split(/\s+/)
      const hasOverlap = titleWords.some(tw => linkWords.some(lw => lw.includes(tw) || tw.includes(lw)))
      
      if (linkTitle.includes(titleNormalized) || titleNormalized.includes(linkTitle) || hasOverlap) {
        filmUrl = match[1]
        matchedTitle = match[2]
        break
      }
    }
    
    // Fallback: ambil yang pertama kalau gak ada match
    if (!filmUrl) {
      filmUrl = allLinks[0][1]
      matchedTitle = allLinks[0][2]
      logs.push(`[INDOXXI] No exact match, using first result: "${matchedTitle}"`)
    } else {
      logs.push(`[INDOXXI] Matched film: "${matchedTitle}" → ${filmUrl}`)
    }
    
    // 3. Fetch film page
    logs.push(`[INDOXXI] Fetching film page: ${filmUrl}`)
    const filmPageRes = await $fetch<string>(filmUrl, { timeout: 8000 })
    logs.push(`[INDOXXI] Film page loaded (${filmPageRes.length} chars)`)
    
    // 4. Extract iframe embed: <iframe ... src="https://..."
    const embedMatch = filmPageRes.match(/<iframe[^>]*src="([^"]+)"/)
    if (!embedMatch) {
      logs.push(`[INDOXXI] No embed iframe found on film page`)
      return { success: false, error: 'Embed iframe not found on film page', logs }
    }
    
    const embedUrl = embedMatch[1]
    logs.push(`[INDOXXI] Found embed URL: ${embedUrl}`)
    
    // 5. Call Go backend to resolve HLS m3u8 from embed
    logs.push(`[INDOXXI] Resolving HLS via Go backend...`)
    const resolveRes = await $fetch<any>(`${GO_API}/stream/resolve-indoxxi?url=${encodeURIComponent(embedUrl)}`, { timeout: 10000 })
    
    if (!resolveRes.success) {
      logs.push(`[INDOXXI] Go backend failed: ${resolveRes.error || 'Unknown error'}`)
      return { success: false, error: resolveRes.error || 'Failed to resolve HLS stream', logs }
    }
    
    logs.push(`[INDOXXI] Success! HLS URL: ${resolveRes.proxy_url}`)
    
    return {
      success: true,
      proxy_url: resolveRes.proxy_url,
      m3u8_url: resolveRes.m3u8_url,
      source: 'indoxxi',
      film_url: filmUrl,
      embed_url: embedUrl,
      logs
    }
  } catch (err: any) {
    logs.push(`[INDOXXI] Exception: ${err.message}`)
    return {
      success: false,
      error: err.message || 'Scraping failed',
      logs
    }
  }
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const hash = query.hash as string
  const type = query.type as string // 'md5', 'sha1', 'sha256'

  if (!hash) {
    throw createError({ statusCode: 400, message: 'Hash is required' })
  }

  try {
    if (type === 'md5') {
      // 1. Try md5.gromweb.com
      try {
        const gromweb = await $fetch<string>(`https://md5.gromweb.com/query/?string=${hash}`, { timeout: 3000 })
        if (gromweb && !gromweb.includes('<')) return { success: true, result: gromweb }
      } catch (e) { /* ignore */ }

      // 2. Try nitrxgen (using http to bypass expired SSL cert)
      try {
        const nitrx = await $fetch<string>(`http://nitrxgen.net/md5db/${hash}`, { timeout: 3000 })
        if (nitrx && !nitrx.includes('<')) return { success: true, result: nitrx }
      } catch (e) { /* ignore */ }
      
      return { success: false, message: 'Not found in database' }
    }
    
    // For SHA1/SHA256, it's harder to find free open API without keys. We just return not found for now.
    return { success: false, message: 'Only MD5 has open rainbow table access currently' }
  } catch (err) {
    return { success: false, message: 'Failed to lookup hash' }
  }
})

import { defineEventHandler, readBody, createError } from 'h3'

// ============================================================
// LINK SAFETY CHECKER — Real URL Scraping + Threat Analysis
// ============================================================

interface ThreatFinding {
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
}

interface AnalysisResult {
  url: string
  finalUrl: string
  status: number | null
  ssl: boolean
  redirected: boolean
  redirectCount: number
  responseTime: number
  threats: ThreatFinding[]
  score: number // 0-100, higher = safer
  level: 'safe' | 'warning' | 'danger'
  summary: string
}

// Known suspicious TLDs and free hosting patterns
const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.xyz', '.buzz', '.click', '.link', '.work', '.surf', '.loan', '.racing', '.review', '.download', '.cricket', '.science', '.party', '.stream', '.gdn', '.bid', '.trade', '.webcam']
const FREE_HOSTING = ['000webhostapp.com', 'weebly.com', 'wixsite.com', 'blogspot.com', 'wordpress.com', 'netlify.app', 'vercel.app', 'pages.dev', 'github.io', 'herokuapp.com', 'glitch.me', 'repl.co', 'firebaseapp.com']
const URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'rb.gy', 'shorturl.at', 'is.gd', 'v.gd', 'cutt.ly', 'ow.ly', 'bl.ink', 'short.io']

// Known legitimate domains (don't flag these)
const KNOWN_SAFE = ['google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 'github.com', 'microsoft.com', 'apple.com', 'amazon.com', 'wikipedia.org', 'linkedin.com', 'reddit.com', 'stackoverflow.com', 'mozilla.org', 'cloudflare.com', 'nuxt.com', 'vuejs.org', 'npmjs.com', 'vercel.com', 'netlify.com']

// Suspicious URL patterns
const PHISHING_URL_PATTERNS = [
  /free[_-]?(iphone|samsung|gift|money|bitcoin|crypto|prize)/i,
  /account[_-]?(verify|update|confirm|secure|login|suspend)/i,
  /paypal[_-]?(secure|verify|update|login)/i,
  /secure[_-]?(login|bank|update|verify)/i,
  /login[_-]?(verify|update|confirm)/i,
  /bank[_-]?(verify|update|secure|login)/i,
  /reward[_-]?(claim|redeem|win)/i,
  /lottery[_-]?(win|claim|prize)/i,
  /urgent[_-]?(action|update|verify)/i,
  /password[_-]?(reset|update|change|expire)/i,
  /whatsapp[_-]?(hack|spy|crack|clone)/i,
  /[0-9]{10,}/,  // Very long number sequences in URL
]

// Typosquatting check (Levenshtein-like)
const TYPOSQUAT_TARGETS = ['google', 'facebook', 'amazon', 'paypal', 'apple', 'microsoft', 'netflix', 'instagram', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'yahoo', 'spotify', 'tiktok', 'snapchat', 'pinterest', 'ebay', 'dropbox', 'github']

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i]![j] = a[i - 1] === b[j - 1]
        ? dp[i - 1]![j - 1]!
        : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!)
  return dp[m]![n]!
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function extractRootDomain(hostname: string): string {
  const parts = hostname.split('.')
  if (parts.length <= 2) return hostname
  return parts.slice(-2).join('.')
}

// ==================
// ANALYSIS FUNCTIONS
// ==================

function analyzeUrl(url: string, hostname: string): ThreatFinding[] {
  const findings: ThreatFinding[] = []
  const rootDomain = extractRootDomain(hostname)

  // Check suspicious TLD
  for (const tld of SUSPICIOUS_TLDS) {
    if (hostname.endsWith(tld)) {
      findings.push({
        category: 'Domain',
        severity: 'medium',
        title: 'Suspicious Top-Level Domain',
        description: `The domain uses "${tld}" which is frequently associated with spam and phishing websites.`,
      })
      break
    }
  }

  // Check free hosting
  for (const host of FREE_HOSTING) {
    if (hostname.includes(host)) {
      findings.push({
        category: 'Domain',
        severity: 'low',
        title: 'Free Hosting Platform',
        description: `Hosted on "${host}" — free hosting is commonly used for temporary phishing pages.`,
      })
      break
    }
  }

  // Check URL shortener
  for (const shortener of URL_SHORTENERS) {
    if (hostname.includes(shortener)) {
      findings.push({
        category: 'Redirect',
        severity: 'medium',
        title: 'URL Shortener Detected',
        description: `Uses "${shortener}" — the true destination is hidden. Could redirect to a malicious site.`,
      })
      break
    }
  }

  // Check phishing URL patterns
  for (const pattern of PHISHING_URL_PATTERNS) {
    if (pattern.test(url)) {
      findings.push({
        category: 'Phishing',
        severity: 'high',
        title: 'Suspicious URL Pattern',
        description: `The URL contains patterns commonly used in phishing and social engineering attacks.`,
      })
      break
    }
  }

  // Typosquatting check
  const domainName = hostname.split('.')[0]
  if (!domainName) return findings
  for (const target of TYPOSQUAT_TARGETS) {
    if (domainName !== target && domainName.length > 3) {
      const dist = levenshtein(domainName, target)
      if (dist > 0 && dist <= 2 && !KNOWN_SAFE.some(s => hostname.includes(s))) {
        findings.push({
          category: 'Phishing',
          severity: 'critical',
          title: 'Possible Typosquatting',
          description: `"${hostname}" looks very similar to "${target}.com" — this is a common phishing technique to steal credentials.`,
        })
        break
      }
    }
  }

  // Excessive subdomains
  const subdomainCount = hostname.split('.').length - 2
  if (subdomainCount >= 3) {
    findings.push({
      category: 'Domain',
      severity: 'medium',
      title: 'Excessive Subdomains',
      description: `${subdomainCount} subdomain levels detected. Attackers use long subdomains to hide the real domain.`,
    })
  }

  // IP address as domain
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    findings.push({
      category: 'Domain',
      severity: 'high',
      title: 'IP Address Used as Domain',
      description: 'The URL uses a raw IP address instead of a domain name. Legitimate sites almost never do this.',
    })
  }

  // Homograph attack (mixed scripts in domain)
  if (/[а-яА-ЯёЁ]|[\u0400-\u04FF]/.test(hostname)) {
    findings.push({
      category: 'Phishing',
      severity: 'critical',
      title: 'Homograph Attack (IDN)',
      description: 'The domain contains Cyrillic characters that look like Latin letters. This is used to impersonate legitimate websites.',
    })
  }

  return findings
}

function analyzeSSL(url: string): ThreatFinding[] {
  const findings: ThreatFinding[] = []
  if (!url.startsWith('https://')) {
    findings.push({
      category: 'Security',
      severity: 'high',
      title: 'No HTTPS Encryption',
      description: 'This website does not use SSL/TLS encryption. Any data you enter (passwords, cards, personal info) can be intercepted by attackers.',
    })
  }
  return findings
}

function analyzeHtml(html: string, hostname: string, finalUrl: string): ThreatFinding[] {
  const findings: ThreatFinding[] = []
  const htmlLower = html.toLowerCase()

  // --- PHISHING FORMS ---
  // Password fields
  const passwordInputs = (htmlLower.match(/<input[^>]*type\s*=\s*["']?password/gi) || []).length
  if (passwordInputs > 0) {
    // Check if form posts to a different domain
    const formActions = html.match(/action\s*=\s*["']([^"']+)["']/gi) || []
    const crossDomainForms = formActions.filter(action => {
      const match = action.match(/action\s*=\s*["']([^"']+)["']/i)
      if (!match || !match[1]) return false
      const actionUrl = match[1]
      try {
        if (actionUrl.startsWith('http')) {
          const actionHost = new URL(actionUrl).hostname
          return !actionHost.includes(hostname)
        }
      } catch {}
      return false
    })

    if (crossDomainForms.length > 0) {
      findings.push({
        category: 'Phishing',
        severity: 'critical',
        title: 'Cross-Domain Login Form',
        description: 'Contains a password form that submits data to a DIFFERENT domain. This is a strong indicator of credential theft.',
      })
    }

    // Check for brand impersonation in login forms
    const brandNames = ['google', 'facebook', 'apple', 'microsoft', 'paypal', 'amazon', 'netflix', 'instagram', 'bank', 'whatsapp']
    const isBrandPage = brandNames.some(brand => htmlLower.includes(brand))
    const isRealBrand = KNOWN_SAFE.some(safe => hostname.includes(safe.replace('.com', '').replace('.org', '')))

    if (isBrandPage && !isRealBrand) {
      findings.push({
        category: 'Phishing',
        severity: 'critical',
        title: 'Brand Impersonation Detected',
        description: 'This page contains login fields and references a well-known brand, but is NOT hosted on that brand\'s official domain.',
      })
    }
  }

  // --- MALICIOUS SCRIPTS ---
  // Crypto miners
  const minerPatterns = ['coinhive', 'cryptoloot', 'coin-hive', 'jsecoin', 'webminepool', 'cryptonight', 'monero', 'minero.cc', 'webmine', 'deepminer']
  for (const miner of minerPatterns) {
    if (htmlLower.includes(miner)) {
      findings.push({
        category: 'Malware',
        severity: 'critical',
        title: 'Cryptocurrency Miner Detected',
        description: `Found reference to "${miner}" — this page may use your CPU to mine cryptocurrency without your consent.`,
      })
      break
    }
  }

  // Obfuscated JavaScript (eval, unescape, document.write with encoded strings)
  const evalCount = (htmlLower.match(/eval\s*\(/g) || []).length
  const unescapeCount = (htmlLower.match(/unescape\s*\(/g) || []).length
  const fromCharCodeCount = (htmlLower.match(/fromcharcode/gi) || []).length
  const atobCount = (htmlLower.match(/\batob\s*\(/g) || []).length

  if (evalCount + unescapeCount + fromCharCodeCount > 5) {
    findings.push({
      category: 'Malware',
      severity: 'high',
      title: 'Heavily Obfuscated JavaScript',
      description: `Found ${evalCount} eval(), ${unescapeCount} unescape(), ${fromCharCodeCount} fromCharCode() calls. Code obfuscation is used to hide malicious behavior.`,
    })
  }

  // document.write suspicious usage
  if ((htmlLower.match(/document\.write\s*\(/g) || []).length > 3) {
    findings.push({
      category: 'Malware',
      severity: 'medium',
      title: 'Excessive document.write() Usage',
      description: 'Multiple document.write() calls detected. This technique is used to dynamically inject malicious content.',
    })
  }

  // --- HIDDEN IFRAMES ---
  const hiddenIframes = html.match(/<iframe[^>]*(hidden|display\s*:\s*none|width\s*=\s*["']?[01]|height\s*=\s*["']?[01]|visibility\s*:\s*hidden)[^>]*>/gi) || []
  if (hiddenIframes.length > 0) {
    findings.push({
      category: 'Malware',
      severity: 'high',
      title: `${hiddenIframes.length} Hidden IFrame(s) Detected`,
      description: 'Hidden iframes can load malicious content, exploit kits, or tracking pixels without your knowledge.',
    })
  }

  // Too many external iframes
  const allIframes = html.match(/<iframe[^>]*src\s*=\s*["']https?:\/\//gi) || []
  if (allIframes.length > 5) {
    findings.push({
      category: 'Suspicious',
      severity: 'medium',
      title: `${allIframes.length} External IFrames`,
      description: 'An unusual number of external iframes. This may indicate ad injection or content loading from untrusted sources.',
    })
  }

  // --- META REFRESH REDIRECT ---
  const metaRefresh = html.match(/<meta[^>]*http-equiv\s*=\s*["']?refresh[^>]*content\s*=\s*["']?\d+\s*;\s*url/gi)
  if (metaRefresh) {
    findings.push({
      category: 'Redirect',
      severity: 'medium',
      title: 'Meta Refresh Redirect',
      description: 'Page uses a meta refresh tag to automatically redirect you. This can be used to chain through malicious URLs.',
    })
  }

  // --- CLIPBOARD HIJACKING ---
  if (htmlLower.includes('navigator.clipboard') || htmlLower.includes('clipboarddata') || htmlLower.includes('execcommand') && htmlLower.includes('copy')) {
    findings.push({
      category: 'Data Theft',
      severity: 'high',
      title: 'Clipboard Access Detected',
      description: 'This page accesses your clipboard. Attackers can replace copied crypto addresses or inject malicious content.',
    })
  }

  // --- PERMISSION ABUSE ---
  if (htmlLower.includes('notification.requestpermission') || htmlLower.includes('pushmanager.subscribe')) {
    findings.push({
      category: 'Abuse',
      severity: 'medium',
      title: 'Push Notification Request',
      description: 'This page requests push notification permission. Malicious sites abuse this to send spam and scam alerts.',
    })
  }

  if (htmlLower.includes('getusermedia') || htmlLower.includes('mediadevices')) {
    findings.push({
      category: 'Privacy',
      severity: 'high',
      title: 'Camera/Microphone Access',
      description: 'This page attempts to access your camera or microphone. This is unusual for most websites.',
    })
  }

  // --- AUTO DOWNLOAD ---
  if (htmlLower.includes('download=') || (htmlLower.includes('blob:') && htmlLower.includes('createobjecturl'))) {
    findings.push({
      category: 'Malware',
      severity: 'medium',
      title: 'Automatic Download Trigger',
      description: 'This page may automatically download files to your device. Downloaded files could contain malware.',
    })
  }

  // --- FAKE SECURITY ALERTS ---
  const fakeAlertPatterns = ['your computer is infected', 'your device has been compromised', 'virus detected', 'your account has been hacked', 'security alert', 'your phone is infected', 'your data is at risk', 'call this number', 'call microsoft', 'tech support']
  for (const pattern of fakeAlertPatterns) {
    if (htmlLower.includes(pattern)) {
      findings.push({
        category: 'Scam',
        severity: 'critical',
        title: 'Fake Security Warning / Tech Support Scam',
        description: `Contains text "${pattern}" — this is a classic social engineering scam designed to scare you into calling a fake support number or installing malware.`,
      })
      break
    }
  }

  // --- DATA COLLECTION ---
  // Only flag when sensitive keywords appear in FORM INPUTS (name, placeholder, autocomplete, label)
  // NOT in general HTML (which would match CSS classes like .card, .card-body, etc.)
  const formContext = htmlLower.match(/<input[^>]*>/gi) || []
  const labelContext = htmlLower.match(/<label[^>]*>[^<]{0,100}/gi) || []
  const formText = formContext.join(' ') + ' ' + labelContext.join(' ')

  const sensitiveFormPatterns = [
    { key: 'credit card', pattern: /credit[_\-\s]?card|cc[_\-\s]?number/i },
    { key: 'CVV', pattern: /\bcvv\b|\bcvc\b|\bccv\b|security[_\-\s]?code/i },
    { key: 'SSN', pattern: /\bssn\b|social[_\-\s]?security/i },
    { key: 'bank account', pattern: /bank[_\-\s]?account|account[_\-\s]?number/i },
    { key: 'routing number', pattern: /routing[_\-\s]?number/i },
    { key: 'PIN', pattern: /\bpin[_\-\s]?code\b|\batm[_\-\s]?pin\b/i },
    { key: 'mother\'s maiden name', pattern: /mother'?s?\s*maiden/i },
  ]
  const matchedSensitive = sensitiveFormPatterns.filter(p => p.pattern.test(formText))
  if (matchedSensitive.length >= 2) {
    findings.push({
      category: 'Data Theft',
      severity: 'critical',
      title: 'Sensitive Data Collection',
      description: `Form inputs collect highly sensitive information (${matchedSensitive.map(m => m.key).join(', ')}). Verify this is a legitimate and trusted website.`,
    })
  }

  // --- EXTERNAL SCRIPTS ---
  const externalScripts = html.match(/<script[^>]*src\s*=\s*["']https?:\/\/([^"'\/]+)/gi) || []
  const uniqueScriptDomains = new Set(
    externalScripts.map(s => {
      const match = s.match(/src\s*=\s*["']https?:\/\/([^"'\/]+)/i)
      return match ? match[1] : ''
    }).filter(Boolean)
  )
  if (uniqueScriptDomains.size > 10) {
    findings.push({
      category: 'Suspicious',
      severity: 'low',
      title: `Scripts from ${uniqueScriptDomains.size} External Domains`,
      description: 'An unusually high number of external script sources. This increases the attack surface and the risk of supply-chain attacks.',
    })
  }

  return findings
}

function analyzeRedirects(redirected: boolean, redirectCount: number, originalUrl: string, finalUrl: string): ThreatFinding[] {
  const findings: ThreatFinding[] = []

  if (redirectCount > 3) {
    findings.push({
      category: 'Redirect',
      severity: 'high',
      title: `${redirectCount} Redirect Chain`,
      description: 'Excessive redirects detected. Attackers use long redirect chains to evade security tools and hide the final malicious destination.',
    })
  } else if (redirected) {
    const originalHost = extractDomain(originalUrl)
    const finalHost = extractDomain(finalUrl)
    if (originalHost !== finalHost) {
      findings.push({
        category: 'Redirect',
        severity: 'medium',
        title: 'Cross-Domain Redirect',
        description: `Redirected from "${originalHost}" to "${finalHost}". The final destination is on a different domain.`,
      })
    }
  }

  return findings
}

function calculateScore(threats: ThreatFinding[]): { score: number; level: 'safe' | 'warning' | 'danger' } {
  let score = 100

  for (const t of threats) {
    switch (t.severity) {
      case 'critical': score -= 30; break
      case 'high': score -= 20; break
      case 'medium': score -= 10; break
      case 'low': score -= 5; break
      case 'info': score -= 1; break
    }
  }

  score = Math.max(0, Math.min(100, score))

  let level: 'safe' | 'warning' | 'danger'
  if (score >= 70) level = 'safe'
  else if (score >= 40) level = 'warning'
  else level = 'danger'

  return { score, level }
}

function generateSummary(level: string, threats: ThreatFinding[]): string {
  if (threats.length === 0) {
    return 'No threats detected. This URL appears to be safe.'
  }

  const critical = threats.filter(t => t.severity === 'critical').length
  const high = threats.filter(t => t.severity === 'high').length

  if (level === 'danger') {
    return `⚠️ ${critical + high} serious threat(s) found. This URL shows strong indicators of phishing, malware, or social engineering. DO NOT enter any personal information.`
  }
  if (level === 'warning') {
    return `Found ${threats.length} potential issue(s). Exercise caution and verify the authenticity of this website before interacting with it.`
  }
  return `${threats.length} minor observation(s) found, but no significant threats detected. The URL appears reasonably safe.`
}

// ==================
// MAIN HANDLER
// ==================

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const rawUrl = body?.url as string

  if (!rawUrl || typeof rawUrl !== 'string') {
    throw createError({ statusCode: 400, message: 'URL is required' })
  }

  // Normalize URL
  let url = rawUrl.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  // Validate URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid URL format' })
  }

  const hostname = parsedUrl.hostname.replace(/^www\./, '')
  const allThreats: ThreatFinding[] = []

  // 1. SSL check
  allThreats.push(...analyzeSSL(url))

  // 2. URL pattern analysis
  allThreats.push(...analyzeUrl(url, hostname))

  // 3. Fetch the URL
  let fetchStatus: number | null = null
  let finalUrl = url
  let redirected = false
  let redirectCount = 0
  let html = ''
  let responseTime = 0

  try {
    const startTime = Date.now()

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
      signal: controller.signal,
    })

    clearTimeout(timeout)
    responseTime = Date.now() - startTime

    fetchStatus = response.status
    finalUrl = response.url
    redirected = response.redirected

    // Count redirects by comparing URLs
    if (redirected) {
      const originalHost = extractDomain(url)
      const finalHost = extractDomain(finalUrl)
      redirectCount = originalHost !== finalHost ? 2 : 1
    }

    // Read HTML (limit to 500KB)
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      const reader = response.body?.getReader()
      if (reader) {
        let totalSize = 0
        const maxSize = 500 * 1024 // 500KB
        const chunks: Uint8Array[] = []

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          totalSize += value.length
          if (totalSize >= maxSize) break
        }

        const decoder = new TextDecoder()
        html = chunks.map(c => decoder.decode(c, { stream: true })).join('')
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      allThreats.push({
        category: 'Network',
        severity: 'medium',
        title: 'Connection Timeout',
        description: 'The website took too long to respond (>10 seconds). This could indicate a non-existent domain or an unreliable server.',
      })
    } else {
      allThreats.push({
        category: 'Network',
        severity: 'high',
        title: 'Connection Failed',
        description: `Could not connect to this URL: ${err.message || 'Unknown error'}. The domain may not exist or is blocking connections.`,
      })
    }
  }

  // 4. Redirect analysis
  allThreats.push(...analyzeRedirects(redirected, redirectCount, url, finalUrl))

  // 5. HTML content analysis
  if (html.length > 0) {
    allThreats.push(...analyzeHtml(html, hostname, finalUrl))
  }

  // 6. Response status analysis
  if (fetchStatus !== null) {
    if (fetchStatus >= 400 && fetchStatus < 500) {
      allThreats.push({
        category: 'Network',
        severity: 'low',
        title: `HTTP ${fetchStatus} Error`,
        description: 'The page returned a client error. The URL may be broken or access is restricted.',
      })
    } else if (fetchStatus >= 500) {
      allThreats.push({
        category: 'Network',
        severity: 'low',
        title: `Server Error (${fetchStatus})`,
        description: 'The server is experiencing issues. This could indicate an unstable or abandoned website.',
      })
    }
  }

  // 7. Calculate score
  const { score, level } = calculateScore(allThreats)

  const result: AnalysisResult = {
    url,
    finalUrl,
    status: fetchStatus,
    ssl: url.startsWith('https://'),
    redirected,
    redirectCount,
    responseTime,
    threats: allThreats,
    score,
    level,
    summary: generateSummary(level, allThreats),
  }

  return result
})

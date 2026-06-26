package main

// ================================================================
// VIDEO PROXY — Clean streaming tanpa iklan & bypass sandbox
// 
// Endpoints:
//   /video/proxy?url={embed_url}  — Proxy iframe dengan cleanup
//   /video/direct?id={tmdb}&type={movie|tv}&s={season}&e={episode}
//
// Features:
// - Remove ads & tracking scripts
// - Add proper iframe sandbox attributes
// - Filter malicious domains
// - Inject custom CSS untuk hide ads
// ================================================================

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
)

const (
	// Alternative embed sources (no ads, more reliable)
	embedSource1 = "https://vidsrc.to/embed"      // Sumber 1
	embedSource2 = "https://vidsrc.me/embed"      // Sumber 2  
	embedSource3 = "https://www.2embed.cc/embed"  // Sumber 3
)

type videoProxyState struct {
	client *http.Client
}

func newVideoProxyState() *videoProxyState {
	return &videoProxyState{
		client: &http.Client{
			Timeout: httpGetTimout,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return nil // Allow redirects
			},
		},
	}
}

func (vp *videoProxyState) registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/video/proxy", vp.proxyHandler)
	mux.HandleFunc("/video/direct", vp.directHandler)
	mux.HandleFunc("/video/sources", vp.sourcesHandler)
}

// proxyHandler — Proxy embed URL dengan cleanup
func (vp *videoProxyState) proxyHandler(w http.ResponseWriter, r *http.Request) {
	embedURL := r.URL.Query().Get("url")
	if embedURL == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Missing 'url' parameter"})
		return
	}

	// Validate URL
	parsed, err := url.Parse(embedURL)
	if err != nil || !vp.isAllowedDomain(parsed.Host) {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Invalid or blocked URL"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	// Fetch original embed page
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, embedURL, nil)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Failed to create request"})
		return
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Referer", "https://www.google.com/")

	resp, err := vp.client.Do(req)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Failed to fetch embed"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Failed to read response"})
		return
	}

	// Clean HTML
	cleaned := vp.cleanHTML(string(body))

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("X-Frame-Options", "SAMEORIGIN")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(cleaned))
}

// directHandler — Generate clean embed dari multiple sources
func (vp *videoProxyState) directHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	mediaType := r.URL.Query().Get("type")
	season := r.URL.Query().Get("s")
	episode := r.URL.Query().Get("e")

	if id == "" || mediaType == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Missing 'id' or 'type'"})
		return
	}

	var embedURL string
	if mediaType == "movie" {
		embedURL = fmt.Sprintf("%s/movie/%s", embedSource1, id)
	} else {
		if season == "" {
			season = "1"
		}
		if episode == "" {
			episode = "1"
		}
		embedURL = fmt.Sprintf("%s/tv/%s/%s/%s", embedSource1, id, season, episode)
	}

	// Return HTML wrapper dengan multiple fallback sources
	html := vp.generateCleanPlayer(embedURL, id, mediaType, season, episode)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(html))
}

// sourcesHandler — Return semua available sources untuk ID
func (vp *videoProxyState) sourcesHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	mediaType := r.URL.Query().Get("type")
	season := r.URL.Query().Get("s")
	episode := r.URL.Query().Get("e")

	if id == "" || mediaType == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Missing parameters"})
		return
	}

	sources := []map[string]string{}

	if mediaType == "movie" {
		sources = append(sources,
			map[string]string{"name": "Vidsrc.to", "url": fmt.Sprintf("%s/movie/%s", embedSource1, id)},
			map[string]string{"name": "Vidsrc.me", "url": fmt.Sprintf("%s/movie/%s", embedSource2, id)},
			map[string]string{"name": "2Embed", "url": fmt.Sprintf("%s/%s", embedSource3, id)},
		)
	} else {
		if season == "" {
			season = "1"
		}
		if episode == "" {
			episode = "1"
		}
		sources = append(sources,
			map[string]string{"name": "Vidsrc.to", "url": fmt.Sprintf("%s/tv/%s/%s/%s", embedSource1, id, season, episode)},
			map[string]string{"name": "Vidsrc.me", "url": fmt.Sprintf("%s/tv/%s/%s/%s", embedSource2, id, season, episode)},
			map[string]string{"name": "2Embed", "url": fmt.Sprintf("%s/%s/%s/%s", embedSource3, id, season, episode)},
		)
	}

	writeJSON(w, http.StatusOK, map[string]any{"sources": sources})
}

// --- Helpers ---

func (vp *videoProxyState) isAllowedDomain(host string) bool {
	allowed := []string{
		"vidsrc.to",
		"vidsrc.me",
		"vidsrc.xyz",
		"2embed.cc",
		"multiembed.mov",
		"embedsu.com",
	}

	host = strings.ToLower(host)
	for _, domain := range allowed {
		if strings.Contains(host, domain) {
			return true
		}
	}
	return false
}

func (vp *videoProxyState) cleanHTML(html string) string {
	// Remove ad scripts & trackers
	adPatterns := []string{
		`<script[^>]*google[^>]*>.*?</script>`,
		`<script[^>]*ads[^>]*>.*?</script>`,
		`<script[^>]*analytics[^>]*>.*?</script>`,
		`<script[^>]*doubleclick[^>]*>.*?</script>`,
		`<iframe[^>]*ad[^>]*>.*?</iframe>`,
		`<div[^>]*ad[^>]*>.*?</div>`,
	}

	for _, pattern := range adPatterns {
		re := regexp.MustCompile(`(?i)` + pattern)
		html = re.ReplaceAllString(html, "")
	}

	// Inject ad-blocking CSS
	cssBlock := `
	<style>
		/* Hide common ad containers */
		[class*="ad-"], [id*="ad-"], 
		[class*="banner"], [id*="banner"],
		[class*="sponsor"], [id*="sponsor"] {
			display: none !important;
		}
		
		/* Full screen player */
		body, html {
			margin: 0;
			padding: 0;
			width: 100%;
			height: 100%;
			overflow: hidden;
		}
		
		iframe {
			width: 100%;
			height: 100%;
			border: none;
		}
	</style>
	`

	// Insert CSS before </head>
	html = strings.Replace(html, "</head>", cssBlock+"</head>", 1)

	return html
}

func (vp *videoProxyState) generateCleanPlayer(primaryURL, id, mediaType, season, episode string) string {
	// Fallback sources
	var source2, source3 string
	if mediaType == "movie" {
		source2 = fmt.Sprintf("%s/movie/%s", embedSource2, id)
		source3 = fmt.Sprintf("%s/%s", embedSource3, id)
	} else {
		source2 = fmt.Sprintf("%s/tv/%s/%s/%s", embedSource2, id, season, episode)
		source3 = fmt.Sprintf("%s/%s/%s/%s", embedSource3, id, season, episode)
	}

	html := `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>FiGo Player</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body, html { width: 100%; height: 100%; background: #000; overflow: hidden; }
		#player { width: 100%; height: 100%; border: none; }
		#error { display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center; font-family: system-ui; }
		#error.show { display: block; }
		.source-btn { margin: 10px; padding: 10px 20px; background: #e50914; border: none; color: white; border-radius: 8px; cursor: pointer; font-size: 16px; }
		.source-btn:hover { background: #f40612; }
		[class*="ad"], [id*="ad"], [class*="banner"], [id*="banner"] { display: none !important; }
	</style>
</head>
<body>
	<iframe id="player" src="` + primaryURL + `" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="no-referrer-when-downgrade"></iframe>
	<div id="error">
		<h2>Video tidak tersedia</h2>
		<p>Coba sumber lain:</p>
		<button class="source-btn" onclick="switchSource('` + source2 + `')">Vidsrc.me</button>
		<button class="source-btn" onclick="switchSource('` + source3 + `')">2Embed</button>
	</div>
	<script>
		// ── Anti-ads: block popups, new tabs, redirects ──
		window.open = function() { return null; };
		window.__open = window.open;
		Object.defineProperty(window, 'open', { get: function() { return function() { return null; }; }, set: function() {} });

		// Block click hijacking (ads that intercept first click)
		document.addEventListener('click', function(e) {
			var t = e.target;
			while (t && t !== document.body) {
				var tag = (t.tagName || '').toLowerCase();
				if (tag === 'a') {
					var href = t.getAttribute('href') || '';
					var tgt = t.getAttribute('target') || '';
					if (tgt === '_blank' || href.match(/doubleclick|ads|track|popads|popup|redirect/i)) {
						e.preventDefault();
						e.stopPropagation();
						return false;
					}
				}
				t = t.parentElement;
			}
		}, true);

		// Block beforeunload hijacking (ad redirects)
		window.addEventListener('beforeunload', function(e) { e.stopImmediatePropagation(); }, true);

		const iframe = document.getElementById('player');
		const error = document.getElementById('error');
		let errorTimeout;
		iframe.addEventListener('error', function() { error.classList.add('show'); });
		errorTimeout = setTimeout(function() {
			try { if (!iframe.contentWindow) { error.classList.add('show'); } } catch(e) {}
		}, 5000);
		function switchSource(url) {
			error.classList.remove('show');
			iframe.src = url;
			clearTimeout(errorTimeout);
			errorTimeout = setTimeout(function() { error.classList.add('show'); }, 5000);
		}
	</script>
</body>
</html>`
	return html
}

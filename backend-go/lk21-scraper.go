package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/DaRealFreak/cloudflare-bp-go"
	"github.com/PuerkitoBio/goquery"
)

// LK21Client wraps Cloudflare bypass client
type LK21Client struct {
	client *http.Client
}

// NewLK21Client creates client dengan Cloudflare bypass
func NewLK21Client() *LK21Client {
	// Create Cloudflare bypass transport
	transport := cloudflarebp.AddCloudFlareByPass(&http.Transport{})
	
	return &LK21Client{
		client: &http.Client{
			Transport: transport,
			Timeout:   30 * time.Second,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				// Follow max 5 redirects
				if len(via) >= 5 {
					return fmt.Errorf("stopped after 5 redirects")
				}
				return nil
			},
		},
	}
}

// GetLK21Domain mengambil domain LK21 aktif dari d21.team button redirect
func (c *LK21Client) GetLK21Domain() (string, error) {
	// Step 1: Scrape d21.team untuk button "KE HALAMAN LK21"
	req, err := http.NewRequest("GET", "https://d21.team/", nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
	
	resp, err := c.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return "", err
	}
	
	// Cari button dengan text "KE HALAMAN LK21"
	var redirectURL string
	doc.Find("a.cta-button").Each(func(i int, s *goquery.Selection) {
		text := strings.TrimSpace(s.Text())
		if strings.Contains(text, "KE HALAMAN LK21") {
			href, exists := s.Attr("href")
			if exists {
				redirectURL = href
			}
		}
	})
	
	if redirectURL == "" {
		return "", fmt.Errorf("button 'KE HALAMAN LK21' not found on d21.team")
	}
	
	// Step 2: Follow redirect dari lk21.de → tv11.lk21official.cc
	req2, err := http.NewRequest("GET", redirectURL, nil)
	if err != nil {
		return "", err
	}
	req2.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	
	// Disable redirect following untuk ambil Location header
	originalCheckRedirect := c.client.CheckRedirect
	c.client.CheckRedirect = func(req *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse // Stop at first redirect
	}
	
	resp2, err := c.client.Do(req2)
	if err != nil {
		c.client.CheckRedirect = originalCheckRedirect
		return "", err
	}
	defer resp2.Body.Close()
	c.client.CheckRedirect = originalCheckRedirect
	
	// Ambil Location header (domain LK21 final)
	location := resp2.Header.Get("Location")
	if location == "" {
		return "", fmt.Errorf("no redirect found from %s", redirectURL)
	}
	
	// Parse domain dari Location
	u, err := url.Parse(location)
	if err != nil {
		return "", err
	}
	
	finalDomain := fmt.Sprintf("%s://%s", u.Scheme, u.Host)
	return finalDomain, nil
}

// SearchLK21 mencari film di LK21 (via Cloudflare bypass)
func (c *LK21Client) SearchLK21(query string) ([]map[string]interface{}, error) {
	// Get domain LK21 aktif
	domain, err := c.GetLK21Domain()
	if err != nil {
		return nil, fmt.Errorf("failed to get LK21 domain: %w", err)
	}
	
	// Build search URL (asumsi format: /search?q=keyword atau /?s=keyword)
	searchURL := fmt.Sprintf("%s/?s=%s", domain, url.QueryEscape(query))
	
	req, err := http.NewRequest("GET", searchURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Referer", domain+"/")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	
	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	body, _ := io.ReadAll(resp.Body)
	bodyStr := string(body)
	
	// Check apakah dapat HTML atau masih Cloudflare challenge
	if strings.Contains(bodyStr, "challenges.cloudflare.com") || strings.Contains(bodyStr, "Just a moment") {
		return nil, fmt.Errorf("cloudflare challenge not bypassed")
	}
	
	// Parse HTML untuk extract film results
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(bodyStr))
	if err != nil {
		return nil, err
	}
	
	results := []map[string]interface{}{}
	
	// Pattern umum LK21: article.post, div.movie-item, dll
	doc.Find("article, .movie-item, .film-item").Each(func(i int, s *goquery.Selection) {
		title := strings.TrimSpace(s.Find("h2, h3, .title").Text())
		link, _ := s.Find("a").Attr("href")
		poster, _ := s.Find("img").Attr("src")
		
		if title != "" && link != "" && strings.Contains(strings.ToLower(title), strings.ToLower(query)) {
			results = append(results, map[string]interface{}{
				"title":  title,
				"url":    link,
				"poster": poster,
			})
		}
	})
	
	return results, nil
}

// GetLK21StreamURL mengambil embed player URL dari halaman film LK21
func (c *LK21Client) GetLK21StreamURL(filmURL string) ([]string, error) {
	req, err := http.NewRequest("GET", filmURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	
	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	body, _ := io.ReadAll(resp.Body)
	bodyStr := string(body)
	
	// Check Cloudflare
	if strings.Contains(bodyStr, "challenges.cloudflare.com") {
		return nil, fmt.Errorf("cloudflare challenge active")
	}
	
	// Extract iframe embed URLs
	iframeRegex := regexp.MustCompile(`<iframe[^>]*src=["']([^"']+)["']`)
	matches := iframeRegex.FindAllStringSubmatch(bodyStr, -1)
	
	embedURLs := []string{}
	seen := make(map[string]bool)
	
	for _, match := range matches {
		if len(match) > 1 {
			url := match[1]
			// Filter: hanya ambil domain player valid, skip poster/image
			if isValidPlayerURL(url) && !seen[url] {
				embedURLs = append(embedURLs, url)
				seen[url] = true
			}
		}
	}
	
	// Extract dari data-src, data-url attributes
	dataSrcRegex := regexp.MustCompile(`data-(?:src|url)=["']([^"']+)["']`)
	matches2 := dataSrcRegex.FindAllStringSubmatch(bodyStr, -1)
	for _, match := range matches2 {
		if len(match) > 1 {
			url := match[1]
			if isValidPlayerURL(url) && !seen[url] {
				embedURLs = append(embedURLs, url)
				seen[url] = true
			}
		}
	}
	
	return embedURLs, nil
}

// isValidPlayerURL memeriksa apakah URL adalah embed player valid (bukan poster/image)
func isValidPlayerURL(url string) bool {
	// Skip jika poster/image
	if strings.HasSuffix(url, ".jpg") || strings.HasSuffix(url, ".jpeg") || 
	   strings.HasSuffix(url, ".png") || strings.HasSuffix(url, ".webp") ||
	   strings.HasSuffix(url, ".gif") {
		return false
	}
	
	// Whitelist domain player yang valid
	validDomains := []string{
		"playeriframe.sbs",
		"vidsrc.to",
		"vidsrc.xyz",
		"vidsrc.me",
		"2embed.cc",
		"2embed.to",
		"embedsu.net",
		"embed.su",
		"multiembed.mov",
		"fembed.com",
		"streamsb.net",
		"dood.to",
		"streamtape.com",
	}
	
	for _, domain := range validDomains {
		if strings.Contains(url, domain) {
			return true
		}
	}
	
	return false
}

// GetLK21MasterHLS mengekstrak link .m3u8 fisik asli dari halaman film LK21
func (c *LK21Client) GetLK21MasterHLS(filmURL string) (string, error) {
	embedURLs, err := c.GetLK21StreamURL(filmURL)
	if err != nil || len(embedURLs) == 0 {
		return "", fmt.Errorf("no embed URLs found: %v", err)
	}

	for _, embedURL := range embedURLs {
		if strings.Contains(embedURL, "/iframe/p2p/") || strings.Contains(embedURL, "/iframe/") {
			// Extract ID dari playeriframe.sbs URL
			parts := strings.Split(embedURL, "/")
			p2pID := parts[len(parts)-1]
			if p2pID == "" && len(parts) > 1 {
				p2pID = parts[len(parts)-2]
			}

			if p2pID != "" {
				// Call api2.php di cloud.hownetwork.xyz
				apiURL := "https://cloud.hownetwork.xyz/api2.php?id=" + p2pID
				form := url.Values{}
				form.Set("r", "https://playeriframe.sbs/")
				form.Set("d", "cloud.hownetwork.xyz")

				req, err := http.NewRequest("POST", apiURL, strings.NewReader(form.Encode()))
				if err != nil {
					continue
				}
				req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
				req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
				req.Header.Set("Referer", "https://cloud.hownetwork.xyz/")

				resp, err := c.client.Do(req)
				if err != nil {
					continue
				}
				defer resp.Body.Close()

				body, _ := io.ReadAll(resp.Body)
				var res struct {
					File string `json:"file"`
				}
				if err := json.Unmarshal(body, &res); err == nil && res.File != "" {
					return res.File, nil
				}
			}
		}
	}

	return "", fmt.Errorf("failed to extract physical m3u8 link from embeds")
}

// Handler untuk endpoint /api/lk21/domain
func handleLK21Domain(w http.ResponseWriter, r *http.Request) {
	client := NewLK21Client()
	domain, err := client.GetLK21Domain()
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get LK21 domain: %v", err), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"domain": domain,
		"source": "d21.team -> lk21.de redirect",
	})
}

// Handler untuk endpoint /api/lk21/search
func handleLK21Search(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "missing query parameter 'q'", http.StatusBadRequest)
		return
	}
	
	client := NewLK21Client()
	results, err := client.SearchLK21(query)
	if err != nil {
		http.Error(w, fmt.Sprintf("search failed: %v", err), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"query":   query,
		"count":   len(results),
		"results": results,
	})
}

// Handler untuk endpoint /api/lk21/stream
func handleLK21Stream(w http.ResponseWriter, r *http.Request) {
	filmURL := r.URL.Query().Get("url")
	if filmURL == "" {
		http.Error(w, "missing query parameter 'url'", http.StatusBadRequest)
		return
	}
	
	client := NewLK21Client()
	embedURLs, err := client.GetLK21StreamURL(filmURL)
	if err != nil {
		http.Error(w, fmt.Sprintf("stream extraction failed: %v", err), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"film_url":   filmURL,
		"embed_urls": embedURLs,
		"count":      len(embedURLs),
	})
}

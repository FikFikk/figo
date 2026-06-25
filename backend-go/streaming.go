package main

// ================================================================
// STREAMING — LK21 scraper untuk direct video streaming
// Menyediakan endpoint untuk search film Indonesia dan extract video URL
//
// Endpoints:
//   /stream/search       — cari film/series via ?q=
//   /stream/detail       — detail + video sources via ?id=
//   /stream/trending     — film trending Indonesia
//
// ================================================================

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

const (
	lk21Base = "https://lk21official.mom"
)

// --- Response structs ---

type streamSearchResult struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	Type      string   `json:"type"`      // "movie" or "series"
	Year      string   `json:"year"`
	Poster    string   `json:"poster"`
	Rating    string   `json:"rating"`
	Genres    []string `json:"genres"`
	StreamURL string   `json:"stream_url"` // internal endpoint /stream/detail?id=
}

type streamDetail struct {
	ID          string         `json:"id"`
	Title       string         `json:"title"`
	Type        string         `json:"type"`
	Year        string         `json:"year"`
	Poster      string         `json:"poster"`
	Backdrop    string         `json:"backdrop"`
	Rating      string         `json:"rating"`
	Duration    string         `json:"duration"`
	Synopsis    string         `json:"synopsis"`
	Genres      []string       `json:"genres"`
	Directors   []string       `json:"directors"`
	Casts       []string       `json:"casts"`
	VideoSources []videoSource `json:"video_sources"`
}

type videoSource struct {
	Provider    string   `json:"provider"`
	Quality     string   `json:"quality"`
	URL         string   `json:"url"`
	Resolutions []string `json:"resolutions,omitempty"`
}

// --- State ---

type streamingState struct {
	cache  *catalogCache
	client *http.Client
}

func newStreamingState() *streamingState {
	return &streamingState{
		cache:  newCatalogCache(),
		client: &http.Client{Timeout: httpGetTimout},
	}
}

// registerStreamingRoutes mendaftarkan endpoint streaming ke mux utama.
func (ss *streamingState) registerStreamingRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/stream/search", ss.searchHandler)
	mux.HandleFunc("/stream/detail", ss.detailHandler)
	mux.HandleFunc("/stream/trending", ss.trendingHandler)
}

// --- HTTP handlers ---

func (ss *streamingState) searchHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Missing query parameter 'q'"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	// Search LK21
	searchURL := fmt.Sprintf("%s/?s=%s", lk21Base, url.QueryEscape(q))
	
	doc, err := ss.fetchHTML(ctx, searchURL)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Scraping failed", "error": err.Error()})
		return
	}

	results := []streamSearchResult{}
	
	doc.Find("article.item").Each(func(i int, s *goquery.Selection) {
		result := streamSearchResult{}
		
		// Extract ID from URL
		href, exists := s.Find("a").Attr("href")
		if !exists {
			return
		}
		parts := strings.Split(strings.Trim(href, "/"), "/")
		if len(parts) > 0 {
			result.ID = parts[len(parts)-1]
		}
		
		result.Title = s.Find("h2.entry-title").Text()
		result.Poster, _ = s.Find("img").Attr("src")
		result.Rating = s.Find("span.rating").Text()
		result.Year = extractYear(s.Find("span.year").Text())
		result.Type = "movie" // default
		
		// Detect series
		if strings.Contains(strings.ToLower(href), "series") {
			result.Type = "series"
		}
		
		// Extract genres
		s.Find("a[rel=category tag]").Each(func(j int, genre *goquery.Selection) {
			result.Genres = append(result.Genres, genre.Text())
		})
		
		result.StreamURL = fmt.Sprintf("/stream/detail?id=%s", result.ID)
		
		results = append(results, result)
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"query":   q,
		"count":   len(results),
		"results": results,
	})
}

func (ss *streamingState) detailHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Missing parameter 'id'"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	// Fetch detail page
	detailURL := fmt.Sprintf("%s/%s", lk21Base, id)
	
	doc, err := ss.fetchHTML(ctx, detailURL)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Scraping failed", "error": err.Error()})
		return
	}

	detail := streamDetail{ID: id}
	
	// Extract metadata
	detail.Title = doc.Find("h1.entry-title").Text()
	detail.Poster, _ = doc.Find("div.poster img").Attr("src")
	detail.Backdrop, _ = doc.Find("div.backdrop img").Attr("src")
	detail.Rating = doc.Find("span.rating strong").Text()
	detail.Synopsis = strings.TrimSpace(doc.Find("div[itemprop=description]").Text())
	
	// Extract additional info
	doc.Find("div.info").Each(func(i int, s *goquery.Selection) {
		label := strings.TrimSpace(s.Find("strong").Text())
		s.Find("strong").Remove()
		value := strings.TrimSpace(s.Text())
		
		switch strings.ToLower(label) {
		case "tahun:":
			detail.Year = value
		case "durasi:":
			detail.Duration = value
		case "genre:":
			detail.Genres = strings.Split(value, ", ")
		case "direksi:":
			detail.Directors = strings.Split(value, ", ")
		case "aktor:":
			detail.Casts = strings.Split(value, ", ")
		}
	})
	
	// Extract video sources (iframe embeds)
	doc.Find("div#player-option-1").Find("iframe").Each(func(i int, s *goquery.Selection) {
		src, exists := s.Attr("src")
		if !exists {
			return
		}
		
		detail.VideoSources = append(detail.VideoSources, videoSource{
			Provider: fmt.Sprintf("Server %d", i+1),
			Quality:  "HD",
			URL:      src,
		})
	})
	
	// If no iframe, try to find direct video links
	if len(detail.VideoSources) == 0 {
		doc.Find("div.player-wrapper").Find("source").Each(func(i int, s *goquery.Selection) {
			src, exists := s.Attr("src")
			if !exists {
				return
			}
			quality, _ := s.Attr("label")
			if quality == "" {
				quality = "HD"
			}
			
			detail.VideoSources = append(detail.VideoSources, videoSource{
				Provider: "Direct",
				Quality:  quality,
				URL:      src,
			})
		})
	}

	writeJSON(w, http.StatusOK, detail)
}

func (ss *streamingState) trendingHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	// Fetch trending page (homepage)
	doc, err := ss.fetchHTML(ctx, lk21Base)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Scraping failed", "error": err.Error()})
		return
	}

	results := []streamSearchResult{}
	
	doc.Find("article.item").Each(func(i int, s *goquery.Selection) {
		result := streamSearchResult{}
		
		href, exists := s.Find("a").Attr("href")
		if !exists {
			return
		}
		parts := strings.Split(strings.Trim(href, "/"), "/")
		if len(parts) > 0 {
			result.ID = parts[len(parts)-1]
		}
		
		result.Title = s.Find("h2.entry-title").Text()
		result.Poster, _ = s.Find("img").Attr("src")
		result.Rating = s.Find("span.rating").Text()
		result.Year = extractYear(s.Find("span.year").Text())
		result.Type = "movie"
		
		if strings.Contains(strings.ToLower(href), "series") {
			result.Type = "series"
		}
		
		s.Find("a[rel=category tag]").Each(func(j int, genre *goquery.Selection) {
			result.Genres = append(result.Genres, genre.Text())
		})
		
		result.StreamURL = fmt.Sprintf("/stream/detail?id=%s", result.ID)
		
		results = append(results, result)
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"count":   len(results),
		"results": results,
	})
}

// --- Helper ---

func (ss *streamingState) fetchHTML(ctx context.Context, url string) (*goquery.Document, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	
	resp, err := ss.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, &httpStatusError{code: resp.StatusCode}
	}
	
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}
	
	return doc, nil
}

func extractYear(s string) string {
	re := regexp.MustCompile(`\d{4}`)
	match := re.FindString(s)
	return match
}

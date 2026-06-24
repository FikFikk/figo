package main

// ============================================================
// CATALOG — integrasi metadata film/series via TVMaze (gratis,
// tanpa API key). Menyediakan: trending, search, detail show,
// dan daftar episode per season. Hasil di-cache in-memory.
// ============================================================

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	tvmazeBase    = "https://api.tvmaze.com"
	catalogTTL    = 6 * time.Hour
	httpGetTimout = 12 * time.Second
)

// --- Tipe respons mentah TVMaze (hanya field yang dipakai) ---

type tvImage struct {
	Medium   string `json:"medium"`
	Original string `json:"original"`
}

type tvNetwork struct {
	Name    string `json:"name"`
	Country struct {
		Name string `json:"name"`
	} `json:"country"`
}

type tvShow struct {
	ID        int      `json:"id"`
	Name      string   `json:"name"`
	Type      string   `json:"type"`
	Language  string   `json:"language"`
	Genres    []string `json:"genres"`
	Status    string   `json:"status"`
	Runtime   int      `json:"runtime"`
	Premiered string   `json:"premiered"`
	Rating    struct {
		Average float64 `json:"average"`
	} `json:"rating"`
	Image   *tvImage   `json:"image"`
	Summary string     `json:"summary"`
	Network *tvNetwork `json:"network"`
}

type tvSearchHit struct {
	Score float64 `json:"score"`
	Show  tvShow  `json:"show"`
}

type tvEpisode struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Season  int    `json:"season"`
	Number  int    `json:"number"`
	Runtime int    `json:"runtime"`
	Airdate string `json:"airdate"`
	Rating  struct {
		Average float64 `json:"average"`
	} `json:"rating"`
	Image   *tvImage `json:"image"`
	Summary string   `json:"summary"`
}

// --- Tipe respons rapi untuk frontend ---

type catalogShow struct {
	ID       int      `json:"id"`
	Title    string   `json:"title"`
	Type     string   `json:"type"`
	Language string   `json:"language"`
	Genres   []string `json:"genres"`
	Status   string   `json:"status"`
	Year     string   `json:"year"`
	Rating   float64  `json:"rating"`
	Poster   string   `json:"poster"`
	Backdrop string   `json:"backdrop"`
	Summary  string   `json:"summary"`
	Network  string   `json:"network"`
}

type catalogEpisode struct {
	ID      int     `json:"id"`
	Title   string  `json:"title"`
	Season  int     `json:"season"`
	Number  int     `json:"number"`
	Code    string  `json:"code"` // S01E02
	Runtime int     `json:"runtime"`
	Airdate string  `json:"airdate"`
	Rating  float64 `json:"rating"`
	Still   string  `json:"still"`
	Summary string  `json:"summary"`
}

// --- Cache sederhana TTL ---

type cacheEntry struct {
	data      []byte
	expiresAt time.Time
}

type catalogCache struct {
	mu    sync.RWMutex
	items map[string]cacheEntry
}

func newCatalogCache() *catalogCache {
	return &catalogCache{items: map[string]cacheEntry{}}
}

func (c *catalogCache) get(key string) ([]byte, bool) {
	c.mu.RLock()
	entry, ok := c.items[key]
	c.mu.RUnlock()
	if !ok || time.Now().After(entry.expiresAt) {
		return nil, false
	}
	return entry.data, true
}

func (c *catalogCache) set(key string, data []byte) {
	c.mu.Lock()
	c.items[key] = cacheEntry{data: data, expiresAt: time.Now().Add(catalogTTL)}
	c.mu.Unlock()
}

// catalogState memegang dependency handler katalog
type catalogState struct {
	cache  *catalogCache
	client *http.Client
}

func newCatalogState() *catalogState {
	return &catalogState{
		cache:  newCatalogCache(),
		client: &http.Client{Timeout: httpGetTimout},
	}
}

// registerCatalogRoutes mendaftarkan endpoint katalog ke mux utama.
func (cs *catalogState) registerCatalogRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/catalog/trending", cs.trendingHandler)
	mux.HandleFunc("/catalog/search", cs.searchHandler)
	mux.HandleFunc("/catalog/show", cs.showHandler)
	mux.HandleFunc("/catalog/episodes", cs.episodesHandler)
}

// fetchJSON mengambil JSON dari TVMaze dengan context timeout.
func (cs *catalogState) fetchJSON(ctx context.Context, url string, out any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "figo-catalog/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := cs.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return &httpStatusError{code: resp.StatusCode}
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 8<<20))
	if err != nil {
		return err
	}
	return json.Unmarshal(body, out)
}

type httpStatusError struct{ code int }

func (e *httpStatusError) Error() string { return "upstream status " + strconv.Itoa(e.code) }

// --- Mapper raw → rapi ---

func mapShow(s tvShow) catalogShow {
	poster, backdrop := "", ""
	if s.Image != nil {
		poster = s.Image.Medium
		backdrop = s.Image.Original
	}
	year := ""
	if len(s.Premiered) >= 4 {
		year = s.Premiered[:4]
	}
	network := ""
	if s.Network != nil {
		network = s.Network.Name
	}
	genres := s.Genres
	if genres == nil {
		genres = []string{}
	}
	return catalogShow{
		ID:       s.ID,
		Title:    s.Name,
		Type:     s.Type,
		Language: s.Language,
		Genres:   genres,
		Status:   s.Status,
		Year:     year,
		Rating:   s.Rating.Average,
		Poster:   poster,
		Backdrop: backdrop,
		Summary:  stripTags(s.Summary),
		Network:  network,
	}
}

func mapEpisode(e tvEpisode) catalogEpisode {
	still := ""
	if e.Image != nil {
		still = e.Image.Medium
	}
	return catalogEpisode{
		ID:      e.ID,
		Title:   e.Name,
		Season:  e.Season,
		Number:  e.Number,
		Code:    episodeCode(e.Season, e.Number),
		Runtime: e.Runtime,
		Airdate: e.Airdate,
		Rating:  e.Rating.Average,
		Still:   still,
		Summary: stripTags(e.Summary),
	}
}

// episodeCode menghasilkan kode standar industri, mis. S01E02.
func episodeCode(season, number int) string {
	pad := func(n int) string {
		if n < 10 {
			return "0" + strconv.Itoa(n)
		}
		return strconv.Itoa(n)
	}
	return "S" + pad(season) + "E" + pad(number)
}

// stripTags membersihkan tag HTML dari summary TVMaze (mis. <p>, <b>).
func stripTags(html string) string {
	var b strings.Builder
	inTag := false
	for _, r := range html {
		switch r {
		case '<':
			inTag = true
		case '>':
			inTag = false
		default:
			if !inTag {
				b.WriteRune(r)
			}
		}
	}
	return strings.TrimSpace(b.String())
}

// --- Handlers ---

// trendingHandler mengembalikan daftar show populer (TVMaze tidak punya endpoint
// trending resmi, jadi pakai halaman index show pertama yang sudah berbobot popularitas).
func (cs *catalogState) trendingHandler(w http.ResponseWriter, r *http.Request) {
	const cacheKey = "trending"
	if cached, ok := cs.cache.get(cacheKey); ok {
		writeRawJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	var raw []tvShow
	if err := cs.fetchJSON(ctx, tvmazeBase+"/shows?page=0", &raw); err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]any{"message": "Gagal memuat katalog."})
		return
	}

	shows := make([]catalogShow, 0, len(raw))
	for _, s := range raw {
		// Hanya tampilkan yang punya poster & rating agar grid rapi
		if s.Image == nil || s.Rating.Average == 0 {
			continue
		}
		shows = append(shows, mapShow(s))
	}
	// Urutkan rating tertinggi & batasi 40
	sortShowsByRating(shows)
	if len(shows) > 40 {
		shows = shows[:40]
	}

	payload, _ := json.Marshal(map[string]any{"results": shows})
	cs.cache.set(cacheKey, payload)
	writeRawJSON(w, http.StatusOK, payload)
}

// searchHandler mencari show berdasarkan query ?q=
func (cs *catalogState) searchHandler(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Query pencarian kosong."})
		return
	}

	cacheKey := "search:" + strings.ToLower(q)
	if cached, ok := cs.cache.get(cacheKey); ok {
		writeRawJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	var hits []tvSearchHit
	url := tvmazeBase + "/search/shows?q=" + urlQueryEscape(q)
	if err := cs.fetchJSON(ctx, url, &hits); err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]any{"message": "Pencarian gagal."})
		return
	}

	shows := make([]catalogShow, 0, len(hits))
	for _, h := range hits {
		shows = append(shows, mapShow(h.Show))
	}

	payload, _ := json.Marshal(map[string]any{"results": shows})
	cs.cache.set(cacheKey, payload)
	writeRawJSON(w, http.StatusOK, payload)
}

// showHandler mengembalikan detail satu show via ?id=
func (cs *catalogState) showHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.URL.Query().Get("id"))
	if _, err := strconv.Atoi(id); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "ID show tidak valid."})
		return
	}

	cacheKey := "show:" + id
	if cached, ok := cs.cache.get(cacheKey); ok {
		writeRawJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	var s tvShow
	if err := cs.fetchJSON(ctx, tvmazeBase+"/shows/"+id, &s); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"message": "Show tidak ditemukan."})
		return
	}

	payload, _ := json.Marshal(mapShow(s))
	cs.cache.set(cacheKey, payload)
	writeRawJSON(w, http.StatusOK, payload)
}

// episodesHandler mengembalikan seluruh episode show, dikelompokkan per season.
// Query: ?id=
func (cs *catalogState) episodesHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.URL.Query().Get("id"))
	if _, err := strconv.Atoi(id); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "ID show tidak valid."})
		return
	}

	cacheKey := "episodes:" + id
	if cached, ok := cs.cache.get(cacheKey); ok {
		writeRawJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	var raw []tvEpisode
	if err := cs.fetchJSON(ctx, tvmazeBase+"/shows/"+id+"/episodes", &raw); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"message": "Episode tidak ditemukan."})
		return
	}

	// Kelompokkan per season agar frontend mudah render tab Netflix-style
	seasonMap := map[int][]catalogEpisode{}
	seasonOrder := []int{}
	for _, e := range raw {
		ep := mapEpisode(e)
		if _, seen := seasonMap[ep.Season]; !seen {
			seasonOrder = append(seasonOrder, ep.Season)
		}
		seasonMap[ep.Season] = append(seasonMap[ep.Season], ep)
	}

	seasons := make([]map[string]any, 0, len(seasonOrder))
	for _, sNum := range seasonOrder {
		seasons = append(seasons, map[string]any{
			"season":   sNum,
			"episodes": seasonMap[sNum],
		})
	}

	payload, _ := json.Marshal(map[string]any{"seasons": seasons})
	cs.cache.set(cacheKey, payload)
	writeRawJSON(w, http.StatusOK, payload)
}

// --- Util kecil ---

func sortShowsByRating(shows []catalogShow) {
	for i := 1; i < len(shows); i++ {
		for j := i; j > 0 && shows[j].Rating > shows[j-1].Rating; j-- {
			shows[j], shows[j-1] = shows[j-1], shows[j]
		}
	}
}

func writeRawJSON(w http.ResponseWriter, status int, raw []byte) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(raw)
}

// urlQueryEscape escape minimal untuk query string TVMaze.
func urlQueryEscape(s string) string {
	replacer := strings.NewReplacer(
		" ", "%20", "&", "%26", "?", "%3F", "#", "%23",
		"+", "%2B", "=", "%3D", "/", "%2F",
	)
	return replacer.Replace(s)
}

package main

// ================================================================
// NETFLIX / TMDB — integrasi metadata film & series via TMDB API
// (themoviedb.org, gratis dengan API key).
//
// Menyediakan:
//   /catalog/movies           — trending film minggu ini
//   /catalog/movies/search    — cari film via ?q=
//   /catalog/movies/detail    — detail film via ?id=
//   /catalog/netflix          — series Netflix trending (provider 8)
//   /catalog/netflix/search   — cari series Netflix via ?q=
//
// Konfigurasi env:
//   TMDB_API_KEY  — API key dari themoviedb.org (daftar gratis)
//                   Tanpa key → fallback ke data demo kosong.
// ================================================================

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
)

const (
	tmdbBase        = "https://api.themoviedb.org/3"
	tmdbImageBase   = "https://image.tmdb.org/t/p"
	tmdbNetflixID   = "8"   // Netflix watch provider ID di TMDB
	tmdbRegion      = "US"
	tmdbMoviesCacheKey      = "tmdb:movies:trending"
	tmdbNetflixCacheKey     = "tmdb:netflix:trending"
)

// --- Raw struct dari TMDB ---

type tmdbMovie struct {
	ID               int     `json:"id"`
	Title            string  `json:"title"`
	OriginalTitle    string  `json:"original_title"`
	Overview         string  `json:"overview"`
	PosterPath       string  `json:"poster_path"`
	BackdropPath     string  `json:"backdrop_path"`
	ReleaseDate      string  `json:"release_date"`
	VoteAverage      float64 `json:"vote_average"`
	VoteCount        int     `json:"vote_count"`
	GenreIDs         []int   `json:"genre_ids"`
	Popularity       float64 `json:"popularity"`
	Adult            bool    `json:"adult"`
}

type tmdbSeries struct {
	ID           int     `json:"id"`
	Name         string  `json:"name"`
	OriginalName string  `json:"original_name"`
	Overview     string  `json:"overview"`
	PosterPath   string  `json:"poster_path"`
	BackdropPath string  `json:"backdrop_path"`
	FirstAirDate string  `json:"first_air_date"`
	VoteAverage  float64 `json:"vote_average"`
	VoteCount    int     `json:"vote_count"`
	GenreIDs     []int   `json:"genre_ids"`
	Popularity   float64 `json:"popularity"`
}

type tmdbMovieDetail struct {
	tmdbMovie
	Runtime  int    `json:"runtime"`
	Status   string `json:"status"`
	Tagline  string `json:"tagline"`
	Genres   []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"genres"`
	ProductionCompanies []struct {
		Name string `json:"name"`
	} `json:"production_companies"`
	Credits struct {
		Cast []struct {
			ID          int    `json:"id"`
			Name        string `json:"name"`
			Character   string `json:"character"`
			ProfilePath string `json:"profile_path"`
			Order       int    `json:"order"`
		} `json:"cast"`
		Crew []struct {
			ID          int    `json:"id"`
			Name        string `json:"name"`
			Job         string `json:"job"`
			ProfilePath string `json:"profile_path"`
		} `json:"crew"`
	} `json:"credits"`
}

type tmdbSeriesDetail struct {
	tmdbSeries
	NumberOfSeasons  int    `json:"number_of_seasons"`
	NumberOfEpisodes int    `json:"number_of_episodes"`
	Status           string `json:"status"`
	Tagline          string `json:"tagline"`
	Genres           []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"genres"`
	Networks []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"networks"`
	LastAirDate string `json:"last_air_date"`
	Credits     struct {
		Cast []struct {
			ID          int    `json:"id"`
			Name        string `json:"name"`
			Character   string `json:"character"`
			ProfilePath string `json:"profile_path"`
			Order       int    `json:"order"`
		} `json:"cast"`
		Crew []struct {
			ID          int    `json:"id"`
			Name        string `json:"name"`
			Job         string `json:"job"`
			ProfilePath string `json:"profile_path"`
		} `json:"crew"`
	} `json:"credits"`
}

type tmdbPageResult[T any] struct {
	Page         int `json:"page"`
	TotalPages   int `json:"total_pages"`
	TotalResults int `json:"total_results"`
	Results      []T `json:"results"`
}

// --- Output rapi untuk frontend ---

type movieItem struct {
	ID       int      `json:"id"`
	Title    string   `json:"title"`
	Year     string   `json:"year"`
	Rating   float64  `json:"rating"`
	Votes    int      `json:"votes"`
	Poster   string   `json:"poster"`
	Backdrop string   `json:"backdrop"`
	Summary  string   `json:"summary"`
	Genres   []string `json:"genres"`
	Runtime  int      `json:"runtime,omitempty"`
	Status   string   `json:"status,omitempty"`
	Tagline  string   `json:"tagline,omitempty"`
	Type     string   `json:"type"` // "movie" | "series"
	Networks []string `json:"networks,omitempty"`
	Seasons  int      `json:"seasons,omitempty"`
	Episodes int      `json:"episodes,omitempty"`
}

type castMember struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Character string `json:"character"`
	Photo     string `json:"photo"`
}

type movieDetail struct {
	Movie movieItem    `json:"movie"`
	Cast  []castMember `json:"cast"`
}

// --- State ---

type netflixState struct {
	cache  *catalogCache
	client *http.Client
	apiKey string
}

func newNetflixState() *netflixState {
	key := strings.TrimSpace(os.Getenv("TMDB_API_KEY"))
	return &netflixState{
		cache:  newCatalogCache(),
		client: &http.Client{Timeout: httpGetTimout},
		apiKey: key,
	}
}

func (ns *netflixState) hasKey() bool { return ns.apiKey != "" }

// registerNetflixRoutes mendaftarkan endpoint TMDB ke mux utama.
func (ns *netflixState) registerNetflixRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/catalog/movies", ns.moviesHandler)
	mux.HandleFunc("/catalog/movies/search", ns.moviesSearchHandler)
	mux.HandleFunc("/catalog/movies/detail", ns.moviesDetailHandler)
	mux.HandleFunc("/catalog/netflix", ns.netflixHandler)
	mux.HandleFunc("/catalog/netflix/search", ns.netflixSearchHandler)
	mux.HandleFunc("/catalog/netflix/detail", ns.netflixDetailHandler)
}

// --- HTTP helper ---

func (ns *netflixState) fetchTMDB(ctx context.Context, endpoint string, params url.Values, out any) error {
	if !ns.hasKey() {
		return fmt.Errorf("TMDB_API_KEY tidak dikonfigurasi")
	}

	params.Set("api_key", ns.apiKey)
	params.Set("language", "en-US")

	fullURL := tmdbBase + endpoint + "?" + params.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fullURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "figo-catalog/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := ns.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return &httpStatusError{code: resp.StatusCode}
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 16<<20))
	if err != nil {
		return err
	}
	return json.Unmarshal(body, out)
}

// --- Image URL helpers ---

func tmdbPosterURL(path string) string {
	if path == "" {
		return ""
	}
	return tmdbImageBase + "/w342" + path
}

func tmdbBackdropURL(path string) string {
	if path == "" {
		return ""
	}
	return tmdbImageBase + "/w1280" + path
}

func tmdbProfileURL(path string) string {
	if path == "" {
		return ""
	}
	return tmdbImageBase + "/w185" + path
}

func yearFromDate(date string) string {
	if len(date) >= 4 {
		return date[:4]
	}
	return ""
}

// --- Mapper ---

func mapTMDBMovie(m tmdbMovie) movieItem {
	return movieItem{
		ID:       m.ID,
		Title:    m.Title,
		Year:     yearFromDate(m.ReleaseDate),
		Rating:   roundRating(m.VoteAverage),
		Votes:    m.VoteCount,
		Poster:   tmdbPosterURL(m.PosterPath),
		Backdrop: tmdbBackdropURL(m.BackdropPath),
		Summary:  m.Overview,
		Genres:   []string{}, // genre IDs — diisi kalau ada mapping
		Type:     "movie",
	}
}

func mapTMDBSeries(s tmdbSeries) movieItem {
	return movieItem{
		ID:       s.ID,
		Title:    s.Name,
		Year:     yearFromDate(s.FirstAirDate),
		Rating:   roundRating(s.VoteAverage),
		Votes:    s.VoteCount,
		Poster:   tmdbPosterURL(s.PosterPath),
		Backdrop: tmdbBackdropURL(s.BackdropPath),
		Summary:  s.Overview,
		Genres:   []string{},
		Type:     "series",
	}
}

func mapTMDBMovieDetail(m tmdbMovieDetail) movieDetail {
	genres := make([]string, 0, len(m.Genres))
	for _, g := range m.Genres {
		genres = append(genres, g.Name)
	}

	cast := make([]castMember, 0)
	for i, c := range m.Credits.Cast {
		if i >= 10 {
			break
		}
		cast = append(cast, castMember{
			ID:        c.ID,
			Name:      c.Name,
			Character: c.Character,
			Photo:     tmdbProfileURL(c.ProfilePath),
		})
	}

	return movieDetail{
		Movie: movieItem{
			ID:       m.ID,
			Title:    m.Title,
			Year:     yearFromDate(m.ReleaseDate),
			Rating:   roundRating(m.VoteAverage),
			Votes:    m.VoteCount,
			Poster:   tmdbPosterURL(m.PosterPath),
			Backdrop: tmdbBackdropURL(m.BackdropPath),
			Summary:  m.Overview,
			Genres:   genres,
			Runtime:  m.Runtime,
			Status:   m.Status,
			Tagline:  m.Tagline,
			Type:     "movie",
		},
		Cast: cast,
	}
}

func mapTMDBSeriesDetail(s tmdbSeriesDetail) movieDetail {
	genres := make([]string, 0, len(s.Genres))
	for _, g := range s.Genres {
		genres = append(genres, g.Name)
	}
	networks := make([]string, 0, len(s.Networks))
	for _, n := range s.Networks {
		networks = append(networks, n.Name)
	}

	cast := make([]castMember, 0)
	for i, c := range s.Credits.Cast {
		if i >= 10 {
			break
		}
		cast = append(cast, castMember{
			ID:        c.ID,
			Name:      c.Name,
			Character: c.Character,
			Photo:     tmdbProfileURL(c.ProfilePath),
		})
	}

	return movieDetail{
		Movie: movieItem{
			ID:       s.ID,
			Title:    s.Name,
			Year:     yearFromDate(s.FirstAirDate),
			Rating:   roundRating(s.VoteAverage),
			Votes:    s.VoteCount,
			Poster:   tmdbPosterURL(s.PosterPath),
			Backdrop: tmdbBackdropURL(s.BackdropPath),
			Summary:  s.Overview,
			Genres:   genres,
			Status:   s.Status,
			Tagline:  s.Tagline,
			Type:     "series",
			Networks: networks,
			Seasons:  s.NumberOfSeasons,
			Episodes: s.NumberOfEpisodes,
		},
		Cast: cast,
	}
}

func roundRating(v float64) float64 {
	return float64(int(v*10)) / 10
}

// --- Handler: /catalog/movies (trending films) ---

func (ns *netflixState) moviesHandler(w http.ResponseWriter, r *http.Request) {
	if !ns.hasKey() {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"message": "TMDB_API_KEY belum dikonfigurasi di server.",
			"results": []any{},
		})
		return
	}

	const cacheKey = tmdbMoviesCacheKey
	if cached, ok := ns.cache.get(cacheKey); ok {
		writeRawJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	var page1, page2 tmdbPageResult[tmdbMovie]
	params1 := url.Values{"time_window": {"week"}, "page": {"1"}}
	params2 := url.Values{"time_window": {"week"}, "page": {"2"}}

	err1 := ns.fetchTMDB(ctx, "/trending/movie/week", params1, &page1)
	err2 := ns.fetchTMDB(ctx, "/trending/movie/week", params2, &page2)

	if err1 != nil {
		writeJSON(w, http.StatusBadGateway, map[string]any{"message": "Gagal memuat film.", "results": []any{}})
		return
	}

	allMovies := page1.Results
	if err2 == nil {
		allMovies = append(allMovies, page2.Results...)
	}

	items := make([]movieItem, 0, len(allMovies))
	for _, m := range allMovies {
		if m.Adult || m.PosterPath == "" {
			continue
		}
		items = append(items, mapTMDBMovie(m))
	}

	payload, _ := json.Marshal(map[string]any{"results": items, "total": len(items)})
	ns.cache.set(cacheKey, payload)
	writeRawJSON(w, http.StatusOK, payload)
}

// --- Handler: /catalog/movies/search?q= ---

func (ns *netflixState) moviesSearchHandler(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Query kosong.", "results": []any{}})
		return
	}
	if !ns.hasKey() {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"message": "TMDB_API_KEY belum dikonfigurasi.", "results": []any{}})
		return
	}

	cacheKey := "tmdb:movies:search:" + strings.ToLower(q)
	if cached, ok := ns.cache.get(cacheKey); ok {
		writeRawJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	var result tmdbPageResult[tmdbMovie]
	params := url.Values{"query": {q}, "include_adult": {"false"}, "page": {"1"}}
	if err := ns.fetchTMDB(ctx, "/search/movie", params, &result); err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]any{"message": "Pencarian film gagal.", "results": []any{}})
		return
	}

	items := make([]movieItem, 0)
	for _, m := range result.Results {
		if m.Adult || m.PosterPath == "" {
			continue
		}
		items = append(items, mapTMDBMovie(m))
	}

	payload, _ := json.Marshal(map[string]any{"results": items, "total": result.TotalResults})
	ns.cache.set(cacheKey, payload)
	writeRawJSON(w, http.StatusOK, payload)
}

// --- Handler: /catalog/movies/detail?id= ---

func (ns *netflixState) moviesDetailHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.URL.Query().Get("id"))
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "ID film tidak valid."})
		return
	}
	if !ns.hasKey() {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"message": "TMDB_API_KEY belum dikonfigurasi."})
		return
	}

	cacheKey := "tmdb:movies:detail:" + id
	if cached, ok := ns.cache.get(cacheKey); ok {
		writeRawJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	var detail tmdbMovieDetail
	params := url.Values{"append_to_response": {"credits"}}
	if err := ns.fetchTMDB(ctx, "/movie/"+id, params, &detail); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"message": "Film tidak ditemukan."})
		return
	}

	result := mapTMDBMovieDetail(detail)
	payload, _ := json.Marshal(result)
	ns.cache.set(cacheKey, payload)
	writeRawJSON(w, http.StatusOK, payload)
}

// --- Handler: /catalog/netflix (series Netflix trending) ---

func (ns *netflixState) netflixHandler(w http.ResponseWriter, r *http.Request) {
	if !ns.hasKey() {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"message": "TMDB_API_KEY belum dikonfigurasi di server.",
			"results": []any{},
		})
		return
	}

	const cacheKey = tmdbNetflixCacheKey
	if cached, ok := ns.cache.get(cacheKey); ok {
		writeRawJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	// Ambil series yang tersedia di Netflix (watch provider ID 8)
	// sort_by=popularity.desc + with_watch_providers=8 + watch_region=US
	var page1, page2 tmdbPageResult[tmdbSeries]
	baseParams := url.Values{
		"with_watch_providers": {tmdbNetflixID},
		"watch_region":         {tmdbRegion},
		"sort_by":              {"popularity.desc"},
		"vote_count.gte":       {"100"},
	}
	p1 := url.Values{}
	for k, v := range baseParams {
		p1[k] = v
	}
	p1.Set("page", "1")
	p2 := url.Values{}
	for k, v := range baseParams {
		p2[k] = v
	}
	p2.Set("page", "2")

	err1 := ns.fetchTMDB(ctx, "/discover/tv", p1, &page1)
	err2 := ns.fetchTMDB(ctx, "/discover/tv", p2, &page2)

	if err1 != nil {
		writeJSON(w, http.StatusBadGateway, map[string]any{"message": "Gagal memuat katalog Netflix.", "results": []any{}})
		return
	}

	allSeries := page1.Results
	if err2 == nil {
		allSeries = append(allSeries, page2.Results...)
	}

	items := make([]movieItem, 0, len(allSeries))
	for _, s := range allSeries {
		if s.PosterPath == "" {
			continue
		}
		items = append(items, mapTMDBSeries(s))
	}

	payload, _ := json.Marshal(map[string]any{"results": items, "total": len(items)})
	ns.cache.set(cacheKey, payload)
	writeRawJSON(w, http.StatusOK, payload)
}

// --- Handler: /catalog/netflix/search?q= ---

func (ns *netflixState) netflixSearchHandler(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Query kosong.", "results": []any{}})
		return
	}
	if !ns.hasKey() {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"message": "TMDB_API_KEY belum dikonfigurasi.", "results": []any{}})
		return
	}

	cacheKey := "tmdb:netflix:search:" + strings.ToLower(q)
	if cached, ok := ns.cache.get(cacheKey); ok {
		writeRawJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	// Search TV (series) — tidak ada filter provider Netflix di /search/tv, tapi kita tampilkan semua series
	var result tmdbPageResult[tmdbSeries]
	params := url.Values{"query": {q}, "page": {"1"}, "include_adult": {"false"}}
	if err := ns.fetchTMDB(ctx, "/search/tv", params, &result); err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]any{"message": "Pencarian series gagal.", "results": []any{}})
		return
	}

	items := make([]movieItem, 0)
	for _, s := range result.Results {
		if s.PosterPath == "" {
			continue
		}
		items = append(items, mapTMDBSeries(s))
	}

	payload, _ := json.Marshal(map[string]any{"results": items, "total": result.TotalResults})
	ns.cache.set(cacheKey, payload)
	writeRawJSON(w, http.StatusOK, payload)
}

// --- Handler: /catalog/netflix/detail?id= ---

func (ns *netflixState) netflixDetailHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.URL.Query().Get("id"))
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "ID series tidak valid."})
		return
	}
	if !ns.hasKey() {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"message": "TMDB_API_KEY belum dikonfigurasi."})
		return
	}

	cacheKey := "tmdb:netflix:detail:" + id
	if cached, ok := ns.cache.get(cacheKey); ok {
		writeRawJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	var detail tmdbSeriesDetail
	params := url.Values{"append_to_response": {"credits"}}
	if err := ns.fetchTMDB(ctx, "/tv/"+id, params, &detail); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"message": "Series tidak ditemukan."})
		return
	}

	result := mapTMDBSeriesDetail(detail)
	payload, _ := json.Marshal(result)
	ns.cache.set(cacheKey, payload)
	writeRawJSON(w, http.StatusOK, payload)
}

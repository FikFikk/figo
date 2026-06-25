package main

// ================================================================
// STREAMING — Auto-play streaming dengan vidsrc.xyz embed
// Menggunakan TMDB API untuk metadata + vidsrc.xyz untuk video player
//
// Endpoints:
//   /stream/search       — cari film/series via ?q= (TMDB search)
//   /stream/detail       — detail + auto embed URL via ?id=&type=
//   /stream/trending     — film trending (TMDB)
//
// Vidsrc.xyz embed format:
//   - Movie: https://vidsrc.xyz/embed/movie/{tmdb_id}
//   - Series: https://vidsrc.xyz/embed/tv/{tmdb_id}/{season}/{episode}
// ================================================================

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

const (
	vidsrcBase = "https://vidsrc.xyz/embed"
)

// --- Response structs ---

type streamSearchResult struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	Type      string   `json:"type"` // "movie" or "tv"
	Year      string   `json:"year"`
	Poster    string   `json:"poster"`
	Backdrop  string   `json:"backdrop"`
	Rating    float64  `json:"rating"`
	Overview  string   `json:"overview"`
	Genres    []string `json:"genres"`
	StreamURL string   `json:"stream_url"` // /stream/detail?id=X&type=movie
	EmbedURL  string   `json:"embed_url"`  // direct vidsrc.xyz URL
}

type streamDetail struct {
	ID          string         `json:"id"`
	Title       string         `json:"title"`
	Type        string         `json:"type"`
	Year        string         `json:"year"`
	Poster      string         `json:"poster"`
	Backdrop    string         `json:"backdrop"`
	Rating      float64        `json:"rating"`
	Overview    string         `json:"overview"`
	Genres      []string       `json:"genres"`
	Runtime     int            `json:"runtime,omitempty"`
	Seasons     int            `json:"seasons,omitempty"`
	EmbedURL    string         `json:"embed_url"`    // vidsrc URL untuk movie
	Episodes    []episodeInfo  `json:"episodes,omitempty"` // untuk series
}

type episodeInfo struct {
	Season    int    `json:"season"`
	Episode   int    `json:"episode"`
	Name      string `json:"name"`
	Overview  string `json:"overview"`
	Thumbnail string `json:"thumbnail"` // episode still image
	EmbedURL  string `json:"embed_url"` // vidsrc URL untuk episode
}

// --- State ---

type streamingState struct {
	cache     *catalogCache
	client    *http.Client
	tmdbToken string
}

func newStreamingState() *streamingState {
	return &streamingState{
		cache:     newCatalogCache(),
		client:    &http.Client{Timeout: httpGetTimout},
		tmdbToken: envString("TMDB_API_KEY", ""),
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

	// Search via TMDB
	tmdbURL := fmt.Sprintf("%s/search/multi?api_key=%s&query=%s&language=id-ID&page=1",
		tmdbBase, ss.tmdbToken, url.QueryEscape(q))

	body, err := ss.fetchTMDB(ctx, tmdbURL)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "TMDB search failed", "error": err.Error()})
		return
	}

	var resp struct {
		Results []struct {
			ID           int     `json:"id"`
			Title        string  `json:"title"`
			Name         string  `json:"name"`
			MediaType    string  `json:"media_type"`
			ReleaseDate  string  `json:"release_date"`
			FirstAirDate string  `json:"first_air_date"`
			PosterPath   string  `json:"poster_path"`
			BackdropPath string  `json:"backdrop_path"`
			VoteAverage  float64 `json:"vote_average"`
			Overview     string  `json:"overview"`
		} `json:"results"`
	}

	if err := json.Unmarshal(body, &resp); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Failed to parse TMDB response"})
		return
	}

	results := []streamSearchResult{}
	for _, item := range resp.Results {
		if item.MediaType != "movie" && item.MediaType != "tv" {
			continue
		}

		title := item.Title
		if title == "" {
			title = item.Name
		}

		year := extractYear(item.ReleaseDate)
		if year == "" {
			year = extractYear(item.FirstAirDate)
		}

		result := streamSearchResult{
			ID:        strconv.Itoa(item.ID),
			Title:     title,
			Type:      item.MediaType,
			Year:      year,
			Poster:    ss.tmdbImageURL(item.PosterPath, "w500"),
			Backdrop:  ss.tmdbImageURL(item.BackdropPath, "w1280"),
			Rating:    item.VoteAverage,
			Overview:  item.Overview,
			StreamURL: fmt.Sprintf("/stream/detail?id=%d&type=%s", item.ID, item.MediaType),
			EmbedURL:  ss.buildVidsrcURL(item.ID, item.MediaType, 1, 1),
		}

		results = append(results, result)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"query":   q,
		"count":   len(results),
		"results": results,
	})
}

func (ss *streamingState) detailHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	mediaType := r.URL.Query().Get("type")

	if id == "" || mediaType == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Missing 'id' or 'type' parameter"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	// Fetch detail dari TMDB
	tmdbURL := fmt.Sprintf("%s/%s/%s?api_key=%s&language=id-ID",
		tmdbBase, mediaType, id, ss.tmdbToken)

	body, err := ss.fetchTMDB(ctx, tmdbURL)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "TMDB detail failed", "error": err.Error()})
		return
	}

	if mediaType == "movie" {
		var movie struct {
			ID           int     `json:"id"`
			Title        string  `json:"title"`
			ReleaseDate  string  `json:"release_date"`
			PosterPath   string  `json:"poster_path"`
			BackdropPath string  `json:"backdrop_path"`
			VoteAverage  float64 `json:"vote_average"`
			Overview     string  `json:"overview"`
			Runtime      int     `json:"runtime"`
			Genres       []struct {
				Name string `json:"name"`
			} `json:"genres"`
		}

		if err := json.Unmarshal(body, &movie); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Failed to parse movie"})
			return
		}

		genres := []string{}
		for _, g := range movie.Genres {
			genres = append(genres, g.Name)
		}

		detail := streamDetail{
			ID:       id,
			Title:    movie.Title,
			Type:     "movie",
			Year:     extractYear(movie.ReleaseDate),
			Poster:   ss.tmdbImageURL(movie.PosterPath, "w500"),
			Backdrop: ss.tmdbImageURL(movie.BackdropPath, "w1280"),
			Rating:   movie.VoteAverage,
			Overview: movie.Overview,
			Runtime:  movie.Runtime,
			Genres:   genres,
			EmbedURL: ss.buildVidsrcURL(movie.ID, "movie", 0, 0),
		}

		writeJSON(w, http.StatusOK, detail)
		return
	}

	// TV Series
	var series struct {
		ID               int     `json:"id"`
		Name             string  `json:"name"`
		FirstAirDate     string  `json:"first_air_date"`
		PosterPath       string  `json:"poster_path"`
		BackdropPath     string  `json:"backdrop_path"`
		VoteAverage      float64 `json:"vote_average"`
		Overview         string  `json:"overview"`
		NumberOfSeasons  int     `json:"number_of_seasons"`
		NumberOfEpisodes int     `json:"number_of_episodes"`
		Genres           []struct {
			Name string `json:"name"`
		} `json:"genres"`
	}

	if err := json.Unmarshal(body, &series); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Failed to parse series"})
		return
	}

	genres := []string{}
	for _, g := range series.Genres {
		genres = append(genres, g.Name)
	}

	// Fetch season 1 episodes dengan thumbnail dari TMDB
	seasonURL := fmt.Sprintf("%s/tv/%s/season/1?api_key=%s&language=id-ID",
		tmdbBase, id, ss.tmdbToken)
	
	seasonBody, err := ss.fetchTMDB(ctx, seasonURL)
	episodes := []episodeInfo{}
	
	if err == nil {
		var seasonData struct {
			Episodes []struct {
				EpisodeNumber int    `json:"episode_number"`
				Name          string `json:"name"`
				Overview      string `json:"overview"`
				StillPath     string `json:"still_path"`
			} `json:"episodes"`
		}
		
		if json.Unmarshal(seasonBody, &seasonData) == nil {
			for _, ep := range seasonData.Episodes {
				thumbnail := ss.tmdbImageURL(ep.StillPath, "w300")
				if thumbnail == "" {
					// Fallback ke poster series jika thumbnail tidak ada
					thumbnail = ss.tmdbImageURL(series.PosterPath, "w300")
				}
				
				episodes = append(episodes, episodeInfo{
					Season:    1,
					Episode:   ep.EpisodeNumber,
					Name:      ep.Name,
					Overview:  ep.Overview,
					Thumbnail: thumbnail,
					EmbedURL:  ss.buildVidsrcURL(series.ID, "tv", 1, ep.EpisodeNumber),
				})
			}
		}
	}
	
	// Fallback jika fetch season gagal
	if len(episodes) == 0 {
		for ep := 1; ep <= 10; ep++ {
			episodes = append(episodes, episodeInfo{
				Season:    1,
				Episode:   ep,
				Name:      fmt.Sprintf("Episode %d", ep),
				Overview:  "",
				Thumbnail: ss.tmdbImageURL(series.PosterPath, "w300"),
				EmbedURL:  ss.buildVidsrcURL(series.ID, "tv", 1, ep),
			})
		}
	}

	detail := streamDetail{
		ID:       id,
		Title:    series.Name,
		Type:     "tv",
		Year:     extractYear(series.FirstAirDate),
		Poster:   ss.tmdbImageURL(series.PosterPath, "w500"),
		Backdrop: ss.tmdbImageURL(series.BackdropPath, "w1280"),
		Rating:   series.VoteAverage,
		Overview: series.Overview,
		Genres:   genres,
		Seasons:  series.NumberOfSeasons,
		Episodes: episodes,
	}

	writeJSON(w, http.StatusOK, detail)
}

func (ss *streamingState) trendingHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), httpGetTimout)
	defer cancel()

	// Trending dari TMDB (all — movie + tv)
	tmdbURL := fmt.Sprintf("%s/trending/all/week?api_key=%s&language=id-ID",
		tmdbBase, ss.tmdbToken)

	body, err := ss.fetchTMDB(ctx, tmdbURL)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "TMDB trending failed", "error": err.Error()})
		return
	}

	var resp struct {
		Results []struct {
			ID           int     `json:"id"`
			Title        string  `json:"title"`
			Name         string  `json:"name"`
			MediaType    string  `json:"media_type"`
			ReleaseDate  string  `json:"release_date"`
			FirstAirDate string  `json:"first_air_date"`
			PosterPath   string  `json:"poster_path"`
			BackdropPath string  `json:"backdrop_path"`
			VoteAverage  float64 `json:"vote_average"`
			Overview     string  `json:"overview"`
		} `json:"results"`
	}

	if err := json.Unmarshal(body, &resp); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Failed to parse TMDB response"})
		return
	}

	results := []streamSearchResult{}
	for _, item := range resp.Results {
		if item.MediaType != "movie" && item.MediaType != "tv" {
			continue
		}

		title := item.Title
		if title == "" {
			title = item.Name
		}

		year := extractYear(item.ReleaseDate)
		if year == "" {
			year = extractYear(item.FirstAirDate)
		}

		result := streamSearchResult{
			ID:        strconv.Itoa(item.ID),
			Title:     title,
			Type:      item.MediaType,
			Year:      year,
			Poster:    ss.tmdbImageURL(item.PosterPath, "w500"),
			Backdrop:  ss.tmdbImageURL(item.BackdropPath, "w1280"),
			Rating:    item.VoteAverage,
			Overview:  item.Overview,
			StreamURL: fmt.Sprintf("/stream/detail?id=%d&type=%s", item.ID, item.MediaType),
			EmbedURL:  ss.buildVidsrcURL(item.ID, item.MediaType, 1, 1),
		}

		results = append(results, result)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"count":   len(results),
		"results": results,
	})
}

// --- Helpers ---

func (ss *streamingState) fetchTMDB(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := ss.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, &httpStatusError{code: resp.StatusCode}
	}

	return io.ReadAll(resp.Body)
}

func (ss *streamingState) tmdbImageURL(path string, size string) string {
	if path == "" {
		return ""
	}
	return fmt.Sprintf("%s/%s%s", tmdbImageBase, size, path)
}

func (ss *streamingState) buildVidsrcURL(id int, mediaType string, season int, episode int) string {
	if mediaType == "movie" {
		return fmt.Sprintf("%s/movie/%d", vidsrcBase, id)
	}
	return fmt.Sprintf("%s/tv/%d/%d/%d", vidsrcBase, id, season, episode)
}

func extractYear(dateStr string) string {
	parts := strings.Split(dateStr, "-")
	if len(parts) > 0 {
		return parts[0]
	}
	return ""
}

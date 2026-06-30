package main

// ================================================================
// VIDLINK SCRAPER — VidLink.pro redirect proxy
// 
// Endpoints:
//   /movie/{tmdb_id}/stream.m3u8  — Redirect ke VidLink.pro embed
// ================================================================

import (
	"fmt"
	"net/http"
	"strings"
)

type vidlinkState struct{}

func newVidlinkState() *vidlinkState {
	return &vidlinkState{}
}

func (vs *vidlinkState) registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/vidlink/", vs.streamHandler) // Catch /vidlink/{id}
}

// streamHandler handles /vidlink/{tmdb_id}
func (vs *vidlinkState) streamHandler(w http.ResponseWriter, r *http.Request) {
	// Parse: /vidlink/1049082 atau /vidlink/tt37659097
	path := r.URL.Path
	fmt.Printf("[VidLink] Request: %s\n", path)
	
	// Extract TMDB ID (bisa numeric atau IMDb ID dengan "tt")
	var tmdbID string
	parts := strings.Split(strings.TrimPrefix(path, "/vidlink/"), "/")
	fmt.Printf("[VidLink] Parts: %v\n", parts)
	
	if len(parts) < 1 || parts[0] == "" {
		http.Error(w, "Invalid path format. Use /vidlink/{tmdb_id}", http.StatusBadRequest)
		return
	}
	tmdbID = parts[0]
	fmt.Printf("[VidLink] TMDB ID: %s\n", tmdbID)

	// VidLink embed URL
	embedURL := fmt.Sprintf("https://vidlink.pro/movie/%s", tmdbID)
	fmt.Printf("[VidLink] Redirect to: %s\n", embedURL)
	
	// Redirect langsung ke VidLink embed player
	http.Redirect(w, r, embedURL, http.StatusFound)
}

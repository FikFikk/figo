package main

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

// HLSProxyState handles decryption and proxying HLS streams
type HLSProxyState struct {
	client *http.Client
}

func newHLSProxyState() *HLSProxyState {
	return &HLSProxyState{
		client: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (h *HLSProxyState) registerRoutes(mux *http.ServeMux) {
	log.Println("[HLS Proxy] Registering /stream/rebahin, /stream/proxy-m3u8, and HLS proxy endpoints")
	mux.HandleFunc("/stream/rebahin", h.handleRebahinStream)
	mux.HandleFunc("/stream/proxy-m3u8", h.handleProxyM3U8)
	
	// HLS proxy unified router dengan logging
	mux.HandleFunc("/hls/", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("[HLS Proxy] Request: %s", r.URL.Path)
		path := strings.TrimPrefix(r.URL.Path, "/hls/")
		
		if path == "seg.ts" {
			h.handleSegmentProxy(w, r)
		} else if path == "variant.m3u8" {
			h.handleVariantProxy(w, r)
		} else if strings.HasSuffix(path, "/master.m3u8") {
			h.handleMasterProxy(w, r)
		} else {
			log.Printf("[HLS Proxy] No match for path: %s", path)
			http.Error(w, "Not Found", http.StatusNotFound)
		}
	})
}

type rebahinPayload struct {
	IV   string `json:"iv"`
	Data string `json:"data"`
}

// Decrypt AES-256-CBC payload from Rebahin playsobat
func decryptRebahinPayload(ivBase64, dataBase64 string) (map[string]string, error) {
	key := []byte("96fb393f57087e9333cc067bf4aa378e") // 32 bytes UTF-8 key

	iv, err := base64.StdEncoding.DecodeString(ivBase64)
	if err != nil {
		return nil, fmt.Errorf("invalid IV base64: %w", err)
	}

	ciphertext, err := base64.StdEncoding.DecodeString(dataBase64)
	if err != nil {
		return nil, fmt.Errorf("invalid Data base64: %w", err)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("new cipher failed: %w", err)
	}

	if len(ciphertext) < aes.BlockSize || len(ciphertext)%aes.BlockSize != 0 {
		return nil, fmt.Errorf("ciphertext length invalid")
	}

	mode := cipher.NewCBCDecrypter(block, iv)
	plaintext := make([]byte, len(ciphertext))
	mode.CryptBlocks(plaintext, ciphertext)

	// PKCS7 unpadding
	if len(plaintext) == 0 {
		return nil, fmt.Errorf("plaintext empty")
	}
	paddingLen := int(plaintext[len(plaintext)-1])
	if paddingLen > len(plaintext) || paddingLen > aes.BlockSize {
		return nil, fmt.Errorf("invalid padding")
	}
	plaintext = plaintext[:len(plaintext)-paddingLen]

	var result map[string]string
	if err := json.Unmarshal(plaintext, &result); err != nil {
		return nil, fmt.Errorf("json unmarshal failed: %w", err)
	}

	return result, nil
}

// /api/stream/rebahin?url=https://rebahin.app/tow-2026/
func (h *HLSProxyState) handleRebahinStream(w http.ResponseWriter, r *http.Request) {
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		respondJSON(w, http.StatusBadRequest, map[string]any{"error": "missing url parameter"})
		return
	}

	log.Printf("[HLS Proxy] Fetching Rebahin page: %s", targetURL)

	// Step 1: Fetch Rebahin detail page to get embed iframe (e.g. playsobat.xyz/e/...)
	req, _ := http.NewRequest("GET", targetURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	resp, err := h.client.Do(req)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]any{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	bodyStr := string(bodyBytes)

	// Find iframe playsobat src
	iframeRegex := regexp.MustCompile(`<iframe[^>]*src=['"]([^'"]+)['"]`)
	matches := iframeRegex.FindStringSubmatch(bodyStr)
	if len(matches) < 2 {
		respondJSON(w, http.StatusNotFound, map[string]any{"error": "embed iframe not found on rebahin page"})
		return
	}

	iframeURL := matches[1]
	if strings.HasPrefix(iframeURL, "//") {
		iframeURL = "https:" + iframeURL
	}

	log.Printf("[HLS Proxy] Found iframe: %s", iframeURL)

	// Step 2: Fetch iframe page to get window.payload
	req2, _ := http.NewRequest("GET", iframeURL, nil)
	req2.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req2.Header.Set("Referer", targetURL)
	resp2, err := h.client.Do(req2)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]any{"error": err.Error()})
		return
	}
	defer resp2.Body.Close()

	bodyBytes2, _ := io.ReadAll(resp2.Body)
	bodyStr2 := string(bodyBytes2)

	// Extract window.payload = "..." sampai semicolon
	startIdx := strings.Index(bodyStr2, "window.payload = ")
	if startIdx == -1 {
		respondJSON(w, http.StatusNotFound, map[string]any{"error": "window.payload not found in player iframe"})
		return
	}

	sub := bodyStr2[startIdx+len("window.payload = "):]
	endIdx := strings.Index(sub, ";")
	if endIdx == -1 {
		endIdx = strings.Index(sub, "\n")
	}
	if endIdx == -1 {
		respondJSON(w, http.StatusInternalServerError, map[string]any{"error": "invalid payload line format"})
		return
	}

	rawPayloadStr := strings.TrimSpace(sub[:endIdx])
	// Parse double-JSON string
	var serializedJSON string
	if err := json.Unmarshal([]byte(rawPayloadStr), &serializedJSON); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]any{"error": "failed first json unmarshal: " + err.Error()})
		return
	}

	var p rebahinPayload
	if err := json.Unmarshal([]byte(serializedJSON), &p); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]any{"error": "failed second json unmarshal: " + err.Error()})
		return
	}

	// Step 3: Decrypt payload
	servers, err := decryptRebahinPayload(p.IV, p.Data)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]any{"error": "decrypt failed: " + err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"source":  targetURL,
		"servers": servers,
	})
}

// Helper function for JSON responses
func respondJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

// /api/stream/proxy-m3u8?url=...
func (h *HLSProxyState) handleProxyM3U8(w http.ResponseWriter, r *http.Request) {
	m3u8URL := r.URL.Query().Get("url")
	if m3u8URL == "" {
		http.Error(w, "missing url", http.StatusBadRequest)
		return
	}

	req, _ := http.NewRequest("GET", m3u8URL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	
	// Set referer jika dipassing
	if ref := r.URL.Query().Get("referer"); ref != "" {
		req.Header.Set("Referer", ref)
	} else {
		u, _ := url.Parse(m3u8URL)
		req.Header.Set("Referer", u.Scheme+"://"+u.Host+"/")
	}

	resp, err := h.client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

// /hls/<base64_url>/master.m3u8 or /hls/seg.ts?u=<base64> or /hls/variant.m3u8?u=<base64>
func (h *HLSProxyState) handleHLSProxy(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/hls/")
	
	// Case 1: /hls/seg.ts?u=<base64>
	if path == "seg.ts" {
		h.handleSegmentProxy(w, r)
		return
	}
	
	// Case 2: /hls/variant.m3u8?u=<base64>
	if path == "variant.m3u8" {
		h.handleVariantProxy(w, r)
		return
	}
	
	// Case 3: /hls/<base64_url>/master.m3u8
	if strings.HasSuffix(path, "/master.m3u8") {
		h.handleMasterProxy(w, r)
		return
	}
	
	http.Error(w, "invalid HLS proxy path", http.StatusBadRequest)
}

// Proxy segment .ts file
func (h *HLSProxyState) handleSegmentProxy(w http.ResponseWriter, r *http.Request) {
	encodedURL := r.URL.Query().Get("u")
	if encodedURL == "" {
		http.Error(w, "missing u parameter", http.StatusBadRequest)
		return
	}
	
	decodedBytes, err := base64.StdEncoding.DecodeString(encodedURL)
	if err != nil {
		http.Error(w, "invalid base64", http.StatusBadRequest)
		return
	}
	upstreamURL := string(decodedBytes)
	
	req, _ := http.NewRequest("GET", upstreamURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	
	u, _ := url.Parse(upstreamURL)
	req.Header.Set("Referer", u.Scheme+"://"+u.Host+"/")
	
	resp, err := h.client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	
	w.Header().Set("Content-Type", "video/mp2t")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

// Proxy variant playlist
func (h *HLSProxyState) handleVariantProxy(w http.ResponseWriter, r *http.Request) {
	encodedURL := r.URL.Query().Get("u")
	if encodedURL == "" {
		http.Error(w, "missing u parameter", http.StatusBadRequest)
		return
	}
	
	decodedBytes, err := base64.StdEncoding.DecodeString(encodedURL)
	if err != nil {
		http.Error(w, "invalid base64", http.StatusBadRequest)
		return
	}
	upstreamURL := string(decodedBytes)
	
	req, _ := http.NewRequest("GET", upstreamURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	
	u, _ := url.Parse(upstreamURL)
	req.Header.Set("Referer", u.Scheme+"://"+u.Host+"/")
	
	resp, err := h.client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	
	bodyBytes, _ := io.ReadAll(resp.Body)
	content := string(bodyBytes)
	
	// Rewrite semua .ts segment URLs jadi proxy URLs
	upstreamBase, _ := url.Parse(upstreamURL)
	lines := strings.Split(content, "\n")
	for i, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		
		// Resolve relative URL
		segmentURL := line
		if !strings.HasPrefix(line, "http") {
			segmentURL = resolveURL(upstreamBase, line)
		}
		
		// Encode ke base64 dan rewrite jadi proxy URL
		encoded := base64.StdEncoding.EncodeToString([]byte(segmentURL))
		lines[i] = fmt.Sprintf("https://go-api.fikfikk.my.id/hls/seg.ts?u=%s", encoded)
	}
	
	rewritten := strings.Join(lines, "\n")
	
	w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(rewritten))
}

// Proxy master playlist
func (h *HLSProxyState) handleMasterProxy(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/hls/")
	encodedURL := strings.TrimSuffix(path, "/master.m3u8")
	
	decodedBytes, err := base64.URLEncoding.DecodeString(encodedURL)
	if err != nil {
		http.Error(w, "invalid base64 URL", http.StatusBadRequest)
		return
	}
	upstreamURL := string(decodedBytes)
	
	req, _ := http.NewRequest("GET", upstreamURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	
	u, _ := url.Parse(upstreamURL)
	req.Header.Set("Referer", u.Scheme+"://"+u.Host+"/")
	
	resp, err := h.client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	
	bodyBytes, _ := io.ReadAll(resp.Body)
	content := string(bodyBytes)
	
	// Rewrite semua variant URLs jadi proxy URLs
	upstreamBase, _ := url.Parse(upstreamURL)
	lines := strings.Split(content, "\n")
	for i, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		
		// Resolve relative URL
		variantURL := line
		if !strings.HasPrefix(line, "http") {
			variantURL = resolveURL(upstreamBase, line)
		}
		
		// Encode ke base64 dan rewrite jadi proxy URL
		encoded := base64.StdEncoding.EncodeToString([]byte(variantURL))
		lines[i] = fmt.Sprintf("https://go-api.fikfikk.my.id/hls/variant.m3u8?u=%s", encoded)
	}
	
	rewritten := strings.Join(lines, "\n")
	
	w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(rewritten))
}

// Helper: resolve relative URL
func resolveURL(base *url.URL, ref string) string {
	refURL, err := url.Parse(ref)
	if err != nil {
		return ref
	}
	return base.ResolveReference(refURL).String()
}

package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	defaultPort      = "5001"
	downloadTimeout  = 10 * time.Minute
	jobDoneTTL       = 15 * time.Minute
	jobErrorTTL      = 5 * time.Minute
	jobProcessingTTL = 20 * time.Minute
	sweepInterval    = 5 * time.Minute
)

var blockedDomains = []string{
	"xvideos.com", "xnxx.com", "xhamster.com", "redtube.com",
	"youporn.com", "spankbang.com", "eporner.com", "beeg.com", "chaturbate.com",
	"onlyfans.com", "rule34.xxx",
}

type downloadRequest struct {
	URL             string `json:"url"`
	Mode            string `json:"mode"`
	FormatID        string `json:"formatId"`
	Uploader        string `json:"uploader"`
	Resolution      string `json:"resolution"`
	ResolutionLabel string `json:"resolutionLabel"`
	MediaID         string `json:"mediaId"`
}

type downloadJob struct {
	Status    string    `json:"status"`
	FilePath  string    `json:"-"`
	Ext       string    `json:"-"`
	MimeType  string    `json:"-"`
	Error     string    `json:"error,omitempty"`
	Title     string    `json:"-"`
	CreatedAt time.Time `json:"-"`
}

type serverState struct {
	jobs        map[string]*downloadJob
	jobsMu      sync.RWMutex
	downloader  chan struct{}
	downloadDir string
}

type fileCandidate struct {
	path string
	name string
	size int64
}

func main() {
	state := &serverState{
		jobs:        map[string]*downloadJob{},
		downloader:  make(chan struct{}, envInt("DOWNLOAD_CONCURRENCY", 1)),
		downloadDir: resolveDownloadDir(),
	}

	if err := os.MkdirAll(state.downloadDir, 0o755); err != nil {
		log.Fatalf("gagal membuat folder download: %v", err)
	}

	go state.sweepLoop()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", state.healthHandler)
	mux.HandleFunc("/download", state.downloadHandler)
	mux.HandleFunc("/job-status", state.jobStatusHandler)
	mux.HandleFunc("/download-file", state.downloadFileHandler)

	port := envString("PORT", defaultPort)
	server := &http.Server{
		Addr:              "127.0.0.1:" + port,
		Handler:           withJSONRecovery(mux),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      0,
	}

	log.Printf("figo download api aktif di http://127.0.0.1:%s", port)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func (s *serverState) healthHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s *serverState) downloadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"message": "Method tidak valid."})
		return
	}

	var req downloadRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Payload tidak valid."})
		return
	}

	if req.URL == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Harap masukkan URL yang valid."})
		return
	}

	normalizedURL := normalizeURL(req.URL)
	if isBlocked(normalizedURL) {
		writeJSON(w, http.StatusForbidden, map[string]any{"message": "Akses Ditolak: URL mengandung konten dewasa yang tidak diizinkan."})
		return
	}

	if req.Mode != "download" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Mode tidak valid untuk Go download API."})
		return
	}

	jobID, err := newJobID()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Gagal membuat job ID."})
		return
	}

	formatID := req.FormatID
	if formatID == "" {
		formatID = "best"
	}

	ext := inferExt(formatID)
	title := buildTitle(req, ext)

	s.jobsMu.Lock()
	s.jobs[jobID] = &downloadJob{Status: "processing", Ext: ext, Title: title, CreatedAt: time.Now()}
	s.jobsMu.Unlock()

	go s.runDownloadJob(jobID, normalizedURL, formatID, ext)

	writeJSON(w, http.StatusOK, map[string]any{"success": true, "mode": "download", "jobId": jobID})
}

func (s *serverState) jobStatusHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		writeJSON(w, http.StatusOK, map[string]any{"status": "error", "error": "Missing job ID"})
		return
	}

	s.jobsMu.RLock()
	job := s.jobs[id]
	s.jobsMu.RUnlock()

	if job == nil {
		writeJSON(w, http.StatusOK, map[string]any{"status": "not_found", "error": "Job not found or expired."})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"status": job.Status, "error": job.Error})
}

func (s *serverState) downloadFileHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "Valid Job ID parameter is required."})
		return
	}

	s.jobsMu.RLock()
	job := s.jobs[id]
	s.jobsMu.RUnlock()

	if job == nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"message": "Tugas unduhan tidak ditemukan atau kadaluarsa."})
		return
	}

	if job.Status != "done" || job.FilePath == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "File belum siap diunduh."})
		return
	}

	file, err := os.Open(job.FilePath)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "File hilang dari server."})
		return
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Download failed: gagal membaca file."})
		return
	}

	filename := fmt.Sprintf("%s.%s", job.Title, job.Ext)
	w.Header().Set("Content-Type", job.MimeType)
	w.Header().Set("Content-Disposition", contentDisposition(filename))
	w.Header().Set("Content-Length", strconv.FormatInt(info.Size(), 10))

	_, copyErr := io.Copy(w, file)

	_ = file.Close()
	_ = os.Remove(job.FilePath)
	s.jobsMu.Lock()
	delete(s.jobs, id)
	s.jobsMu.Unlock()

	if copyErr != nil {
		log.Printf("[Job %s] stream gagal: %v", id, copyErr)
	}
}

func (s *serverState) runDownloadJob(jobID, targetURL, formatID, ext string) {
	s.downloader <- struct{}{}
	defer func() { <-s.downloader }()

	ctx, cancel := context.WithTimeout(context.Background(), downloadTimeout)
	defer cancel()

	outputTemplate := filepath.Join(s.downloadDir, "figo-"+jobID+".%(ext)s")
	ytdlpBin := envString("YTDLP_BIN", "yt-dlp")
	ffmpegBin := envString("FFMPEG_BIN", "ffmpeg")

	isAudioOnly := strings.Contains(formatID, "bestaudio") && !strings.Contains(formatID, "bestvideo")
	isYouTube := strings.Contains(targetURL, "youtube.com") || strings.Contains(targetURL, "youtu.be")

	// Strategi player-client untuk YouTube. Default web client sering kena HTTP 403
	// di CDN googlevideo (URL di-throttle), jadi fallback ke android/ios/tv yang URL-nya valid.
	clientStrategies := []string{""}
	if isYouTube {
		clientStrategies = []string{
			"youtube:player-client=android",
			"youtube:player-client=ios",
			"youtube:player-client=tv",
			"youtube:player-client=web",
		}
	}

	// Bangun args yt-dlp per strategi (extractorArg kosong = pakai default web client)
	buildArgs := func(extractorArg string) []string {
		a := []string{
			"--format", formatID,
			"--output", outputTemplate,
			"--no-warnings",
			"--no-check-certificates",
			"--retries", "5",
			"--fragment-retries", "5",
			"--ffmpeg-location", ffmpegBin,
			"--downloader-args", "ffmpeg_i:-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5",
			"--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
		}
		if extractorArg != "" {
			a = append(a, "--extractor-args", extractorArg)
		}
		if !isAudioOnly {
			a = append(a, "--merge-output-format", ext)
		}
		if ext == "mp4" {
			a = append(a, "--postprocessor-args", "ffmpeg:-c:a aac")
		}
		a = append(a, targetURL)
		return a
	}

	// Coba tiap strategi sampai ada yang sukses. Bersihkan file parsial sebelum retry
	// agar tidak tercampur dengan attempt sebelumnya.
	var lastErr error
	for i, strategy := range clientStrategies {
		log.Printf("[Job %s] download attempt %d/%d format=%s client=%s", jobID, i+1, len(clientStrategies), formatID, clientLabel(strategy))
		if err := runCommand(ctx, ytdlpBin, buildArgs(strategy)); err != nil {
			lastErr = err
			log.Printf("[Job %s] attempt %d gagal: %v", jobID, i+1, err)
			if ctx.Err() != nil {
				break // timeout/cancel — hentikan retry
			}
			cleanupJobArtifacts(s.downloadDir, jobID)
			continue
		}
		lastErr = nil
		break
	}
	if lastErr != nil {
		s.setJobError(jobID, lastErr)
		return
	}

	file, fragments := findDownloadedFile(s.downloadDir, jobID)
	if file == "" && len(fragments) >= 2 {
		mergedPath := filepath.Join(s.downloadDir, "figo-"+jobID+"."+ext)
		if err := mergeFragments(ctx, ffmpegBin, fragments, mergedPath); err == nil {
			file = mergedPath
		} else {
			log.Printf("[Job %s] merge manual gagal: %v", jobID, err)
			file = largestFile(fragments)
		}
	} else if file == "" && len(fragments) == 1 {
		file = fragments[0]
	}

	if file == "" {
		s.setJobError(jobID, errors.New("File hasil download tidak ditemukan."))
		return
	}

	actualExt := strings.TrimPrefix(strings.ToLower(filepath.Ext(file)), ".")
	if actualExt == "" {
		actualExt = ext
	}

	s.jobsMu.Lock()
	if job := s.jobs[jobID]; job != nil {
		job.Status = "done"
		job.FilePath = file
		job.Ext = actualExt
		job.MimeType = mimeType(actualExt)
	}
	s.jobsMu.Unlock()
	log.Printf("[Job %s] selesai file=%s", jobID, file)
}

func (s *serverState) setJobError(jobID string, err error) {
	log.Printf("[Job %s] error: %v", jobID, err)
	s.jobsMu.Lock()
	if job := s.jobs[jobID]; job != nil {
		job.Status = "error"
		job.Error = err.Error()
	}
	s.jobsMu.Unlock()
}

// clientLabel mengubah extractor-arg menjadi label singkat untuk logging.
func clientLabel(extractorArg string) string {
	if extractorArg == "" {
		return "default-web"
	}
	if idx := strings.Index(extractorArg, "player-client="); idx >= 0 {
		val := extractorArg[idx+len("player-client="):]
		if semi := strings.Index(val, ";"); semi >= 0 {
			val = val[:semi]
		}
		return val
	}
	return extractorArg
}

// cleanupJobArtifacts menghapus file/fragment parsial milik job tertentu
// sebelum retry agar attempt berikutnya tidak tercampur sisa attempt gagal.
func cleanupJobArtifacts(dir, jobID string) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return
	}
	for _, entry := range entries {
		if entry.IsDir() || !strings.Contains(entry.Name(), jobID) {
			continue
		}
		if removeErr := os.Remove(filepath.Join(dir, entry.Name())); removeErr != nil {
			log.Printf("[Job %s] gagal hapus artifact %s: %v", jobID, entry.Name(), removeErr)
		}
	}
}

func runCommand(ctx context.Context, bin string, args []string) error {
	cmd := exec.CommandContext(ctx, bin, args...)
	output, err := cmd.CombinedOutput()
	if ctx.Err() != nil {
		return fmt.Errorf("download timeout setelah %s", downloadTimeout)
	}
	if err != nil {
		msg := strings.TrimSpace(string(output))
		if len(msg) > 600 {
			msg = msg[len(msg)-600:]
		}
		return fmt.Errorf("%s gagal: %w — %s", bin, err, msg)
	}
	return nil
}

func mergeFragments(ctx context.Context, ffmpegBin string, fragments []string, outputPath string) error {
	sort.Strings(fragments)
	args := []string{"-y"}
	for _, fragment := range fragments {
		args = append(args, "-i", fragment)
	}
	args = append(args, "-c", "copy", outputPath)
	return runCommand(ctx, ffmpegBin, args)
}

func findDownloadedFile(dir, jobID string) (string, []string) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return "", nil
	}

	fragmentPattern := regexp.MustCompile(`\.f\d+\.`)
	var merged []fileCandidate
	var fragments []fileCandidate

	for _, entry := range entries {
		if entry.IsDir() || !strings.Contains(entry.Name(), jobID) || strings.HasSuffix(entry.Name(), ".part") || strings.HasSuffix(entry.Name(), ".ytdl") {
			continue
		}
		path := filepath.Join(dir, entry.Name())
		info, err := entry.Info()
		if err != nil {
			continue
		}
		item := fileCandidate{path: path, name: entry.Name(), size: info.Size()}
		if fragmentPattern.MatchString(entry.Name()) {
			fragments = append(fragments, item)
		} else {
			merged = append(merged, item)
		}
	}

	sort.Slice(merged, func(i, j int) bool { return merged[i].size > merged[j].size })
	if len(merged) > 0 {
		return merged[0].path, candidatePaths(fragments)
	}

	return "", candidatePaths(fragments)
}

func candidatePaths(items []fileCandidate) []string {
	paths := make([]string, 0, len(items))
	for _, item := range items {
		paths = append(paths, item.path)
	}
	return paths
}

func largestFile(paths []string) string {
	var selected string
	var selectedSize int64 = -1
	for _, path := range paths {
		info, err := os.Stat(path)
		if err == nil && info.Size() > selectedSize {
			selected = path
			selectedSize = info.Size()
		}
	}
	return selected
}

func (s *serverState) sweepLoop() {
	ticker := time.NewTicker(sweepInterval)
	defer ticker.Stop()
	for range ticker.C {
		s.sweepJobs()
	}
}

func (s *serverState) sweepJobs() {
	now := time.Now()
	s.jobsMu.Lock()
	for id, job := range s.jobs {
		expired := false
		switch job.Status {
		case "done":
			expired = now.Sub(job.CreatedAt) > jobDoneTTL
		case "error":
			expired = now.Sub(job.CreatedAt) > jobErrorTTL
		case "processing":
			expired = now.Sub(job.CreatedAt) > jobProcessingTTL
		}
		if expired {
			if job.FilePath != "" {
				_ = os.Remove(job.FilePath)
			}
			delete(s.jobs, id)
		}
	}
	s.jobsMu.Unlock()

	entries, err := os.ReadDir(s.downloadDir)
	if err != nil {
		return
	}
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasPrefix(entry.Name(), "figo-") {
			continue
		}
		path := filepath.Join(s.downloadDir, entry.Name())
		info, err := entry.Info()
		if err == nil && now.Sub(info.ModTime()) > 30*time.Minute {
			_ = os.Remove(path)
		}
	}
}

func normalizeURL(raw string) string {
	url := strings.TrimSpace(raw)
	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		url = "https://" + url
	}
	return url
}

func isBlocked(rawURL string) bool {
	lower := strings.ToLower(rawURL)
	for _, domain := range blockedDomains {
		if strings.Contains(lower, domain) {
			return true
		}
	}
	return false
}

func inferExt(formatID string) string {
	if matches := regexp.MustCompile(`\[ext=([^\]]+)\]`).FindStringSubmatch(formatID); len(matches) == 2 {
		return matches[1]
	}
	if strings.Contains(formatID, "bestaudio") && !strings.Contains(formatID, "bestvideo") {
		return "m4a"
	}
	return "mp4"
}

func buildTitle(req downloadRequest, _ string) string {
	uploader := req.Uploader
	if uploader == "" {
		uploader = "Unknown"
	}
	uploader = sanitizeName(uploader)
	resolution := req.Resolution
	if resolution == "" {
		resolution = req.ResolutionLabel
	}
	if resolution == "" {
		resolution = "Media"
	}
	idSuffix := ""
	if req.MediaID != "" {
		idSuffix = "-[" + sanitizeName(req.MediaID) + "]"
	}
	return fmt.Sprintf("figo-%s%s (%s)", uploader, idSuffix, sanitizeName(resolution))
}

func sanitizeName(input string) string {
	replacer := strings.NewReplacer("/", "", "\\", "", "?", "", "%", "", "*", "", ":", "", "|", "", "\"", "", "<", "", ">", "", "@", "")
	result := strings.TrimSpace(replacer.Replace(input))
	if result == "" {
		return "Media"
	}
	return result
}

func mimeType(ext string) string {
	switch ext {
	case "m4a":
		return "audio/mp4"
	case "mp3":
		return "audio/mp3"
	case "opus":
		return "audio/opus"
	default:
		if detected := mime.TypeByExtension("." + ext); detected != "" {
			return detected
		}
		return "video/mp4"
	}
}

func contentDisposition(filename string) string {
	quoted := strings.ReplaceAll(filename, "\"", "")
	return fmt.Sprintf("attachment; filename=\"%s\"; filename*=UTF-8''%s", quoted, urlPathEscape(filename))
}

func urlPathEscape(input string) string {
	replacer := strings.NewReplacer(" ", "%20", "(", "%28", ")", "%29", "[", "%5B", "]", "%5D")
	return replacer.Replace(input)
}

func newJobID() (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

func resolveDownloadDir() string {
	if dir := os.Getenv("DOWNLOAD_DIR"); dir != "" {
		return dir
	}
	return filepath.Join(mustGetwd(), ".downloads")
}

func mustGetwd() string {
	wd, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	return wd
}

func envString(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func envInt(key string, fallback int) int {
	value, err := strconv.Atoi(strings.TrimSpace(os.Getenv(key)))
	if err != nil || value < 1 {
		return fallback
	}
	return value
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func withJSONRecovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				log.Printf("panic: %v", recovered)
				writeJSON(w, http.StatusInternalServerError, map[string]any{"message": "Internal server error."})
			}
		}()
		next.ServeHTTP(w, r)
	})
}

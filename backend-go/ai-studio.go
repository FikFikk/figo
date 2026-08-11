package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

const (
	maxUploadSize    = 20 * 1024 * 1024 // 20MB
	aiWorkerTimeout  = 360 * time.Second // ARM64 CPU butuh ~3 menit untuk u2net inference
)

// aiStudioState menyimpan path ke Python venv dan worker script
type aiStudioState struct {
	pythonBin  string // path ke python di venv
	workerPath string // path ke ai_worker.py
}

func newAIStudioState() *aiStudioState {
	// Resolve base directory (satu tingkat di atas backend-go)
	baseDir := resolveProjectRoot()

	venvPython := filepath.Join(baseDir, ".ai-venv", "bin", "python3")
	workerScript := filepath.Join(baseDir, "backend-go", "ai_worker.py")

	// Fallback ke system python jika venv tidak ada
	if _, err := os.Stat(venvPython); os.IsNotExist(err) {
		venvPython = "python3"
		log.Printf("[AI Studio] venv python not found at %s, using system python3", venvPython)
	} else {
		log.Printf("[AI Studio] Using venv python: %s", venvPython)
	}

	if _, err := os.Stat(workerScript); os.IsNotExist(err) {
		log.Printf("[AI Studio] WARNING: ai_worker.py not found at %s", workerScript)
	}

	return &aiStudioState{
		pythonBin:  venvPython,
		workerPath: workerScript,
	}
}

func resolveProjectRoot() string {
	// Coba dari working directory
	wd, err := os.Getwd()
	if err != nil {
		wd = "."
	}
	// Dari backend-go/ → parent adalah project root
	parent := filepath.Dir(wd)
	if _, err := os.Stat(filepath.Join(parent, ".ai-venv")); err == nil {
		return parent
	}
	// Kalau langsung dari project root
	if _, err := os.Stat(filepath.Join(wd, ".ai-venv")); err == nil {
		return wd
	}
	// Default assume backend-go is cwd
	return filepath.Join(wd, "..")
}

func (s *aiStudioState) registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/ai/remove-bg", s.removeBgHandler)
	mux.HandleFunc("/ai/upscale", s.upscaleHandler)
	mux.HandleFunc("/ai/enhance", s.enhanceHandler)
	mux.HandleFunc("/ai/denoise", s.denoiseHandler)
	mux.HandleFunc("/ai/status", s.statusHandler)
	log.Printf("[AI Studio] Routes registered: /ai/remove-bg, /ai/upscale, /ai/enhance, /ai/denoise")
}

// statusHandler: cek apakah AI worker tersedia
func (s *aiStudioState) statusHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	_, err := os.Stat(s.workerPath)
	workerOK := err == nil
	_, err2 := exec.LookPath(s.pythonBin)
	if err2 != nil {
		_, err2 = os.Stat(s.pythonBin)
	}
	pythonOK := err2 == nil

	writeJSON(w, http.StatusOK, map[string]any{
		"python":     s.pythonBin,
		"worker":     s.workerPath,
		"python_ok":  pythonOK,
		"worker_ok":  workerOK,
		"ready":      pythonOK && workerOK,
		"platform":   runtime.GOARCH,
	})
}

// removeBgHandler: hapus background gambar menggunakan rembg U2Net
func (s *aiStudioState) removeBgHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "POST only"})
		return
	}

	imgBytes, mimeType, err := readUploadedImage(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	log.Printf("[AI Studio] remove-bg: %s %dKB", mimeType, len(imgBytes)/1024)

	result, err := s.runWorker("remove-bg", imgBytes)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": fmt.Sprintf("remove-bg failed: %v", err)})
		return
	}

	// Kembalikan sebagai base64 JSON agar mudah di-consume frontend
	encoded := base64.StdEncoding.EncodeToString(result)
	writeJSON(w, http.StatusOK, map[string]any{
		"success":  true,
		"format":   "png",
		"data_b64": encoded,
		"size":     len(result),
	})
}

// upscaleHandler: upscale gambar 2x atau 4x
func (s *aiStudioState) upscaleHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "POST only"})
		return
	}

	scale := r.URL.Query().Get("scale")
	if scale == "" {
		scale = "2"
	}
	if scale != "2" && scale != "4" {
		scale = "2"
	}

	imgBytes, mimeType, err := readUploadedImage(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	log.Printf("[AI Studio] upscale x%s: %s %dKB", scale, mimeType, len(imgBytes)/1024)

	result, err := s.runWorker("upscale", imgBytes, scale)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": fmt.Sprintf("upscale failed: %v", err)})
		return
	}

	outFmt := "jpeg"
	if strings.HasPrefix(mimeType, "image/png") || strings.Contains(mimeType, "png") {
		outFmt = "png"
	}

	encoded := base64.StdEncoding.EncodeToString(result)
	writeJSON(w, http.StatusOK, map[string]any{
		"success":  true,
		"format":   outFmt,
		"scale":    scale,
		"data_b64": encoded,
		"size":     len(result),
	})
}

// enhanceHandler: AI-grade image enhancement
func (s *aiStudioState) enhanceHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "POST only"})
		return
	}

	model := r.URL.Query().Get("model")
	validModels := map[string]bool{"balanced": true, "hd_clarity": true, "portrait": true, "vivid": true, "cinematic": true}
	if !validModels[model] {
		model = "balanced"
	}

	imgBytes, mimeType, err := readUploadedImage(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	log.Printf("[AI Studio] enhance [%s]: %s %dKB", model, mimeType, len(imgBytes)/1024)

	result, err := s.runWorker("enhance", imgBytes, model)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": fmt.Sprintf("enhance failed: %v", err)})
		return
	}

	encoded := base64.StdEncoding.EncodeToString(result)
	writeJSON(w, http.StatusOK, map[string]any{
		"success":  true,
		"format":   "jpeg",
		"model":    model,
		"data_b64": encoded,
		"size":     len(result),
	})
}

// denoiseHandler: hapus noise dari gambar
func (s *aiStudioState) denoiseHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "POST only"})
		return
	}

	imgBytes, mimeType, err := readUploadedImage(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	log.Printf("[AI Studio] denoise: %s %dKB", mimeType, len(imgBytes)/1024)

	result, err := s.runWorker("denoise", imgBytes)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": fmt.Sprintf("denoise failed: %v", err)})
		return
	}

	encoded := base64.StdEncoding.EncodeToString(result)
	writeJSON(w, http.StatusOK, map[string]any{
		"success":  true,
		"format":   "jpeg",
		"data_b64": encoded,
		"size":     len(result),
	})
}

// runWorker: spawn Python worker, pipe image bytes ke stdin, baca stdout
func (s *aiStudioState) runWorker(mode string, imgBytes []byte, args ...string) ([]byte, error) {
	cmdArgs := append([]string{s.workerPath, mode}, args...)
	cmd := exec.Command(s.pythonBin, cmdArgs...)

	// Suppress onnxruntime GPU warnings di env
	cmd.Env = append(os.Environ(),
		"ORT_LOGGING_LEVEL=3",
		"ONNXRUNTIME_LOG_LEVEL=3",
	)

	// Pipe input
	cmd.Stdin = bytes.NewReader(imgBytes)

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Timeout
	done := make(chan error, 1)
	go func() {
		done <- cmd.Run()
	}()

	select {
	case err := <-done:
		errText := strings.TrimSpace(stderr.String())
		// Log stderr yang informatif (skip GPU warnings)
		if errText != "" {
			for _, line := range strings.Split(errText, "\n") {
				if !strings.Contains(line, "W:onnxruntime") && !strings.Contains(line, "GetGpuDevices") && !strings.Contains(line, "ReadFileContents") {
					log.Printf("[ai_worker/%s] %s", mode, line)
				}
			}
		}
		if err != nil {
			// Cari error message dari stderr
			for _, line := range strings.Split(errText, "\n") {
				if strings.HasPrefix(line, "ERROR:") {
					return nil, fmt.Errorf("%s", strings.TrimPrefix(line, "ERROR:"))
				}
			}
			return nil, fmt.Errorf("worker exited: %v", err)
		}
		result := stdout.Bytes()
		if len(result) == 0 {
			return nil, fmt.Errorf("worker returned empty output")
		}
		log.Printf("[ai_worker/%s] success: %dKB output", mode, len(result)/1024)
		return result, nil

	case <-time.After(aiWorkerTimeout):
		if cmd.Process != nil {
			_ = cmd.Process.Kill()
		}
		return nil, fmt.Errorf("worker timeout after %s", aiWorkerTimeout)
	}
}

// readUploadedImage: baca gambar dari multipart form atau raw body
func readUploadedImage(r *http.Request) ([]byte, string, error) {
	contentType := r.Header.Get("Content-Type")

	if strings.Contains(contentType, "multipart/form-data") {
		// Multipart file upload
		if err := r.ParseMultipartForm(maxUploadSize); err != nil {
			return nil, "", fmt.Errorf("parse multipart: %v", err)
		}
		file, header, err := r.FormFile("image")
		if err != nil {
			return nil, "", fmt.Errorf("no 'image' field in form: %v", err)
		}
		defer file.Close()

		if header.Size > maxUploadSize {
			return nil, "", fmt.Errorf("file too large: %dMB (max 20MB)", header.Size/1024/1024)
		}

		data, err := io.ReadAll(file)
		if err != nil {
			return nil, "", fmt.Errorf("read file: %v", err)
		}
		return data, header.Header.Get("Content-Type"), nil
	}

	// Raw body (application/octet-stream atau image/*)
	body := io.LimitReader(r.Body, maxUploadSize+1)
	data, err := io.ReadAll(body)
	if err != nil {
		return nil, "", fmt.Errorf("read body: %v", err)
	}
	if len(data) > maxUploadSize {
		return nil, "", fmt.Errorf("body too large (max 20MB)")
	}
	if len(data) == 0 {
		return nil, "", fmt.Errorf("empty body")
	}
	return data, contentType, nil
}

// setCORSHeaders: allow CORS untuk frontend dev
func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

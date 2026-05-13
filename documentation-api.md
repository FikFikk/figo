# API Documentation

## Endpoints

| Field | Detail |
|---|---|
| Method + Endpoint | GET /api/media-proxy |
| Auth Required | No |
| Headers | None specific |
| Query Params | url (string, required), type (string), filename (string) |
| Request Body | N/A |
| Response | HTTP 200 + File Stream (Content-Disposition: attachment) |
| Notes | Used to proxy media downloads and avoid CORS issues |

| Field | Detail |
|---|---|
| Method + Endpoint | GET /api/download-file |
| Auth Required | No |
| Headers | None specific |
| Query Params | id (string, required) |
| Request Body | N/A |
| Response | HTTP 200 + File Stream |
| Notes | Used to download completed yt-dlp jobs |

| Field | Detail |
|---|---|
| Method + Endpoint | GET /api/tools/unhash |
| Auth Required | No |
| Headers | None specific |
| Query Params | hash (string, required), type (string: md5/sha1/sha256) |
| Request Body | N/A |
| Response | HTTP 200 + JSON `{success: boolean, result?: string, message?: string}` |
| Notes | Proxy endpoint to query public rainbow tables for hash reversing without CORS issues |

| Field | Detail |
|---|---|
| Method + Endpoint | GET /api/tools/qr |
| Auth Required | No (Public API) |
| Headers | None specific |
| Query Params | text (string, required), size (number: 50-2000, default 300), format (string: png/svg, default png), dark (hex color, default #000000), light (hex color, default #ffffff), ec (string: L/M/Q/H, default M), margin (number: 0-10, default 2) |
| Request Body | N/A |
| Response | HTTP 200 + image/png atau image/svg+xml |
| Rate Limit | 15 requests per minute per IP. Header: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset |
| Notes | Public QR Code generator API. Mendukung custom warna, ukuran, format, error correction level, dan margin. Mengembalikan HTTP 429 jika rate limit terlampaui. |

| Field | Detail |
|---|---|
| Method + Endpoint | POST /api/compress |
| Auth Required | No |
| Headers | `Content-Type: multipart/form-data` |
| Query Params | N/A |
| Request Body | `files`: File[] (Maks 10 file, Total 200MB, Per-file 50MB)<br>`quality`: Number (1-100) |
| Response | HTTP 200 + `application/octet-stream` (Single) atau `application/zip` (Multiple) |
| Notes | Mendukung ekstensi gambar, PDF, dan dokumen Office. Menggunakan proteksi magic bytes untuk mencegah eksesusi malware (contoh file .exe disamarkan). |

| Field | Detail |
|---|---|
| Method + Endpoint | POST /api/convert |
| Auth Required | No |
| Headers | `Content-Type: multipart/form-data` |
| Query Params | N/A |
| Request Body | `files`: File[] (Maks 10 file, Total 200MB, Per-file 50MB)<br>`format`: String (Target Ekstensi) |
| Response | HTTP 200 + stream file sesuai target atau `application/zip` |
| Notes | Konversi gambar dan spreadsheet (server-side). PDF diproses client-side via WebAssembly. Menggunakan Magic Bytes Guard dan RFC 5987 content disposition untuk sanitasi nama file. |

| Method + Endpoint | GET /api/foods |
| Auth Required | Yes (HF_TOKEN via server) |
| Headers | None specific |
| Query Params | page (number), limit (number, max 100), country (string, e.g., 'en:japan'), search (string) |
| Request Body | N/A |
| Response | HTTP 200 + JSON `{foods: Food[], total: number, page: number, ...}` |
| Notes | Proxy ke HuggingFace OpenFoodFacts dataset. Melakukan transformasi data nutrisi dan mapping image URL ke OpenFoodFacts CDN. |

No scheduled tasks (cron jobs) configured.

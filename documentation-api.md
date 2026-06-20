# API Documentation

## Endpoints

| Bidang                  | Rincian                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Metode + Endpoint       | GET /api/media-proxy                                                                                                                                                                                                                                                                                                                                                    |
| Membutuhkan Autentikasi | Tidak                                                                                                                                                                                                                                                                                                                                                                   |
| Header                  | Tidak ada yang khusus                                                                                                                                                                                                                                                                                                                                                   |
| Parameter Query         | url (string, wajib), type (string, opsional: 'photo'\|'video', default: 'photo'), filename (string, opsional), inline (string, opsional: 'true'\|'false', default: 'false')                                                                                                                                                                                             |
| Body Permintaan         | N/A                                                                                                                                                                                                                                                                                                                                                                     |
| Respons                 | HTTP 200 + File Stream (Content-Disposition: inline atau attachment) / Mengembalikan gambar SVG Fallback jika inline=true dan gagal memuat                                                                                                                                                                                                                              |
| Catatan                 | Digunakan sebagai proxy media untuk menghindari masalah CORS. Jika tautan kedaluwarsa atau diblokir platform (misal: thumbnail Instagram 403), endpoint secara otomatis mengembalikan gambar SVG fallback kustom minimalis bertema gelap dengan ikon default di tengah demi estetika frontend, dan mencatat log sebagai peringatan biasa (bukan error fatal unhandled). |

| Bidang                  | Rincian                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Metode + Endpoint       | POST /api/download                                                                                                                                                                                           |
| Membutuhkan Autentikasi | Tidak                                                                                                                                                                                                        |
| Header                  | Content-Type: application/json                                                                                                                                                                               |
| Parameter Query         | N/A                                                                                                                                                                                                          |
| Body Permintaan         | url (string, wajib), mode (string, wajib: `info` atau `download`), formatId (string, wajib untuk mode download), uploader (string, opsional), resolutionLabel (string, opsional), mediaId (string, opsional) |
| Respons                 | Mode `info`: HTTP 200 + metadata media. YouTube mengembalikan preview (oEmbed) beserta daftar kualitas statis pada field `qualities`. Mode `download`: HTTP 200 + JSON `{ success: true, mode: "download", jobId: string }`                                           |
| Catatan                 | Mode `info` YouTube memakai oEmbed untuk preview cepat dan langsung mengembalikan daftar kualitas statis (preset 1080/720/480/360/Audio) tanpa menjalankan yt-dlp. yt-dlp baru dijalankan saat mode `download`, yang diproxy ke Go Download API internal di `127.0.0.1:5001` agar proses yt-dlp/ffmpeg terpisah dari SSR.                                           |

| Bidang                  | Rincian                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Metode + Endpoint       | GET /api/job-status                                                                                                          |
| Membutuhkan Autentikasi | Tidak                                                                                                                        |
| Header                  | Tidak ada yang khusus                                                                                                        |
| Parameter Query         | id (string, wajib)                                                                                                           |
| Body Permintaan         | N/A                                                                                                                          |
| Respons                 | HTTP 200 + JSON `{ status: "processing"\|"done"\|"error"\|"not_found", error?: string }`                                     |
| Catatan                 | Status job download dibaca dari Go Download API. Fallback ke job store lama di Nuxt tersedia untuk kompatibilitas sementara. |

| Bidang                  | Rincian                                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Metode + Endpoint       | GET /api/download-file                                                                                                                                           |
| Membutuhkan Autentikasi | Tidak                                                                                                                                                            |
| Header                  | Tidak ada yang khusus                                                                                                                                            |
| Parameter Query         | id (string, wajib)                                                                                                                                               |
| Body Permintaan         | N/A                                                                                                                                                              |
| Respons                 | HTTP 200 + File Stream                                                                                                                                           |
| Catatan                 | Stream file hasil job dari Go Download API. File temporer dihapus setelah stream selesai. Fallback ke handler Nuxt lama tersedia untuk kompatibilitas sementara. |

| Field             | Detail                                                                               |
| ----------------- | ------------------------------------------------------------------------------------ |
| Method + Endpoint | GET /api/tools/unhash                                                                |
| Auth Required     | No                                                                                   |
| Headers           | None specific                                                                        |
| Query Params      | hash (string, required), type (string: md5/sha1/sha256)                              |
| Request Body      | N/A                                                                                  |
| Response          | HTTP 200 + JSON `{success: boolean, result?: string, message?: string}`              |
| Notes             | Proxy endpoint to query public rainbow tables for hash reversing without CORS issues |

| Field             | Detail                                                                                                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Method + Endpoint | GET /api/tools/qr                                                                                                                                                                                                                             |
| Auth Required     | No (Public API)                                                                                                                                                                                                                               |
| Headers           | None specific                                                                                                                                                                                                                                 |
| Query Params      | text (string, required), size (number: 50-2000, default 300), format (string: png/svg, default png), dark (hex color, default #000000), light (hex color, default #ffffff), ec (string: L/M/Q/H, default M), margin (number: 0-10, default 2) |
| Request Body      | N/A                                                                                                                                                                                                                                           |
| Response          | HTTP 200 + image/png atau image/svg+xml                                                                                                                                                                                                       |
| Rate Limit        | 15 requests per minute per IP. Header: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset                                                                                                                                            |
| Notes             | Public QR Code generator API. Mendukung custom warna, ukuran, format, error correction level, dan margin. Mengembalikan HTTP 429 jika rate limit terlampaui.                                                                                  |

| Field             | Detail                                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Method + Endpoint | POST /api/compress                                                                                                                                  |
| Auth Required     | No                                                                                                                                                  |
| Headers           | `Content-Type: multipart/form-data`                                                                                                                 |
| Query Params      | N/A                                                                                                                                                 |
| Request Body      | `files`: File[] (Maks 10 file, Total 200MB, Per-file 50MB)<br>`quality`: Number (1-100)                                                             |
| Response          | HTTP 200 + `application/octet-stream` (Single) atau `application/zip` (Multiple)                                                                    |
| Notes             | Mendukung ekstensi gambar, PDF, dan dokumen Office. Menggunakan proteksi magic bytes untuk mencegah eksesusi malware (contoh file .exe disamarkan). |

| Field             | Detail                                                                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Method + Endpoint | POST /api/convert                                                                                                                                                                 |
| Auth Required     | No                                                                                                                                                                                |
| Headers           | `Content-Type: multipart/form-data`                                                                                                                                               |
| Query Params      | N/A                                                                                                                                                                               |
| Request Body      | `files`: File[] (Maks 10 file, Total 200MB, Per-file 50MB)<br>`format`: String (Target Ekstensi)                                                                                  |
| Response          | HTTP 200 + stream file sesuai target atau `application/zip`                                                                                                                       |
| Notes             | Konversi gambar dan spreadsheet (server-side). PDF diproses client-side via WebAssembly. Menggunakan Magic Bytes Guard dan RFC 5987 content disposition untuk sanitasi nama file. |

| Method + Endpoint | GET /api/foods |
| Auth Required | Yes (HF_TOKEN via server) |
| Headers | None specific |
| Query Params | page (number), limit (number, max 100), country (string, e.g., 'en:japan'), search (string) |
| Request Body | N/A |
| Response | HTTP 200 + JSON `{foods: Food[], total: number, page: number, ...}` |
| Notes | Proxy ke HuggingFace OpenFoodFacts dataset. Melakukan transformasi data nutrisi dan mapping image URL ke OpenFoodFacts CDN. |

No scheduled tasks (cron jobs) configured.

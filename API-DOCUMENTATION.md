# FiGo Streaming API Documentation

Backend API untuk Netflix-like streaming aplikasi FiGo dengan auto-play video, TMDB metadata, dan multi-source video player.

**Base URL:** `http://127.0.0.1:5001`

---

## 📋 Table of Contents

1. [Streaming Endpoints](#streaming-endpoints)
2. [Video Proxy Endpoints](#video-proxy-endpoints)
3. [Catalog Endpoints](#catalog-endpoints)
4. [Response Examples](#response-examples)
5. [Data Models](#data-models)

---

## 🎬 Streaming Endpoints

### 1. Search Film/Series

**Endpoint:** `GET /stream/search`

**Query Parameters:**
- `q` (required): Search query (contoh: "spider-man", "terikat janji")

**Response:**
```json
{
  "query": "spider-man",
  "count": 20,
  "results": [
    {
      "id": "557",
      "title": "Spider-Man",
      "type": "movie",
      "year": "2002",
      "poster": "https://image.tmdb.org/t/p/w500/gh4cZbhZxyTbgxQPxD0dOudNPTn.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/...")  ,
      "rating": 7.3,
      "overview": "Setelah digigit laba-laba radioaktif...",
      "genres": [],
      "stream_url": "/stream/detail?id=557&type=movie",
      "embed_url": "https://vidsrc.xyz/embed/movie/557"
    }
  ]
}
```

**Field Descriptions:**
- `id`: TMDB ID (gunakan untuk fetch detail)
- `type`: `"movie"` atau `"tv"`
- `embed_url`: Direct URL untuk video player (pakai ini di iframe)
- `stream_url`: Internal endpoint untuk detail lengkap

---

### 2. Detail Film/Series

**Endpoint:** `GET /stream/detail`

**Query Parameters:**
- `id` (required): TMDB ID dari hasil search
- `type` (required): `"movie"` atau `"tv"`

**Response untuk Movie:**
```json
{
  "id": "557",
  "title": "Spider-Man",
  "type": "movie",
  "year": "2002",
  "poster": "https://image.tmdb.org/t/p/w500/...",
  "backdrop": "https://image.tmdb.org/t/p/w1280/...",
  "rating": 7.3,
  "overview": "Setelah digigit laba-laba radioaktif...",
  "genres": ["Aksi", "Cerita Fiksi"],
  "runtime": 121,
  "embed_url": "https://vidsrc.xyz/embed/movie/557"
}
```

**Response untuk TV Series:**
```json
{
  "id": "94997",
  "title": "House of the Dragon",
  "type": "tv",
  "year": "2022",
  "poster": "https://image.tmdb.org/t/p/w500/...",
  "backdrop": "https://image.tmdb.org/t/p/w1280/...",
  "rating": 8.4,
  "overview": "The Targaryen dynasty...",
  "genres": ["Sci-Fi & Fantasy", "Drama", "Aksi & Petualangan"],
  "seasons": 2,
  "episodes": [
    {
      "season": 1,
      "episode": 1,
      "name": "Episode 1",
      "overview": "Viserys hosts a tournament...",
      "thumbnail": "https://image.tmdb.org/t/p/w300/3oumSnkavc4pcMFvPbgWDUTclNb.jpg",
      "embed_url": "https://vidsrc.xyz/embed/tv/94997/1/1"
    },
    {
      "season": 1,
      "episode": 2,
      "name": "Episode 2",
      "overview": "Rhaenyra navigates Alicent's...",
      "thumbnail": "https://image.tmdb.org/t/p/w300/vJfVCJ3ZgVUfbUZBoeHdLVeJzjL.jpg",
      "embed_url": "https://vidsrc.xyz/embed/tv/94997/1/2"
    }
  ]
}
```

**Field Descriptions:**
- `episodes[].thumbnail`: Thumbnail unik per episode (bukan poster series)
- `episodes[].embed_url`: URL langsung untuk play episode tersebut
- Jika `thumbnail` kosong dari TMDB → fallback ke `poster` series

---

### 3. Trending

**Endpoint:** `GET /stream/trending`

**Response:**
```json
{
  "count": 20,
  "results": [
    {
      "id": "94997",
      "title": "House of the Dragon",
      "type": "tv",
      "year": "2022",
      "poster": "https://image.tmdb.org/t/p/w500/...",
      "backdrop": "https://image.tmdb.org/t/p/w1280/...",
      "rating": 8.4,
      "overview": "The Targaryen dynasty...",
      "stream_url": "/stream/detail?id=94997&type=tv",
      "embed_url": "https://vidsrc.xyz/embed/tv/94997/1/1"
    }
  ]
}
```

**Notes:**
- Mix antara movie dan TV series
- Sorted by TMDB trending score
- Language: Indonesia (id-ID)

---

## 🎥 Video Proxy Endpoints

Solusi untuk bypass sandbox error, block iklan, dan multi-source fallback.

### 1. Direct Player (Recommended)

**Endpoint:** `GET /video/direct`

**Query Parameters:**
- `id` (required): TMDB ID
- `type` (required): `"movie"` atau `"tv"`
- `s` (optional): Season number (default: 1, untuk TV)
- `e` (optional): Episode number (default: 1, untuk TV)

**Response:** HTML player dengan:
- ✅ Sandbox attributes sudah diset
- ✅ Ad-blocking CSS & script removal
- ✅ Multi-source fallback buttons (vidsrc.to, vidsrc.me, 2embed)
- ✅ Popup blocker
- ✅ Auto-detect error & switch source

**Usage:**
```html
<!-- Movie -->
<iframe src="http://127.0.0.1:5001/video/direct?id=557&type=movie" 
        class="w-full h-full rounded-2xl" 
        allowfullscreen />

<!-- TV Series Episode -->
<iframe src="http://127.0.0.1:5001/video/direct?id=94997&type=tv&s=1&e=2" 
        class="w-full h-full rounded-2xl" 
        allowfullscreen />
```

---

### 2. List Sources

**Endpoint:** `GET /video/sources`

**Query Parameters:**
- `id` (required): TMDB ID
- `type` (required): `"movie"` atau `"tv"`
- `s` (optional): Season (untuk TV)
- `e` (optional): Episode (untuk TV)

**Response:**
```json
{
  "sources": [
    {
      "name": "Vidsrc.to",
      "url": "https://vidsrc.to/embed/movie/557"
    },
    {
      "name": "Vidsrc.me",
      "url": "https://vidsrc.me/embed/movie/557"
    },
    {
      "name": "2Embed",
      "url": "https://www.2embed.cc/embed/557"
    }
  ]
}
```

**Usage:**
Untuk membuat custom player dengan pilihan manual source.

---

### 3. Proxy (Advanced)

**Endpoint:** `GET /video/proxy`

**Query Parameters:**
- `url` (required): Full embed URL untuk di-proxy

**Response:** HTML dengan cleanup

**Usage:**
```
GET /video/proxy?url=https://vidsrc.to/embed/movie/557
```

**Notes:**
- Hanya menerima domain whitelist: vidsrc.to, vidsrc.me, 2embed.cc
- Auto-remove ad scripts, tracking, analytics
- Inject ad-blocking CSS

---

## 📚 Catalog Endpoints

### 1. Anime

**Endpoint:** `GET /catalog/anime`

**Query Parameters:**
- `limit` (optional): Max results (default: 20)

**Response:**
```json
{
  "count": 20,
  "results": [
    {
      "id": 569094,
      "title": "Spider-Man: Across the Spider-Verse",
      "type": "movie",
      "year": "2023",
      "poster": "https://image.tmdb.org/t/p/w500/...",
      "rating": 8.4,
      "overview": "After reuniting with Gwen..."
    }
  ]
}
```

**Filter:** TMDB genre 16 (Animation) + vote_average >= 7

---

### 2. New Releases

**Endpoint:** `GET /catalog/new`

**Query Parameters:**
- `limit` (optional): Max results (default: 20)

**Response:** Same structure as anime

**Source:** 
- Movies: TMDB `now_playing`
- TV: TMDB `on_the_air`

---

### 3. Netflix

**Endpoint:** `GET /catalog/netflix`

**Query Parameters:**
- `limit` (optional): Max results (default: 20)

**Response:** Same structure

**Filter:** TMDB watch provider ID 8 (Netflix US)

---

### 4. Trending Movies

**Endpoint:** `GET /catalog/movies`

**Query Parameters:**
- `limit` (optional): Max results (default: 20)

**Response:** Same structure

**Source:** TMDB trending movies (week)

---

### 5. Multi Search

**Endpoint:** `GET /catalog/multi/search`

**Query Parameters:**
- `q` (required): Search query

**Response:** Same structure

**Notes:** Search across movies + TV series

---

## 📖 Response Examples

### Complete Movie Detail Flow

```bash
# 1. Search
curl "http://127.0.0.1:5001/stream/search?q=spider-man"

# 2. Get detail
curl "http://127.0.0.1:5001/stream/detail?id=557&type=movie"

# 3. Play dengan video proxy
# Di browser buka: http://127.0.0.1:5001/video/direct?id=557&type=movie
```

### Complete TV Series Flow

```bash
# 1. Search
curl "http://127.0.0.1:5001/stream/search?q=house+of+the+dragon"

# 2. Get detail + episodes
curl "http://127.0.0.1:5001/stream/detail?id=94997&type=tv"

# Response akan berisi array episodes dengan thumbnail masing-masing

# 3. Play episode tertentu
# http://127.0.0.1:5001/video/direct?id=94997&type=tv&s=1&e=3
```

---

## 🔧 Data Models

### StreamSearchResult
```typescript
interface StreamSearchResult {
  id: string;              // TMDB ID
  title: string;
  type: "movie" | "tv";
  year: string;
  poster: string;          // w500 size
  backdrop: string;        // w1280 size
  rating: number;          // TMDB vote_average (0-10)
  overview: string;
  genres: string[];
  stream_url: string;      // /stream/detail?id=X&type=Y
  embed_url: string;       // Direct vidsrc URL
}
```

### StreamDetail (Movie)
```typescript
interface StreamDetailMovie {
  id: string;
  title: string;
  type: "movie";
  year: string;
  poster: string;
  backdrop: string;
  rating: number;
  overview: string;
  genres: string[];
  runtime: number;         // Minutes
  embed_url: string;
}
```

### StreamDetail (TV)
```typescript
interface StreamDetailTV {
  id: string;
  title: string;
  type: "tv";
  year: string;
  poster: string;
  backdrop: string;
  rating: number;
  overview: string;
  genres: string[];
  seasons: number;
  episodes: EpisodeInfo[];
}

interface EpisodeInfo {
  season: number;
  episode: number;
  name: string;
  overview: string;
  thumbnail: string;       // Episode still (w300) atau fallback ke poster
  embed_url: string;       // Direct vidsrc URL untuk episode ini
}
```

---

## 🎨 Image Sizes dari TMDB

| Field | Size | Usage |
|-------|------|-------|
| `poster` | w500 | Thumbnail di grid/list |
| `backdrop` | w1280 | Hero banner / detail page |
| `episodes[].thumbnail` | w300 | Episode card thumbnail |

**Notes:**
- Semua URL sudah include full path: `https://image.tmdb.org/t/p/{size}{path}`
- Jika thumbnail episode kosong dari TMDB → API auto-fallback ke poster series

---

## ⚠️ Important Notes

### 1. Trending vs Other Endpoints

**Potential Issue (Reported by User):**
> "Trending ada bug popup beda film, yang lain aman"

**Root Cause:**
Frontend mungkin salah mapping `id` atau `type`. Pastikan:
```javascript
// ✅ BENAR
const embedUrl = `/video/direct?id=${item.id}&type=${item.type}`;

// ❌ SALAH
const embedUrl = `/video/direct?id=${index}&type=movie`; // hardcoded type
```

**Verification:**
```bash
# Cek trending response consistency
curl "http://127.0.0.1:5001/stream/trending" | jq '.results[] | {id, title, type}'

# Pastikan id + type match dengan thumbnail
```

### 2. Video Sources Priority

API menggunakan priority order:
1. **vidsrc.to** (primary) — Most reliable
2. **vidsrc.me** (fallback 1)
3. **2embed.cc** (fallback 2)

Auto-switch jika source gagal load (5 detik timeout).

### 3. Rate Limiting

TMDB API free tier: **40 requests/10 seconds**

Strategi:
- Backend cache enabled (12s timeout)
- Frontend debounce search input
- Lazy load thumbnails

---

## 🚀 Quick Start Example

```vue
<template>
  <div class="player-container">
    <!-- Movie -->
    <iframe 
      v-if="item.type === 'movie'"
      :src="`http://127.0.0.1:5001/video/direct?id=${item.id}&type=movie`"
      class="w-full h-full rounded-2xl"
      allowfullscreen
    />
    
    <!-- TV Series Episode -->
    <iframe 
      v-else
      :src="`http://127.0.0.1:5001/video/direct?id=${item.id}&type=tv&s=${selectedSeason}&e=${selectedEpisode}`"
      class="w-full h-full rounded-2xl"
      allowfullscreen
    />
  </div>
</template>

<script setup>
// Fetch trending
const { data } = await $fetch('http://127.0.0.1:5001/stream/trending');

// Fetch detail
const detail = await $fetch(`http://127.0.0.1:5001/stream/detail?id=94997&type=tv`);

// Episodes dengan thumbnail berbeda-beda
detail.episodes.forEach(ep => {
  console.log(ep.episode, ep.name, ep.thumbnail);
});
</script>
```

---

## 📝 Changelog

### v1.4.0 (2026-06-25)
- ✅ **Fix trending popup bug** — Change /api/trending from TVMaze to TMDB
- ✅ **Frontend pakai FiGo Proxy** — Default source dengan ad-blocking + auto-fallback
- ✅ **Fix sandbox error** — Backend /video/direct dengan proper iframe attributes
- ✅ **Fix incognito mode** — Cookie sameSite=none untuk cross-origin support
- ✅ Episode thumbnails dari TMDB (bukan poster series)
- ✅ Fallback ke poster jika thumbnail tidak ada

### v1.3.0 (2026-06-25)
- ✅ Episode thumbnails dari TMDB (bukan poster series)
- ✅ Fallback ke poster jika thumbnail tidak ada
- ✅ Season 1 auto-fetch dari TMDB

### v1.2.0 (2026-06-25)
- ✅ Video proxy dengan ad-blocking
- ✅ Multi-source fallback (3 sources)
- ✅ Sandbox bypass attributes
- ✅ Popup blocker

### v1.1.0 (2026-06-25)
- ✅ Vidsrc.xyz auto-play integration
- ✅ Search film Indonesia (contoh: "Terikat Janji")
- ✅ TMDB API language: id-ID

### v1.0.0 (2026-06-24)
- ✅ TMDB catalog (anime, netflix, new, trending)
- ✅ Basic streaming infrastructure

---

**Last Updated:** 2026-06-25 11:43 WIB  
**API Version:** 1.4.0  
**Maintained by:** FiGo Team

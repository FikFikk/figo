require('dotenv').config();

module.exports = {
  apps: [
    {
      name: "figo-web",
      script: "./.output/server/index.mjs",
      env: {
        PORT: 5000,
        RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
        GO_DOWNLOAD_API_URL: process.env.GO_DOWNLOAD_API_URL || "http://127.0.0.1:5001",
        TMDB_API_KEY: process.env.TMDB_API_KEY,
        TMDB_READ_ACCESS_TOKEN: process.env.TMDB_READ_ACCESS_TOKEN
      }
    },
    {
      name: "figo-download-api",
      script: "./backend-go/figo-download-api",
      interpreter: "none",
      env: {
        PORT: 5001,
        DOWNLOAD_CONCURRENCY: process.env.DOWNLOAD_CONCURRENCY || "1",
        DOWNLOAD_DIR: process.env.DOWNLOAD_DIR || "./.downloads",
        YTDLP_BIN: process.env.YTDLP_BIN || "yt-dlp",
        FFMPEG_BIN: process.env.FFMPEG_BIN || "ffmpeg",
        TMDB_API_KEY: process.env.TMDB_API_KEY,
        TMDB_READ_ACCESS_TOKEN: process.env.TMDB_READ_ACCESS_TOKEN
      }
    }
  ]
}

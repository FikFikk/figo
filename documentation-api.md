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

No scheduled tasks (cron jobs) configured.

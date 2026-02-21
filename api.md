# Quran Audio API — Endpoint Reference

> Base URL: `https://quran-api.gacembekhira.workers.dev`

All public API endpoints are **read-only** and require **no authentication**.
Admin endpoints require **HTTP Basic Auth**.

---

## Public API

### `GET /`

Returns API metadata and a list of available endpoints.

**Response**

```json
{
  "name": "Quran Audio API",
  "version": "1.0.0",
  "endpoints": {
    "api": {
      "reciters": "GET /api/reciters",
      "reciter": "GET /api/reciters/:id",
      "surahs": "GET /api/surahs"
    },
    "admin": "GET /admin (Basic Auth required)"
  }
}
```

---

### `GET /api/reciters`

Returns all reciters with their associated surahs nested inside each reciter object.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Abdul Basit",
      "name_ar": "عبد الباسط عبد الصمد",
      "base_url": null,
      "surahs": [
        {
          "id": 1,
          "surah_number": 1,
          "file_name": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3",
          "file_url": "https://your-r2-public-url.example.com/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3"
        },
        {
          "id": 2,
          "surah_number": 2,
          "file_name": "external",
          "file_url": "https://example.com/audio/002.mp3"
        }
      ]
    }
  ]
}
```

#### Field Reference — Reciter

| Field      | Type            | Description                                      |
|------------|-----------------|--------------------------------------------------|
| `id`       | `integer`       | Unique reciter ID                                |
| `name`     | `string`        | Reciter name in English                          |
| `name_ar`  | `string\|null`  | Reciter name in Arabic (nullable)                |
| `base_url` | `string\|null`  | Optional base URL for the reciter's audio source |
| `surahs`   | `Surah[]`       | Array of associated audio files                  |

#### Field Reference — Surah

| Field          | Type      | Description                                                                 |
|----------------|-----------|-----------------------------------------------------------------------------|
| `id`           | `integer` | Unique surah record ID                                                      |
| `surah_number` | `integer` | Surah number (1–114)                                                        |
| `file_name`    | `string`  | R2 object key (UUID), or `"external"` for URL-pasted entries                |
| `file_url`     | `string`  | Direct URL to the audio file (R2 public URL or external link)               |

**Error `500`**

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### `GET /api/reciters/:id`

Returns a single reciter and their surahs.

**Path Parameters**

| Param | Type    | Description         |
|-------|---------|---------------------|
| `id`  | integer | The reciter's ID    |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Abdul Basit",
    "name_ar": "عبد الباسط عبد الصمد",
    "base_url": null,
    "surahs": [
      {
        "id": 1,
        "surah_number": 1,
        "file_name": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3",
        "file_url": "https://your-r2-public-url.example.com/a1b2c3d4.mp3"
      }
    ]
  }
}
```

**Error `400`** — Invalid ID

```json
{ "success": false, "error": "Invalid reciter ID" }
```

**Error `404`** — Not found

```json
{ "success": false, "error": "Reciter not found" }
```

---

### `GET /api/surahs`

Returns a flat list of all audio files across all reciters.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reciter_id": 1,
      "surah_number": 1,
      "file_name": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3",
      "file_url": "https://your-r2-public-url.example.com/a1b2c3d4.mp3"
    },
    {
      "id": 2,
      "reciter_id": 1,
      "surah_number": 2,
      "file_name": "external",
      "file_url": "https://example.com/audio/002.mp3"
    }
  ]
}
```

---

## Admin Dashboard (Browser)

All admin routes are protected by **HTTP Basic Auth**.
Credentials are set via environment variables (see [Deployment Guide](./DEPLOYMENT.md)).

| Route                            | Method | Description                                       |
|----------------------------------|--------|---------------------------------------------------|
| `/admin`                         | GET    | Dashboard — stats, storage info, reciters table   |
| `/admin/reciters/new`            | GET    | Add reciter form                                  |
| `/admin/reciters/new`            | POST   | Create a new reciter                              |
| `/admin/reciters/:id/edit`       | GET    | Edit reciter form (pre-filled)                    |
| `/admin/reciters/:id/edit`       | POST   | Update reciter name, Arabic name, base URL        |
| `/admin/reciters/:id/delete`     | POST   | Delete a reciter + its audio files from R2        |
| `/admin/upload`                  | GET    | Add surah audio form                              |
| `/admin/upload`                  | POST   | Upload MP3 to R2 **or** save an external URL      |
| `/admin/surahs/:id/delete`      | POST   | Delete a single audio file from R2 + DB           |

### Add Surah Audio — Dual Mode

The upload form supports two modes, toggled via tabs:

#### 📁 Upload File (default)
1. Select a reciter from the dropdown.
2. Enter the surah number (1–114).
3. Choose an MP3 file.
4. The file is uploaded to **Cloudflare R2** with a UUID filename.
5. A record is inserted into the **D1 `surahs` table** linking the file to the reciter.
6. `file_name` is set to the UUID (e.g. `a1b2c3d4-…-ef12.mp3`).

#### 🔗 Paste URL
1. Select a reciter and surah number.
2. Paste a direct audio URL.
3. **No file is uploaded to R2** — the URL is stored directly in D1.
4. `file_name` is set to `"external"` — the delete handler uses this to skip R2 cleanup.

### Dashboard Stats

The admin dashboard displays:

| Card             | Source                                          |
|------------------|-------------------------------------------------|
| Total Reciters   | D1 row count                                    |
| Audio Files      | D1 row count                                    |
| R2 Storage Used  | Calculated by listing all R2 objects             |
| Largest File     | Max `size` from R2 `list()`                     |
| Bandwidth        | Not available via API — see Cloudflare Dashboard |

---

## CORS

CORS is enabled on all `/api/*` routes to allow cross-origin requests from your React Native app or any other client. Admin routes do **not** have CORS enabled.

---

## Error Format

All API errors follow this shape:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

| HTTP Code | Meaning                     |
|-----------|-----------------------------|
| `200`     | Success                     |
| `400`     | Bad request / invalid input |
| `401`     | Unauthorized (admin)        |
| `404`     | Resource not found          |
| `500`     | Internal server error       |

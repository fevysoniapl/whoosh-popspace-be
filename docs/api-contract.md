# Whoosh PopSpace — API Contract

Kontrak REST API backend untuk integrasi frontend Nuxt 4.

- **Base URL**: `http://localhost:5000`
- **Frontend origin yang diizinkan (CORS)**: `http://localhost:3000` (env `CORS_ORIGIN`, bisa daftar dipisah koma)
- **Format**: JSON, kecuali upload (`multipart/form-data`) dan unduh proposal (binary PDF)
- **Auth**: JWT dalam cookie HttpOnly `token` + proteksi CSRF double-submit cookie
- Semua contoh di bawah juga tersedia sebagai file REST Client / Postman di [`docs/api.http`](./api.http).

---

## 1. Konvensi Umum

### 1.1 Envelope response

Semua endpoint `/api/*` (kecuali unduhan PDF) mengembalikan envelope konsisten:

**Sukses** (`200`, `201`):

```json
{
  "status": true,
  "message": "Pesan opsional",
  "data": { }
}
```

**Gagal** (`400`, `401`, `403`, `404`, `409`, `500`):

```json
{
  "status": false,
  "message": "Pesan error utama",
  "details": ["opsional: daftar error validasi ATAU objek detail konflik"],
  "error": "opsional: pesan error internal, hanya saat DEBUG=true"
}
```

Catatan:

- `status` selalu boolean — gunakan ini untuk cek sukses, bukan hanya HTTP code.
- Field `message`, `details`, `error`, `data` hanya muncul jika ada.
- `GET /health` pengecualian: mengembalikan `{"status":"ok"}` (untuk health check).
- Unduhan proposal sukses mengembalikan **binary PDF** (`Content-Type: application/pdf`), bukan JSON. Gagal tetap JSON envelope.

### 1.2 Pagination

Endpoint list dengan pagination menerima query `page` (default 1, min 1) dan `limit` (default 20, min 1, max 100). Bentuk `data`:

```json
{
  "status": true,
  "data": {
    "items": [ ],
    "total": 42,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

### 1.3 Penamaan field

- **Request** (body/query): `snake_case` (mis. `booth_id`, `start_date`, `daily_rate`).
- **Response**: objek Sequelize memakai `camelCase` (mis. `boothId`, `startDate`, `dailyRate`, `imageUrl`), kecuali objek yang dibentuk manual (`availability`, ringkasan `create application`, dashboard) memakai `snake_case`. Contoh bentuk tiap endpoint di bawah adalah bentuk aktual.
- Field `DECIMAL` (mis. `dailyRate`, `sizeSqm`, `estimatedCost`) diserialisasi sebagai **string** (mis. `"150000.00"`). Konversi dengan `Number()` di frontend.
- Tanggal berbentuk string `YYYY-MM-DD`. Timestamp berbentuk ISO 8601.

### 1.4 Autentikasi & sesi (cookie)

| Cookie | HttpOnly | Fungsi |
|---|---|---|
| `token` | ya | JWT sesi (login/register). Max-Age mengikuti `JWT_EXPIRES_IN` (default 1 hari). `SameSite=Lax` (env `COOKIE_SAMESITE`), `Secure` aktif di production atau `COOKIE_SECURE=true`. |
| `csrf_token` | tidak | Token CSRF, dibaca frontend untuk dikirim balik sebagai header `x-csrf-token`. |

**Aturan CSRF**: semua method tidak-aman (`POST`, `PATCH`, `PUT`, `DELETE`) pada `/api/*` wajib menyertakan header `x-csrf-token` yang nilainya sama dengan cookie `csrf_token`. `GET`/`HEAD`/`OPTIONS` dikecualikan. Tanpa token yang cocok → `403`.

**Alur untuk Nuxt 4** (semua request ke backend harus memakai `credentials: 'include'`):

```ts
// 1. Ambil CSRF token (set cookie csrf_token)
const { data } = await $fetch('/api/auth/csrf', {
  baseURL: 'http://localhost:5000',
  credentials: 'include',
});

// 2. Request mutating: kirim header x-csrf-token
await $fetch('/api/auth/login', {
  baseURL: 'http://localhost:5000',
  method: 'POST',
  credentials: 'include',
  headers: { 'x-csrf-token': data.csrf_token },
  body: { email, password },
});
```

- Setelah **logout**, cookie `token` dan `csrf_token` dihapus → ambil ulang `/api/auth/csrf` sebelum request POST berikutnya (mis. login lagi).
- Jika cookie `csrf_token` hilang/kedaluwarsa, panggil ulang `GET /api/auth/csrf`.
- Karena `SameSite=Lax`, untuk development lintas-port (`3000` → `5000`) cookie tetap terkirim pada request fetch same-site (`localhost` dianggap same-site). Gunakan host yang **konsisten** (`localhost` vs `127.0.0.1` adalah site berbeda untuk cookie).

### 1.5 Role & proteksi endpoint

| Level | Arti |
|---|---|
| Publik | Tanpa login. Method mutating tetap butuh CSRF. |
| USER | Login (role `USER` atau `ADMIN`), cookie `token` valid. |
| ADMIN | Login dengan role `ADMIN`. Akun admin hanya via seeder, bukan registrasi. |

Error auth: tanpa/sesi invalid → `401 {"status":false,"message":"Autentikasi diperlukan"}`; role tidak sesuai → `403 {"status":false,"message":"Akses ditolak"}`.

### 1.6 Upload file

| Field | Endpoint | Tipe | Batas |
|---|---|---|---|
| `proposal` | POST `/api/applications`, PATCH `/api/applications/my/:id/resubmit` | PDF saja (mimetype + ekstensi) | 10 MB |
| `image` | POST `/api/admin/booths`, PATCH `/api/admin/booths/:id` | JPEG/PNG/WebP | 5 MB |

- Upload memakai `multipart/form-data`; field teks biasa dikirim sebagai form fields.
- `facilities` pada form-data boleh string JSON array, mis. `["Listrik","AC"]`.
- File proposal disimpan **private** (tidak bisa diakses via URL statis); akses hanya lewat endpoint unduhan khusus pemilik/admin.
- Foto booth disimpan publik dan dapat diakses langsung: `http://localhost:5000/uploads/booths/<file>`.
- File terlalu besar / tipe salah → `400` dengan `message` penjelasan.

### 1.7 Status pengajuan sewa

Enum: `DIAJUKAN`, `DALAM_PENINJAUAN`, `PERLU_REVISI`, `DISETUJUI`, `DITOLAK`, `DIBATALKAN`.

Transisi yang diizinkan:

| Dari | Ke (oleh ADMIN) | Ke (oleh USER) |
|---|---|---|
| `DIAJUKAN` | `DALAM_PENINJAUAN`, `DISETUJUI`, `DITOLAK`, `PERLU_REVISI` | — |
| `DALAM_PENINJAUAN` | `DISETUJUI`, `DITOLAK`, `PERLU_REVISI` | — |
| `PERLU_REVISI` | `DITOLAK` | `DIAJUKAN` (via resubmit) |
| `DISETUJUI` / `DITOLAK` / `DIBATALKAN` | terminal, tidak bisa diubah | — |

Aturan bisnis penting untuk frontend:

- Status awal pengajuan: `DIAJUKAN`.
- `DITOLAK` dan `PERLU_REVISI` **wajib** menyertakan `note` (alasan).
- Pengajuan pending (`DIAJUKAN`, `DALAM_PENINJAUAN`, `PERLU_REVISI`) **tidak mengunci** tanggal — hanya blokir admin dan pengajuan `DISETUJUI` yang membuat periode tidak tersedia.
- Ketersediaan dicek ulang saat submit, resubmit, dan approval; konflik → `409` dengan `details` periode yang bertabrakan.
- Approval paralel pada periode bertabrakan aman: hanya satu yang sukses, lainnya `409`.
- Setiap perubahan status tercatat di `statusHistory`.

---

## 2. Endpoint Publik

### 2.1 GET /health

Health check. Tanpa auth/CSRF. Response `200`: `{"status":"ok"}`.

### 2.2 GET /api/auth/csrf

Menerbitkan token CSRF (set cookie `csrf_token`). Tanpa auth.

Response `200`:

```json
{ "status": true, "data": { "csrf_token": "94fd9732..." } }
```

### 2.3 GET /api/stations

Daftar stasiun aktif, urut nama. Tanpa auth, tanpa pagination.

Response `200`:

```json
{
  "status": true,
  "data": {
    "stations": [
      {
        "id": 1,
        "code": "HLM",
        "name": "Stasiun Halim",
        "city": "Jakarta Timur",
        "description": "...",
        "isActive": true
      }
    ]
  }
}
```

### 2.4 GET /api/booths

Katalog booth dengan filter & pagination. Tanpa auth.

Query params (semua opsional):

| Param | Tipe | Keterangan |
|---|---|---|
| `station_id` | integer | Filter stasiun |
| `category` | string | Mis. `F&B`, `Retail` |
| `has_electricity` | boolean | `true`/`false` |
| `facility` | string | Booth yang punya fasilitas ini (mis. `AC`) |
| `is_active` | boolean | Default: semua |
| `page`, `limit` | integer | Pagination |

Contoh: `GET /api/booths?station_id=1&category=F%26B&has_electricity=true&page=1&limit=10`

Response `200` (pagination, lihat 1.2), item contoh:

```json
{
  "id": 1,
  "stationId": 1,
  "code": "HLM-B01",
  "name": "Booth Halim B01",
  "area": "Lobby Utama",
  "category": "F&B",
  "sizeSqm": "6.00",
  "dailyRate": "150000.00",
  "minimumDays": 3,
  "description": "...",
  "imageUrl": "/images/booths/halim-b01.jpg",
  "hasElectricity": true,
  "facilities": ["Listrik 2200W", "Air"],
  "mapX": "12.50",
  "mapY": "8.00",
  "isActive": true,
  "station": { "id": 1, "name": "Stasiun Halim" }
}
```

Error: query tidak valid (mis. `page=0`) → `400` envelope validasi.

### 2.5 GET /api/booths/:id

Detail booth + stasiun lengkap. Tanpa auth.

Response `200`: `{ "status": true, "data": { "booth": { ...seperti item di atas, "station": {objek stasiun lengkap} } } }`

Error: `404` `{"status":false,"message":"Booth tidak ditemukan"}`; id bukan angka → `400`.

### 2.6 GET /api/booths/:id/availability

Cek ketersediaan booth pada rentang tanggal. Tanpa auth.

Query params (**wajib**): `start_date`, `end_date` (`YYYY-MM-DD`, `end_date >= start_date`, `start_date` tidak boleh lampau).

Contoh: `GET /api/booths/1/availability?start_date=2026-12-01&end_date=2026-12-07`

Response `200`:

```json
{
  "status": true,
  "data": {
    "booth_id": 1,
    "booth_code": "HLM-B01",
    "is_active": true,
    "start_date": "2026-12-01",
    "end_date": "2026-12-07",
    "available": false,
    "blocked": [
      { "start_date": "2026-12-02", "end_date": "2026-12-04", "reason": "Maintenance" }
    ],
    "approved": [
      { "start_date": "2026-12-05", "end_date": "2026-12-07" }
    ],
    "pending": [
      { "start_date": "2026-12-01", "end_date": "2026-12-03", "status": "DIAJUKAN" }
    ]
  }
}
```

- `available` = booth aktif **dan** tidak ada `blocked`/`approved` yang bertabrakan. `pending` informatif, tidak menggugurkan `available`.
- Tidak membocorkan identitas pemohon — hanya tanggal.
- Error: parameter hilang/lampau/terbalik → `400`; booth tidak ada → `404`.

---

## 3. Auth

### 3.1 POST /api/auth/register

Registrasi akun USER (role selalu `USER`). Publik + CSRF. Langsung login (set cookie `token`).

Body JSON:

| Field | Wajib | Aturan |
|---|---|---|
| `name` | ya | 3–100 karakter |
| `email` | ya | email valid, unik, max 255 |
| `password` | ya | 8–72 karakter |
| `phone` | tidak | 6–20 karakter, angka/`+`/`-`/spasi |

Response `201`:

```json
{
  "status": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": 3,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "phone": "081234567890",
      "role": "USER",
      "createdAt": "2026-11-22T08:00:00.000Z"
    }
  }
}
```

`passwordHash` **tidak pernah** dikembalikan di endpoint mana pun.

Error:

- `400` validasi: `{"status":false,"message":"Validasi gagal","details":["\"email\" is required"]}`
- `409`: `{"status":false,"message":"Email sudah terdaftar"}`
- `403`: CSRF hilang/salah.

### 3.2 POST /api/auth/login

Publik + CSRF. Set cookie `token`.

Body JSON: `{ "email": "tenant@popspace.demo", "password": "User123!" }`

Response `200`: `{ "status": true, "message": "Login berhasil", "data": { "user": { ...seperti register } } }`

Error: `401` `{"status":false,"message":"Email atau password salah"}` (email tidak ada maupun password salah — pesan sama).

Akun simulasi (seeder): admin `admin@popspace.demo` / `Admin123!`, tenant `tenant@popspace.demo` / `User123!`.

### 3.3 GET /api/auth/me

USER/ADMIN. Mengembalikan user sesi berjalan.

Response `200`: `{ "status": true, "data": { "user": { ... } } }`

Error: `401` jika belum login / cookie invalid / kedaluwarsa.

### 3.4 POST /api/auth/logout

CSRF wajib (sesi tidak wajib). Menghapus cookie `token` dan `csrf_token`.

Response `200`: `{ "status": true, "message": "Logout berhasil" }`

Setelah logout, ambil ulang `/api/auth/csrf` sebelum request POST berikutnya.

---

## 4. Pengajuan Sewa (USER)

Semua endpoint di bagian ini butuh login (`401` tanpa sesi). Data selalu terisolasi per pemilik — pengajuan milik user lain menghasilkan `404`.

### 4.1 POST /api/applications

Buat pengajuan sewa. **multipart/form-data** + CSRF.

Form fields:

| Field | Wajib | Aturan |
|---|---|---|
| `booth_id` | ya | integer, booth harus ada & aktif |
| `business_name` | ya | max 150 |
| `business_category` | ya | max 50 |
| `pic_name` | ya | max 100 |
| `email` | ya | email valid |
| `phone` | ya | 6–20 karakter angka/`+`/`-`/spasi |
| `start_date` | ya | `YYYY-MM-DD`, tidak lampau |
| `end_date` | ya | `>= start_date`; durasi (inklusif) `>= minimumDays` booth |
| `description` | tidak | teks bebas |
| `proposal` | ya | file PDF ≤ 10 MB |

Response `201`:

```json
{
  "status": true,
  "message": "Pengajuan berhasil dikirim",
  "data": {
    "application": {
      "id": 1,
      "application_number": "WPS-20261122-A1B2C3",
      "booth_id": 1,
      "start_date": "2026-12-10",
      "end_date": "2026-12-14",
      "duration_days": 5,
      "estimated_cost": 750000,
      "status": "DIAJUKAN"
    }
  }
}
```

Error:

- `400`: validasi field / proposal hilang / bukan PDF / >10MB / booth tidak aktif / durasi < minimum (`"Durasi minimum sewa booth ini 3 hari"`).
- `404`: booth tidak ditemukan.
- `409` duplikat: `"Anda sudah memiliki pengajuan aktif untuk booth dan periode ini"` + `data.application_number`.
- `409` konflik periode:

```json
{
  "status": false,
  "message": "Periode yang dipilih tidak tersedia untuk booth ini",
  "details": {
    "blocked": [{ "start_date": "2026-12-11", "end_date": "2026-12-13", "reason": "Maintenance" }],
    "approved": [{ "start_date": "2026-12-14", "end_date": "2026-12-16" }]
  }
}
```

### 4.2 GET /api/applications/my

Daftar pengajuan milik sendiri, terbaru dulu. Pagination.

Query: `status` (enum, opsional), `page`, `limit`.

Response `200` (pagination), item: objek aplikasi lengkap (camelCase: `applicationNumber`, `businessName`, `startDate`, `endDate`, `estimatedCost` (string), `status`, `adminNote`, `proposalUrl`, `submittedAt`, `updatedAt`, ...) + `booth: { id, code, name, station: { id, name } }`.

### 4.3 GET /api/applications/my/:id

Detail pengajuan milik sendiri, termasuk `booth` (+`station` lengkap) dan `statusHistory` urut kronologis:

```json
{
  "status": true,
  "data": {
    "application": {
      "id": 1,
      "applicationNumber": "WPS-20261122-A1B2C3",
      "status": "PERLU_REVISI",
      "adminNote": "Perbaiki proposal",
      "booth": { "id": 1, "code": "HLM-B01", "station": { "id": 1, "name": "Stasiun Halim" } },
      "statusHistory": [
        {
          "id": 1,
          "oldStatus": null,
          "newStatus": "DIAJUKAN",
          "note": "Pengajuan dibuat",
          "createdAt": "2026-11-22T08:00:00.000Z",
          "changedByUser": { "id": 2, "name": "Tenant Demo", "role": "USER" }
        }
      ]
    }
  }
}
```

Error: `404` jika tidak ada **atau milik user lain**.

### 4.4 PATCH /api/applications/my/:id/resubmit

Kirim ulang setelah revisi. Hanya untuk status `PERLU_REVISI`. **multipart/form-data** + CSRF.

Semua field opsional, minimal satu perubahan (field teks/tanggal **atau** file `proposal`):

- Field bisnis sama seperti create (`business_name`, `business_category`, `pic_name`, `email`, `phone`, `description`).
- `start_date` & `end_date` harus dikirim berpasangan; jika diganti, divalidasi ulang (tidak lampau, durasi minimum, konflik periode).
- `proposal` (PDF ≤10MB) menggantikan file lama (file lama dihapus).

Response `200`: `{ "status": true, "message": "Pengajuan berhasil dikirim ulang", "data": { "application": { ...status kembali "DIAJUKAN" } } }`

Error:

- `400`: tidak ada perubahan (`"Tidak ada perubahan yang dikirim"`), tanggal tidak valid, durasi kurang, booth tidak aktif.
- `404`: bukan milik sendiri / tidak ada.
- `409`: status bukan `PERLU_REVISI` (`"Hanya pengajuan berstatus Perlu Revisi yang dapat dikirim ulang"`) atau periode baru konflik.

### 4.5 GET /api/applications/my/:id/proposal

Unduh proposal milik sendiri. Sukses → binary PDF, `Content-Disposition: inline; filename="WPS-....pdf"`.

Di Nuxt, ambil sebagai blob dengan `credentials: 'include'`:

```ts
const blob = await $fetch(`/api/applications/my/${id}/proposal`, {
  baseURL: 'http://localhost:5000',
  credentials: 'include',
  responseType: 'blob',
});
```

Error (JSON): `404` (bukan milik sendiri / proposal tidak ada / file hilang).

---

## 5. Admin (role ADMIN)

Semua endpoint `/api/admin/*` butuh login role `ADMIN`: `401` tanpa sesi, `403` jika role `USER`. Method mutating butuh CSRF.

### 5.1 GET /api/admin/dashboard

Ringkasan untuk dashboard admin.

Response `200`:

```json
{
  "status": true,
  "data": {
    "total_booths_active": 12,
    "total_applications": 8,
    "waiting_review": 3,
    "approved": 2,
    "rejected": 1,
    "recent_applications": [ { "...5 pengajuan terbaru + user{id,name,email} + booth{id,code,name,station}" } ]
  }
}
```

(`waiting_review` = jumlah berstatus `DIAJUKAN`.)

### 5.2 GET /api/admin/booths

Semua booth **termasuk nonaktif**. Pagination.

Query: `station_id`, `category`, `is_active`, `search` (cari di `code`/`name`, case-insensitive), `page`, `limit`.

Response: sama seperti katalog publik (pagination + `station{id,name}`).

### 5.3 POST /api/admin/booths

Tambah booth. **multipart/form-data** + CSRF.

Form fields:

| Field | Wajib | Aturan / default |
|---|---|---|
| `station_id` | ya | stasiun harus ada (`404` jika tidak) |
| `code` | ya | max 20, di-uppercase otomatis, unik per stasiun (`409` jika duplikat) |
| `name` | ya | max 100 |
| `daily_rate` | ya | angka > 0, 2 desimal |
| `minimum_days` | tidak | integer ≥ 1, default 1 |
| `has_electricity` | tidak | boolean, default false |
| `facilities` | tidak | array string / JSON string, default `[]` |
| `is_active` | tidak | boolean, default true |
| `area`, `category`, `size_sqm`, `description`, `map_x`, `map_y` | tidak | opsional |
| `image` | tidak | JPEG/PNG/WebP ≤ 5 MB |

Response `201`: `{ "status": true, "message": "Booth berhasil ditambahkan", "data": { "booth": { ... } } }`

### 5.4 PATCH /api/admin/booths/:id

Update booth. **multipart/form-data** + CSRF. Semua field pada 5.3 opsional (tanpa wajib), minimal satu field **atau** file `image`. Ganti `image` menghapus file lama.

Response `200`: `{ "status": true, "message": "Booth berhasil diperbarui", "data": { "booth": { ... } } }`

Error: `400` tidak ada perubahan / validasi; `404` booth/stasiun tidak ada; `409` kode duplikat di stasiun tujuan.

### 5.5 POST /api/admin/booths/:id/blocks

Blokir rentang tanggal booth (mis. maintenance). Body JSON + CSRF.

```json
{ "start_date": "2026-12-20", "end_date": "2026-12-22", "reason": "Maintenance listrik" }
```

`start_date`/`end_date` wajib (`start_date` ≥ hari ini, `end_date >= start_date`); `reason` opsional (max 255).

Response `201`: `{ "status": true, "message": "Tanggal berhasil diblokir", "data": { "block": { "id": 2, "boothId": 1, "startDate": "...", "endDate": "...", "reason": "..." } } }`

Error: `400` validasi/tanggal lampau; `404` booth tidak ada.

### 5.6 GET /api/admin/applications

Semua pengajuan semua user, terbaru dulu. Pagination.

Query: `status` (enum), `booth_id`, `station_id`, `page`, `limit`.

Response: pagination; item = objek aplikasi + `user{id,name,email}` + `booth{id,code,name,station{id,name}}`.

### 5.7 GET /api/admin/applications/:id

Detail pengajuan mana pun: objek aplikasi + `user{id,name,email,phone}` + `booth{id,code,name,dailyRate,minimumDays,station{id,name}}` + `statusHistory` (dengan `changedByUser{id,name,role}`).

Error: `404` tidak ditemukan.

### 5.8 PATCH /api/admin/applications/:id/status

Keputusan admin. Body JSON + CSRF.

```json
{ "status": "PERLU_REVISI", "note": "Proposal kurang jelas, mohon perbaiki" }
```

| Field | Wajib | Aturan |
|---|---|---|
| `status` | ya | `DALAM_PENINJAUAN` / `DISETUJUI` / `DITOLAK` / `PERLU_REVISI` |
| `note` | untuk `DITOLAK` & `PERLU_REVISI` | max 1000; opsional untuk status lain |

Response `200`: `{ "status": true, "message": "Status pengajuan diubah menjadi DISETUJUI", "data": { "application": { ...status baru, adminNote } } }`

Error:

- `400`: validasi (`note` wajib untuk tolak/revisi), booth tidak aktif saat approve.
- `404`: pengajuan tidak ada.
- `409`: transisi tidak diizinkan (lihat 1.7), mis. `"Perubahan status dari DISETUJUI ke DITOLAK tidak diizinkan"`.
- `409` saat approve konflik periode (dicek ulang dalam transaksi + row lock):

```json
{
  "status": false,
  "message": "Persetujuan ditolak: periode bertabrakan dengan blokir atau pengajuan yang sudah disetujui",
  "details": {
    "blocked": [{ "start_date": "...", "end_date": "..." }],
    "approved": [{ "start_date": "...", "end_date": "...", "application_id": 5 }]
  }
}
```

### 5.9 GET /api/admin/applications/:id/proposal

Unduh proposal pengajuan mana pun (admin). Sukses → binary PDF; error JSON `404`.

---

## 6. Ringkasan Endpoint

| # | Method | URL | Auth | Body |
|---|---|---|---|---|
| 1 | GET | `/health` | publik | — |
| 2 | GET | `/api/auth/csrf` | publik | — |
| 3 | POST | `/api/auth/register` | publik + CSRF | JSON |
| 4 | POST | `/api/auth/login` | publik + CSRF | JSON |
| 5 | GET | `/api/auth/me` | USER/ADMIN | — |
| 6 | POST | `/api/auth/logout` | CSRF | — |
| 7 | GET | `/api/stations` | publik | — |
| 8 | GET | `/api/booths` | publik | query filter |
| 9 | GET | `/api/booths/:id` | publik | — |
| 10 | GET | `/api/booths/:id/availability` | publik | query tanggal wajib |
| 11 | POST | `/api/applications` | USER + CSRF | multipart + PDF |
| 12 | GET | `/api/applications/my` | USER | query |
| 13 | GET | `/api/applications/my/:id` | USER (pemilik) | — |
| 14 | PATCH | `/api/applications/my/:id/resubmit` | USER (pemilik) + CSRF | multipart opsional |
| 15 | GET | `/api/applications/my/:id/proposal` | USER (pemilik) | — → PDF |
| 16 | GET | `/api/admin/dashboard` | ADMIN | — |
| 17 | GET | `/api/admin/booths` | ADMIN | query |
| 18 | POST | `/api/admin/booths` | ADMIN + CSRF | multipart opsional image |
| 19 | PATCH | `/api/admin/booths/:id` | ADMIN + CSRF | multipart opsional image |
| 20 | POST | `/api/admin/booths/:id/blocks` | ADMIN + CSRF | JSON |
| 21 | GET | `/api/admin/applications` | ADMIN | query |
| 22 | GET | `/api/admin/applications/:id` | ADMIN | — |
| 23 | GET | `/api/admin/applications/:id/proposal` | ADMIN | — → PDF |
| 24 | PATCH | `/api/admin/applications/:id/status` | ADMIN + CSRF | JSON |

## 7. Catatan Postman

1. Aktifkan cookie jar bawaan Postman (otomatis menyimpan `token` & `csrf_token`).
2. Request pertama: `GET /api/auth/csrf`, lalu untuk request POST/PATCH tambahkan header `x-csrf-token` dengan nilai dari response (bisa otomatis via test script: `pm.collectionVariables.set('csrf', pm.response.json().data.csrf_token)` lalu header `x-csrf-token: {{csrf}}`).
3. Login sebagai tenant atau admin, cookie `token` otomatis terkirim di request berikutnya.
4. Upload: pilih Body → form-data; field `proposal`/`image` bertipe File.
5. Jangan set header `Cookie` manual — biarkan Postman mengelolanya.
# Whoosh PopSpace Backend

**REST API — Interactive Pop-Up Booth Rental Platform**

Backend Whoosh PopSpace merupakan layanan REST API untuk mendukung pengelolaan booth komersial di stasiun Whoosh, meliputi autentikasi pengguna, informasi booth, kalender ketersediaan, pengajuan penyewaan, serta persetujuan oleh admin.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** JWT
- **Validation:** Joi

## Repository

- **Frontend:** [whoosh-popspace-fe](https://github.com/fevysoniapl/whoosh-popspace-fe)
- **Backend:** Repository ini (`whoosh-popspace-be`)

## Getting Started

1. Salin `.env.example` menjadi `.env` dan sesuaikan konfigurasi PostgreSQL.

2. Install dependencies dan jalankan server:

```bash
npm ci
npm run dev
```

3. Jalankan migrasi database:

```bash
npm run db:migrate
```

Backend berjalan di `http://localhost:5000` dan dapat diperiksa melalui endpoint `GET /health`.

## Project Structure

- `bin/www` — Entry point server
- `app.js` — Konfigurasi Express
- `routes/` — Routing API
- `module/` — Modul fitur aplikasi
- `config/` — Konfigurasi database
- `models/` — Model Sequelize
- `migrations/` — Migrasi database
- `seeders/` — Data awal
- `public/` — Aset statis
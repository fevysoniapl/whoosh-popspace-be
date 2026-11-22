# Whoosh Popspace Backend

Salin `.env.example` ke `.env` dan sesuaikan pengaturan PostgreSQL lokal.

```sh
npm ci
npm run dev
```

Cek server lewat `GET /health`. Untuk menjalankan migrasi pada database yang sudah dibuat, gunakan `npm run db:migrate`.

Entry point server ada di `bin/www`, konfigurasi Express ada di `app.js`, dan router ada di `routes/`. Aset statis disajikan dari `public/`. Sequelize menggunakan `config/`, `models/`, `migrations/`, dan `seeders/`.

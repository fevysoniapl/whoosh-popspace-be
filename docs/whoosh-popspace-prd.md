# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# WHOOSH POPSPACE

**Interactive Pop-Up Booth Rental Platform**

**Versi:** 2.1 — Hackathon MVP  
**Status:** Prototype / Konsep Aplikasi  
**Platform:** Responsive Web Application  
**Target:** Ekosistem komersial stasiun KCIC (Whoosh)  
**Development Assistant:** Alibaba Qoder  
**Batas pengembangan:** 300 Qoder Credits  
**Tanggal dokumen:** 18 November 2026

---

## 1. PRODUCT OVERVIEW

### 1.1 Deskripsi Produk

Whoosh PopSpace merupakan platform berbasis website yang memungkinkan UMKM, brand, dan pelaku usaha menemukan serta mengajukan penyewaan booth sementara di lingkungan stasiun Whoosh.

Aplikasi menyediakan pengalaman interaktif melalui denah area komersial stasiun yang memungkinkan pengguna memilih booth secara visual, melihat fasilitas, memeriksa kalender ketersediaan, dan melakukan pengajuan sewa.

Pengajuan yang masuk akan diproses oleh Admin KCIC melalui dashboard manajemen.

Whoosh PopSpace dirancang untuk mendukung digitalisasi pengelolaan ruang komersial dan memperluas akses pelaku usaha terhadap peluang pemanfaatan booth di lingkungan stasiun.

Untuk keperluan hackathon, aplikasi menggunakan data simulasi dan tidak mewakili sistem penyewaan resmi KCIC.

### 1.2 Arti Nama

**Whoosh:** Identitas layanan kereta cepat KCIC.

**Pop:** Mengacu pada konsep pop-up store, kegiatan promosi sementara, atau booth temporer.

**Space:** Ruang komersial yang dapat digunakan pelaku usaha.

Whoosh PopSpace berarti platform digital untuk menjelajahi dan mengajukan penggunaan ruang usaha pop-up di lingkungan stasiun Whoosh.

### 1.3 Tagline

*Your Space, Your Opportunity.*

### 1.4 Product Vision

Mempermudah pelaku usaha menemukan peluang ruang komersial sementara melalui pengalaman digital yang transparan, visual, dan interaktif.

---

## 2. PROBLEM STATEMENT

Calon penyewa booth memerlukan informasi lokasi, luas area, fasilitas, periode ketersediaan, dan prosedur pengajuan sebelum memutuskan menggunakan ruang komersial.

Katalog konvensional yang hanya menampilkan daftar ruang dapat menyulitkan pengguna dalam memahami posisi booth secara visual dan membandingkan pilihan yang tersedia.

Whoosh PopSpace menawarkan pengalaman eksplorasi ruang yang terintegrasi dengan proses pengajuan digital.

**Catatan:** Permasalahan ini merupakan hipotesis produk. Kondisi proses penyewaan aktual di KCIC perlu dikonfirmasi kepada unit pengelola komersial.

---

## 3. PRODUCT OBJECTIVES

Tujuan pengembangan:

1. Menyediakan katalog booth komersial berdasarkan stasiun Whoosh.
2. Mempermudah pemilihan booth melalui denah interaktif.
3. Menampilkan informasi lokasi, fasilitas, dan harga simulasi.
4. Menyediakan kalender ketersediaan booth.
5. Memungkinkan pengajuan penyewaan secara digital.
6. Memberikan fasilitas tracking status pengajuan.
7. Membantu Admin mengelola booth dan memproses permohonan.
8. Menghasilkan prototype yang dapat diuji langsung dalam hackathon Alibaba.

### 3.1 Unique Selling Proposition

**Interactive Booth Discovery & Rental Application**

Pengguna tidak hanya memilih booth dari katalog, tetapi dapat melihat posisi dan memilihnya langsung melalui denah interaktif, kemudian melakukan pengajuan sewa dalam satu alur.

---

## 4. TARGET USERS

### 4.1 User — Penyewa Booth

Target:
- UMKM makanan dan minuman.
- Brand retail.
- Pelaku usaha merchandise.
- Pelaku usaha yang ingin melakukan kegiatan promosi.
- Penyelenggara pop-up booth.

Hak akses:
- Registrasi dan login.
- Melihat katalog booth.
- Melihat denah interaktif.
- Memilih booth.
- Memeriksa fasilitas dan ketersediaan.
- Mengajukan sewa.
- Mengunggah proposal.
- Melihat status pengajuan.
- Memperbarui pengajuan yang membutuhkan revisi.

### 4.2 Admin — Pengelola KCIC

Hak akses:
- Login Admin.
- Dashboard ringkasan.
- Melihat seluruh booth.
- Menambah dan mengedit booth.
- Mengaktifkan atau menonaktifkan booth.
- Mengatur tanggal yang diblokir.
- Melihat semua pengajuan.
- Memeriksa dokumen penyewa.
- Menyetujui atau menolak pengajuan.
- Meminta revisi pengajuan.
- Melihat riwayat aktivitas pengajuan.

### 4.3 Authentication dan Authorization

- User dapat registrasi secara mandiri.
- Akun Admin dibuat melalui proses internal atau seed database.
- Role disimpan dan diverifikasi pada backend.
- User tidak dapat mengakses API Admin.
- User hanya dapat melihat pengajuan miliknya sendiri.

---

## 5. MVP FEATURES

### 5.1 Fitur User

**F-01 — Landing Page**

Halaman utama berisi:
- Navbar.
- Hero section.
- Informasi aplikasi.
- Pilihan stasiun.
- Cara kerja penyewaan.
- Tombol Jelajahi Booth.

**F-02 — Explore Booth**

Menampilkan:
- Pilihan Stasiun Halim dan Padalarang untuk demo.
- Daftar booth dalam bentuk kartu.
- Filter kategori.
- Filter fasilitas listrik.
- Tombol melihat detail.
- Denah booth interaktif.

**F-03 — Interactive Booth Map**

Fitur utama aplikasi.

Kemampuan:
- Menampilkan denah 2D berbasis SVG.
- Marker booth dapat diklik.
- Booth terpilih berubah warna.
- Panel detail booth muncul.
- Pengguna dapat memilih booth melalui denah.
- Posisi pada denah terhubung dengan data katalog.
- Denah responsif pada desktop dan mobile.

Status visual:
- Oranye: booth terpilih.
- Hijau: tersedia untuk tanggal yang dipilih.
- Abu-abu: tidak tersedia untuk tanggal yang dipilih.

Sebelum pengguna memilih tanggal, denah hanya menunjukkan booth aktif dan nonaktif.

**F-04 — Booth Detail**

Menampilkan:
- Kode booth.
- Nama booth.
- Stasiun.
- Area/zona.
- Foto booth.
- Ukuran.
- Kategori.
- Fasilitas.
- Harga simulasi per hari.
- Ketentuan minimum sewa.
- Mini denah.
- Kalender.
- Tombol Ajukan Sewa.

**F-05 — Availability Calendar**

Fungsi:
- Memilih tanggal mulai dan selesai.
- Melihat tanggal yang diblokir.
- Melihat periode yang sudah disetujui.
- Menghitung durasi.
- Menghitung estimasi biaya.
- Validasi durasi minimum.

Aturan:
- Tanggal lampau tidak dapat dipilih.
- Tanggal terblokir tidak dapat diajukan.
- Periode yang telah disetujui tidak dapat digunakan untuk pengajuan baru.
- Pending application belum mengunci tanggal.
- Backend wajib memeriksa ulang ketersediaan sebelum menyimpan pengajuan dan memberikan persetujuan.

**F-06 — Rental Application**

Form pengajuan berisi:

Data usaha:
- Nama usaha/brand.
- Kategori usaha.
- Nama penanggung jawab (PIC).
- Email.
- Nomor telepon.
- Deskripsi kegiatan.

Data penyewaan:
- Stasiun.
- Booth.
- Tanggal mulai.
- Tanggal selesai.
- Durasi.
- Estimasi biaya.

Dokumen:
- Upload proposal PDF maksimal 10 MB.

Aksi:
- Kirim Pengajuan.
- Batal.

Setelah berhasil, sistem menghasilkan nomor pengajuan dan status "Diajukan".

**F-07 — My Applications**

Menampilkan:
- Daftar pengajuan.
- Nomor pengajuan.
- Booth.
- Stasiun.
- Periode.
- Status.
- Detail pengajuan.
- Catatan Admin.
- Riwayat perubahan status.

Jika pengajuan membutuhkan revisi, User dapat memperbarui informasi yang diperlukan dan mengirim ulang.

---

### 5.2 Fitur Admin

**F-08 — Admin Dashboard**

Ringkasan:
- Total booth aktif.
- Total pengajuan.
- Pengajuan menunggu review.
- Pengajuan disetujui.
- Pengajuan ditolak.
- Daftar pengajuan terbaru.

**F-09 — Booth Management**

Admin dapat:
- Menambahkan booth.
- Mengedit informasi booth.
- Mengatur fasilitas.
- Mengatur harga simulasi.
- Mengunggah foto.
- Mengaktifkan atau menonaktifkan booth.
- Memblokir tanggal tertentu.

Untuk MVP, posisi booth pada denah menggunakan konfigurasi statis atau data seed. Admin tidak perlu memiliki editor denah.

**F-10 — Application Management**

Admin dapat:
- Melihat seluruh pengajuan.
- Filter berdasarkan status.
- Melihat detail dan proposal.
- Meninjau pengajuan.
- Menyetujui.
- Menolak.
- Meminta revisi.

Aturan:
- Penolakan dan permintaan revisi membutuhkan alasan.
- Persetujuan memerlukan validasi ulang ketersediaan.
- Dua pengajuan dengan booth dan periode bertabrakan tidak boleh sama-sama disetujui.
- Keputusan dicatat dalam riwayat status.

---

## 6. APPLICATION FLOW

### 6.1 Flow User

1. Membuka Whoosh PopSpace.
2. Memilih menu Jelajahi Booth.
3. Memilih stasiun.
4. Menjelajahi denah interaktif.
5. Memilih booth.
6. Membuka detail booth.
7. Melihat fasilitas dan harga.
8. Memilih tanggal sewa.
9. Mengisi form pengajuan.
10. Login atau registrasi jika diperlukan.
11. Mengunggah proposal.
12. Mengirim pengajuan.
13. Mendapat nomor pengajuan.
14. Melihat status pada halaman Pengajuan Saya.

### 6.2 Flow Admin

1. Login Admin.
2. Masuk ke dashboard.
3. Membuka daftar pengajuan.
4. Memilih pengajuan yang masuk.
5. Memeriksa informasi usaha dan dokumen.
6. Memeriksa periode ketersediaan.
7. Menyetujui, menolak, atau meminta revisi.
8. Sistem menyimpan perubahan status.
9. User melihat hasil keputusan.

### 6.3 Status Pengajuan

- Diajukan.
- Dalam Peninjauan.
- Perlu Revisi.
- Disetujui.
- Ditolak.
- Dibatalkan.

---

## 7. APPLICATION PAGES

### 7.1 Halaman Publik/User

| Route | Halaman |
|---|---|
| `/` | Landing Page |
| `/login` | Login |
| `/register` | Registrasi |
| `/booths` | Explore Booth |
| `/booths/[id]` | Detail Booth |
| `/booths/[id]/apply` | Pengajuan Sewa |
| `/my-applications` | Riwayat Pengajuan |
| `/my-applications/[id]` | Detail Pengajuan |

### 7.2 Halaman Admin

| Route | Halaman |
|---|---|
| `/admin` | Dashboard Admin |
| `/admin/booths` | Manajemen Booth |
| `/admin/applications` | Daftar Pengajuan |
| `/admin/applications/[id]` | Review Pengajuan |

Form tambah/edit booth dapat menggunakan modal atau drawer untuk mengurangi jumlah halaman.

---

## 8. UI/UX DESIGN

### 8.1 Design Direction

Whoosh PopSpace menggunakan pendekatan desain modern, interaktif, dan profesional.

Karakter:
- Modern SaaS.
- Marketplace-style.
- Clean layout.
- Rounded cards.
- Soft shadows.
- Microinteractions.
- Responsive design.

### 8.2 Color Palette

- Navy: `#102A43`
- Teal: `#009E91`
- Orange: `#FF6B00`
- Background: `#F8FAFC`
- White: `#FFFFFF`

Palet merupakan konsep desain, bukan standar resmi KCIC.

### 8.3 Interaksi Utama

- Hover pada marker booth menampilkan informasi singkat.
- Klik marker menampilkan detail.
- Marker booth terpilih diberikan highlight.
- Kalender dapat memilih rentang tanggal.
- Estimasi harga diperbarui otomatis.
- Form memiliki validasi.
- Status pengajuan ditampilkan dengan label yang jelas.
- Admin menggunakan dialog konfirmasi sebelum memberikan keputusan.

### 8.4 Mobile Experience

- Navbar responsif.
- Katalog satu kolom.
- Denah dapat digeser atau diperbesar.
- Detail booth tampil pada panel bawah.
- Form menggunakan layout satu kolom.
- Tombol aksi utama mudah dijangkau.

---

## 9. TECH STACK

### Frontend

- Nuxt 4.
- Vue 3.
- TypeScript.
- Nuxt UI 4.
- Tailwind CSS.
- Vue Composition API.
- SVG untuk denah interaktif.

### Backend

- Node.js.
- Express.js 5.
- JavaScript ESM.
- REST API.

### Database

- SQLite untuk development dan demo lokal.
- Prisma ORM.

### Authentication

- Sistem autentikasi aman yang kompatibel dengan Express.
- Session atau JWT dengan penyimpanan yang aman.
- Role-Based Access Control.

### File Storage

- Penyimpanan lokal privat untuk development.
- Object Storage untuk deployment jika diperlukan.
- Proposal hanya dapat diakses oleh pemilik pengajuan dan Admin yang berwenang.

### Development Assistant

- Alibaba Qoder.
- Digunakan untuk coding frontend, backend, integrasi, dan debugging.

### Cloud Deployment

- Alibaba Cloud ECS atau layanan yang kompatibel, mengikuti persyaratan hackathon.
- PostgreSQL terkelola dan OSS dapat dipilih untuk deployment lebih lanjut.
- Pemilihan layanan cloud disesuaikan dengan kuota dan ketentuan lomba.

---

## 10. DATABASE SCHEMA

Untuk MVP, digunakan tabel inti berikut.

### users
- id
- name
- email
- password_hash
- phone
- role
- created_at

### stations
- id
- name
- description
- map_url
- is_active

### booths
- id
- station_id
- code
- name
- area
- category
- size_sqm
- daily_rate
- minimum_days
- description
- image_url
- has_electricity
- map_x
- map_y
- is_active

### booth_blocks
- id
- booth_id
- start_date
- end_date
- reason

### rental_applications
- id
- application_number
- user_id
- booth_id
- business_name
- business_category
- pic_name
- email
- phone
- start_date
- end_date
- description
- proposal_url
- estimated_cost
- status
- admin_note
- submitted_at
- updated_at

### application_status_history
- id
- application_id
- old_status
- new_status
- note
- changed_by
- created_at

Fasilitas booth sederhana dapat disimpan sebagai field terstruktur pada tabel booths untuk MVP.

---

## 11. API REQUIREMENTS

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Public / User

- `GET /api/stations`
- `GET /api/booths`
- `GET /api/booths/:id`
- `GET /api/booths/:id/availability`
- `POST /api/applications`
- `GET /api/applications/my`
- `GET /api/applications/my/:id`
- `PATCH /api/applications/my/:id/resubmit`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/booths`
- `POST /api/admin/booths`
- `PATCH /api/admin/booths/:id`
- `POST /api/admin/booths/:id/blocks`
- `GET /api/admin/applications`
- `GET /api/admin/applications/:id`
- `PATCH /api/admin/applications/:id/status`

Semua endpoint yang mengubah data membutuhkan autentikasi dan otorisasi sesuai role.

---

## 12. NON-FUNCTIONAL REQUIREMENTS

### Security

- Password harus di-hash.
- Role diverifikasi pada backend.
- Server melakukan validasi input.
- Proposal dibatasi ke PDF maksimal 10 MB.
- Dokumen tidak diekspos melalui URL publik tanpa perlindungan.
- Environment variables tidak dimasukkan ke repository.
- Proses approval harus mencegah bentrok periode secara aman.
- Submission berulang harus ditangani tanpa membuat data duplikat.

### Performance

- Denah tidak memerlukan reload halaman.
- Navigasi katalog menggunakan loading state.
- Gambar booth dioptimalkan.
- API menggunakan pagination/filter apabila dibutuhkan.

### Accessibility

- Marker dapat diakses melalui keyboard.
- Status memiliki teks, bukan hanya warna.
- Form menggunakan label dan pesan kesalahan.
- Tampilan dapat digunakan pada perangkat mobile.

---

## 13. DEVELOPMENT ROADMAP

### Phase 1 — Setup Project
- Setup Nuxt 4.
- Setup Nuxt UI.
- Setup Express.js.
- Struktur repository.
- Konfigurasi project.

### Phase 2 — Frontend User
- Landing Page.
- Katalog booth.
- Denah interaktif.
- Detail booth.
- Kalender.
- Form pengajuan.
- Riwayat pengajuan.

### Phase 3 — Frontend Admin
- Admin layout.
- Dashboard.
- Manajemen booth.
- Tabel pengajuan.
- Halaman review.

### Phase 4 — Backend
- Database.
- Authentication.
- API booth.
- API availability.
- API application.
- API approval.

### Phase 5 — Integration
- Integrasi frontend–backend.
- Autentikasi sesuai role.
- Data booth dari API.
- Pengajuan dan tracking.
- Approval Admin.

### Phase 6 — Testing & Demo
- Pengujian alur User–Admin.
- Pengujian bentrok tanggal.
- Responsivitas mobile.
- Bug fixing.
- Persiapan demo hackathon.

---

## 14. QODER CREDIT MANAGEMENT

Batas pengembangan direncanakan menggunakan 300 Qoder credits.

| Tahap | Anggaran Target |
|---|---:|
| Analisis project | 5 |
| Landing Page | 25 |
| Denah dan katalog | 55 |
| Detail dan kalender | 35 |
| Form pengajuan | 25 |
| Dashboard Admin | 35 |
| Backend dan database | 65 |
| Integrasi API | 35 |
| Testing dan cadangan | 20 |
| **Total** | **300 credits** |

Anggaran merupakan target perencanaan, bukan jaminan biaya aktual.

Prioritas ketika kredit terbatas:
1. Denah interaktif.
2. Detail booth dan kalender.
3. Form pengajuan.
4. Login dua role.
5. Approval Admin.
6. Tracking status.

Fitur kosmetik dan manajemen tambahan boleh ditunda.

---

## 15. OUT OF SCOPE

Tidak dikembangkan pada MVP:

- Booth Preview Studio.
- Booth Matcher otomatis.
- Peta 3D.
- AI chatbot.
- AI recommendation.
- Payment gateway.
- Kontrak digital.
- Tanda tangan elektronik.
- Notifikasi WhatsApp otomatis.
- Manajemen event kompleks.
- Pengelolaan tenant jangka panjang.
- Integrasi ticketing Whoosh.
- Analitik prediksi pengunjung.

---

## 16. DEMO SCENARIO

**Skenario: Kopi Langit mengajukan sewa Booth B01 di Stasiun Padalarang.**

1. Calon penyewa membuka Whoosh PopSpace.
2. Memilih Stasiun Padalarang.
3. Menjelajahi denah interaktif.
4. Mengklik Booth B01.
5. Melihat luas, fasilitas, foto, dan harga simulasi.
6. Memilih tanggal sewa yang tersedia.
7. Mengisi data usaha.
8. Mengunggah proposal.
9. Mengirim pengajuan.
10. Mendapat nomor pengajuan.
11. Admin login.
12. Admin membuka permohonan Kopi Langit.
13. Admin memeriksa informasi dan proposal.
14. Admin menyetujui pengajuan.
15. User melihat status "Disetujui".
16. Periode yang disetujui tidak lagi tersedia untuk pengajuan baru pada booth yang sama.

Data, tanggal, harga, dan lokasi booth yang digunakan pada demo merupakan simulasi.

---

## 17. ACCEPTANCE CRITERIA

MVP dianggap selesai apabila:

- Landing Page dapat diakses.
- Katalog booth menampilkan data.
- Pilihan stasiun berfungsi.
- Denah 2D interaktif dapat diklik.
- Informasi booth sesuai pilihan.
- Kalender berfungsi.
- Durasi dan estimasi biaya dihitung dengan benar.
- User dapat registrasi dan login.
- Form pengajuan dapat dikirim.
- Proposal dapat diunggah.
- Pengajuan tersimpan ke database.
- Admin dapat login dan meninjau pengajuan.
- Admin dapat menyetujui, menolak, atau meminta revisi.
- User dapat melihat status terbaru.
- Tidak ada persetujuan periode yang bertabrakan.
- Hak akses kedua role berjalan.
- Tampilan responsif.
- Alur utama dapat didemonstrasikan tanpa error kritis.

---

## 18. FUTURE DEVELOPMENT

Setelah MVP, aplikasi dapat dikembangkan dengan:

- Booth Preview Studio.
- Smart Booth Matcher berbasis aturan.
- Penyewaan ruang promosi non-booth.
- Pengelolaan bazar dan event.
- Sistem pembayaran.
- Kontrak digital.
- Notifikasi otomatis.
- Statistik pemanfaatan booth.
- Integrasi sistem komersial KCIC sesuai izin.

---

## 19. FINAL PRODUCT SUMMARY

**Product Name:** Whoosh PopSpace

**Category:** Interactive Pop-Up Booth Rental Platform

**Platform:** Responsive Web Application

**User Roles:** USER dan ADMIN

**Main Features:**
- Booth Catalog.
- Interactive Booth Map.
- Booth Detail.
- Availability Calendar.
- Rental Application.
- Application Tracking.
- Admin Approval.

**Product Pitch:**

Whoosh PopSpace merupakan platform digital interaktif untuk menemukan dan mengajukan penyewaan booth sementara di lingkungan stasiun Whoosh. Melalui denah interaktif, informasi fasilitas, kalender ketersediaan, dan sistem pengajuan digital, aplikasi membantu pelaku usaha memilih ruang yang sesuai sekaligus memudahkan pengelola komersial KCIC dalam mengelola permohonan penyewaan.

**Tagline:**

*Your Space, Your Opportunity.*
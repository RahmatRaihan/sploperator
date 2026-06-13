# Product Requirements Document (PRD)
## Aplikasi Rekapan Lembur Operator — Divisi TPP PT BAI

**Versi:** 1.0.0  
**Tanggal:** Juni 2026  
**Dibuat oleh:** Tim Pengembang  
**Status:** Draft

---

## 1. Ringkasan Eksekutif

Aplikasi **Rekapan Lembur TPP** adalah sistem web berbasis Next.js yang dirancang untuk mencatat, mengelola, dan mengekspor data lembur operator di Divisi Thermal Power Plant (TPP) PT BAI. Aplikasi ini menggantikan proses pencatatan manual, mempercepat rekapitulasi, dan menghasilkan file Excel otomatis yang terstruktur per bulan dan tahun.

---

## 2. Latar Belakang & Tujuan

### 2.1 Masalah yang Dihadapi
- Pencatatan lembur dilakukan secara manual (kertas / Excel terpisah) sehingga rawan kesalahan dan duplikasi data.
- Tidak ada satu titik data terpusat yang bisa diakses oleh operator maupun admin secara real-time.
- Proses rekap bulanan membutuhkan waktu lama karena harus mengompilasi data dari berbagai sumber.

### 2.2 Tujuan Aplikasi
- Menyediakan form digital untuk entry data lembur oleh operator.
- Memberikan dashboard rekap yang informatif dengan grafik dan filter.
- Mengotomatiskan pembuatan file Excel per bulan dengan format baku.
- Memisahkan hak akses antara Admin (kelola & hapus data) dan Operator (input & lihat).

---

## 3. Pengguna (User Roles)

| Role | Akses | Deskripsi |
|------|-------|-----------|
| **Admin** | Login wajib | Dapat melihat semua data, mengedit, menghapus, mengakses pengaturan (master data), dan mengekspor Excel. |
| **Operator** | Tanpa login | Dapat mengisi form lembur dan melihat data yang sudah diinput (read-only). Tidak bisa edit/hapus. |

> **Catatan:** Halaman entry form dan halaman rekapan (view-only) untuk Operator dapat diakses langsung tanpa autentikasi. Halaman Admin (edit, hapus, pengaturan) memerlukan login.

---

## 4. Tech Stack

| Komponen | Teknologi |
|---|---|
| **Framework** | Next.js 14+ (App Router) |
| **Bahasa** | TypeScript |
| **Styling** | Tailwind CSS |
| **Font** | Inter (Google Fonts) |
| **Ikon** | Lucide React |
| **Database** | PostgreSQL via Supabase |
| **ORM** | Prisma atau Supabase JS Client |
| **Autentikasi** | NextAuth.js (Admin only) |
| **Export Excel** | ExcelJS |
| **Grafik** | Recharts |
| **Deployment** | Vercel |
| **Storage File** | Folder virtual / Supabase Storage (untuk referensi foto SPL) |

---

## 5. Desain & UI/UX

### 5.1 Prinsip Desain
- **Modern & Clean:** Minimalis, tidak berantakan, whitespace yang cukup.
- **Responsif:** Berfungsi optimal di desktop (1280px+) dan mobile (360px+).
- **Konsisten:** Komponen yang sama digunakan di seluruh halaman.

### 5.2 Palet Warna

| Peran | Warna | Hex |
|---|---|---|
| **Primary** | Biru | `#1D4ED8` (blue-700) |
| **Secondary** | Hijau | `#16A34A` (green-600) |
| **Accent** | Oranye | `#EA580C` (orange-600) |
| **Background** | Abu muda | `#F8FAFC` |
| **Card** | Putih | `#FFFFFF` |
| **Text Utama** | Slate gelap | `#1E293B` |
| **Text Sub** | Slate medium | `#64748B` |

### 5.3 Layout Global
```
┌────────────────────────────────────────────────┐
│                  TOP NAVIGATION                │
├──────────┬─────────────────────────────────────┤
│          │                                     │
│ SIDEBAR  │         MAIN CONTENT                │
│          │                                     │
│          │                                     │
├──────────┴─────────────────────────────────────┤
│                    FOOTER                      │
└────────────────────────────────────────────────┘
```

- **Top Navigation:** Logo PT BAI, nama aplikasi, nama user (jika login), tombol logout.
- **Sidebar:** Menu navigasi dengan ikon (Dashboard, Entry Lembur, Rekapan, Pengaturan).
- **Mobile:** Sidebar collapse menjadi hamburger menu.

### 5.4 Tipografi
- **Font Utama:** Inter (Google Fonts)
- **Heading H1:** 24px / Bold
- **Heading H2:** 20px / SemiBold
- **Body:** 14px / Regular
- **Label / Caption:** 12px / Medium

---

## 6. Struktur Halaman & Fitur

### 6.1 Halaman Operator (Publik — Tanpa Login)

#### 6.1.1 Halaman Entry Lembur (`/entry`)
**Tujuan:** Operator mengisi data lembur.

**Form Fields:**

| No | Field | Tipe | Validasi |
|----|-------|------|----------|
| 1 | Tanggal | Date Picker | Required, tidak boleh masa depan |
| 2 | Nama | Text Input | Required, min 3 karakter |
| 3 | NPK (Nomor Induk) | Text Input | Required, format numerik |
| 4 | Divisi | Select / Auto-fill | Default: "Thermal Power Plant" |
| 5 | Start (Jam Mulai) | Time Picker | Required |
| 6 | Out (Jam Selesai) | Time Picker | Required, harus setelah Start |
| 7 | Jam Lembur | Select | Pilihan: 4 Jam, 8 Jam, 12 Jam, 16 Jam |
| 8 | Keterangan Hari | Radio Button | Pilihan: Hari Libur / Hari Kerja |
| 9 | Keterangan | Textarea | Opsional, max 500 karakter |

**Perilaku:**
- Setelah submit berhasil, tampil notifikasi sukses (toast/alert) dan form di-reset.
- Data tersimpan ke database Supabase (PostgreSQL).
- Field Divisi default otomatis terisi "Thermal Power Plant" namun tetap bisa dilihat.

#### 6.1.2 Halaman Rekapan Operator (`/rekapan`)
**Tujuan:** Operator melihat data lembur yang telah diinput (view-only).

**Fitur:**
- Tabel rekap semua data lembur dengan kolom: No, Tanggal, Nama, NPK, Divisi, Start, Out, Jam Lembur, Hari, Keterangan.
- Filter berdasarkan **bulan & tahun**.
- Filter berdasarkan **nama / NPK**.
- Tidak ada tombol Edit atau Hapus.
- Pagination (25 baris per halaman).

---

### 6.2 Halaman Admin (Privat — Butuh Login)

#### 6.2.1 Halaman Login (`/admin/login`)
**Tujuan:** Autentikasi Admin.

**Fitur:**
- Form login dengan field Email dan Password.
- Menggunakan NextAuth.js dengan credentials provider.
- Jika login gagal, tampilkan pesan error.
- Redirect ke `/admin/dashboard` setelah berhasil.

#### 6.2.2 Dashboard Admin (`/admin/dashboard`)
**Tujuan:** Ringkasan statistik lembur.

**Widget / Card Statistik:**

| No | Kartu | Isi | Ikon |
|----|-------|-----|------|
| 1 | Total Lembur Bulan Ini | Jumlah entri bulan berjalan | 📋 ClipboardList |
| 2 | Total Jam Lembur | Akumulasi jam bulan berjalan | ⏱️ Clock |
| 3 | Operator Aktif | Jumlah operator unik yang lembur | 👥 Users |
| 4 | Hari Libur vs Kerja | Perbandingan jumlah hari | 📅 Calendar |

**Grafik:**
- **Bar Chart:** Jumlah jam lembur per operator (bulan berjalan).
- **Line Chart:** Tren total lembur per bulan (12 bulan terakhir).
- **Pie/Donut Chart:** Perbandingan Hari Libur vs Hari Kerja.

#### 6.2.3 Halaman Kelola Data Lembur (`/admin/data`)
**Tujuan:** Admin mengelola seluruh data lembur.

**Fitur:**
- Tabel lengkap dengan semua kolom data.
- Filter bulan/tahun dan nama/NPK (sama seperti halaman operator).
- **Tombol Edit:** Membuka modal/drawer dengan form pre-filled untuk update data.
- **Tombol Hapus:** Konfirmasi dialog sebelum menghapus.
- **Tombol Export Excel:** Generate dan download file `.xlsx` (lihat Seksi 7).
- **Tombol Cetak/Print:** Membuka tampilan print-friendly dan memicu `window.print()`.
- Pagination (25 baris per halaman).

#### 6.2.4 Halaman Pengaturan (`/admin/settings`)
**Tujuan:** Manajemen master data dan konfigurasi aplikasi.

**Fitur:**
- **Kelola Akun Admin:** Ganti password.
- **Master Operator:** Tambah / hapus daftar nama dan NPK operator (untuk auto-suggest di form entry).
- **Info Aplikasi:** Nama instansi, tahun (tampil di footer).

---

## 7. Fitur Export Excel

### 7.1 Spesifikasi File
- **Library:** ExcelJS
- **Nama File:** `Rekapan Lembur TPP_{NamaBulan}_{Tahun}.xlsx`
  - Contoh: `Rekapan Lembur TPP_Mei_2026.xlsx`
- **Nama Sheet:** `Thermal PP`
- **Lokasi Generate:** Server-side (Next.js API Route), dikirim ke browser sebagai download.

### 7.2 Format / Template Excel

**Baris 1 (Header Judul):**
- Merge cell A1:J1
- Isi: `REKAPAN LEMBUR OPERATOR DIVISI THERMAL POWER PLANT`
- Style: Bold, center, background biru, font putih, font size 13

**Baris 2 (Sub-header Periode):**
- Merge cell A2:J2
- Isi: `Periode: {Bulan} {Tahun}`
- Style: Bold, center, background abu muda

**Baris 3 (Kosong / Pemisah)**

**Baris 4 (Header Kolom Tabel):**

| Kolom | Header | Lebar (chars) |
|-------|--------|----------------|
| A | No | 5 |
| B | Tanggal | 15 |
| C | Nama | 25 |
| D | NPK | 15 |
| E | Divisi | 25 |
| F | Start | 10 |
| G | Out | 10 |
| H | Jam Lembur | 12 |
| I | Keterangan Hari | 18 |
| J | Keterangan / Bukti SPL | 30 |

- Style header: Bold, center, background biru tua, font putih, border tipis

**Baris 5 dst (Data):**
- Setiap baris = satu entri lembur
- Alternating row color (putih & biru sangat muda)
- Border tipis di setiap sel
- Tanggal format: `DD-MM-YYYY`
- Jam format: `HH:mm`

**Baris Terakhir (Total):**
- Kolom A: "TOTAL"
- Kolom H: Total jam lembur (SUM)
- Style: Bold, background hijau muda

---

## 8. Struktur Database (Supabase / PostgreSQL)

### 8.1 Tabel `overtime_records`

```sql
CREATE TABLE overtime_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal       DATE NOT NULL,
  nama          VARCHAR(100) NOT NULL,
  npk           VARCHAR(20) NOT NULL,
  divisi        VARCHAR(100) NOT NULL DEFAULT 'Thermal Power Plant',
  start_time    TIME NOT NULL,
  out_time      TIME NOT NULL,
  jam_lembur    INTEGER NOT NULL CHECK (jam_lembur IN (4, 8, 12, 16)),
  ket_hari      VARCHAR(20) NOT NULL CHECK (ket_hari IN ('Hari Libur', 'Hari Kerja')),
  keterangan    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.2 Tabel `operators` (Master Data)

```sql
CREATE TABLE operators (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama       VARCHAR(100) NOT NULL,
  npk        VARCHAR(20) UNIQUE NOT NULL,
  aktif      BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.3 Tabel `admin_users`

```sql
CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nama          VARCHAR(100),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Struktur Proyek (Next.js)

```
rekapan-lembur-tpp/
├── app/
│   ├── (public)/
│   │   ├── entry/
│   │   │   └── page.tsx              # Form entry lembur (Operator)
│   │   └── rekapan/
│   │       └── page.tsx              # Tabel rekap (Operator, view-only)
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx              # Halaman login Admin
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard statistik
│   │   ├── data/
│   │   │   └── page.tsx              # Kelola data lembur
│   │   └── settings/
│   │       └── page.tsx              # Pengaturan & master data
│   ├── api/
│   │   ├── overtime/
│   │   │   ├── route.ts              # GET (list), POST (create)
│   │   │   └── [id]/route.ts         # PUT (update), DELETE (hapus)
│   │   ├── export/
│   │   │   └── route.ts              # Generate & download Excel
│   │   ├── dashboard/
│   │   │   └── route.ts              # Statistik & data grafik
│   │   └── auth/
│   │       └── [...nextauth]/route.ts
│   ├── layout.tsx                    # Root layout (font, metadata)
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Badge.tsx
│   │   └── Card.tsx
│   ├── forms/
│   │   └── OvertimeForm.tsx          # Form entry lembur (reusable)
│   ├── tables/
│   │   └── OvertimeTable.tsx         # Tabel rekapan (reusable)
│   └── charts/
│       ├── BarChartOvertimePerOperator.tsx
│       ├── LineChartTrend.tsx
│       └── DonutChartHariLembur.tsx
├── lib/
│   ├── supabase.ts                   # Supabase client
│   ├── auth.ts                       # NextAuth config
│   ├── exportExcel.ts                # Logic generate Excel (ExcelJS)
│   └── utils.ts                      # Helper functions
├── types/
│   └── index.ts                      # TypeScript interfaces
├── middleware.ts                     # Proteksi route /admin/*
├── .env.local                        # Environment variables
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 10. API Endpoints

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| `GET` | `/api/overtime` | Publik | Ambil list data lembur (dengan query params filter) |
| `POST` | `/api/overtime` | Publik | Buat entri lembur baru |
| `PUT` | `/api/overtime/[id]` | Admin | Update data lembur |
| `DELETE` | `/api/overtime/[id]` | Admin | Hapus data lembur |
| `GET` | `/api/dashboard` | Admin | Statistik & data grafik |
| `GET` | `/api/export?bulan=5&tahun=2026` | Admin | Download file Excel |
| `POST` | `/api/auth/[...nextauth]` | — | NextAuth handler |

**Query Params untuk `/api/overtime`:**
- `bulan` — nomor bulan (1–12)
- `tahun` — tahun (contoh: 2026)
- `nama` — pencarian berdasarkan nama (ILIKE)
- `npk` — pencarian berdasarkan NPK
- `page` — halaman (default: 1)
- `limit` — jumlah per halaman (default: 25)

---

## 11. Middleware & Keamanan

- **Route Protection:** Middleware Next.js (`middleware.ts`) memproteksi semua route `/admin/*` kecuali `/admin/login`. Jika tidak ada sesi valid, redirect ke `/admin/login`.
- **Session:** JWT-based session via NextAuth.js.
- **Password:** Di-hash menggunakan `bcryptjs` sebelum disimpan.
- **Input Sanitization:** Validasi input di sisi server menggunakan `zod`.
- **CORS:** Dibatasi hanya ke domain deployment.
- **Environment Variables:** Semua credential di `.env.local`, tidak di-commit ke git.

---

## 12. Footer

Footer tampil di seluruh halaman, berisi:

```
┌─────────────────────────────────────────────────────────────┐
│  🏭 Aplikasi Rekapan Lembur Operator                        │
│  Divisi Thermal Power Plant — PT BAI                        │
│  © 2026 PT Berau Asri Indah. Semua hak dilindungi.         │
│  Versi 1.0.0                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx

# NextAuth
NEXTAUTH_SECRET=xxxx
NEXTAUTH_URL=https://your-app.vercel.app

# App Info
NEXT_PUBLIC_APP_NAME=Rekapan Lembur TPP
NEXT_PUBLIC_INSTANSI=PT Berau Asri Indah
NEXT_PUBLIC_DIVISI=Thermal Power Plant
```

---

## 14. Alur Kerja (User Flow)

### 14.1 Alur Operator

```
Buka Aplikasi
      │
      ▼
Pilih menu "Entry Lembur"
      │
      ▼
Isi form (Tanggal, Nama, NPK, dst.)
      │
      ▼
Klik Simpan → Validasi client-side
      │
      ├── Gagal → Tampilkan pesan error di field
      │
      └── Berhasil → POST /api/overtime → Toast sukses → Form reset
```

### 14.2 Alur Admin — Export Excel

```
Login Admin
      │
      ▼
Buka "Kelola Data" → Pilih Filter Bulan & Tahun
      │
      ▼
Klik "Export Excel"
      │
      ▼
GET /api/export?bulan=X&tahun=Y
      │
      ▼
Server query database → Generate .xlsx (ExcelJS)
      │
      ▼
Download file: Rekapan Lembur TPP_{Bulan}_{Tahun}.xlsx
```

---

## 15. Milestone & Estimasi Pengembangan

| Fase | Cakupan | Estimasi |
|------|---------|----------|
| **Fase 1** | Setup proyek, konfigurasi Supabase, autentikasi Admin, layout dasar (sidebar, topnav, footer) | 3–4 hari |
| **Fase 2** | Form entry lembur, API POST, validasi Zod, notifikasi toast | 2–3 hari |
| **Fase 3** | Halaman rekapan operator, tabel, filter, pagination, API GET | 2–3 hari |
| **Fase 4** | Dashboard Admin (statistik, grafik Recharts) | 3–4 hari |
| **Fase 5** | Fitur edit & hapus (Admin), modal, konfirmasi dialog | 2 hari |
| **Fase 6** | Export Excel (ExcelJS), format template, download | 2–3 hari |
| **Fase 7** | Halaman pengaturan, master operator | 1–2 hari |
| **Fase 8** | Fitur cetak/print, responsif mobile, polish UI | 2 hari |
| **Fase 9** | Testing, deployment ke Vercel, konfigurasi production | 1–2 hari |
| **Total** | | **~18–25 hari kerja** |

---

## 16. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Operator dapat mengisi dan menyimpan form lembur tanpa login.
- [ ] Data tersimpan ke Supabase dan tampil di tabel rekapan.
- [ ] Admin dapat login dengan email & password.
- [ ] Admin dapat mengedit dan menghapus data dengan konfirmasi.
- [ ] File Excel ter-generate dengan nama `Rekapan Lembur TPP_{Bulan}_{Tahun}.xlsx` dan sheet bernama `Thermal PP`.
- [ ] Excel memiliki header judul, sub-header periode, header kolom, data, dan baris total.
- [ ] Dashboard menampilkan statistik dan 3 jenis grafik.
- [ ] Filter bulan/tahun dan nama/NPK berfungsi di semua tabel.
- [ ] Aplikasi responsif di mobile (min 360px) dan desktop (1280px+).
- [ ] Semua route `/admin/*` terproteksi — redirect ke login jika belum autentikasi.
- [ ] Footer tampil di semua halaman dengan info instansi dan tahun.
- [ ] Deployment berhasil di Vercel tanpa error.

---

## 17. Catatan & Asumsi

1. **Foto SPL (Bukti):** Kolom "Keterangan" pada form dan Excel digunakan untuk mencantumkan referensi/kode foto SPL secara teks. Upload foto fisik tidak termasuk dalam scope v1.0 ini dan dapat dikembangkan di versi berikutnya.
2. **Multi-Admin:** Versi ini mengasumsikan satu akun admin utama. Manajemen multi-admin dapat ditambahkan di v1.1.
3. **Notifikasi:** Tidak ada email/WhatsApp notification di v1.0. Bisa ditambahkan menggunakan Supabase Edge Functions di versi berikutnya.
4. **Bahasa:** Antarmuka seluruhnya dalam Bahasa Indonesia.
5. **Timezone:** Menggunakan WIB (UTC+7) untuk semua data waktu.

---

*Dokumen ini merupakan acuan pengembangan v1.0 dan dapat diperbarui sesuai kebutuhan.*
-- Skema Database untuk Aplikasi Rekapan Lembur TPP

-- Tabel overtime_records
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
  bukti_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel operators (Master Data)
CREATE TABLE operators (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama       VARCHAR(100) NOT NULL,
  npk        VARCHAR(20) UNIQUE NOT NULL,
  aktif      BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel admin_users
CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nama          VARCHAR(100),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

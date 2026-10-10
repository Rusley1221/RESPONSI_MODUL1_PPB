# Smart Library API – Kelompok 40

REST API sederhana untuk **pencatatan peminjaman buku perpustakaan**, dibuat untuk Responsi Modul 1 Praktikum Pemrograman Perangkat Bergerak (PPB) 2026.

**Base URL (Vercel):** `https://responsi-modul-1-ppb.vercel.app`

## Deskripsi & Tujuan

API ini mencatat data peminjaman buku oleh anggota perpustakaan. Petugas (atau aplikasi klien, misalnya aplikasi mobile) dapat menambah, melihat, mengubah, dan menghapus data peminjaman, serta memfilter peminjaman berdasarkan status (mis. hanya yang **Terlambat**).

- **Stack:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

Peminjaman berstatus `Dipinjam` yang sudah melewati `due_date` otomatis ditandai `Terlambat` saat data dibaca.

## Struktur Data (Schema)

Tabel `loans`:

| Kolom         | Tipe        | Keterangan                                                  |
|---------------|-------------|-------------------------------------------------------------|
| `id`          | bigint (PK) | Auto increment                                              |
| `member_name` | text        | Nama anggota (wajib)                                        |
| `member_nim`  | text        | NIM / ID anggota (wajib)                                    |
| `book_title`  | text        | Judul buku (wajib)                                          |
| `book_author` | text        | Penulis buku (opsional)                                     |
| `loan_date`   | date        | Tanggal pinjam, default hari ini (`YYYY-MM-DD`)             |
| `due_date`    | date        | Batas pengembalian (wajib, tidak boleh sebelum `loan_date`) |
| `return_date` | date        | Tanggal dikembalikan (null jika belum)                      |
| `status`      | text        | `Dipinjam` (default) / `Dikembalikan` / `Terlambat`         |
| `notes`       | text        | Catatan (opsional)                                          |
| `created_at`  | timestamptz | Waktu data dibuat                                           |

SQL lengkap + data contoh ada di [`supabase/schema.sql`](supabase/schema.sql).

## Endpoint

| Method | Endpoint     | Fungsi                                      |
|--------|--------------|---------------------------------------------|
| GET    | `/loans`     | Ambil semua peminjaman (mendukung filter)   |
| GET    | `/loans/:id` | Ambil satu peminjaman                       |
| POST   | `/loans`     | Tambah peminjaman                           |
| PUT    | `/loans/:id` | Ganti data peminjaman (field wajib lengkap) |
| PATCH  | `/loans/:id` | Ubah sebagian data (mis. status)            |
| DELETE | `/loans/:id` | Hapus peminjaman                            |

**Query filter pada `GET /loans`:**

| Parameter     | Contoh                    | Keterangan                                        |
|---------------|---------------------------|---------------------------------------------------|
| `status`      | `/loans?status=Terlambat` | `Dipinjam`, `Dikembalikan`, atau `Terlambat`      |
| `member_name` | `/loans?member_name=andi` | Pencarian nama anggota (tidak case-sensitive)     |
| `book_title`  | `/loans?book_title=clean` | Pencarian judul buku (tidak case-sensitive)       |

Filter bisa digabung: `/loans?status=Dipinjam&member_name=andi`.

## Contoh Request & Response

### GET /loans?status=Terlambat

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 2,
      "member_name": "Siti Rahma",
      "member_nim": "21120123140002",
      "book_title": "Pemrograman Web dengan Node.js",
      "book_author": "Budi Raharjo",
      "loan_date": "2026-09-20",
      "due_date": "2026-10-04",
      "return_date": null,
      "status": "Terlambat",
      "notes": null,
      "created_at": "2026-10-10T01:00:00.000Z"
    }
  ]
}
```

### POST /loans

Request:

```json
{
  "member_name": "Rina Wulandari",
  "member_nim": "21120123140010",
  "book_title": "Basis Data",
  "book_author": "Abdul Kadir",
  "due_date": "2026-10-24"
}
```

Response `201 Created`:

```json
{
  "success": true,
  "message": "Peminjaman berhasil dicatat",
  "data": {
    "id": 4,
    "member_name": "Rina Wulandari",
    "member_nim": "21120123140010",
    "book_title": "Basis Data",
    "book_author": "Abdul Kadir",
    "loan_date": "2026-10-10",
    "due_date": "2026-10-24",
    "return_date": null,
    "status": "Dipinjam",
    "notes": null,
    "created_at": "2026-10-10T02:00:00.000Z"
  }
}
```

### PATCH /loans/4 (tandai dikembalikan)

Request:

```json
{ "status": "Dikembalikan" }
```

Response `200 OK` (`return_date` otomatis terisi hari ini jika tidak dikirim):

```json
{
  "success": true,
  "message": "Peminjaman berhasil diperbarui",
  "data": { "id": 4, "status": "Dikembalikan", "return_date": "2026-10-12", "...": "..." }
}
```

### DELETE /loans/4

```json
{ "success": true, "message": "Peminjaman berhasil dihapus", "data": { "id": 4, "...": "..." } }
```

### Contoh error

`400` validasi gagal:

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": ["member_nim wajib diisi", "due_date wajib diisi"]
}
```

`404` data tidak ditemukan:

```json
{ "success": false, "message": "Peminjaman dengan id 99 tidak ditemukan" }
```

### Contoh cURL

```bash
curl "https://responsi-modul-1-ppb.vercel.app/loans?status=Terlambat"

curl -X POST "https://responsi-modul-1-ppb.vercel.app/loans" \
  -H "Content-Type: application/json" \
  -d '{"member_name":"Rina","member_nim":"21120123140010","book_title":"Basis Data","due_date":"2026-10-24"}'
```

## Instalasi & Menjalankan Lokal

Prasyarat: Node.js 18+ dan akun [Supabase](https://supabase.com).

1. **Clone repository**
   ```bash
   git clone https://github.com/Rusley1221/smart-library-api-Kel40.git
   cd smart-library-api-Kel40
   ```
2. **Install dependency**
   ```bash
   npm install
   ```
3. **Siapkan database:** buat project di Supabase, buka **SQL Editor**, lalu jalankan isi `supabase/schema.sql`.
4. **Buat file `.env`** (salin dari `.env.example`):
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   SUPABASE_KEY=<service_role key dari Project Settings > API>
   PORT=3000
   ```
5. **Jalankan server**
   ```bash
   npm run dev     # development (nodemon)
   npm start       # production
   ```
6. Buka `http://localhost:3000/loans`.

## Deployment ke Vercel

1. Push repository ke GitHub.
2. Di [vercel.com](https://vercel.com), pilih **Add New > Project**, lalu import repository ini.
3. Pada **Environment Variables**, isi `SUPABASE_URL` dan `SUPABASE_KEY`.
4. Klik **Deploy**. Konfigurasi routing sudah ada di `vercel.json` dan `api/index.js`.

**Link deployment:** https://responsi-modul-1-ppb.vercel.app

## Struktur Proyek

```
├── api/index.js              # entry point serverless Vercel
├── src/
│   ├── app.js                # konfigurasi Express
│   ├── index.js              # entry point lokal
│   ├── config/db.js          # koneksi Supabase
│   ├── routes/loanRoutes.js
│   ├── controllers/loanController.js
│   └── models/loanModel.js
├── supabase/schema.sql       # schema + data contoh
├── vercel.json
└── .env.example
```

## Anggota Kelompok 40

- Syauqi Akifur Rahman 21120124130097

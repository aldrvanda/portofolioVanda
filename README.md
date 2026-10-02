# Portofolio — Aldreine Vanda Kauntu

Next.js 15 (App Router) + Sanity, deploy ke Vercel di `aldreinevanda.vercel.app`.
Desain mengikuti *Design Brief — "The Clean Report"*; fitur mengikuti PRD.

## 1. Jalankan lokal (tanpa Sanity dulu)

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Selama `NEXT_PUBLIC_SANITY_PROJECT_ID` kosong, website memakai
konten dari CV di `lib/seed-data.json`. Artinya **website sudah bisa di-launch hari ini tanpa Sanity**.

## 2. Deploy ke Vercel

1. Push folder ini ke repo GitHub baru (mis. `github.com/aldrvanda/portfolio`).
2. Di vercel.com → **Add New → Project** → pilih repo → **Deploy** (setting default Next.js).
3. Di **Settings → Domains**, ubah subdomain menjadi `aldreinevanda.vercel.app` (jika nama tersedia).
4. Di tab **Analytics**, klik **Enable** untuk Vercel Web Analytics (menghitung pengunjung per hari).

> Event klik (`contact_click`) sudah dipasang di kode. Custom event mungkin hanya tercatat di paket
> berbayar Vercel; pageview dan pengunjung unik tetap tercatat di paket gratis.

## 3. Sambungkan Sanity (bisa setelah launch)

1. Buat project di https://www.sanity.io/manage → catat **Project ID**. Dataset: `production`.
2. Di **API → CORS origins**, tambahkan `http://localhost:3000` dan `https://aldreinevanda.vercel.app`
   (centang *Allow credentials*).
3. Buat file `.env.local` dari `.env.example`, isi `NEXT_PUBLIC_SANITY_PROJECT_ID`.
4. Isi konten awal dari CV sekaligus:
   ```bash
   npm run seed:ndjson
   npx sanity login
   npx sanity dataset import scripts/seed.ndjson production --replace
   ```
5. Buka http://localhost:3000/studio, login, dan cek kontennya.
6. Di Vercel → **Settings → Environment Variables**, tambahkan tiga variabel dari `.env.example`, lalu redeploy.

### Update otomatis setelah Publish (webhook)

1. Isi `SANITY_REVALIDATE_SECRET` dengan string acak panjang (di `.env.local` dan di Vercel).
2. Sanity Manage → **API → Webhooks → Create webhook**:
   - URL: `https://aldreinevanda.vercel.app/api/revalidate`
   - Dataset: `production`, Trigger: Create, Update, Delete
   - HTTP method: POST, Secret: sama dengan `SANITY_REVALIDATE_SECRET`
3. Setelah itu, setiap kali Anda klik **Publish** di Studio, website ikut ter-update.
   Jika tidak berubah, klik **Redeploy** di dashboard Vercel sebagai cadangan.

## Mengelola konten

| Yang ingin diubah | Di mana |
| --- | --- |
| Nama, title, tagline, About, pendidikan | Studio → Profile |
| Proyek (termasuk angka KPI, link repo/demo) | Studio → Project. Set **status = published** agar tampil |
| Pengalaman | Studio → Experience (status = published) |
| Email, LinkedIn, GitHub | Studio → Contact link |
| Skill | Studio → Skill |
| Teks tombol/label UI | `lib/strings.ts` |

Setiap teks punya kolom **English** (wajib) dan **Bahasa Indonesia** (opsional). Jika versi Indonesia
kosong, website menampilkan versi Inggris.

## Struktur

```
app/                 route Next.js (halaman, 404, error, studio, webhook, OG image, sitemap)
components/          Header, Sections (Hero/About/Experience/Footer), Projects, Contact, CursorSpotlight
lib/                 tipe data, konten seed dari CV, teks UI EN/ID, i18n, loader konten
sanity/              schema, client, query GROQ
scripts/make-seed.mjs  generator seed.ndjson untuk impor ke Sanity
```

## Catatan teknis

- Styling memakai CSS biasa dengan design token di `app/globals.css` (tanpa Tailwind) supaya token brief
  terpetakan 1:1 dan tidak ada konfigurasi tambahan.
- `stack` proyek disimpan sebagai daftar teks (bukan referensi ke Skill), agar input di Studio sederhana.
- Field `year` ditambahkan ke Project untuk label tahun di kartu.
- Jika Sanity sudah disetel tetapi tidak bisa diakses saat build, build sengaja gagal sehingga versi lama tetap live.

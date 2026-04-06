# Panduan FinCute (ID)

## Ringkasan
FinCute adalah platform manajemen keuangan pribadi/UMKM dengan fitur transaksi terpadu, anggaran, tabungan, utang, invoice, dan laporan. Gunakan akun demo: `demo@fincute.app` / `demo1234` (hanya untuk lokal).

## Persiapan & Menjalankan
1. Pastikan .env sudah diisi `DATABASE_URL` dan `NEXTAUTH_SECRET`.
2. Jalankan server: `npm run dev` (http://localhost:3000).
3. Jika database kosong: `npx prisma migrate dev` lalu `npm run seed`.

## Menu: Panduan Penggunaan (alur cepat)
- **Login/Daftar**: masuk di `/login`, bisa pakai demo atau buat akun baru.
- **Dashboard**: lihat ringkasan saldo, grafik income vs expense, insight, dan transaksi terbaru.
- **Tambah transaksi cepat**: buka menu *Transactions* → form "Quick add" (isi amount, tanggal, tipe, akun, kategori, catatan opsional).
- **Atur anggaran**: menu *Budget* → set limit per kategori per bulan; lihat progres bar pemakaian.
- **Pantau tabungan**: menu *Savings* → buat goal (target, deadline) dan lihat progres.
- **Pantau utang**: menu *Debts* → tambah utang, lihat sisa pembayaran.
- **Invoice sederhana**: menu *Invoices* → buat invoice (client, amount, status). Jika status *PAID* dan pilih akun + kategori, otomatis tercatat sebagai income.
- **Laporan**: menu *Reports* → income/expense bulan berjalan, profit/loss, jumlah transaksi.
- **Settings**: lihat profil dasar (email/nama). Tambahan pengaturan bisa ditambah di sini.

## Detail Fitur
- **Authentication**: NextAuth (credentials + Google/email opsional). Session JWT.
- **Akun keuangan (WalletAccount)**: jenis Cash/Bank/E-Wallet dengan saldo realtime dari transaksi.
- **Transaksi**: tipe Income/Expense, terkait akun & kategori; saldo akun otomatis berubah.
- **Kategori**: per tipe (income/expense) dengan warna pastel.
- **Budget**: limit per kategori per bulan; indikator pemakaian.
- **SavingsGoal**: target & deadline; progres dari `currentAmount` (dapat diupdate via transaksi/fitur lanjut).
- **Debt**: total vs remaining; dapat dikaitkan ke transaksi pembayaran.
- **Invoice**: status Paid/Unpaid; Paid membuat transaksi income otomatis (jika akun & kategori disediakan).
- **Reports/Insights**: perbandingan bulan ini vs lalu, top expense category, health score sederhana.

## Tips Penggunaan
- Selalu pilih akun & kategori saat menambah transaksi agar saldo dan laporan akurat.
- Gunakan kategori konsisten supaya budget dan insight tepat.
- Jika menandai invoice sebagai PAID, pilih akun + kategori income agar saldo naik.
- Untuk multi-device/production, ganti `NEXTAUTH_SECRET`, isi kredensial Google/Email, dan gunakan DB produksi.

## Troubleshooting singkat
- **Login gagal (CredentialsSignin)**: pastikan email/password benar; cek `.env` sudah ada `NEXTAUTH_SECRET`; restart `npm run dev` setelah ubah env.
- **Error Decimal di client**: pastikan gunakan versi terbaru repo ini (nilai Decimal sudah dikonversi di server sebelum dikirim ke client).
- **Port bentrok**: hentikan server lama `kill $(lsof -ti :3000)` lalu `npm run dev`.

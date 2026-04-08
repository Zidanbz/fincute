This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel (tested Apr 2026)

1) Pastikan build lokal lulus  
   ```bash
   npm run build
   ```

2) Set Environment Variables di Vercel (Project Settings → Environment Variables):  
   - `DATABASE_URL` → koneksi PostgreSQL production (Neon/Supabase/RDS).  
   - `NEXTAUTH_SECRET` → string acak panjang (gunakan `openssl rand -hex 32`).  
   - `NEXTAUTH_URL` → `https://<project>.vercel.app` (atau custom domain).  
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` → wajib jika login Google dipakai.  
   - `EMAIL_SERVER`, `EMAIL_FROM` → isi hanya jika login email (SMTP) dipakai.  
   - Jangan pakai nilai lokal (localhost) untuk production.

3) Hubungkan repo dan pilih branch (mis. `main`). Klik **Redeploy** dengan opsi **Clear build cache** setelah mengubah env.

4) Setelah deploy, tes login di domain Vercel. Jika credential login gagal, cek:  
   - Database sudah terisi user/password (seed).  
   - `NEXTAUTH_URL` sesuai domain production.  
   - SECRET sama di server & build.  
   - Provider (Google/Email) memiliki callback URL: `https://<project>.vercel.app/api/auth/callback/<provider>`.

Referensi resmi: https://nextjs.org/docs/app/building-your-application/deploying dan https://authjs.dev.

# Opsi Deploy Arrvyy

Vercel tidak support upload langsung, hanya support Git repository. Berikut opsi deploy:

## 🚀 Opsi 1: Deploy ke Vercel via GitHub (RECOMMENDED)

### Langkah-langkah:

1. **Buat Repository di GitHub:**
   - Buka [github.com](https://github.com)
   - Klik "New repository"
   - Name: `arrvyy`
   - Public atau Private (terserah)
   - Jangan centang "Initialize with README"
   - Klik "Create repository"

2. **Push Project ke GitHub:**
```bash
cd D:\Project\arrvy
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/arrvyy.git
git push -u origin main
```
(Ganti USERNAME dengan username GitHub kamu)

3. **Deploy di Vercel:**
   - Di halaman Vercel yang kamu lihat
   - Pilih "Import Git Repository"
   - Pilih repository `arrvyy` yang baru dibuat
   - Klik "Import"

4. **Configure Project:**
   - Framework: Vite
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Environment Variables:**
   - `VITE_SUPABASE_URL` = `https://ulqaphcmmvimdhqtufle.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (anon key kamu)

6. **Deploy!**

---

## 🌐 Opsi 2: Deploy ke Netlify (Support Drag & Drop!)

Netlify support drag & drop upload langsung!

### Langkah-langkah:

1. **Build aplikasi:**
```bash
cd web
npm run build
```

2. **Deploy ke Netlify:**
   - Buka [netlify.com](https://netlify.com)
   - Sign up / Login
   - Drag folder `web/dist` ke Netlify
   - Atau klik "Add new site" → "Deploy manually" → Upload folder `dist`

3. **Setup Environment Variables:**
   - Site settings → Environment variables
   - Tambahkan:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Redeploy

4. **Update Supabase Redirect URLs:**
   - Dapatkan URL Netlify (contoh: `arrvyy.netlify.app`)
   - Supabase Dashboard → Authentication → URL Configuration
   - Tambahkan:
     - `https://arrvyy.netlify.app/chat`
     - `https://arrvyy.netlify.app/auth/callback`

---

## 📦 Opsi 3: Deploy ke Cloudflare Pages (Gratis)

1. Buka [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub atau upload langsung
3. Setup build: `npm run build`, output: `dist`

---

## 🎯 Rekomendasi

**Untuk cepat:** Pakai **Netlify** (drag & drop langsung)
**Untuk long-term:** Pakai **Vercel via GitHub** (auto-deploy dari Git)

---

Mau saya bantu setup yang mana?


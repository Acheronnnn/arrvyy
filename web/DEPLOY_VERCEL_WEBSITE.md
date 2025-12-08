# Deploy Arrvyy ke Vercel via Website (Lebih Mudah!)

## 🚀 Cara Deploy via Vercel Website

### Step 1: Siapkan Project di GitHub (Opsional tapi Recommended)

1. Buat repository baru di GitHub
2. Push project ke GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/arrvyy.git
git push -u origin main
```

### Step 2: Deploy via Vercel Website

1. **Buka [vercel.com](https://vercel.com)**
2. **Sign up / Login** (bisa pakai GitHub, Google, atau Email)
3. **Klik "Add New Project"**
4. **Import Project:**
   - Jika sudah di GitHub: Pilih repository `arrvyy`
   - Jika belum: Drag & drop folder `web/` atau upload zip

5. **Configure Project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `web` (jika import dari root) atau `.` (jika import folder web)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. **Environment Variables:**
   Klik "Environment Variables" dan tambahkan:
   - **Name**: `VITE_SUPABASE_URL`
     **Value**: `https://ulqaphcmmvimdhqtufle.supabase.co`
   - **Name**: `VITE_SUPABASE_ANON_KEY`
     **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscWFwaGNtbXZpbWRocXR1ZmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzA2MDEsImV4cCI6MjA4MDc0NjYwMX0.OeCnxk5AP23VQa4nYquXgiVBdStTna2QEjeIswcV_24`

7. **Klik "Deploy"**

### Step 3: Tunggu Deploy Selesai

- Deploy biasanya selesai dalam 1-2 menit
- Setelah selesai, dapatkan URL (contoh: `arrvyy.vercel.app`)

### Step 4: Update Supabase Redirect URLs

1. Buka **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Tambahkan Redirect URLs:
   ```
   https://arrvyy.vercel.app/chat
   https://arrvyy.vercel.app/auth/callback
   ```
   (Ganti `arrvyy.vercel.app` dengan URL Vercel kamu)
3. **Save**

### Step 5: Test Aplikasi

1. Buka URL Vercel di browser
2. Daftar 2 akun
3. Login dan mulai chat!

## ✅ Selesai!

Aplikasi sekarang bisa diakses dari mana saja dengan URL Vercel!

---

## 🔄 Update Aplikasi (Setelah Perubahan)

Jika ada perubahan code:
1. Push ke GitHub (jika pakai GitHub)
2. Vercel akan auto-deploy
3. Atau manual: Vercel Dashboard → Deployments → Redeploy

## 📝 Catatan

- Vercel gratis untuk personal projects
- Auto HTTPS
- Auto deploy dari GitHub (jika connect)
- Custom domain bisa ditambahkan nanti


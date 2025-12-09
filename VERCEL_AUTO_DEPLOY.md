# 🚀 Setup Auto-Deploy ke Vercel

Ada 2 cara untuk auto-deploy ke Vercel:

## ✅ Cara 1: GitHub Integration (RECOMMENDED)

Ini adalah cara TERBAIK dan PALING MUDAH. Setiap kali kamu push ke GitHub, Vercel akan otomatis deploy.

### Langkah-langkah:

1. **Pastikan code sudah di GitHub:**
   ```bash
   # Commit semua perubahan
   git add .
   git commit -m "Setup auto-deploy"
   git push origin main
   ```

2. **Login ke Vercel Dashboard:**
   - Buka https://vercel.com
   - Login dengan GitHub account

3. **Import Project dari GitHub:**
   - Klik "Add New..." → "Project"
   - Pilih repository `arrvy` (atau nama repo kamu)
   - Klik "Import"

4. **Configure Project:**
   - **Root Directory:** `web` (karena project ada di folder `web`)
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (sudah otomatis)
   - **Output Directory:** `dist` (sudah otomatis)
   - **Install Command:** `npm install` (sudah otomatis)

5. **Environment Variables:**
   - Tambahkan semua env variables yang diperlukan:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_ACCESSIBLE_URL` (optional)

6. **Deploy!**
   - Klik "Deploy"
   - Vercel akan otomatis build dan deploy

### 🎉 Setelah Setup:

Setiap kali kamu:
1. Edit code di local
2. Commit: `git add . && git commit -m "Update"`
3. Push: `git push origin main`

Vercel akan **OTOMATIS**:
- Detect perubahan
- Build project
- Deploy ke production
- Update `arrvyy.vercel.app`

**Tidak perlu manual deploy lagi!** 🎊

---

## ✅ Cara 2: Vercel CLI (Alternative)

Jika tidak mau pakai GitHub, bisa pakai Vercel CLI:

### Install Vercel CLI:
```bash
npm install -g vercel
```

### Login:
```bash
vercel login
```

### Link Project:
```bash
cd web
vercel link
```

### Deploy:
```bash
# Production deploy
vercel --prod

# Preview deploy (untuk testing)
vercel
```

### Auto-deploy dengan Watch Mode:
```bash
# Install vercel-cli globally
npm install -g vercel

# Setup watch mode (akan auto-deploy setiap perubahan)
vercel dev --listen 3000
```

---

## 📝 Notes:

1. **GitHub Integration adalah cara TERBAIK** karena:
   - Auto-deploy setiap push
   - Preview deployments untuk setiap PR
   - History dan rollback mudah
   - Free untuk personal projects

2. **Root Directory:**
   - Pastikan set ke `web` karena project ada di folder `web`
   - Atau bisa pindahkan semua file ke root (tidak recommended)

3. **Environment Variables:**
   - Set di Vercel Dashboard → Project Settings → Environment Variables
   - Available untuk Production, Preview, dan Development

4. **Build Settings:**
   - Sudah ada di `web/vercel.json`
   - Vercel akan otomatis detect Vite

---

## 🔧 Troubleshooting:

### Build Error:
- Cek apakah `web/vercel.json` sudah benar
- Pastikan `package.json` ada di folder `web`
- Cek build logs di Vercel Dashboard

### Environment Variables tidak ter-load:
- Pastikan sudah set di Vercel Dashboard
- Restart deployment setelah add env vars

### Root Directory Error:
- Set Root Directory ke `web` di Vercel Project Settings

---

## 🎯 Quick Start (Recommended):

1. **Commit & Push ke GitHub:**
   ```bash
   git add .
   git commit -m "Setup for auto-deploy"
   git push origin main
   ```

2. **Import ke Vercel:**
   - Login ke https://vercel.com
   - Import project dari GitHub
   - Set Root Directory: `web`
   - Add Environment Variables
   - Deploy!

3. **Done!** Setiap push akan auto-deploy 🚀


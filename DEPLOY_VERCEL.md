# 🚀 Deploy ke Vercel - Panduan Lengkap

Repository: `https://github.com/Acheronnnn/arrvyy.git`

## ⚡ Setup Cepat (5 Menit)

### 1. Login & Import Project
- Buka [vercel.com](https://vercel.com) → Login dengan GitHub
- Klik **"Add New..."** → **"Project"**
- Pilih repository: **`Acheronnnn/arrvyy`**
- Klik **"Import"**

### 2. Konfigurasi Project
- **Root Directory**: `web` ⚠️ **PENTING!**
- **Framework**: Vite (otomatis terdeteksi)
- **Build Command**: `npm run build` (otomatis)
- **Output Directory**: `dist` (otomatis)

### 3. Environment Variables
Tambahkan di halaman import atau Settings → Environment Variables:

```
VITE_SUPABASE_URL = [URL Supabase Anda]
VITE_SUPABASE_ANON_KEY = [Anon Key Supabase Anda]
```

✅ Centang: **Production**, **Preview**, **Development**

### 4. Deploy
- Klik **"Deploy"**
- Tunggu build selesai (~2-3 menit)
- Aplikasi live di: `https://arrvyy.vercel.app` (atau nama yang diberikan Vercel)

## ✅ Setelah Deploy Pertama

### Update Supabase Redirect URLs
1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Tambahkan di **Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/auth/callback
   ```
3. Set **Site URL**: `https://your-app.vercel.app`
4. Klik **Save**

## 🔄 Auto Deploy (Sudah Aktif!)

⚠️ **PENTING**: Vercel hanya deploy dari GitHub, bukan dari file lokal!

**Workflow:**
1. Edit file di lokal
2. **Commit & Push ke GitHub** (WAJIB!)
3. Vercel detect perubahan di GitHub
4. Vercel auto deploy

```powershell
# Setelah edit file, selalu lakukan ini:
git add .
git commit -m "Update feature"
git push origin main
```

Setelah push, cek Vercel Dashboard → Deployments → Akan muncul deployment baru otomatis! 🎉

## 📋 Commit File yang Perlu

Pastikan file berikut sudah di-commit sebelum deploy:

```powershell
# Commit file konfigurasi
git add web/vercel.json
git add web/.vercelignore
git add web/package.json
git add web/vite.config.ts
git add .

# Commit dan push
git commit -m "Setup Vercel deployment"
git push origin main
```

## 🐛 Troubleshooting

### Build Gagal
- Cek build logs di Vercel Dashboard
- Test build lokal: `cd web && npm run build`
- Pastikan tidak ada error TypeScript

### Environment Variables Tidak Terdeteksi
- Pastikan nama dimulai dengan `VITE_` (contoh: `VITE_SUPABASE_URL`)
- Re-deploy setelah menambah environment variables

### Routing Error (404)
- Pastikan `web/vercel.json` sudah di-commit
- File sudah ada dengan konfigurasi rewrites yang benar

### Supabase Connection Error
- Double-check environment variables di Vercel
- Update Supabase redirect URLs dengan URL Vercel yang benar

## 📊 Monitoring

- **Deployments**: Vercel Dashboard → Project → Deployments
- **Logs**: Klik deployment → View Function Logs
- **Rollback**: Deployments → Pilih deployment → Menu (⋯) → Promote to Production

## 🎯 Tips

1. **Preview Deployments**: Push ke branch selain `main` akan create preview URL untuk testing
2. **Skip Deploy**: Tambahkan `[vercel skip]` di commit message untuk skip deployment
3. **Custom Domain**: Settings → Domains untuk tambahkan custom domain

---

**Selesai!** Setiap push ke `main` akan otomatis deploy ke production. 🎉

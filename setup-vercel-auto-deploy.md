# 🚀 Quick Setup Auto-Deploy ke Vercel

## ✅ Langkah-langkah (5 menit):

### 1. Commit & Push Code ke GitHub
```bash
git add .
git commit -m "Setup auto-deploy to Vercel"
git push origin main
```

### 2. Setup di Vercel Dashboard

1. **Buka Vercel:**
   - Login ke https://vercel.com
   - Pastikan login dengan GitHub account yang sama

2. **Import Project:**
   - Klik **"Add New..."** → **"Project"**
   - Pilih repository: **`Acheronnnn/arrvyy`**
   - Klik **"Import"**

3. **Configure Project Settings:**
   
   ⚠️ **PENTING:** Set Root Directory ke `web`
   
   - **Root Directory:** `web` ← **INI PENTING!**
   - **Framework Preset:** Vite (auto-detect)
   - **Build Command:** `npm run build` (auto)
   - **Output Directory:** `dist` (auto)
   - **Install Command:** `npm install` (auto)

4. **Environment Variables:**
   
   Klik **"Environment Variables"** dan tambahkan:
   
   ```
   VITE_SUPABASE_URL = [your-supabase-url]
   VITE_SUPABASE_ANON_KEY = [your-supabase-anon-key]
   VITE_ACCESSIBLE_URL = https://arrvyy.vercel.app (optional)
   ```
   
   - Set untuk: **Production**, **Preview**, **Development**

5. **Deploy!**
   - Klik **"Deploy"**
   - Tunggu build selesai (2-3 menit)
   - Done! 🎉

---

## 🎯 Setelah Setup:

### Workflow Baru:

1. **Edit code di local** (seperti biasa)
2. **Commit:**
   ```bash
   git add .
   git commit -m "Update feature"
   ```
3. **Push:**
   ```bash
   git push origin main
   ```
4. **Vercel OTOMATIS:**
   - ✅ Detect perubahan
   - ✅ Build project
   - ✅ Deploy ke production
   - ✅ Update `arrvyy.vercel.app`

**Tidak perlu manual deploy lagi!** 🚀

---

## 📋 Checklist Setup:

- [ ] Code sudah di GitHub
- [ ] Login ke Vercel dengan GitHub
- [ ] Import project dari GitHub
- [ ] Set Root Directory: `web`
- [ ] Add Environment Variables
- [ ] Deploy pertama kali
- [ ] Test auto-deploy dengan push baru

---

## 🔧 Troubleshooting:

### Build Error: "Cannot find module"
- Pastikan Root Directory set ke `web`
- Cek apakah `package.json` ada di folder `web`

### Environment Variables tidak ter-load
- Pastikan sudah set di Vercel Dashboard
- Restart deployment setelah add env vars
- Cek apakah nama variable benar (harus `VITE_` prefix)

### Deploy tidak otomatis
- Cek GitHub connection di Vercel
- Pastikan push ke branch `main` (atau branch yang di-set di Vercel)
- Cek deployment logs di Vercel Dashboard

---

## 💡 Tips:

1. **Preview Deployments:**
   - Setiap PR akan dapat preview URL
   - Test sebelum merge ke main

2. **Deployment History:**
   - Bisa rollback ke deployment sebelumnya
   - Lihat di Vercel Dashboard → Deployments

3. **Build Logs:**
   - Cek build logs jika ada error
   - Vercel akan show error detail

---

## 🎊 Done!

Setelah setup, setiap `git push` akan otomatis deploy ke production!

**Tidak perlu manual deploy lagi!** 🚀


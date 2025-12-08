# Setup GitHub untuk Deploy Vercel

## 🚀 Quick Setup

### 1. Buat Repository di GitHub

1. Buka [github.com/new](https://github.com/new)
2. Repository name: `arrvyy`
3. Description: (opsional) "LDR Chat App"
4. Public atau Private (terserah)
5. JANGAN centang "Initialize with README"
6. Klik "Create repository"

### 2. Push Project ke GitHub

Setelah repository dibuat, GitHub akan kasih command. Atau jalankan ini:

```bash
cd D:\Project\arrvy

# Jika belum init git
git init
git branch -M main

# Add files (node_modules & dist sudah di-ignore)
git add .
git commit -m "Initial commit: Arrvyy LDR App"

# Ganti USERNAME dengan username GitHub kamu
git remote add origin https://github.com/USERNAME/arrvyy.git
git push -u origin main
```

### 3. Deploy di Vercel

1. Buka [vercel.com](https://vercel.com)
2. Klik "Add New Project"
3. Pilih "Import Git Repository"
4. Pilih repository `arrvyy`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. **Environment Variables**:
   - `VITE_SUPABASE_URL` = `https://ulqaphcmmvimdhqtufle.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (anon key kamu)
7. Klik "Deploy"

### 4. Update Supabase Redirect URLs

Setelah deploy, dapatkan URL Vercel (contoh: `arrvyy.vercel.app`)

1. Supabase Dashboard → Authentication → URL Configuration
2. Tambahkan:
   - `https://arrvyy.vercel.app/chat`
   - `https://arrvyy.vercel.app/auth/callback`
3. Save

## ✅ Selesai!

Aplikasi bisa diakses dari mana saja!

---

**Note**: File besar (node_modules, dist) sudah di-ignore, jadi tidak akan di-commit ke GitHub.


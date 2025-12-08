# Git Setup Commands - Copy & Paste

## Step 1: Setup Git Config (Jalankan sekali saja)

Ganti EMAIL dan NAMA dengan data kamu:

```bash
git config --global user.email "EMAIL_KAMU@example.com"
git config --global user.name "NAMA_KAMU"
```

Contoh:
```bash
git config --global user.email "aceron@gmail.com"
git config --global user.name "Acheronnnn"
```

## Step 2: Setup Repository

```bash
cd D:\Project\arrvy
git init
git add .
git commit -m "Initial commit: Arrvyy LDR App"
git branch -M main
```

## Step 3: Buat Repository di GitHub

1. Buka https://github.com/new
2. Repository name: `arrvyy`
3. Jangan centang "Initialize with README"
4. Klik "Create repository"

## Step 4: Push ke GitHub

**GANTI USERNAME dengan username GitHub kamu:**

```bash
git remote add origin https://github.com/USERNAME/arrvyy.git
git push -u origin main
```

Contoh jika username kamu "Acheronnnn":
```bash
git remote add origin https://github.com/Acheronnnn/arrvyy.git
git push -u origin main
```

## ✅ Selesai!

Setelah ini, repository sudah ada di GitHub dan bisa di-deploy di Vercel!


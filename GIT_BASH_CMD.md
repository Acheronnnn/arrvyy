# Setup Git dengan Git Bash atau Git CMD

## 🖥️ Opsi 1: Git Bash (Recommended)

### Cara Buka:
- Klik kanan di folder `D:\Project\arrvy`
- Pilih "Git Bash Here"

### Command (Copy & Paste):

```bash
# 1. Setup Git Config (ganti EMAIL & NAMA)
git config --global user.email "EMAIL_KAMU@example.com"
git config --global user.name "NAMA_KAMU"

# 2. Setup Repository
git init
git add .
git commit -m "Initial commit: Arrvyy LDR App"
git branch -M main

# 3. Buat repo di GitHub dulu: https://github.com/new
#    Name: arrvyy
#    Jangan centang "Initialize with README"

# 4. Push ke GitHub (GANTI USERNAME)
git remote add origin https://github.com/USERNAME/arrvyy.git
git push -u origin main
```

---

## 💻 Opsi 2: Git CMD

### Cara Buka:
- Klik kanan di folder `D:\Project\arrvy`
- Pilih "Git CMD Here"

### Command (Copy & Paste):

```cmd
REM 1. Setup Git Config (ganti EMAIL & NAMA)
git config --global user.email "EMAIL_KAMU@example.com"
git config --global user.name "NAMA_KAMU"

REM 2. Setup Repository
git init
git add .
git commit -m "Initial commit: Arrvyy LDR App"
git branch -M main

REM 3. Buat repo di GitHub dulu: https://github.com/new
REM    Name: arrvyy
REM    Jangan centang "Initialize with README"

REM 4. Push ke GitHub (GANTI USERNAME)
git remote add origin https://github.com/USERNAME/arrvyy.git
git push -u origin main
```

---

## 📝 Contoh Lengkap

### Git Bash:
```bash
git config --global user.email "aceron@gmail.com"
git config --global user.name "Acheronnnn"
git init
git add .
git commit -m "Initial commit: Arrvyy LDR App"
git branch -M main
git remote add origin https://github.com/Acheronnnn/arrvyy.git
git push -u origin main
```

### Git CMD:
```cmd
git config --global user.email "aceron@gmail.com"
git config --global user.name "Acheronnnn"
git init
git add .
git commit -m "Initial commit: Arrvyy LDR App"
git branch -M main
git remote add origin https://github.com/Acheronnnn/arrvyy.git
git push -u origin main
```

---

## ⚠️ Catatan

- **Ganti EMAIL & NAMA** dengan data kamu
- **Ganti USERNAME** dengan username GitHub kamu
- **Buat repository di GitHub dulu** sebelum push
- Jika diminta login, masukkan username & password GitHub (atau token)

---

## ✅ Setelah Berhasil

1. Buka Vercel
2. Import dari GitHub repository `arrvyy`
3. Setup environment variables
4. Deploy!


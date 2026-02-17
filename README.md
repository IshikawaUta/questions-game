# 🚀 Modern Full-Stack Quiz App (Jekyll + MongoDB)

Aplikasi kuis interaktif modern dengan sistem **Serverless** menggunakan Jekyll sebagai frontend dan Netlify Functions sebagai backend. Dilengkapi dengan dashboard admin, sistem leaderboard, timer dinamis, dan kategori soal.

## ✨ Fitur Utama
- 🎨 **Modern UI:** Glassmorphism design dengan Tailwind CSS & Animate.css.
- 🕒 **Dynamic Timer:** Waktu mundur yang dapat diatur per soal.
- 🏆 **Leaderboard:** Papan peringkat Top 10 dari database MongoDB.
- 🔐 **Admin Dashboard:** Kelola soal (CRUD) langsung dari website.
- 📂 **Kategori:** Pilih topik kuis sesuai keinginan.
- 📝 **Review Soal:** Lihat pembahasan jawaban benar/salah setelah kuis selesai.
- 🛡️ **Netlify Identity:** Proteksi akses admin dan identitas player.

---

## 🛠️ Persiapan Lingkungan (Setup)

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- [Ruby & Jekyll](https://jekyllrb.com/docs/installation/)
- [Node.js](https://nodejs.org/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`npm install netlify-cli -g`)

### 2. Database (MongoDB Atlas)
1. Buat klaster gratis di [MongoDB Atlas](https://www.mongodb.com/).
2. Buat database bernama `quiz_db`.
3. Buat dua collection: `questions` dan `leaderboard`.
4. Dapatkan **Connection String (URI)** Anda.

---

## 🚀 Instalasi Lokal

1. **Clone repositori ini:**
```bash
   git clone https://github.com/IshikawaUta/questions-game.git
   cd questions-game

```

2. **Instal dependensi Node.js:**

```bash
npm install

```


3. **Konfigurasi Environment:**
Buat file `.env` di akar folder dan masukkan URI MongoDB Anda:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority

```


4. **Jalankan secara lokal:**
Gunakan Netlify CLI untuk menjalankan Frontend dan Backend sekaligus:
```bash
netlify dev

```


Buka `http://localhost:8888` di browser Anda.

---

## ☁️ Deployment ke Netlify

1. **Push kode ke GitHub.**
2. **Hubungkan Repo ke Netlify:**
* Masuk ke dashboard Netlify > *Add new site* > *Import from Git*.


3. **Atur Environment Variables:**
* Di Netlify Dashboard: *Site Settings* > *Build & Deploy* > *Environment*.
* Tambahkan `MONGODB_URI` dengan nilai dari Atlas Anda.


4. **Aktifkan Netlify Identity:**
* Masuk ke tab *Identity* > *Enable Identity*.
* (Opsional) Di *Settings > Registration*, set ke *Invite Only* jika admin hanya Anda sendiri.


5. **Selesai!** Situs akan otomatis ter-deploy.

---

## 📂 Struktur Folder

* `/admin` : Halaman dashboard pengelolaan soal.
* `/assets` : File CSS (Glassmorphism) dan JS (Logika kuis).
* `/functions` : API Serverless (Backend) untuk MongoDB.
* `_layouts` : Template utama Jekyll.

---

## 🤝 Kontribusi

Silakan fork proyek ini dan kirimkan Pull Request jika ingin menambahkan fitur baru seperti sistem level, badge, atau integrasi suara!
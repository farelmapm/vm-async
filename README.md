## Setup

Masuk ke folder \backend dan jalankan command berikut:
```bash
pip install -r requirements.txt
```

Lalu jalankan server dengan command:
```bash
uvicorn main:app --reload
```

Buka terminal baru dan jalankan command berikut pada \frontend:
```bash
npm install
```

Lalu jalankan server dengan command:
```bash
npm run dev
```

Akses frontend pada URL localhost:3000.

## Instance

Ketika mengakses localhost:3000, server frontend akan mengambil ID instance random dari backend melalui endpoint localhost:3000/api/vm. ID instance akan disimpan pada cookie browser. Untuk mengakses instance VM yang sebelumnya telah didapatkan, simpan ID pada cookie dan kirim ID dalam cookie untuk mendapatkan instance yang sama.

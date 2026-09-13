# Ubah Delivero menjadi POS Cashier F&B (1 akun, akses penuh)

## Prinsip
- Tampilan tidak diubah: warna ungu-kuning, search bar, banner, chip kategori beremoji, grid Popular Dishes, bottom nav (Home/Order/Saved/History/Wallet), sidebar (Dashboard/Food Order/Favorites/Order History/Bills & Wallet/Settings) tetap sama persis. Yang berubah hanya **isi datanya** (dari database) dan **fungsi di baliknya**.
- Hanya 1 jenis akun. Siapa pun yang login punya akses penuh ke semua modul. Tabel peran lama (customer/kasir/driver/admin) tidak dipakai lagi untuk membatasi apa pun; PIN operator hanya dicatat untuk jejak audit.
- Tidak ada data contoh. Semua angka, menu, pesanan, stok, dan grafik dibaca langsung dari database dan ikut berubah otomatis (realtime).
- Perbaiki dulu error yang sekarang muncul di preview (halaman masih memanggil daftar menu contoh `dishes` yang sudah dihapus).

## Urutan pengerjaan (bertahap, sesuai prioritas Anda)

### Tahap 1 — Fondasi + POS Kasir (dikerjakan sekarang)
1. **Login & sesi staf**
   - Halaman `/auth` (email + kata sandi). Semua halaman lain wajib login.
   - PIN operator: daftar operator (nama + PIN 4-6 digit) di Settings; tombol "Ganti Operator" di sidebar (menggantikan blok "Samantha Doe" dengan nama operator aktif, desain sama).
   - Shift: buka/tutup shift (kas awal, kas akhir, selisih). Semua transaksi tercatat memakai operator + shift aktif.
2. **Katalog dari database (UI sama)**
   - Home & Food Order: chip kategori + emoji diambil dari tabel kategori (desain chip tidak berubah), kartu menu memakai kartu yang sama (nama, gambar, harga Rp, rating, stok). Menu stok 0 otomatis "Sold out".
   - Detail menu, Favorit (Saved) tetap berjalan dengan menu database.
3. **POS / Kasir di halaman Checkout (Order)**
   - Tipe order: dine-in (pilih meja), takeaway, delivery.
   - Item custom: catatan, level pedas, topping/varian tambahan dengan harga.
   - Hold order (simpan tanpa bayar) & lanjutkan nanti; split bill sederhana (bagi rata / per item); gabung order antar meja.
   - Pembayaran multi-metode: tunai (hitung kembalian), QRIS, e-wallet, kartu, dan split payment (kombinasi).
   - Void/refund dengan alasan (tercatat di audit).
   - Struk digital (halaman struk siap cetak / bagikan tautan WhatsApp).
4. **Riwayat (History)** = daftar semua transaksi realtime, filter tanggal/status/metode bayar, buka detail & struk.
5. **Bills & Wallet** = ringkasan tagihan belum lunas (order hold/belum bayar), rekap setoran per metode pembayaran hari ini, dan saldo kas shift aktif.

### Tahap 2 — Kitchen Display (KDS)
- Halaman `/kds` (link baru di sidebar, gaya item nav sama): kartu order realtime, status Baru → Dimasak → Siap → Disajikan, timer per order, bunyi notifikasi saat order baru, pemisahan stasiun (Dapur / Bar) berdasarkan kategori menu.

### Tahap 3 — Inventory
- Bahan baku, resep per menu (bahan + takaran), pemotongan stok otomatis saat transaksi lunas, batas stok minimum + peringatan, stock opname, purchase order supplier, laporan HPP/food cost.

### Tahap 4 — Dashboard (Home) realtime
- Banner promo tetap, tetapi kartu di bawahnya berisi: omzet hari ini/minggu/bulan, grafik tren penjualan (filter tanggal), menu terlaris, jumlah transaksi & shift aktif, antrian dapur, peringatan stok kritis. Panel kanan (saldo/alamat/recent order) diisi kas shift, outlet aktif, dan transaksi terakhir.

### Tahap 5 — CRM, Meja, Self-Order
- Data pelanggan, poin loyalitas & tier, voucher/promo.
- Denah meja + status meja + reservasi, QR per meja untuk pesan mandiri (halaman publik `/m/:kode-meja`) yang langsung masuk ke kasir & KDS, pelacakan status untuk pelanggan.

### Tahap 6 — Sisanya
- Laporan & ekspor Excel/PDF, laporan per shift/operator/pajak/service charge, staf & absensi & komisi, multi-outlet (struktur data sudah disiapkan sejak Tahap 1), pusat notifikasi (lonceng), integrasi Midtrans/Xendit & WhatsApp, marketplace (GoFood/Grab/Shopee butuh akses API merchant resmi — akan diminta saat tiba), mode offline (antrian transaksi lokal + sinkron otomatis), integrasi perangkat (printer thermal via cetak browser/Bluetooth, cash drawer, barcode), backup terjadwal & audit trail lengkap.

## Detail teknis (untuk referensi)
- **Database (migrasi baru, tanpa menghapus data lama):** `outlets`, `operators` (nama, PIN hash), `shifts`, `tables`, `orders` ditambah kolom `outlet_id`, `operator_id`, `shift_id`, `order_type`, `table_id`, `held`, `service_charge`, `tax`, `discount`; `order_items` ditambah `modifiers` (jsonb) & `note`; `payments` (multi pembayaran per order); `product_variants`, `product_modifiers`; `ingredients`, `recipes`, `stock_movements`, `purchase_orders`, `suppliers`; `customers`, `loyalty_points`, `vouchers`; `audit_logs`, `notifications`; `kds_tickets`. Semua tabel diberi GRANT + RLS "semua pengguna login boleh baca/tulis" (karena 1 jenis akun), ditambah realtime publication.
- **Fungsi server aman (createServerFn + requireSupabaseAuth):** buat/hold/bayar/void order, pemotongan stok atomik lewat fungsi SQL, buka/tutup shift, verifikasi PIN operator, ubah status KDS. Setiap aksi menulis `audit_logs` (operator, shift, waktu, sebelum/sesudah).
- **Frontend:** hook `useAuth`, `useOperator`, `useRealtimeTable`; query lewat TanStack Query + channel realtime Supabase; komponen kartu/chip/nav yang ada dipakai ulang tanpa perubahan kelas CSS. Halaman baru (`/auth`, `/kds`, `/inventory`, `/tables`, `/customers`, `/reports`, `/staff`) mengikuti gaya header & kartu yang sama.
- **Fungsi lama:** `payment.functions.ts` (QRIS numerik) dan alur delivery RajaOngkir dipindah menjadi opsi "delivery" di POS; ongkir tetap dapat dihitung bila API key tersedia.
- Tahap 1 menyelesaikan seluruh error build saat ini dan langsung membuat preview hidup dengan data asli.

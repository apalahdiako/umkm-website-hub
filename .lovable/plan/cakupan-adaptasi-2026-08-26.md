Repositori GitHub publik `apalahdiako/WEBSITEUMKM` adalah aplikasi food-ordering UMKM berbasis Vite + React + Tailwind v4 + shadcn/ui yang di-generate dari Figma. Stack-nya mirip dengan project Lovable ini (TanStack Start, Vite, React, Tailwind v4, shadcn/ui), tapi Lovable **tidak mendukung import otomatis repo GitHub yang sudah ada**.

Solusinya: mengadaptasi/membuat ulang aplikasi tersebut secara manual di project ini, memindahkan komponen, halaman, data, dan styling yang relevan ke struktur TanStack Start.

### Cakupan adaptasi
1. **Design system**: tambahkan token warna ungu utama `#1c075c` dan aksen kuning `#ffe51c`, serta font Space Grotesk ke `src/styles.css`.
2. **Halaman utama**: ganti placeholder `src/routes/index.tsx` dengan dashboard food-ordering yang menampilkan kategori, promo banner, dan popular dishes.
3. **Komponen inti**: adaptasi `FoodCard`, `Sidebar`, `BottomNav` ke project ini.
4. **State lokal**: cart, favorites, selected dish, dan navigasi halaman menggunakan internal state (mirip aslinya) agar semua halaman bisa berjalan tanpa backend.
5. **Halaman tambahan**: adaptasi `OrderPage`, `DetailPage`, `FavoritesPage`, `CheckoutPage`, dan `WalletPage` sebagai route-route terpisah di TanStack Router.
6. **Assets**: gunakan gambar Unsplash yang sama dari repo asli untuk menjaga tampilan.

### Yang tidak masuk dalam tahap pertama
- Integrasi backend/database/order nyata (memerlukan Lovable Cloud dan perancangan lebih lanjut).
- Halaman `HistoryPage`, `TrackingPage`, dan `SettingsPage` bisa ditambahkan jika diperlukan setelah tahap pertama selesai.

### Hasil akhir yang diharapkan
Preview project menampilkan aplikasi food-ordering UMKK dengan navigasi dashboard, menu, detail produk, favorit, checkout, dan dompet yang mirip dengan repo asli.

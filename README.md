# KelanaAI

AI-powered Travel Planner

## Session 1
   
Building the First Feature of KelanaAI:

- [x] Pengaturan Proyek & Struktur Folder
- [x] Implementasi Fitur Utama (backend/main.py)
  - [x] Input interaktif
  - [x] Fungsi & Formatting
- [x] Git & Release Management

Additionals Features:

- [x] Cost Breakdown
- [x] Country, Currency, and Month of Travel

## Session 2
   
Making KelanaAI Smarter:

- [x] Modularisasi Arsitektur (`backend/services/trip_service.py`)
  - [x] Kategori Perjalanan (`get_trip_category`)
  - [x] Kategori Season (`get_travel_season`)
  - [x] Kalkulasi Anggaran Harian (`calculate_daily_budget`)
  - [x] Rekomendasi Tempat
- [x] Implementasi Presentation Layer (`backend/main.py`)
- [x] Git & Version Control

Additionals Features:

- [x] Recommended Transportation
- [x] Travel Season recommendation
- [x] Multiple Destinations

## Session 3
   
Teaching KelanaAI to Communicate (REST Services with FastAPI):

- [x] Persiapan Environment & Install Dependensi
  - [x] Install FastAPI framework
  - [x] Install ASGI Uvicorn
- [x] Implementasi Schema & REST API (`backend/main.py`)
  - [x] Pydantic Model (`TripRequest`)
  - [x] Endpoint 1: `GET /`
    - [x] Menampilkan teks sambutan JSON `{"message": "Welcome to KelanaAI"}`.
  - [x] Endpoint 2: `GET /health`
    - [x] Menampilkan status health check JSON `{"status": "OK"}`.
  - [x] Endpoint 3: `POST /api/v1/trips`
    - [x] Menerima JSON request berbasis `TripRequest`.
    - [x] Import dan panggil fungsi `calculate_daily_budget()` and`get_trip_category()` dari `services/trip_service.py`.
    - [x] Mengembalikan JSON response berisi rincian destinasi, anggaran, anggaran harian, dan kategori.
- [x] Pengujian via Swagger UI & Release Management
  - [x] Jalankan server lokal dengan `uvicorn`
  - [x] Buka dokumentasi interaktif Swagger UI di http://localhost:8000/docs
  - [x] Uji seluruh endpoint.

Additionals Features:

- [x] Response with recommended transportation
- [x] Trip categories endpoint (GET /api/v1/trip-categories`)
- [x] Recomended Places endpoint (GET /api/v1/recommendations`)
- [x] Transportations endpoint (GET /api/v1/transportations`)

## Session 4
   
Teaching KelanaAI to Remember:

- [x] Add new dependencies
  - [x] SQLAlchemy
  - [x] psycopg2-binary
  - [x] python-dotenv
- [x] Implementasi database connection dan model
  - [x] Buat logic untuk koneksi dan initialisasi database (`database.py`)
  - [x] Buat model sebagai representasi tabel `trips` (`models/trip.py`)
- [x] Add and update endpoint Get & Post (backend/main.py)
  - [x] Endpoint 1: `GET /api/v1/trips/`
    - [x] Return semua trip dari database.
  - [x] Endpoint 1: `GET /api/v1/trips/{id}`
    - [x] Return trip berdasarkan trip identifier (ID) dari database.
  - [x] Endpoint 3: `POST /api/v1/trips`
    - [x] Buat trip baru dan simpan di database.
- [x] Pengujian via Swagger UI
  - [x] Jalankan server lokal dengan `uvicorn`
  - [x] Buka Swagger UI di http://localhost:8000/docs.
  - [x] Uji endpoint `PUT` dan `DELETE` untuk memastikan data di dalam PostgreSQL benar-benar diperbarui dan terhapus.

Additionals Features:

- [x] Tambahkan endpoint Update & Delete (backend/main.py)
  - [x] Endpoint 1: `PUT /api/v1/trips/{id}`
    - [x] Memperbarui data anggaran (budget) untuk trip tertentu berdasarkan ID.
    - [x] Menghitung ulang (recalculate) nilai category dan daily_budget berdasarkan input budget yang baru.
  - [x] Endpoint 2: `DELETE /api/v1/trips/{id}`
    - [x] Menghapus data perjalanan (trip) dari database berdasarkan ID.
    - [x] Jika ID yang dikirim tidak ditemukan di database, pastikan endpoint mengembalikan status kode `HTTP 404` (Not Found).

## Session 5
   
Teaching KelanaAI to Think with AI:

- [x] Add new dependencies
  - [x] boto3
- [x] Integration with Amazon Bedrock
  - [x] Add Bearer token, region and model configuration
  - [x] Implement Bedrock Runtime client and service (`backend/services/bedrock_service.py`)
- [x] Membuat Richer AI Prompt (`backend/services/bedrock_service.py`) 
  - [x] Improve prompt yang dikirimkan ke Amazon, instruksikan AI untuk menghasilkan rencana harian (structured daily plan) dengan kriteria wajib berikut:
    - [x] Morning activities: Minta AI untuk secara spesifik memberikan 2-3 aktivitas pagi per harinya.
    - [x] Afternoon activities: Instruksikan AI untuk memasukkan rekomendasi situs budaya (cultural sites) dan pengalaman lokal.
    - [x] Evening activities: Tambahkan saran tempat makan malam (dinner spots) dan hiburan malam (nightlife).
- [x] Menyimpan Rekomendasi AI ke PostgreSQL (Persistence Layer)
  - [x] Menambahkan kolom `ai_recommendation = Column(Text, nullable=True)` pada model database (`models/trip.py`).
  - [x] Menyimpan rencana perjalanan dari AI yang sudah diperkaya (improved response) ke dalam kolom `ai_recommendation`.
- [x] Menambahkan AI recommendation endpoint (backend/main.py)
  - [x] Endpoint: `POST /api/v1/trips/{id}/generate`
- [x] Pengujian via Swagger UI
  - [x] Jalankan server lokal dengan `uvicorn`
  - [x] Buka Swagger UI di http://localhost:8000/docs.
  - [x] Request pada endpoint `POST /api/v1/trips/{id}/generate` untuk salah satu trip yang sudah ada.
  - [x] Response sukses dan rekomendasi AI yang baru berhasil tersimpan di database.

Additionals Features:

- [x] Merekam token dan execution metrics
  - [x] Menambahkan kolom `input_tokens`, `output_tokens`, `total_tokens` di database
  - [x] Menambahkan kolom `execution_time` di database
  - [x] Membaca token usage dan merekam execution time untuk setiap pemanggilan fungsi `get_ai_recommendation`.
- [x] Generate AI recommendation menggunakan background task.
- [x] Menambahkan endpoint untuk polling status background task `GET /api/v1/recommendation/{id}`

## Session 6
   
Giving KelanaAI a Face:

- [x] Create a Next.js frontend
  - [x] Create home page
  - [x] Create new travel form
  - [x] Create AI recommendation page
- [x] Improve frontend
  - [x] Better styling: Gunakan classes dari Tailwind untuk mengatur tata letak spasi (spacing), warna (colors), dan tipografi (typography).
  - [x] Destination image: Tambahkan sebuah gambar utama (hero image) untuk menampilkan destinasi di bagian atas halaman.
  - [x] Responsive layout: Pastikan halaman dapat diakses dengan baik di berbagai perangkat. 
  - [x] Uji coba tampilan pada perangkat seluler (mobile): Pastikan elemen formulir (form) menyesuaikan ukuran layar.
    - [x] Desktop: Halaman memiliki hero image besar yang menarik perhatian, teks dan spasi terlihat proporsional, formulir pencarian/input sejajar dengan rapi, dan diakhiri dengan footer informatif di bagian paling bawah.
    - [x] Mobile: Saat layar dipersempit seukuran ponsel, hero image menyesuaikan proporsi, dan kolom-kolom pada formulir tidak terpotong melainkan turun dan menyusun secara vertikal ke bawah.
  - [x] Footer Lengkapi struktur halaman web: Tambahkan sebuah footer berisi informasi hak cipta (copyright) dan tautan-tautan (links) navigasi yang diperlukan.
  - [x] Git & Version Control (Commit and push) Sesuai dengan instruksi

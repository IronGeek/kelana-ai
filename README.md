# Kelana AI

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

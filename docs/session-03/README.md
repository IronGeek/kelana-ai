# Session 3
   
Teaching KelanaAI to Communicate (REST Services with FastAPI):

## Assignments

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

- [x] Additionals Features
  - [x] Response with recommended transportation
  - [x] Trip categories endpoint (GET /api/v1/trip-categories`)
  - [x] Recomended Places endpoint (GET /api/v1/recommendations`)
  - [x] Transportations endpoint (GET /api/v1/transportations`)

## Repository

https://github.com/IronGeek/kelana-ai/commits/session-3

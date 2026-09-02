# Session 4
   
Teaching KelanaAI to Remember:

## Assignments

- [x] Add new dependencies
  - [x] SQLAlchemy
  - [x] psycopg2-binary
  - [x] python-dotenv
- [x] Implementation of database connection and model
  - [x] Create logic for database connection and initialization (`database.py`)
  - [x] Create a model as a representation of the `trips` table (`models/trip.py`)
- [x] Add and update endpoint Get & Post (backend/main.py)
  - [x] Endpoint 1: `GET /api/v1/trips/`
    - [x] Return all trips from the database.
  - [x] Endpoint 1: `GET /api/v1/trips/{id}`
    - [x] Return trip based on trip identifier (ID) from database.
  - [x] Endpoint 3: `POST /api/v1/trips`
    - [x] Create a new trip and save it in the database.
- [x] Testing via Swagger UI
  - [x] Run local server with `uvicorn`
  - [x] Open Swagger UI at `http://localhost:8000/docs`.
  - [x] Test the `PUT` and `DELETE` endpoints to ensure that data in PostgreSQL is actually updated and deleted.
- [x] Additionals Features
  - [x] Add Update & Delete endpoints (backend/main.py)
    - [x] Endpoint 1: `PUT /api/v1/trips/{id}`
      - [x] Updates budget data for a specific trip based on ID.
      - [x] Recalculate category and daily_budget values ​​based on new budget input.
    - [x] Endpoint 2: `DELETE /api/v1/trips/{id}`
      - [x] Delete trip data from the database based on ID.
      - [x] If the submitted ID is not found in the database, ensure the endpoint returns a status code of `HTTP 404` (Not Found).

## Repository

https://github.com/IronGeek/kelana-ai/commits/session-4

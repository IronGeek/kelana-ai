from typing import Optional

from fastapi import (
    FastAPI,
    HTTPException
)
from pydantic import BaseModel
from services.trip_service import (
    calculate_daily_budget,
    get_recommended_places,
    get_recommended_transport,
    get_recommended_transports,
    get_trip_category,
    get_trip_categories
)
from models.trip import Trip
from database import (
    SessionLocal,
    init_db
)

class TripRequest(BaseModel):
    destination:    str
    days:           int
    budget:         float

app = FastAPI()

init_db()

# a GET endpoint at the root path
@app.get("/")
def home():
    return {
        "message": "Welcome to KelanaAI"
    }

@app.get("/health")
def health():
    return {
        "status": "OK"
    }

@app.get("/api/v1/trip-categories")
def categories():
    return get_trip_categories()

@app.get("/api/v1/recommendations")
@app.get("/api/v1/recommendations/{destination}")
def recommendations(destination: Optional[str] = None):
    return get_recommended_places(destination)

@app.get("/api/v1/transportations")
def categories():
    return get_recommended_transports()

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()

    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    try:
        trip = db.get(Trip, trip_id)

        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

        return trip
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=f"Failed to get Trip with id {trip_id}")
    finally:
        db.close()

@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(
        request.budget, request.days
    )
    category = get_trip_category(
        request.budget
    )
    transport = get_recommended_transport(
        category
    )

    trip = Trip(
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        category     = category,
        daily_budget = daily_budget,
        transport    = transport
    )

    db = SessionLocal()
    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)

        return trip
    except Exception:
        raise HTTPException(status_code=500, detail=f"Failed to create Trip")
    finally:
        db.close()


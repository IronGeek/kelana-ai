import logging

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    status
)

from services.trip_service import (
    TripRequest,
    TripUpdate,
    get_recommended_places,
    get_recommended_transports,
    get_trip_categories,
    update_trip_details,
    update_recommendation
)
from models.trip import Trip
from sqlalchemy.orm import Session
from database import (
    init_db,
    get_db
)

app = FastAPI()
logger = logging.getLogger("app_logger")

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
def recommendations(destination: str | None = None):
    return get_recommended_places(destination)

@app.get("/api/v1/transportations")
def categories():
    return get_recommended_transports()

@app.get("/api/v1/trips", status_code= status.HTTP_200_OK)
def list_trips(db: Session = Depends(get_db)):
    return db.query(Trip).all()

@app.post("/api/v1/trips", status_code= status.HTTP_201_CREATED)
def create_trip(request: TripRequest, db: Session = Depends(get_db)):
    try:
        trip = Trip(
            destination       = request.destination,
            days              = request.days,
            budget            = request.budget,
            travel_style      = request.travel_style
        )
        update_trip_details(trip)

        db.add(trip)
        db.commit()
        db.refresh(trip)

        return trip
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create Trip")

@app.get("/api/v1/trips/{trip_id}", status_code= status.HTTP_200_OK)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    try:
        trip = db.get(Trip, trip_id)

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        return trip
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get Trip with id {trip_id}")

@app.put("/api/v1/trips/{trip_id}", status_code= status.HTTP_200_OK)
def update_trip(trip_id: int, payload: TripUpdate, db: Session = Depends(get_db)):
    try:
        trip = db.get(Trip, trip_id)

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        # update new trip data
        update = payload.model_dump(exclude_unset=True)
        for key, value in update.items():
            setattr(trip, key, value)

        # recalculate details based on updated trip
        update_trip_details(trip)

        # update recommendation if it's already set
        if not trip.ai_recommendation is None:
            update_recommendation(trip)

        db.commit()
        db.refresh(trip)

        return trip
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update Trip with id {trip_id}")

@app.delete("/api/v1/trips/{trip_id}", status_code= status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    try:
        trip = db.get(Trip, trip_id)

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        db.delete(trip)
        db.commit()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete Trip with id {trip_id}")

@app.post("/api/v1/trips/{trip_id}/generate", status_code= status.HTTP_200_OK)
def generate_trip(trip_id: int, db: Session = Depends(get_db)):
    try:
        trip = db.get(Trip, trip_id)

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        update_recommendation(trip)

        db.commit()
        db.refresh(trip)

        return trip
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate Trip recommendation with id {trip_id}")

from uuid import uuid4
from logging import getLogger
from time import sleep
from os import getenv

from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    HTTPException,
    status
)
from fastapi.middleware.cors import CORSMiddleware

from services.trip_service import (
    TripRequest,
    TripUpdate,
    get_recommended_places,
    get_recommended_transports,
    get_trip_categories,
    update_trip_details
)
from tasks.trip import generate_recommendation
from models.trip import Trip
from sqlalchemy.orm import Session
from database import (
    init_db,
    get_db
)

origins = [
    getenv("FRONTEND_URL")
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger = getLogger("app_logger")

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
def update_trip(trip_id: int, payload: TripUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
        if trip.ai_recommendation is None or (not trip.tracking_id is None and trip.processing):
            db.commit()
            return trip

        trip.tracking_id = str(uuid4())
        trip.processing = True
        db.commit()

        background_tasks.add_task(generate_recommendation, trip.tracking_id, trip)

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

@app.post("/api/v1/trips/{trip_id}/generate", status_code= status.HTTP_202_ACCEPTED)
def generate_trip(trip_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        trip = db.get(Trip, trip_id)

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        if not trip.tracking_id is None and trip.processing:
            return {
                "status": "processing",
                "message": "The itinerary is being processed in the background.",
                "tracking_id": trip.tracking_id
            }

        trip.tracking_id = str(uuid4())
        trip.processing = True
        db.commit()

        background_tasks.add_task(generate_recommendation, trip.tracking_id, trip)

        return {
            "status": "processing",
            "message": "The itinerary is being processed in the background.",
            "tracking_id": trip.tracking_id
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate Trip recommendation with id {trip_id}")

@app.get("/api/v1/recommendation/{tracking_id}", status_code=status.HTTP_200_OK)
async def get_recommendation_status(tracking_id: str, db: Session = Depends(get_db)):
    try:
        trip = db.query(Trip).filter(Trip.tracking_id == tracking_id).first()

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with tracking_id {tracking_id} not found")

        if trip.processing:
            return {
                "trip_id": trip.id,
                "tracking_id": tracking_id,
                "status": "processing"
            }
        elif not trip.ai_recommendation is None:
            return {
                "trip_id": trip.id,
                "tracking_id": tracking_id,
                "status": "completed",
                "recommendation": trip.ai_recommendation
            }
        else:
            return {
                "trip_id": trip.id,
                "tracking_id": tracking_id,
                "status": "failed",
            }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get recommendation status with tracking_id {tracking_id}.")

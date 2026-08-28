from uuid import UUID
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
from services.bedrock_service import (
    _determine_system_persona,
    _build_user_prompt
)
from services.trip_service import (
    TripRequest,
    TripUpdate,
    TripSearchPage,
    TripSearchRequest,
    get_recommended_transports,
    get_trip_categories,
    update_trip_details
)
from tasks.trip import generate_recommendation
from models.trip import Trip
from sqlalchemy import (
    desc,
    select,
    func,
    literal,
    any_,
    or_
)
from sqlalchemy.orm import Session
from database import (
    init_db,
    get_db
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        getenv("FRONTEND_URL")
    ],
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

@app.get("/api/v1/transportations")
def categories():
    return get_recommended_transports()

@app.get("/api/v1/trips", status_code= status.HTTP_200_OK)
def list_trips(db: Session = Depends(get_db)):
    data = db.query(Trip).all()
    total = db.scalar(select(func.count()).select_from(Trip))

    return { "data": data, "total": total }

@app.post("/api/v1/trips", status_code= status.HTTP_201_CREATED)
def create_trip(request: TripRequest, db: Session = Depends(get_db)):
    try:
        trip = Trip(
            destination       = request.destination,
            days              = request.days,
            budget            = request.budget,
            travel_style      = request.travel_style or []
        )
        update_trip_details(trip)

        db.add(trip)
        db.commit()
        db.refresh(trip)

        return trip
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create Trip")

@app.get("/api/v1/trips/{trip_id}", status_code= status.HTTP_200_OK)
def get_trip(trip_id: UUID, db: Session = Depends(get_db)):
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
def update_trip(trip_id: UUID, payload: TripUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
        if trip.recommendation is None:
            db.commit()
        elif not trip.processing:
            background_tasks.add_task(generate_recommendation, trip.id)

        return trip
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update Trip with id {trip_id}")

@app.delete("/api/v1/trips/{trip_id}", status_code= status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: UUID, db: Session = Depends(get_db)):
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
def generate_trip(trip_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        trip = db.get(Trip, trip_id)

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        if trip.processing:
            return {
                "id": trip.id,
                "processing": True,
                "message": "The itinerary is being processed in the background.",
            }

        background_tasks.add_task(generate_recommendation, trip.id)

        return {
            "id": trip.id,
            "processing": True,
            "message": "The itinerary is being processed in the background.",
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate Trip recommendation with id {trip_id}")

@app.get("/api/v1/trips/{trip_id}/status", status_code=status.HTTP_200_OK)
async def status_trip(trip_id: UUID, db: Session = Depends(get_db)):
    try:
        trip = db.get(Trip, trip_id)

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        if trip.processing:
            return {
                "id": trip.id,
                "processing": True,
                "message": "The itinerary is being processed in the background."
            }
        elif not trip.recommendation is None:
            return {
                "id": trip.id,
                "processing": False,
                "recommendation": trip.recommendation
            }
        else:
            return {
                "id": trip.id,
                "processing": False,
                "message": "The itinerary has not been processed",
            }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get trip status with id {trip_id}.")

@app.post("/api/v1/search/trips", status_code=status.HTTP_200_OK)
async def search_trip(request: TripSearchRequest, db: Session = Depends(get_db)):
    try:
        search = request.search.lower()

        query = db.query(Trip)
        logger.info(request)

        if search != "":
            if (request.filter is None or (request.filter.destination == request.filter.style)) :
                query = query.filter(or_(Trip.destination.ilike(f"%{search}%"), literal(search).ilike(any_(Trip.travel_style))))
            else:
                if (request.filter.destination):
                    query = query.filter(Trip.destination.ilike(f"%{search}%"))
                    logger.info('4')

                if (request.filter.style):
                    query = query.filter(literal(search).ilike(any_(Trip.travel_style)))
                    logger.info('5')

        print(query.statement.compile(compile_kwargs={"literal_binds": True}))

        page = TripSearchPage(index=1, size=10) if request.page is None else request.page
        offset = (page.index - 1) * page.size
        trip = query.order_by(desc(Trip.created_at)).limit(page.size).offset(offset).all()
        total = db.scalar(select(func.count()).select_from(Trip))

        return { "data": [] if trip is None else trip, "total": total }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get search trips. {e}")

@app.post("/api/v1/debug/echo", status_code= status.HTTP_200_OK)
def echo(request: TripRequest):
    try:
        trip = Trip(
            destination       = request.destination,
            days              = request.days,
            budget            = request.budget,
            travel_style      = request.travel_style or []
        )
        update_trip_details(trip)

        # simulate long running process
        sleep(5)

        return trip
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create Trip")

@app.post("/api/v1/debug/persona", status_code= status.HTTP_200_OK)
def persona(travel_style: list[str] | None):
    try:
        return _determine_system_persona(travel_style or [])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")

@app.post("/api/v1/debug/prompt", status_code= status.HTTP_200_OK)
def persona(request: TripRequest):
    try:
        return _build_user_prompt(request.destination, request.days, request.budget, request.travel_style or [])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")

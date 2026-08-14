from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel
from services.trip_service import (
    calculate_daily_budget,
    get_recommended_places,
    get_recommended_transport,
    get_recommended_transports,
    get_trip_category,
    get_trip_categories,
)

class TripRequest(BaseModel):
    destination:    str
    days:           int
    budget:         float
    travel_style:   str

app = FastAPI()

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
    return {
        "destination": request.destination,
        "days": request.days,
        "budget": request.budget,
        "daily_budget": daily_budget,
        "category": category,
        "recommended_transport": transport
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

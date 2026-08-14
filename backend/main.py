from fastapi import FastAPI
from pydantic import BaseModel
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_recommended_transport
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


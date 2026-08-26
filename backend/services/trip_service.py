from typing import (
    Literal,
    get_args
)
from pydantic import (
    BaseModel,
    Field
)
from models.trip import Trip

TripCategory = Literal["Backpacker", "Standard", "Luxury"]
TripTransport = Literal["Bus", "Train", "Flight"]

class TripRequest(BaseModel):
    destination:    str
    days:           int
    budget:         float
    travel_style:   list[str] = []

class TripUpdate(BaseModel):
    days:           int | None = None
    budget:         float | None= None
    travel_style:   list[str] | None = None

def calculate_daily_budget(budget: float, days: int) -> float:
    return budget/days

def get_trip_categories() -> list[str]:
    return list(get_args(TripCategory))

def get_trip_category(budget: float) -> TripCategory:
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_recommended_transports() -> list[str]:
    return list(get_args(TripTransport))

def get_recommended_transport(category: TripCategory) -> TripTransport:
    if category == "Backpacker":
        return "Bus"
    elif category == "Standard":
        return "Train"
    else:
        return "Flight"

def update_trip_details(trip: Trip) -> Trip:
    trip.daily_budget = calculate_daily_budget(
        trip.budget, trip.days
    )
    trip.category = get_trip_category(
        trip.budget
    )
    trip.transport = get_recommended_transport(
        trip.category
    )

    return trip

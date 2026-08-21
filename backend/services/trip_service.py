from typing import (
    Literal,
    Optional,
    get_args
)
from pydantic import (
    BaseModel,
    Field
)
from services.bedrock_service import get_ai_recommendation

# Deprecated
TripSeason = Literal["Peak", "Holiday", "Regular"]

TripCategory = Literal["Backpacker", "Standard", "Luxury"]
TripTransport = Literal["Bus", "Train", "Flight"]
TripStyle = Literal[
    "Backpacker", "Budget", "Cheap",
    "Luxury", "Premium", "High-end",
    "Family", "Kid", "Children",
    "Food", "Culinary", "Eat",
    "Standard", "Default", "Normal"
]

# Deprecated
class TripCosts:
    def __init__(self, **costs: dict[str: float]):
        self.costs = costs

    def get_total(self) -> float:
        return sum(self.costs.values())

    def get_cost_breakdown(self):
        return self.costs.items()

# Deprecated
class TripPlaces:
    defaults = [
       "City Center",
       "Local Market",
       "Popular Landmark"
    ]
    recommendations = {
        "japan": ["Tokyo", "Shibuya", "Mount Fuji"],
        "bali": ["Ubud", "Kuta Beach", "Tanah Lot"],
        "singapore": ["Marina Bay Sands", "Gardens by the Bay", "Sentosa"]
    }

    def __init__(self, destination: Optional[str]):
        self.destination = destination

    def get_recommendations(self):
        if self.destination:
            return TripPlaces.recommendations.get(self.destination.lower(), TripPlaces.defaults)

        return TripPlaces.defaults

class TripRequest(BaseModel):
    destination:    str
    days:           int
    budget:         float
    travel_style:   str

class TripUpdate(BaseModel):
    days:           int = Field(default=None, validate_default=False)
    budget:         float = Field(default=None, validate_default=False)
    travel_style:   str = Field(default=None, validate_default=False)

class TripDetails:
    def __init__(self, daily_budget: float, category: TripCategory, transport: TripTransport, recommendation: str | None = None):
        self.daily_budget   = daily_budget
        self.category       = category
        self.transport      = transport
        self.recommendation = recommendation

def calculate_daily_budget(budget: float, days: int) -> float:
    return budget/days

# Deprecated
def get_recommended_places(destination: Optional[str] = None) -> list[str]:
    return TripPlaces(destination).get_recommendations()

def get_trip_categories() -> list[str]:
    return list(get_args(TripCategory))

def get_trip_category(budget: float) -> TripCategory:
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

# Deprecated
def get_travel_season(travel_month: str) -> TripSeason:
    if travel_month == "December":
        return "Peak"
    elif travel_month == "June":
        return "Holiday"
    else:
        return "Regular"

def get_recommended_transports() -> list[str]:
    return list(get_args(TripTransport))

def get_recommended_transport(category: TripCategory) -> TripTransport:
    if category == "Backpacker":
        return "Bus"
    elif category == "Standard":
        return "Train"
    else:
        return "Flight"

def get_trip_details(request: TripRequest, with_ai_recommendation:bool=False) -> TripDetails:
    daily_budget = calculate_daily_budget(
        request.budget, request.days
    )
    category = get_trip_category(
        request.budget
    )
    transport = get_recommended_transport(
        category
    )
    recommendation = get_ai_recommendation(
        destination = request.destination,
        days = request.days,
        budget = request.budget,
        travel_style = request.travel_style,
    ) if with_ai_recommendation else None

    return TripDetails(
        daily_budget,
        category,
        transport,
        recommendation
    )

from typing import Literal

TripCategory = Literal["Backpacker", "Standard", "Luxury"]
TripSeason = Literal["Peak", "Holiday", "Regular"]
TripTransport = Literal["Bus", "Train", "Flight"]

class TripCosts:
    def __init__(self, **costs: dict[str: float]):
        self.costs = costs

    def get_total(self) -> float:
        return sum(self.costs.values())

    def get_cost_breakdown(self):
        return self.costs.items()

class TripPlaces:
    defaults = [
       "City Center",
       "Local Market",
       "Popular Landmark"
    ]
    recommendations = {
        "Japan": ["Tokyo", "Shibuya", "Mount Fuji"],
        "Bali": ["Ubud", "Kuta Beach", "Tanah Lot"],
        "Singapore": ["Marina Bay Sands", "Gardens by the Bay", "Sentosa"]
    }

    def __init__(self, destination: str):
        self.destination = destination

    def get_recommendations(self):
        return TripPlaces.recommendations.get(self.destination, TripPlaces.defaults)


def calculate_daily_budget(budget: float, days: int) -> float:
    return budget/days

def get_trip_category(budget: float) -> TripCategory:
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_travel_season(travel_month: str) -> TripSeason:
    if travel_month == "December":
        return "Peak"
    elif travel_month == "June":
        return "Holiday"
    else:
        return "Regular"

def get_recommended_transport(category: TripCategory) -> TripTransport:
    if category == "Backpacker":
        return "Bus"
    elif category == "Standard":
        return "Train"
    else:
        return "Flight"

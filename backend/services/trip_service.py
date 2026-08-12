class TravelCosts:
    def __init__(self, **costs: dict[str: float]):
        self.costs = costs

    def get_total(self):
        return sum(self.costs.values())

    def get_cost_breakdown(self):
        return self.costs.items()

class TravelPlaces:
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
        return TravelPlaces.recommendations.get(self.destination, TravelPlaces.defaults)


def calculate_daily_budget(budget, days):
    return budget/days

def get_trip_category(budget: float):
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_travel_season(travel_month: str):
    if travel_month == "December":
        return "Peak"
    elif travel_month == "June":
        return "Holiday"
    else:
        return "Regular"

def get_recommended_transport(category):
    if category == "Backpacker":
        return "Bus"
    elif category == "Standard":
        return "Train"
    else:
        return "Flight"
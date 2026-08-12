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

def get_recommended_places(destination: str):
    recommendations = {
        "Japan": ["Tokyo", "Shibuya", "Mount Fuji"],
        "Bali": ["Ubud", "Kuta Beach", "Tanah Lot"],
        "Singapore": ["Marina Bay Sands", "Gardens by the Bay", "Sentosa"]
    }

    return recommendations.get(destination, [
       "City Center", 
       "Local Market", 
       "Popular Landmark"
    ])
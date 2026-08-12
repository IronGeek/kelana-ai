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
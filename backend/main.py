from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_travel_season,
    get_recommended_places,
    get_recommended_transport
)

def print_banner(size: int = 50):
    print("=" * size)
    print("KelanaAI")
    print("=" * size)

def print_divider(size: int = 50):
    print("╌" * size)

def print_trip_summary(
    destination: str,
    country: str,
    currency: str,
    days: int,
    travel_month: str,
    budget: float,
    hotel_cost = float,
    food_cost = float,
    transport_cost = float,
    misc_cost = float
):
    total_estimated_cost = (
        hotel_cost + 
        food_cost + 
        transport_cost + 
        misc_cost
    )
    daily = calculate_daily_budget(budget, days)
    season = get_travel_season(travel_month)
    category = get_trip_category(budget)
    transport = get_recommended_transport(category)

    print(f"Destination          : {destination}")
    print(f"Country              : {country}")
    print(f"Currency             : {currency}")
    print(f"Days                 : {days}")
    print(f"Budget               : {budget:.2f} {currency}")
    print(f"Daily Budget         : {daily:.2f} {currency}/day")
    print(f"Category             : {category}")
    print(f"Travel Month         : {travel_month}")
    print(f"Season               : {season} Season")
    print(f"Transportation       : {transport}")
    print(f"Hotel Cost           : {hotel_cost}")
    print(f"Food Cost            : {food_cost}")
    print(f"Transportation Cost  : {transport_cost}")
    print(f"Miscellaneous Cost   : {misc_cost}")
    print(f"Total Estimated Cost : {total_estimated_cost}")

    if total_estimated_cost > budget:
        print(f"⚠️ Budget exceeded.")

    print()

    print("Recommended Places:")
    for place in get_recommended_places(destination):
        print(f"  - {place}")

# Examples
inputs = [
    {
        "destination": "Tokyo",
        "country": "Japan",
        "currency": "USD",
        "days": 5,
        "travel_month": "December",
        "budget": 1500,
        "hotel_cost": 900,
        "food_cost": 300,
        "transport_cost": 250,
        "misc_cost": 100
    },
    {
        "destination": "Bali",
        "country": "Indonesia",
        "currency": "USD",
        "days": 3,
        "travel_month": "October",
        "budget": 800,
        "hotel_cost": 300,
        "food_cost": 150,
        "transport_cost": 100,
        "misc_cost": 75
    },
    {
        "destination": "Cappadocia",
        "country": "Turkey",
        "currency": "USD",
        "days": 4,
        "travel_month": "November",
        "budget": 1200,
        "hotel_cost": 440,
        "food_cost": 300,
        "transport_cost": 250,
        "misc_cost": 150
    }
]

print_banner()

for input in inputs:
    print_trip_summary(
        input["destination"],
        input["country"],
        input["currency"],
        input["days"],
        input["travel_month"],
        input["budget"],
        input["hotel_cost"],
        input["food_cost"],
        input["transport_cost"],
        input["misc_cost"]
    )
    print_divider()
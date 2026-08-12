from sys import stdout
from datetime import datetime

from input import (
    ask_float,
    ask_int,
    ask_month,
    ask_str
)
from services.trip_service import (
    TravelCosts,
    TravelPlaces,
    calculate_daily_budget,
    get_trip_category,
    get_travel_season,
    get_recommended_transport
)

def print_banner(size: int = 50):    
    print("=" * size)
    print("KelanaAI")
    print("=" * size)

def print_divider(size: int = 50):
    print("╌" * size)

def print_cost_breakdown(budget: float, costs: TravelCosts, currency: str = "USD"):
    total = costs.get_total()
    
    print()
    print(f"Total Estimated Cost : {total:.2f} {currency}")

    padding = len(f"{total:.2f}")
    for item, value in costs.get_cost_breakdown():
        print(f"  - {item:<16} : {value:{padding}.2f} {currency}")

    if total > budget:
        print()
        print("  ⚠️ Budget exceeded!")
        
def print_recommended_places(places: TravelPlaces):
    print()
    print("Recommended Places:")
    for place in places.get_recommendations():
        print(f"  - {place}")

def print_trip_summary(
    destination: str,
    days: int,
    travel_month: str,
    currency: str,
    budget: float,
    hotel_cost = float,
    food_cost = float,
    transport_cost = float,
    misc_cost = float
):
    daily = calculate_daily_budget(budget, days)
    season = get_travel_season(travel_month)
    category = get_trip_category(budget)
    transport = get_recommended_transport(category)

    print(f"Destination          : {destination}")
    print(f"Currency             : {currency}")
    print(f"Days                 : {days}")
    print(f"Budget               : {budget:.2f} {currency}")
    print(f"Daily Budget         : {daily:.2f} {currency}/day")
    print(f"Category             : {category}")
    print(f"Travel Month         : {travel_month}")
    print(f"Season               : {season} Season")
    print(f"Transportation       : {transport}")

    costs = TravelCosts(
        Hotel= hotel_cost,
        Food = food_cost,
        Transporation = transport_cost,
        Miscellaneous = misc_cost
    )
    print_cost_breakdown(budget, costs, currency)

    places = TravelPlaces(destination)
    print_recommended_places(places)

print_banner()

print(f"Your destination (or press <Enter> to continue):")
destinations = []

while True:
    destination = input(f"{len(destinations) + 1}. ")

    if destination.strip() == "":
        stdout.write("\033[1A\033[K\n")
        stdout.flush()
        break

    destinations.append(destination)

inputs = []
currency = "USD"

for dest in destinations:
    print_divider()
    print(f"Trip detail for {dest.capitalize()}:")
    print_divider()

    days = ask_int("+ Duration (in days): ", "  # Invalid days! Please enter numbers only.")
    travel_month = ask_month(f"+ Travel Month (1–12): ", "  # Invalid month!")
    currency = ask_str(f"+ Currency (default: {currency}): ", "  # Invalid currency!", currency)
    budget = ask_float("+ Budget: ", "  # Invalid value!", 0.0)
    hotel_cost = ask_float("+ Hotel Cost: ", "  # Invalid value!", 0.0)
    food_cost = ask_float("+ Food Cost: ", "  # Invalid value!", 0.0)
    transport_cost = ask_float("+ Transportation Cost: ", "  # Invalid value!", 0.0)
    misc_cost = ask_float("+ Miscellaneous Cost: ", "  # Invalid value!", 0.0)

    inputs.append({
        "destination": dest.capitalize(),
        "days": days,
        "travel_month": travel_month,
        "currency": currency,
        "budget": budget,
        "hotel_cost": hotel_cost,
        "food_cost": food_cost ,
        "transport_cost": transport_cost,
        "misc_cost": misc_cost
    })
    print()


# Hard-coded examples, uncomment to enable
# inputs.append({
#     "destination": "Japan",
#     "days": 5,
#     "travel_month": "December",
#     "currency": "USD",
#     "budget": 1500,
#     "hotel_cost": 900,
#     "food_cost": 300,
#     "transport_cost": 250,
#     "misc_cost": 100
# })
# inputs.append({
#     "destination": "Bali",
#     "days": 3,
#     "travel_month": "October",
#     "currency": "USD",
#     "budget": 800,
#     "hotel_cost": 300,
#     "food_cost": 150,
#     "transport_cost": 100,
#     "misc_cost": 75
# })
# inputs.append({
#     "destination": "Turkey",
#     "days": 4,
#     "travel_month": "November",
#     "currency": "USD",
#     "budget": 1200,
#     "hotel_cost": 440,
#     "food_cost": 300,
#     "transport_cost": 250,
#     "misc_cost": 150
# })

if len(inputs) > 0:
    print_divider()
    print("Trip Summaries:")

    for input in inputs:
        print_divider()
        print_trip_summary(
            input["destination"],
            input["days"],
            input["travel_month"],
            input["currency"],
            input["budget"],
            input["hotel_cost"],
            input["food_cost"],
            input["transport_cost"],
            input["misc_cost"]
        )
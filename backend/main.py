from services.trip_service import (
    get_trip_category
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
    category = get_trip_category(budget)

    print(f"Destination          : {destination}")
    print(f"Country              : {country}")
    print(f"Currency             : {currency}")
    print(f"Days                 : {days}")
    print(f"Travel Month         : {travel_month}")
    print(f"Budget               : {budget} {currency}")
    print(f"Category             : {category}")
    print(f"Hotel Cost           : {hotel_cost}")
    print(f"Food Cost            : {food_cost}")
    print(f"Transportation Cost  : {transport_cost}")
    print(f"Miscellaneous Cost   : {misc_cost}")
    print(f"Total Estimated Cost : {total_estimated_cost}")

    if total_estimated_cost > budget:
        print(f"⚠️ Budget exceeded.")

    print()

print_banner()

# Examples
print_trip_summary("Tokyo", "Japan", "USD", 5, "December", 1500, 900, 300, 250, 100)
print_divider()
print_trip_summary("Bali", "Indonesia", "USD", 3, "October", 800, 300, 150, 100, 75)
print_divider()
print_trip_summary("Cappadocia", "Turkey", "USD", 4, "November", 1200, 440, 300, 250, 150)
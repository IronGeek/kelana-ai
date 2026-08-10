def print_trip_summary(
    destination,
    country,
    days,
    budget,
    currency,
    travel_month,
    travel_style,
    hotel_cost,
    food_cost,
    transportation_cost,
    miscellaneous_cost
):
    total_estimated_cost = (
        hotel_cost + 
        food_cost + 
        transportation_cost + 
        miscellaneous_cost
    )

    print()
    print("================================================")
    print("KelanaAI")
    print("================================================")
    print(f"Destination          : {destination}")
    print(f"Country              : {country}")
    print(f"Days                 : {days}")
    print(f"Budget               : {budget} {currency}")
    print(f"Currency             : {currency}")
    print(f"Travel Month         : {travel_month}")
    print(f"Travel Style         : {travel_style}")
    print(f"Hotel Cost           : {hotel_cost}")
    print(f"Food Cost            : {food_cost}")
    print(f"Transportation Cost  : {transportation_cost}")
    print(f"Miscellaneous Cost   : {miscellaneous_cost}")
    print(f"Total Estimated Cost : {total_estimated_cost}")

    if total_estimated_cost > budget:
        print(f"⚠️ Budget exceeded.")

    print()

print_trip_summary("Tokyo", "Japan", 5, 1500, "USD", "December", "Family", 900, 300, 250, 100)
print_trip_summary("Bali", "Indonesia", 3, 800, "USD", "October", "Backpacker", 300, 150, 100, 75)
print_trip_summary("Cappadocia", "Turkey", 4, 1200, "USD", "November", "Business", 440, 300, 250, 150)
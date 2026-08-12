def get_trip_category(budget: float):
 if budget < 1000:
   return "Backpacker"
 elif budget <= 3000:
   return "Standard"
 else:
   return "Luxury"
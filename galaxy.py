"""
Galaxy and location management for Uncharted Stars Saga
"""


class Galaxy:
    """Represents the game's galaxy with various star systems"""

    def __init__(self):
        self.current_location = "Sol System"
        self.locations = {
            "Sol System": {
                "description": "Your home system with Earth and familiar planets",
                "planets": ["Earth", "Mars", "Jupiter"]
            },
            "Alpha Centauri": {
                "description": "The nearest star system to Sol",
                "planets": ["Proxima b", "Alpha Centauri Bb"]
            }
        }
        # TODO: Add random event generation for encounters

    def display_current_location(self):
        """Display information about current location"""
        location_data = self.locations.get(self.current_location)
        if location_data:
            print(f"\n=== {self.current_location} ===")
            print(location_data["description"])
            print(f"Planets: {', '.join(location_data['planets'])}")

    def travel_to(self, destination):
        """Travel to a new location"""
        if destination in self.locations:
            self.current_location = destination
            return True
        print(f"Error: '{destination}' is not a valid destination.")
        print(f"Available destinations: {', '.join(self.locations.keys())}")
        return False

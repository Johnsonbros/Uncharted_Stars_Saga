"""
Player character class for Uncharted Stars Saga
"""


class Player:
    """Represents the player character"""

    def __init__(self, name):
        self.name = name
        self.credits = 1000
        self.ship_health = 100
        self.fuel = 100
        # TODO: Add inventory system for items and resources

    def display_status(self):
        """Display player status"""
        # TODO: Format status display with colors or better formatting
        print(f"\n--- Captain {self.name} ---")
        print(f"Credits: {self.credits}")
        print(f"Ship Health: {self.ship_health}%")
        print(f"Fuel: {self.fuel}%")

    def consume_fuel(self, amount):
        """Consume fuel for travel"""
        if self.fuel >= amount:
            self.fuel -= amount
            return True
        return False

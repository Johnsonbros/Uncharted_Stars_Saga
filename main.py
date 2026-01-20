#!/usr/bin/env python3
"""
Uncharted Stars Saga - A space exploration adventure game
"""

from player import Player
from galaxy import Galaxy


def main():
    """Main game loop"""
    print("Welcome to Uncharted Stars Saga!")

    # TODO: Add player name input at game start
    player = Player("Explorer")
    galaxy = Galaxy()

    # TODO: Implement main game loop with commands
    print(f"Captain {player.name}, your adventure begins...")
    galaxy.display_current_location()

    # TODO: Add save/load game functionality


if __name__ == "__main__":
    main()

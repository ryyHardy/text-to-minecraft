"""
Entry point for the program, which takes in command line arguments to connect the bot to the server.
"""

from GUI import BotControllerGUI


def main():
    b = BotControllerGUI()
    b.run()


if __name__ == "__main__":
    main()

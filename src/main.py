"""
Entry point for the program, which takes in command line arguments to connect the bot to the server.
"""

from GUI import run
from node import check_node


def main():
    check_node()
    run()


if __name__ == "__main__":
    main()

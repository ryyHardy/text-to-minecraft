"""
Entry point for the program, starting the GUI and checking node dependency
"""

from GUI import run
from node import check_node


def main():
    check_node()
    run()


if __name__ == "__main__":
    main()

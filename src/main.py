"""
Entry point for the program, which takes in command line arguments to connect the bot to the server.
"""

import flet as ft

from GUI import BotController


def main(page: ft.Page):
    BotController(page)


if __name__ == "__main__":
    ft.app(main)

import asyncio
import os
import sys

import flet as ft

from bot_new import TextMCBot
from utils import get_default_ipv4


class BotController:
    def __init__(self, page: ft.Page):
        self.page = page
        self.bot = None

        self.setup_page()

    def setup_page(self):
        self.page.title = "Text-to-Minecraft Bot Controller"
        self.page.theme_mode = ft.ThemeMode.LIGHT
        self.page.theme = ft.Theme(color_scheme_seed=ft.Colors.GREEN_300)
        self.page.horizontal_alignment = ft.CrossAxisAlignment.CENTER

        self.port_field = ft.TextField(
            label="LAN World Port", keyboard_type=ft.KeyboardType.NUMBER
        )
        self.page.add(self.port_field)

        connect_button = ft.FilledButton(
            text="Connect Bot to LAN World",
            on_click=self.connect_bot,
        )
        self.page.add(connect_button)

        # Attach the disconnect logic to the on_close event
        self.page.on_disconnect = self.disconnect_bot

        self.page.update()

    def connect_bot(self, event):
        try:
            port = int(self.port_field.value)
            host = get_default_ipv4()
            if not host:
                self.show_snackbar("Wireless LAN adapter IPV4 not found")
                return
            self.bot = TextMCBot()
            self.bot.connect(host=host, port=port)
            print("Bot connected successfully!")
        except ValueError:
            self.show_snackbar("Please enter a valid integer for the port.")

    async def disconnect_bot(self, event=None):
        if self.bot:
            print("Disconnecting bot...")
            await asyncio.to_thread(self.bot.command_exit("@a", []))
            self.bot = None
            print("Bot disconnected successfully.")

    def show_snackbar(self, message):
        self.page.snack_bar = ft.SnackBar(content=ft.Text(message))
        self.page.snack_bar.open = True
        self.page.update()


def main(page: ft.Page):
    BotController(page)


def run():
    ft.app(main)

"""
Contains code defining the bot and its behavior using Mineflayer and the llm module.
"""

from __future__ import annotations

import os
import textwrap

from javascript import On, require

mineflayer = require("mineflayer")
pathfinder = require("mineflayer-pathfinder")

from llm import MinecraftCodeGenerator

BOT_USERNAME = "TextMCBot"

# TODO: Consider making bot chat messages private to just one player to avoid annoying other people on servers
# As for how... I don't know yet


def place_block(bot: BuilderBot, block_type, x, y, z):
    bot.chat(f"/setblock {x} {y} {z} {block_type}")


class BuilderBot:
    def __init__(self, host: str, port: int) -> None:
        self.bot = mineflayer.createBot(
            {
                "host": host,
                "port": port,
                "username": BOT_USERNAME,
                "hideErrors": False,
            }
        )
        print(f"Attempting to join server '{host}' on port {port}")
        self.bot.loadPlugin(pathfinder.pathfinder)
        print("Started mineflayer")
        self.commands = {}
        self.setup_commands()
        self.setup_listeners()

    def setup_commands(self):
        """Registers possible commands"""
        self.commands = {
            "$come": self.command_come,
            "$build": self.command_build,
            "$where": self.command_where,
            "$exec": self.command_exec,
            "$exit": self.command_exit,
            "$help": self.command_help,
        }

    def setup_listeners(self):
        @On(self.bot, "spawn")
        def on_spawn(*args):
            """Runs when the bot connects to a world"""
            print("Connection successful!")
            self.bot.chat("Hello! Type '$help' for a list of commands!")
            self.client = MinecraftCodeGenerator()
            self.movements = pathfinder.Movements(self.bot)

        @On(self.bot, "chat")
        def on_chat(this, sender, message: str, *args):
            """Runs after every in-game chat message"""
            if not sender or sender == BOT_USERNAME:
                return
            if message.startswith("$"):  # Is a command?
                command, *args = message.split(" ")
                command = command.lower()
                handler = self.commands.get(command)
                if handler:
                    handler(sender, args)
                else:
                    self.bot.chat(
                        f"Unknown command: '{command}'. Try '$help' for a list of commands"
                    )

        @On(self.bot, "end")
        def on_end(*args):
            """Called when the bot disconnects from the server"""
            print("\nBot ended\n")
            os._exit(0)  # TODO: Find something better than this

    def command_come(self, sender, args):
        """walk over to the sender"""
        player = self.bot.players[sender]
        target = player.entity
        if not target:
            self.bot.chat("I don't see you!")
            return
        pos = target.position
        self.bot.pathfinder.setMovements(self.movements)
        self.bot.pathfinder.setGoal(pathfinder.goals.GoalNear(pos.x, pos.y, pos.z, 1))

    def command_build(self, sender, args):
        """try to build a structure based on the sender's prompt"""
        message = " ".join(args)  # Reconstructs the prompt
        response = self.client.generate_code(message)
        print("Generated code: ", response)
        try:
            self.execute_code(response)
        except RuntimeError as e:
            print("Error in generated code: ", e)
            self.bot.chat("Error in generated code")

    def command_where(self, sender, args):
        """announce current location"""
        pos = self.bot.entity.position
        self.bot.chat(
            f"I'm at X: {int(pos.x)}, Y: {int(pos.y)}, Z: {int(pos.z)} in the {self.bot.game.dimension}"
        )

    def command_exec(self, sender, args):
        """run a Minecraft command (ex: /tp, /setblock)"""
        cmd = " ".join(args)
        if cmd.startswith("/"):
            self.bot.chat(
                f"Attempted command: '{textwrap.shorten(cmd, width=25, placeholder="...")}'"
            )
            self.bot.chat(cmd)

    def command_exit(self, sender, args):
        """disconnect from the world"""
        self.bot.chat("Bye! Disconnecting...")
        self.bot.end()

    def command_help(self, sender, args):
        help_message = "Here are the available commands:\n"
        for command, handler in self.commands.items():
            if command != "$help":
                help_message += f"{command} - {handler.__doc__}\n"
        self.bot.chat(help_message)

    def execute_code(self, code):
        exec_context = {
            "place_block": place_block,
            "bot": self.bot,
            "__builtins__": __builtins__,
        }
        try:
            # or... compile(code, "<string>", "exec") TODO: Consider this
            exec(code, exec_context)
        except Exception as e:
            raise RuntimeError(f"Failed to execute generated code: {e}")

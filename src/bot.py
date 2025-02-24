"""
Contains code defining the bot and its behavior using Mineflayer and the llm module.
"""

from __future__ import annotations

# import os
from collections import namedtuple

from javascript import On, require

from llm import MinecraftCodeGenerator

mineflayer = require("mineflayer")
pathfinder = require("mineflayer-pathfinder")


BOT_USERNAME = "TextMCBot"

# TODO: Consider making bot chat messages private to just one player to avoid annoying other people on servers
# As for how... I don't know yet. Maybe use the ingame /tellraw command?


def place_block(bot: BuilderBot, block_type, x, y, z):
    bot.chat(f"/setblock {x} {y} {z} {block_type}")


Command = namedtuple("Command", ["handler", "description", "args"])


class BuilderBot:
    def __init__(self, host: str, port: int) -> None:
        print(f"Attempting to join server '{host}' on port {port}")
        self.bot = mineflayer.createBot(
            {
                "host": host,
                "port": port,
                "username": BOT_USERNAME,
                "hideErrors": False,
            }
        )
        self.bot.loadPlugin(pathfinder.pathfinder)
        print("Started mineflayer")
        self.commands = {}
        self.bind_commands()
        self.setup_listeners()

    def bind_commands(self):
        """Binds possible bot commands to their handlers"""
        self.commands = {
            "$come": Command(
                handler=self.command_come,
                description="Walk over to the sender.",
                args=[],
            ),
            "$build": Command(
                handler=self.command_build,
                description="Build a structure based on the sender's prompt.",
                args=["<prompt: string>"],
            ),
            "$where": Command(
                handler=self.command_where,
                description="Announce current location.",
                args=[],
            ),
            "$exec": Command(
                handler=self.command_exec,
                description="Run a Minecraft command (e.g., /tp, /setblock).",
                args=["<command: string>"],
            ),
            "$exit": Command(
                handler=self.command_exit,
                description="Disconnect from the world.",
                args=[],
            ),
            "$help": Command(
                handler=self.command_help,
                description="Show this help message.",
                args=[],
            ),
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
                command = self.commands.get(command)
                if command:
                    command.handler(sender, args)
                else:
                    self.bot.chat(
                        f"Unknown command: '{command}'. Try '$help' for a list of commands"
                    )

        @On(self.bot, "end")
        def on_end(*args):
            """Called when the bot disconnects from the server"""
            self.bot.chat("Bye! Disconnecting...")
            print("\nBot ended\n")

    def command_come(self, sender, args):
        player = self.bot.players[sender]
        target = player.entity
        if not target:
            self.bot.chat("I don't see you!")
            return
        pos = target.position
        self.bot.pathfinder.setMovements(self.movements)
        try:
            self.bot.pathfinder.setGoal(
                pathfinder.goals.GoalNear(pos.x, pos.y, pos.z, 1)
            )
        except Exception:
            self.bot.chat("An error occurred with my pathfinding! Please try again.")

    def command_build(self, sender, args):
        message = " ".join(args)  # Reconstructs the prompt
        response = self.client.generate_code(message)
        print("Generated code: ", response)
        try:
            self.execute_code(response)
        except RuntimeError as e:
            print("Error in generated code: ", e)
            self.bot.chat("Error in generated code.")

    def command_where(self, sender, args):
        pos = self.bot.entity.position
        self.bot.chat(
            f"I'm at X: {int(pos.x)}, Y: {int(pos.y)}, Z: {int(pos.z)} in the {self.bot.game.dimension}"
        )

    def command_exec(self, sender, args):
        cmd = " ".join(args)
        if not cmd.startswith("/"):
            cmd = "/" + cmd
        self.bot.chat(cmd)

    def command_exit(self, sender, args):
        self.bot.chat("Bye! Disconnecting...")
        self.bot.end()

    def command_help(self, sender, args):
        message = "Available commands:\n"
        for command, cmd in self.commands.items():
            message += f"{command} {' '.join(cmd.args)} - {cmd.description}\n"
        self.bot.chat(message)

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

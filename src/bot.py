"""
Contains code defining the bot and its behavior using Mineflayer and the llm module.
"""

from __future__ import annotations

# import os
from collections import namedtuple

from javascript import AsyncTask, On, Once, off, once, require

from llm import MinecraftCodeGenerator

mineflayer = require("mineflayer")
pathfinder = require("mineflayer-pathfinder")


def place_block(player, block_type, x, y, z):
    player.chat(f"/setblock {x} {y} {z} {block_type}")


Command = namedtuple("Command", ["handler", "description", "args"])

MESSAGE_COLOR = "light_purple"


class TextMCBot:
    def __init__(self, username: str = "TextMCBot", allowed_users: list[str] = None):
        self.username = username
        self.player = None
        self.allowed_users = allowed_users if allowed_users else []
        self.commands = None

    def connect(self, host: str, port: int) -> bool:
        try:
            self.player = mineflayer.createBot(
                {
                    "host": host,
                    "port": port,
                    "username": self.username,
                    "hideErrors": False,
                }
            )
            self.player.loadPlugin(pathfinder.pathfinder)
            self.__bind_commands()
            self.__setup_listeners()
        except Exception:
            return False
        return True

    def __message(self, recipient: str, message: str):
        """Send a message to a recipient in-game

        :param recipient: The username of the recipient
        :type recipient: str
        :param message: The message to send
        ttype message: str
        """
        # Use the in-game /tellraw command to make the message look nice
        tellraw = f'/tellraw {recipient} {{"text":"[BOT] <{self.username}> {message}","color":"{MESSAGE_COLOR}"}}'
        print(tellraw)
        self.player.chat(tellraw)

    def __bind_commands(self):
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

    def __setup_listeners(self):
        @On(self.player, "spawn")
        def on_spawn(this):
            """Runs when the player spawns in the world"""
            self.__message("@a", "Hello! Type $help for a list of commands")
            self.client = MinecraftCodeGenerator()
            self.movements = pathfinder.Movements(self.player)

        @On(self.player, "chat")
        def on_chat(this, sender, message: str, *args):
            """Runs after every in-game chat message"""
            if not sender or sender == self.username:
                return
            if message.startswith("$"):  # Is a command?
                command, *args = message.split(" ")
                command = command.lower()
                command_obj = self.commands.get(command)
                if command_obj:
                    command_obj.handler(sender, args)
                else:
                    self.__message(
                        sender,
                        f"Unknown command: '{command}'. Try '$help' for a list of commands",
                    )

        @On(self.player, "end")
        def on_end(*args):
            """Called when the bot ends and disconnects from the server"""
            off(self.player, "spawn", on_spawn)
            off(self.player, "chat", on_chat)
            off(self.player, "end", on_end)

    def command_help(self, sender, args):
        messages = ["Available commands:"]
        for command, cmd in self.commands.items():
            args_str = " ".join(cmd.args) if cmd.args else ""
            description = cmd.description if cmd.description else "No description"

            line = f"{command} {args_str} - {description}"
            print(f"Generated help line: {line}")
            messages.append(line)
        for msg in messages:
            self.__message(sender, msg)

    def command_where(self, sender, args):
        pos = self.player.entity.position
        self.__message(
            sender,
            f"I'm at X: {int(pos.x)}, Y: {int(pos.y)}, Z: {int(pos.z)} in the {self.player.game.dimension}",
        )

    def command_come(self, sender, args):
        player = self.player.players[sender]
        target = player.entity
        if not target:
            self.__message(sender, "I don't see you!")
            return
        pos = target.position
        self.player.pathfinder.setMovements(self.movements)
        try:
            self.player.pathfinder.setGoal(
                pathfinder.goals.GoalNear(pos.x, pos.y, pos.z, 1)
            )
        except Exception:
            self.__message(
                sender, "An error occurred with my pathfinding! Please try again."
            )

    def command_exec(self, sender, args):
        cmd = " ".join(args)
        if not cmd.startswith("/"):
            cmd = "/" + cmd
        self.player.chat(cmd)

    def command_build(self, sender, args):
        message = " ".join(args)  # Reconstructs the prompt
        response = self.client.generate_code(message)
        print("Generated code: ", response)
        try:
            self.execute_code(response)
        except RuntimeError as e:
            print("Error in generated code: ", e)
            self.__message(sender, "Error in generated code.")

    def command_exit(self, sender, args):
        self.__message("@a", "Bye! Disconnecting...")
        self.player.end()

    def execute_code(self, code):
        exec_context = {
            "place_block": place_block,
            "bot": self.player,
            "__builtins__": __builtins__,
        }
        try:
            # or... compile(code, "<string>", "exec") TODO: Consider this
            exec(code, exec_context)
        except Exception as e:
            raise RuntimeError(f"Failed to execute generated code: {e}")

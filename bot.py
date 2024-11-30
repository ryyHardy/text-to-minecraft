"""
Contains code defining the bot and its behavior using Mineflayer and the llm module.
"""

from __future__ import annotations

from javascript import On, require

mineflayer = require("mineflayer")
pathfinder = require("mineflayer-pathfinder")

from llm import MinecraftCodeGenerator

BOT_USERNAME = "TextMCBot"


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
        self.setup_listeners()

    def setup_listeners(self):
        @On(self.bot, "spawn")
        def on_spawn(*args):
            """Spawns the bot"""
            print("Connection successful!")
            self.bot.chat("Hello!")
            self.client = MinecraftCodeGenerator()
            self.movements = pathfinder.Movements(self.bot)

        @On(self.bot, "chat")
        def on_chat(this, sender, message: str, *args):
            """Handles chats"""
            if (
                not sender or sender == BOT_USERNAME
            ):  # Ignore if sender is nonexistent or the bot itself
                return
            if "come" in message.split(" "):  #! "come" command
                player = self.bot.players[sender]
                target = player.entity
                if not target:
                    self.bot.chat("I don't see you!")
                    return
                pos = target.position
                self.bot.pathfinder.setMovements(self.movements)
                self.bot.pathfinder.setGoal(
                    pathfinder.goals.GoalNear(pos.x, pos.y, pos.z, 1)
                )
            elif message.lower().startswith("build "):
                response = self.client.generate_code(message)
                print("Generated code: ", response)
                try:
                    self.execute_code(response)
                except RuntimeError as e:
                    print(e)
                    self.bot.chat("Error in generated code")
            elif "where are you" in message.lower():
                pos = self.bot.entity.position
                self.bot.chat(
                    f"I'm at X: {int(pos.x)}, Y: {int(pos.y)}, Z: {int(pos.z)}"
                )

        @On(self.bot, "end")
        def on_end(*args):
            """Ends the bot"""
            print("Bot ended")
            exit(0)

    def execute_code(self, code):
        exec_context = {
            "place_block": place_block,
            "bot": self.bot,
            "__builtins__": __builtins__,
        }
        try:
            # or... compile(code, "<string>", "exec")
            exec(code, exec_context)
        except Exception as e:
            raise RuntimeError(f"Failed to execute generated code: {e}")

from dotenv import load_dotenv
import os
import sys
from javascript import require, On

mineflayer = require("mineflayer")
pathfinder = require("mineflayer-pathfinder")

load_dotenv()

BOT_USERNAME = "TextMCBot"


class BuilderBot:
    def __init__(self) -> None:
        self.API_KEY = os.getenv("OPENAI_APY_KEY")
        self.bot = mineflayer.createBot({"host": "localhost", "username": BOT_USERNAME})
        self.bot.loadPlugin(pathfinder.pathfinder)
        print("Started mineflayer")
        self.setup_listeners()

    def setup_listeners(self):
        @On(self.bot, "spawn")
        def handle_spawn(*args):
            """Spawns the bot"""
            print("Hello!")
            self.movements = pathfinder.Movements(self.bot)

        @On(self.bot, "chat")
        def on_chat(this, sender, message, *args):
            """Handles chats"""
            if sender and (sender != BOT_USERNAME):
                if "come" in message:
                    player = self.bot.players[sender]
                    print("Target", player)
                    target = player.entity
                    if not target:
                        self.bot.chat("I don't see you!")
                        return
                    pos = target.position
                    self.bot.pathfinder.setMovements(self.movements)
                    self.bot.pathfinder.setGoal(
                        pathfinder.goals.GoalNear(pos.x, pos.y, pos.z, 1)
                    )

        @On(self.bot, "end")
        def on_end(*args):
            """Ends the bot"""
            print("Bot ended", args)

from dotenv import load_dotenv
import sys
import os
from javascript import require, On
from openai import OpenAI

mineflayer = require("mineflayer")
pathfinder = require("mineflayer-pathfinder")

load_dotenv()

BOT_USERNAME = "TextMCBot"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CHATBOT_ROLE = "You are a helpful Minecraft player. For every question, answer in the context of Minecraft."
# ^ Consider changing later on if this has issues


class BuilderBot:
    def __init__(self, host: str, port: int) -> None:
        self.openai_client = OpenAI(api_key=OPENAI_API_KEY)
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
        self.setup_listeners()

    def setup_listeners(self):
        @On(self.bot, "spawn")
        def handle_spawn(*args):
            """Spawns the bot"""
            self.bot.chat("Hello!")
            self.movements = pathfinder.Movements(self.bot)

        @On(self.bot, "chat")
        def on_chat(this, sender, message, *args):
            """Handles chats"""
            if not sender or sender == BOT_USERNAME: # Ignore if sender is nonexistent or the bot itself
                return
            if message.lower() == "come": #! "come" command
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
            else: #! Otherwise, get response using the LLM
                completion = self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": CHATBOT_ROLE},
                        {"role": "user", "content": message}
                    ]
                )
                self.bot.chat(completion.choices[0].message.content)

        @On(self.bot, "end")
        def on_end(*args):
            """Ends the bot"""
            print("Bot ended")
            sys.exit()

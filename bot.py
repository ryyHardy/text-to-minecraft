from dotenv import load_dotenv
import os
from javascript import require, On
mineflayer = require("mineflayer")

load_dotenv()

class BuilderBot:
    def __init__(self) -> None:
        self.setup_listeners()
        self.API_KEY = os.getenv("OPENAI_APY_KEY")
    
    def setup_listeners(self):
        @On(self.bot, "spawn")
        def handle_spawn(*args):
            """
            Spawns the bot
            """
            pass
        
        @On(self.bot, "chat")
        def on_chat(this, sender, message, *args):
            """Handles chats

            :param this: _description_
            :type this: _type_
            :param sender: _description_
            :type sender: _type_
            :param message: _description_
            :type message: _type_
            :param args: _description_
            :type args: _type_
            """
            pass
        
        def on_end(*args):
            """Ends the bot
            """
            pass

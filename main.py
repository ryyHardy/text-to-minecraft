import sys
from javascript import require, On, Once, AsyncTask, once, off

# from bot import BuilderBot
mineflayer = require("mineflayer")

# import mineflayer

if len(sys.argv) != 3:
    print("Usage : python main.py <host> <port>")
    sys.exit()

host = sys.argv[1]
try:
    port = int(sys.argv[2])
except ValueError:
    print(f"Invalid port argument '{sys.argv[2]}'")
    sys.exit()

bot = mineflayer.createBot(
    {
        "username": "TextMCBot",
        "auth": "microsoft",
        "host": host,
        "port": port,
        "version": "1.20.4",
    }
)


@On(bot, "login")
def login(this):
    pass


# b = BuilderBot(host, port)


# def main():
#     if len(sys.argv) != 3:
#         print("Usage : python main.py <host> <port>")
#         return

#     host = sys.argv[1]
#     port = sys.argv[2]

#     bot = mineflayer.createBot(
#         {
#             "host": host,
#             "port": port,
#             "username": "TextMCBot",
#             "version": "1.20.4",
#             "hideErros": False,
#         }
#     )

#     @On(bot, "login")
#     def login(this):
#         pass

#     # b = BuilderBot(host, port)


# if __name__ == "__main__":
#     main()

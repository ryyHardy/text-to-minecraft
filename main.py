import sys
from bot import BuilderBot

def main():
    if len(sys.argv) != 3:
        print("Usage : python main.py <host> <port>")
        return
    
    host = sys.argv[1] 
    # Host IP should be the server IP, or if it is a LAN world, the IPV4 address of your wireless LAN adapter
    # Run "ipconfig" to get that IP if you don't know it.
    try:
        port = int(sys.argv[2])
    except ValueError:
        print(f"Invalid port argument '{sys.argv[2]}'")
        return
    
    b = BuilderBot(host, port)
    print(f"Bot spawned at {b.bot.entity.position}")


if __name__ == "__main__":
    main()

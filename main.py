import sys

from bot import BuilderBot


def parse_args(args: list[str]):
    if len(args) != 2:
        raise ValueError("Usage : python main.py <host> <port>")
    host = args[0]
    try:
        port = int(args[1])
    except ValueError:
        raise ValueError(f"Port argument {args[1]} is not an integer")
    return (host, port)


def main():
    b = BuilderBot(*parse_args(sys.argv[1:]))


if __name__ == "__main__":
    main()

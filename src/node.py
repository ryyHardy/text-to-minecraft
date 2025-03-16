import subprocess


def check_node():
    try:
        subprocess.run(
            ["node", "--version"], check=True, capture_output=True, text=True
        )
    except FileNotFoundError:
        print(
            "Error: Node.js is not installed. Please install it from https://nodejs.org/"
        )

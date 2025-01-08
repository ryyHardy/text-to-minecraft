import socket


def get_default_ipv4():
    try:
        # Connect to a public server without sending data
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))  # Google's public DNS
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception as e:
        print(f"Error getting IP: {e}")
        return None


default_ip = get_default_ipv4()
if default_ip:
    print(f"Your default IPv4 address is: {default_ip}")
else:
    print("Could not determine IPv4 address!")

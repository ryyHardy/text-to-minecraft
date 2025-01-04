import os
import tkinter as tk

from bot import BuilderBot


class BotControllerGUI:
    def __init__(self):
        self.bot = None

        self.root = tk.Tk()
        self.root.title("Minecraft Bot Controller")

        # Server connection fields
        tk.Label(self.root, text="Server Host:").pack()
        self.host_entry = tk.Entry(self.root)
        self.host_entry.pack()

        tk.Label(self.root, text="Server Port:").pack()
        self.port_entry = tk.Entry(self.root)
        self.port_entry.pack()

        self.connect_button = tk.Button(
            self.root, text="Connect", command=self.connect_to_server
        )
        self.connect_button.pack()

        # Log display
        tk.Label(self.root, text="Log:").pack()
        self.log_display = tk.Text(
            self.root, height=15, width=50, state="normal", wrap=tk.WORD
        )
        self.log_display.pack()
        self.log_display.config(state="normal")

    def log_message(self, message):
        self.log_display.insert(tk.END, message)
        self.log_display.see(tk.END)  # Auto-scroll to bottom

    def connect_to_server(self):
        host = self.host_entry.get()
        port = self.port_entry.get()
        if not host or not port:
            self.log_message("Error: Host and port are required!\n")
            return
        try:
            self.bot = BuilderBot(host, int(port))
            self.log_message(f"Attempting to connect to {host}:{port}...\n")
            self.log_message("Connection successful!\n")
        except Exception as e:
            self.log_message(f"Connection failed: {e}\n")

    def run(self):
        self.root.mainloop()
        if self.bot:
            self.bot.command_exit(sender=None, args=None)
        os._exit(0)

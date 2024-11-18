import json

def place_block(bot, block_type, x, y, z):
    bot.chat(f"/setblock ~{x} ~{y} ~{z} {block_type}")

def build_from_json(bot, json_str: str):
    try:
        loaded = json.loads(json_str)
        name = loaded["schematic_name"]
        blocks = loaded["blocks"]
        for block in blocks:
            place_block(bot, block["block_type"], block["x"], block["y"], block["z"])
        return name
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        bot.chat("Failed to parse the building instructions.")
        return None
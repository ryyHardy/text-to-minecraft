import json

def place_block(bot, block_type, x, y, z):
    bot.chat(f"/setblock ~{x} ~{y} ~{z} {block_type}")

def build_from_json(bot, json_str: str):
    print(json_str)
    # loaded = json.loads(json_str)
    name = json_str["schematic_name"]
    blocks = json_str["blocks"]
    for block in blocks:
        place_block(bot, block["block_type"], block["x"], block["y"], block["z"])
    return name
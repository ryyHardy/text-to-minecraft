def generate_setblock_commands(part_data: dict) -> list[str]:
    commands = []
    for block_type, coords_list in part_data["blocks"].items():
        for coord in coords_list:
            x, y, z = map(int, coord.split(","))
            commands.append(
                f"/setblock ~{x} ~{y} ~{z} {block_type} destroy"
            )  # TODO: Consider removing "destroy" parameter of setblock commands list
    return commands

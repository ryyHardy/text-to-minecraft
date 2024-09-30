def place_block(block_type, x, y, z) -> str:
    return f"/setblock {x} {y} {z} {block_type}"


# Define house parameters
house_origin = (0, 0, 0)  # Starting coordinates (x, y, z)
width = 5
height = 4
length = 7

# Unpack the origin coordinates
origin_x, origin_y, origin_z = house_origin

# Build the floor
for x in range(width):
    for z in range(length):
        print(place_block("oak_planks", origin_x + x, origin_y, origin_z + z))

# Build the walls
for y in range(1, height):
    for x in range(width):
        # Front and back walls
        print(place_block("stone", origin_x + x, origin_y + y, origin_z))  # Front wall
        print(
            place_block("stone", origin_x + x, origin_y + y, origin_z + length - 1)
        )  # Back wall

    for z in range(length):
        # Left and right walls
        print(place_block("stone", origin_x, origin_y + y, origin_z + z))  # Left wall
        print(
            place_block("stone", origin_x + width - 1, origin_y + y, origin_z + z)
        )  # Right wall

# Create door (gap in the front wall)
print(place_block("air", origin_x + width // 2, origin_y + 1, origin_z))  # Door space
print(place_block("air", origin_x + width // 2, origin_y + 2, origin_z))  # Door space

# Create windows (gaps in the side walls)
print(place_block("glass", origin_x, origin_y + 2, origin_z + 2))  # Left window
print(
    place_block("glass", origin_x + width - 1, origin_y + 2, origin_z + 2)
)  # Right window

# Build the roof
for x in range(width):
    for z in range(length):
        print(place_block("oak_planks", origin_x + x, origin_y + height, origin_z + z))

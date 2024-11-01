import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate

load_dotenv("OPENAI_API_KEY")

EXAMPLES = [
    {
        "input": "build a house",
        "output": "pos = bot.entity.position\nx = int(pos.x)\ny = int(pos.y)\nz = int(pos.z)\nsize = 5\nheight = 4\nblock_type = 'stone'\n\nx_start = x - size // 2\nx_end = x + size // 2\nz_start = z - size // 2\nz_end = z + size // 2\ny_floor = y\ny_ceiling = y + height\n\nfor i in range(x_start, x_end + 1):\n for j in range(z_start, z_end + 1):\n place_block(bot, block_type, i, y_floor, j)\n\nfor i in range(x_start, x_end + 1):\n for j in range(z_start, z_end + 1):\n for k in range(y_floor + 1, y_ceiling):\n if i == x_start or i == x_end or j == z_start or j == z_end:\n place_block(bot, block_type, i, k, j)\n\nfor i in range(x_start, x_end + 1):\n for j in range(z_start, z_end + 1):\n place_block(bot, block_type, i, y_ceiling, j)"
    }, 
    {
        "input": "build a snowman",
        "output": "pos = bot.entity.position\nx = int(pos.x)\ny = int(pos.y)\nz = int(pos.z)n\nbody_radius = 2\nmiddle_radius = 1\nhead_radius = 1\n\nbody_block = 'snow_block'\nhead_block = 'carved_pumpkin'\narm_block = 'oak_fence'\n\ndef place_sphere(bot, block_type, center_x, center_y, center_z, radius):\n for i in range(center_x - radius, center_x + radius + 1):\n for j in range(center_y - radius, center_y + radius + 1):\n for k in range(center_z - radius, center_z + radius + 1):\n if (i - center_x) 2 + (j - center_y) 2 + (k - center_z) 2 <= radius 2:\n place_block(bot, block_type, i, j, k)\n\nplace_sphere(bot, body_block, x, y + body_radius, z, body_radius)\nplace_sphere(bot, body_block, x, y + body_radius + 2*middle_radius, z, middle_radius)\nplace_sphere(bot, head_block, x, y + body_radius + 2*middle_radius + 2*head_radius, z, head_radius)\n\nplace_block(bot, arm_block, x - middle_radius - 1, y + body_radius + middle_radius, z)\nplace_block(bot, arm_block, x + middle_radius + 1, y + body_radius + middle_radius, z)",
    },
]
EXAMPLE_PROMPT = ChatPromptTemplate.from_messages(
    [("human", "{input}"), ("ai", "{output}")]
)
FEW_SHOT_PROMPT = FewShotChatMessagePromptTemplate(
    examples=EXAMPLES,
    example_prompt=EXAMPLE_PROMPT
)
FINAL_PROMPT = ChatPromptTemplate.from_messages(
    [
        ('system', 'You are a bot designed to generate python code for building structures in Minecraft version 1.20.4. If asked to build, your response should be a string of PEP8-formatted Python code that is able to run with the Python exec() function, and remove the ```python line at the top. Finally, ensure that all variables used are passed into each function you create, to avoid errors.'),
        FEW_SHOT_PROMPT,
        ('human', '{input}')
    ]
)
# TODO: ^ Consider making some of these non-constant, because maybe we could change them over time.

class MinecraftCodeGenerator:
    def __init__(self) -> None:
        self.client = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
            api_key=os.getenv("OPENAI_API_KEY")
        )
    
    def generate_code(self, message: str):
        chain = (
            FINAL_PROMPT
            | self.client
            | StrOutputParser()
        )
        return chain.invoke({"input": message})

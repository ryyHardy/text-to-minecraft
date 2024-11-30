import ast
import os
import re

from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain_openai import ChatOpenAI

load_dotenv("OPENAI_API_KEY")


def is_valid_python(raw_code: str) -> bool:
    try:
        ast.parse(raw_code)
        return True
    except SyntaxError:
        return False


def clean_code(raw_code: str):
    cleaned_code = re.sub(r"```(?:python)?", "", raw_code).strip()
    return cleaned_code


def postprocess_code(code: str, required_imports: list):
    parsed = ast.parse(code)
    imports = [
        node.names[0].name for node in ast.walk(parsed) if isinstance(node, ast.Import)
    ]
    missing_imports = [lib for lib in required_imports if lib not in imports]
    for lib in missing_imports:
        code = f"import {lib}\n{code}"
    return code


SYSTEM_PROMPT = """
You are an expert Minecraft bot designed to generate Python code for building structures in Minecraft version 1.20.4. Your output must be **raw, runnable Python code only**, following these strict rules:

1. **Function Usage:**
   - Always use the pre-defined `place_block(bot, block_type, x, y, z)` function for placing blocks. 
   - Do not redefine the `place_block` function or any other functions provided externally.

2. **Output Formatting:**
   - Do not include markdown delimiters like ```python or ```.
   - Only generate valid Python code that can be directly executed using the Python `exec()` function.

3. **Variable and Function Scoping:**
   - Pass every variable explicitly into each function you define. Avoid relying on global variables unless explicitly provided.
   - Ensure all imports are declared at the top of the generated code, and use standard Python libraries only if necessary.

4. **Minecraft-Specific Requirements:**
   - Use only block types compatible with the in-game `/setblock` command.
   - For blocks with variants (e.g., wood, stone), specify the correct block states for detail (e.g., `"cut_copper_slab[type=top,waterlogged=true]"` or `"acacia_door[hinge=right,facing=south]"`).

5. **PEP-8 Compliance:**
   - Follow PEP-8 formatting guidelines for Python, including proper indentation and spacing.

6. **Explanations and Comments:**
   - Do not include any standalone explanatory text or paragraphs outside of Python code.
   - If an explanation is required, embed it as **comments** within the code.

7. **Error Handling:**
   - Ensure all generated code is syntactically valid Python.
   - Avoid undefined variables, functions, or imports.

8. **Code Complexity:**
   - Avoid overcomplicating the code. Generate efficient and readable Python code suitable for Minecraft automation.

9. **Output Integrity:**
   - Do not generate empty lines or trailing text after the Python code.
   - Do not generate output that requires manual editing to execute.

10. **Fail-Safe Rule:**
    - If unsure about specific details, always prioritize valid Python code that adheres to the above rules.
"""

EXAMPLES = [
    {
        "input": "build a house",
        "output": "pos = bot.entity.position\nx = int(pos.x)\ny = int(pos.y)\nz = int(pos.z)\nsize = 5\nheight = 4\nblock_type = 'stone'\n\nx_start = x - size // 2\nx_end = x + size // 2\nz_start = z - size // 2\nz_end = z + size // 2\ny_floor = y\ny_ceiling = y + height\n\nfor i in range(x_start, x_end + 1):\n for j in range(z_start, z_end + 1):\n place_block(bot, block_type, i, y_floor, j)\n\nfor i in range(x_start, x_end + 1):\n for j in range(z_start, z_end + 1):\n for k in range(y_floor + 1, y_ceiling):\n if i == x_start or i == x_end or j == z_start or j == z_end:\n place_block(bot, block_type, i, k, j)\n\nfor i in range(x_start, x_end + 1):\n for j in range(z_start, z_end + 1):\n place_block(bot, block_type, i, y_ceiling, j)",
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
    examples=EXAMPLES, example_prompt=EXAMPLE_PROMPT
)
FINAL_PROMPT = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        FEW_SHOT_PROMPT,
        ("human", "{input}"),
    ]
)


class MinecraftCodeGenerator:
    def __init__(self) -> None:
        self.client = ChatOpenAI(
            model="gpt-4o",
            temperature=0,
            max_tokens=10000,
            timeout=60,
            max_retries=2,
            api_key=os.getenv("OPENAI_API_KEY"),
        )

    def generate_code(self, message: str):
        chain = FINAL_PROMPT | self.client | StrOutputParser()
        return clean_code(chain.invoke({"input": message}))

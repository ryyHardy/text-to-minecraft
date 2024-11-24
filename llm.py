"""
The backend of the bot which is made with LangChain using ChatGPT as the LLM and Chroma for the vectorstore.
"""

import json
import os

# import uuid
from pathlib import Path

from dotenv import load_dotenv
from langchain.chains.retrieval_qa.base import RetrievalQA
from langchain_chroma.vectorstores import Chroma
from langchain_community.document_loaders import DirectoryLoader, JSONLoader
from langchain_core.documents import Document
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain_openai import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from pydantic import BaseModel, Field

from skills import generate_setblock_commands

# SCHEMATICS_DIR = Path("./data/filtered_schematics_json/")
SCHEMATICS_DIR = Path("./data/custom_schematics_json")
# VECTORSTORE_DIR = Path("./data/vectorstore")

# VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)

TOKEN_LIMIT = 10000
TIMEOUT_LIMIT = 30
SYSTEM_PROMPT = """
You are a bot designed to generate JSON representing large, detailed structures in Minecraft version 1.20.4. 
Your task is to produce JSON matching the schema provided in the examples. 
- For larger or more detailed structures (e.g., statues, castles, or large houses), include more blocks and layers.
- If the structure is too large to represent in one response, split it into multiple parts.
- Each part should include `"part_start"`, `"part_end"`, and `"is_final"` fields.
- Ensure all parts together form a complete and coherent structure, with no parts missing or disconnected.

When generating block types:
- Use **valid block names** compatible with Minecraft 1.20.4 and in the correct format (e.g., `minecraft:oak_planks` for oak planks).
- If a block has variants (e.g., wood, copper, stone), include the correct variant for the context (e.g., `minecraft:oak_slab[type=top]` for a top slab).
- Use only **standard blocks** available in Minecraft 1.20.4. For example:
  - Wood blocks: `minecraft:oak_planks`, `minecraft:spruce_planks`, `minecraft:birch_planks`, etc.
  - Copper blocks: `minecraft:copper_block`, `minecraft:cut_copper`, etc.
  - Stone blocks: `minecraft:stone`, `minecraft:smooth_stone`, `minecraft:stone_bricks`, etc.
  - Slabs and stairs: Ensure the correct type for slabs and stairs (e.g., `minecraft:stone_slab[type=double]`).
- Avoid using any non-existent or unrecognized block names.
- For blocks that have multiple variants (e.g., copper, wool), make sure the variant is included (e.g., `minecraft:copper_block[exposed=1]` or `minecraft:blue_wool`).
- If a block does not have a variant, use the base block name (e.g., `minecraft:stone` or `minecraft:oak_log`).
"""


load_dotenv("OPENAI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# TODO: Find a way to write some Pydantic models for the new JSON format
# class Block(BaseModel):
#     block_type: str = Field(description="Type of block")
#     x: int = Field(description="X coordinate of the block")
#     y: int = Field(description="Y coordinate of the block")
#     z: int = Field(description="Z coordinate of the block")


# class MinecraftBuild(BaseModel):
#     schematic_name: str = Field(description="Name of the schematic")
#     blocks: list[Block] = Field(description="List of blocks in the schematic")


# * || FEW-SHOT PROMPT FORMAT
# Ehh not sure if I like the file opening part but it works
with open(str(SCHEMATICS_DIR / "fountain.json")) as f1:
    fountain_json = f1.read()

with open(str(SCHEMATICS_DIR / "small_house.json")) as f2:
    small_house_json = f2.read()

with open(str(SCHEMATICS_DIR / "garden.json")) as f3:
    garden_json = f3.read()

EXAMPLES = [
    {"input": "build a fountain", "output": fountain_json},
    {"input": "build a small house", "output": small_house_json},
    {"input": "build a garden", "output": garden_json},
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
            max_tokens=TOKEN_LIMIT,
            timeout=TIMEOUT_LIMIT,
            max_retries=2,
            api_key=OPENAI_API_KEY,
        )

    def generate_code(self, message: str):
        chain = FINAL_PROMPT | self.client | JsonOutputParser()
        try:
            result = chain.invoke({"input": message})
            print(f"LLM Response: {result}")
            return self.handle_multi_part_response(result)
        except Exception as e:
            print(f"Error generating JSON: {e}")
            return None


class MinecraftCodeGenerator:
    def __init__(self) -> None:
        self.client = ChatOpenAI(
            model="gpt-4o",
            temperature=0,
            max_tokens=TOKEN_LIMIT,
            timeout=TIMEOUT_LIMIT,
            max_retries=2,
            api_key=OPENAI_API_KEY,
        )

    def generate_code(self, message: str):
        chain = FINAL_PROMPT | self.client | JsonOutputParser()

        try:
            # Generate the first part
            result = chain.invoke({"input": message})
            print(f"LLM Response (Part 1): {result}")
            all_parts = self.handle_multi_part_response(result)

            # Keep generating additional parts if necessary
            while not result.get("is_final", False):  # Check if it's the final part
                # Increment the part range for the next request
                part_start = result.get("part_end", 1) + 1
                part_end = (
                    part_start + 2
                )  # Generate the next 2 parts (or adjust accordingly)

                next_prompt = f"{message}\n\nPlease continue building the structure from part {part_start} to part {part_end}."
                result = chain.invoke({"input": next_prompt})
                print(f"LLM Response (Next Part): {result}")
                # Process the next part and append it to the result
                all_parts.extend(self.handle_multi_part_response(result))

            print(f"Complete Structure: {all_parts}")
            return all_parts
        except Exception as e:
            print(f"Error generating JSON: {e}")
            return None

    def handle_multi_part_response(self, response):
        all_parts = []

        if isinstance(response, dict):
            try:
                if "blocks" in response:
                    commands = generate_setblock_commands(response)
                    all_parts.extend(commands)

                if response.get("is_final", False):
                    return all_parts  # End processing if "is_final" is present
            except Exception as e:
                print(f"Error processing response part: {e}")

        elif isinstance(response, str):
            parts = response.split("\n\n")
            for part in parts:
                try:
                    part_data = json.loads(part)

                    if isinstance(part_data, dict):
                        if "blocks" in part_data:
                            commands = generate_setblock_commands(part_data)
                            all_parts.extend(commands)

                        if part_data.get("is_final", False):
                            break
                except json.JSONDecodeError:
                    print(f"Skipping invalid JSON part: {part}")

        return all_parts

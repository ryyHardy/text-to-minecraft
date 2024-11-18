import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
import json
from pathlib import Path

MAX_JSON_FILES_TO_READ = 10
SCHEMATICS_DIR = Path("./data/filtered_schematics_json/")

load_dotenv("OPENAI_API_KEY")

class Block(BaseModel):
    block_type: str = Field(description="Type of block")
    x: int = Field(description="X coordinate of the block")
    y: int = Field(description="Y coordinate of the block")
    z: int = Field(description="Z coordinate of the block")

class MinecraftBuild(BaseModel):
    schematic_name: str = Field(description="Name of the schematic")
    blocks: list[Block] = Field(description="List of blocks in the schematic")

def load_schematics(directory: Path, max_files: int = 5):
    """Loads a specified number of JSON schematics from a directory.

    :param directory: The directory holding the schematics.
    :type directory: Path
    :param max_files: Maximum number of files to read (for performance purposes), defaults to 5
    :type max_files: int, optional
    """
    examples = []
    for i, file_path in enumerate(directory.glob("*.json")):
        if i >= max_files:
            break
        try:
            with open(file_path, "r") as file:
                schematic_data = json.load(file)
                examples.append({
                    "input": f"Build a {schematic_data["schematic_name"]}",
                    "output": json.dumps(schematic_data)
                })
        except json.JSONDecodeError:
            print(f"Error decoding JSON from {file_path.name}")
    return examples

EXAMPLES = load_schematics(SCHEMATICS_DIR, max_files=3)

EXAMPLE_PROMPT = ChatPromptTemplate.from_messages(
    [("human", "{input}"), ("ai", "{output}")]
)
FEW_SHOT_PROMPT = FewShotChatMessagePromptTemplate(
    examples=EXAMPLES,
    example_prompt=EXAMPLE_PROMPT
)
FINAL_PROMPT = ChatPromptTemplate.from_messages(
    [
        ('system', 'You are a bot designed to generate JSON describing large, detailed structures in Minecraft version 1.20.4. Your responses should be in JSON format, using coordinates and block types to represent buildings. Only use block types compatible with the in-game /setblock command. Focus on creating significant structures such as towers, castles, or multi-room buildings. Use the provided examples as inspiration.'),
        FEW_SHOT_PROMPT,
        ('human', '{input}')
    ]
)

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
        try:
            chain = (
                FINAL_PROMPT
                | self.client
                | JsonOutputParser(pydantic_object=MinecraftBuild)
            )
            result = chain.invoke({"input": message})
            print(f"Generated JSON: {result}")
            return result
        except Exception as e:
            print(f"Error generating code: {e}")
            return None
    

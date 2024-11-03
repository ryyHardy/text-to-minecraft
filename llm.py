import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate

load_dotenv("OPENAI_API_KEY")

class Block(BaseModel):
    block_type: str = Field(description="Type of block")
    x: int = Field(description="X coordinate of the block")
    y: int = Field(description="Y coordinate of the block")
    z: int = Field(description="Z coordinate of the block")

class MinecraftBuild(BaseModel):
    schematic_name: str = Field(description="Name of the schematic")
    blocks: list[Block] = Field(description="List of blocks in the schematic")

# TODO: These examples suck and they result in all the builds being very small. Try to change them at some point
EXAMPLES = [
    {
        "input": "build a house foundation with two levels",
        "output": '{"schematic_name": "Two-Level House Foundation", "blocks": [{"block_type": "stone_bricks", "x": 0, "y": 0, "z": 0}, {"block_type": "stone_bricks", "x": 1, "y": 0, "z": 0}, {"block_type": "stone_bricks", "x": 2, "y": 0, "z": 0}, {"block_type": "stone_bricks", "x": 0, "y": 1, "z": 0}, {"block_type": "air", "x": 1, "y": 1, "z": 0}, {"block_type": "stone_bricks", "x": 2, "y": 1, "z": 0}, {"block_type": "stone_bricks", "x": 0, "y": 1, "z": 1}, {"block_type": "stone_bricks", "x": 2, "y": 1, "z": 1}]}'
    }, 
    {
        "input": "build a simple fountain and make it symmetrical",
        "output": '{"schematic_name": "Simple Fountain", "blocks": [{"block_type": "stone_bricks", "x": 0, "y": 0, "z": 0}, {"block_type": "stone_bricks", "x": 1, "y": 0, "z": 0}, {"block_type": "water", "x": 0, "y": 1, "z": 1}, {"block_type": "water", "x": 1, "y": 1, "z": 1}, {"block_type": "stone_bricks", "x": 2, "y": 0, "z": 1}, {"block_type": "stone_bricks", "x": 1, "y": 0, "z": 2}, {"block_type": "stone_bricks", "x": 0, "y": 0, "z": 2}]}'
    },
    {
        "input": "build an automated redstone door",
        "output": '{"schematic_name": "Automated Redstone Door", "blocks": [{"block_type": "lever", "x": 0, "y": 1, "z": 0}, {"block_type": "redstone_wire", "x": 1, "y": 0, "z": 0}, {"block_type": "redstone_repeater", "x": 2, "y": 0, "z": 0}, {"block_type": "iron_door", "x": 3, "y": 0, "z": 0}, {"block_type": "redstone_torch", "x": 4, "y": 1, "z": 0}, {"block_type": "redstone_wire", "x": 3, "y": 1, "z": 1}]'
    }
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
        ('system', 'You are a bot designed to generate python code for building structures in Minecraft version 1.20.4. If asked to build, your response should be in JSON in the format shown by the provided examples.'),
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
        chain = (
            FINAL_PROMPT
            | self.client
            | JsonOutputParser(pydantic_object=MinecraftBuild)
        )
        return chain.invoke({"input": message})

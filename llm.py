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

# SCHEMATICS_DIR = Path("./data/filtered_schematics_json/")
# VECTORSTORE_DIR = Path("./data/vectorstore")

# VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)

TOKEN_LIMIT = 10000
TIMEOUT_LIMIT = 30

load_dotenv("OPENAI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# * || VALIDATORS
class Block(BaseModel):
    block_type: str = Field(description="Type of block")
    x: int = Field(description="X coordinate of the block")
    y: int = Field(description="Y coordinate of the block")
    z: int = Field(description="Z coordinate of the block")


class MinecraftBuild(BaseModel):
    schematic_name: str = Field(description="Name of the schematic")
    blocks: list[Block] = Field(description="List of blocks in the schematic")


# * || FEW-SHOT PROMPT FORMAT
EXAMPLES = []
EXAMPLE_PROMPT = ChatPromptTemplate.from_messages(
    [("human", "{input}"), ("ai", "{output}")]
)
FEW_SHOT_PROMPT = FewShotChatMessagePromptTemplate(
    examples=EXAMPLES, example_prompt=EXAMPLE_PROMPT
)
FINAL_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a bot designed to generate JSON representing structures in Minecraft version 1.20.4. If asked to build, your response should be in JSON matching the schema in the provided examples. Try to generate more JSON for larger or more detailed builds.",
        ),
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
        chain = (
            FINAL_PROMPT
            | self.client
            | JsonOutputParser(pydantic_object=MinecraftBuild)
        )
        try:
            result = chain.invoke({"input": message})
            print(f"Generated JSON: {result}")
            return result
        except Exception as e:
            print(f"Error generating JSON: {e}")
            return None

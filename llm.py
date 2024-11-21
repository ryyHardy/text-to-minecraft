import json
import os

# import uuid
from pathlib import Path

from dotenv import load_dotenv
from langchain_chroma.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain_openai import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from pydantic import BaseModel, Field

load_dotenv()

SCHEMATICS_DIR = Path("./data/filtered_schematics_json/")
VECTORSTORE_DIR = Path("./data/vectorstore")

VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)

embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))


class Block(BaseModel):
    block_type: str = Field(description="Type of block")
    x: int = Field(description="X coordinate of the block")
    y: int = Field(description="Y coordinate of the block")
    z: int = Field(description="Z coordinate of the block")


class MinecraftBuild(BaseModel):
    schematic_name: str = Field(description="Name of the schematic")
    blocks: list[Block] = Field(description="List of blocks in the schematic")


vectorstore = Chroma(
    persist_directory=str(VECTORSTORE_DIR), embedding_function=embeddings
)

retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})


def load_json_files_to_vectorstore(
    directory: Path, vectorstore: Chroma, max_files: int = 10
):
    docs = []
    count = 0
    for file in directory.glob("*.json"):
        if count >= max_files:
            break
        with open(file, "r") as f:
            data = json.load(f)
            schematic_name = data.get("schematic_name")
            try:
                MinecraftBuild.model_validate(data, strict=True)
                docs.append(
                    Document(
                        page_content=json.dumps(data),
                        metadata={"id": schematic_name},
                    )
                )
                count += 1
            except Exception as e:
                print(f"Skipping invalid file {file}: {e}")
    vectorstore.add_documents(docs)


def truncate_prompt(prompt, max_length: int = 1000):
    if len(prompt) > max_length:
        return prompt[:max_length]
    return prompt


def get_relevant_few_shot_prompt(query: str, retriever):
    results = retriever.invoke(query)
    examples = [
        {
            "input": result.metadata["id"],
            "output": json.dumps(json.loads(result.page_content), indent=2),
        }
        for result in results
    ]

    example_prompt = ChatPromptTemplate.from_messages(
        [("human", "{input}"), ("ai", "{output}")]
    )
    few_shot_prompt = FewShotChatMessagePromptTemplate(
        examples=examples, example_prompt=example_prompt
    )
    final_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                " You are a bot designed to generate JSON describing structures in Minecraft version 1.20.4. Your output must strictly follow the schema in the provided examples, and should consist only of block types that are compatible with the in-game /setblock command.",
            ),
            few_shot_prompt,
            ("human", "{input}"),
        ]
    )
    return final_prompt


load_json_files_to_vectorstore(SCHEMATICS_DIR, vectorstore)


class MinecraftCodeGenerator:
    def __init__(self) -> None:
        self.client = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            max_tokens=10000,
            timeout=30,
            max_retries=2,
            api_key=os.getenv("OPENAI_API_KEY"),
        )

    def generate_code(self, message: str):

        relevant_few_shot_prompt = get_relevant_few_shot_prompt(message, retriever)
        # relevant_few_shot_prompt = truncate_prompt(relevant_few_shot_prompt)

        chain = (
            relevant_few_shot_prompt
            | self.client
            | JsonOutputParser(pydantic_object=MinecraftBuild)
        )
        result = chain.invoke({"input": message})
        print(result)
        return result

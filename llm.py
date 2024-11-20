import json
import os
import uuid
from pathlib import Path

from dotenv import load_dotenv
from langchain.chains.retrieval_qa.base import RetrievalQA
from langchain_community.document_loaders import DirectoryLoader, JSONLoader
from langchain_community.embeddings.openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

SCHEMATICS_DIR = Path("./data/filtered_schematics_json/")
VECTORSTORE_DIR = Path("./data/vectorstore")

if not VECTORSTORE_DIR.exists():
    os.makedirs(str(VECTORSTORE_DIR))

load_dotenv("OPENAI_API_KEY")


class Block(BaseModel):
    block_type: str = Field(description="Type of block")
    x: int = Field(description="X coordinate of the block")
    y: int = Field(description="Y coordinate of the block")
    z: int = Field(description="Z coordinate of the block")


class MinecraftBuild(BaseModel):
    schematic_name: str = Field(description="Name of the schematic")
    blocks: list[Block] = Field(description="List of blocks in the schematic")


def get_schematic_names(path: Path, max_files: int = 3):
    count = 0
    schematic_names = []
    for file in path.glob("*.json"):
        if count >= max_files:
            break
        with open(file, "r") as f:
            data = json.load(f)
            schematic_name = data.get("schematic_name")
            if schematic_name:
                schematic_names.append(schematic_name)
                count += 1
    return schematic_names


PROMPT_TEMPLATE = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a bot designed to generate JSON describing large, detailed structures in Minecraft version 1.20.4. Your responses should be in JSON format, using coordinates and block types to represent buildings. Only use block types compatible with the in-game /setblock command. Focus on creating significant structures such as towers, castles, or multi-room buildings. Follow the JSON format in the provided examples and use them as inspiration.",
        ),
        ("human", "{input}"),
    ]
)

loader = DirectoryLoader(
    path=str(SCHEMATICS_DIR),
    glob="*.json",
    loader_cls=JSONLoader,
    loader_kwargs={"jq_schema": ".", "text_content": False},
)

summaries = get_schematic_names(SCHEMATICS_DIR)

docs = loader.load()
# print(docs[0].page_content)

doc_ids = [str(uuid.uuid4()) for _ in docs]

summary_docs = [
    Document(page_content=doc.page_content, metadata={"id": doc_ids[i]})
    for i, doc in enumerate(docs)  # TODO: Might change enumerate() back to "summaries"
]

embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))

if VECTORSTORE_DIR.exists():
    vectorstore = Chroma(
        persist_directory=str(VECTORSTORE_DIR), embedding_function=embeddings
    )
else:
    vectorstore = Chroma.from_documents(summary_docs, embeddings)
    vectorstore.persist()

retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})


class MinecraftCodeGenerator:
    def __init__(self) -> None:
        self.client = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            max_tokens=None,
            timeout=30,
            max_retries=2,
            api_key=os.getenv("OPENAI_API_KEY"),
        )

    def generate_code(self, message: str):
        try:
            prompt = PROMPT_TEMPLATE.format_prompt(input=message).to_string()
            chain = RetrievalQA.from_chain_type(
                llm=self.client, retriever=retriever, return_source_documents=True
            )
            result = chain.invoke({"query": prompt})
            result = JsonOutputParser(pydantic_object=MinecraftBuild).parse(
                result["result"]
            )
            print(f"Generated JSON: {result}")
            return result
        except Exception as e:
            print(f"Error generating code: {e}")
            return None

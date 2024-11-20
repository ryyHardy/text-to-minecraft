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
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from pydantic import BaseModel, Field

SCHEMATICS_DIR = Path("./data/filtered_schematics_json/")
VECTORSTORE_DIR = Path("./data/vectorstore")

MAX_FILES_TO_PROCESS = 3

VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv("OPENAI_API_KEY")


class Block(BaseModel):
    block_type: str = Field(description="Type of block")
    x: int = Field(description="X coordinate of the block")
    y: int = Field(description="Y coordinate of the block")
    z: int = Field(description="Z coordinate of the block")


class MinecraftBuild(BaseModel):
    schematic_name: str = Field(description="Name of the schematic")
    blocks: list[Block] = Field(description="List of blocks in the schematic")


PROMPT_TEMPLATE = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a bot designed to generate JSON describing large, detailed structures in Minecraft version 1.20.4. Your output must strictly follow this schema:"
            "\n\n"
            "MinecraftBuild Schema:\n"
            "{{"
            "    'schematic_name': 'string',"
            "    'blocks': ["
            "        {{"
            "            'block_type': 'string',"
            "            'x': 'integer',"
            "            'y': 'integer',"
            "            'z': 'integer'"
            "        }}"
            "    ]"
            "}}"
            "\n\n"
            "The response must be a valid JSON object matching this schema. Generate detailed and creative structures like castles or towers, using block types compatible with the /setblock command.",
        ),
        ("human", "{input}"),
    ]
)

embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))

"""
The Chroma vectorstore is created locally in the file system and it is added to with some new schematics
each time the program runs (with an upper limit, of course). This makes the JSON examples easier to access.
"""

if VECTORSTORE_DIR.exists():
    vectorstore = Chroma(
        persist_directory=str(VECTORSTORE_DIR), embedding_function=embeddings
    )

    print("Checking for new schematics to add...")
    existing_ids = set(
        doc.metadata["id"] for doc in vectorstore.similarity_search("", k=100)
    )

    new_docs = []
    count = 0
    for file in SCHEMATICS_DIR.glob("*.json"):
        if count >= MAX_FILES_TO_PROCESS:
            break
        with open(file, "r") as f:
            data = json.load(f)
            schematic_name = data.get("schematic_name")
            if schematic_name not in existing_ids:
                try:
                    MinecraftBuild.model_validate(data, strict=True)
                    new_docs.append(
                        Document(
                            page_content=json.dumps(data),
                            metadata={"id": schematic_name},
                        )
                    )
                    count += 1
                except Exception as e:
                    print(f"Skipping invalid file {file}: {e}")

    if new_docs:
        vectorstore.add_documents(new_docs)
        print(f"Added {len(new_docs)} new schematics to the vectorstore.")
    else:
        print("No new schematics to add.")
else:
    print("Creating a new vectorstore...")
    loader = DirectoryLoader(
        path=str(SCHEMATICS_DIR),
        glob="*.json",
        loader_cls=JSONLoader,
        loader_kwargs={"jq_schema": ".", "text_content": False},
    )

    docs = loader.load()
    docs = docs[:MAX_FILES_TO_PROCESS]

    valid_docs = []
    count = 0
    for doc in docs:
        if count >= MAX_FILES_TO_PROCESS:
            break
        try:
            json_data = json.loads(doc.page_content)
            MinecraftBuild.model_validate(json_data, strict=True)
            valid_docs.append(doc)
            count += 1
        except Exception as e:
            print(f"Skipping invalid document: {e}")

    vectorstore = Chroma.from_documents(valid_docs, embeddings)
    print(f"New vectorstore created with {len(valid_docs)} valid schematics.")

retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})


class MinecraftCodeGenerator:
    def __init__(self) -> None:
        self.client = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            max_tokens=10000,  # TODO: Expeirment with different token and timeout limits
            timeout=60,
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
            print(e)
            return None

from llm import SCHEMATICS_DIR, JSONLoader

test_file = SCHEMATICS_DIR / "49.json"

loader = JSONLoader(file_path=test_file, jq_schema=".", text_content=False)
doc = loader.load()

print(doc)

from src.llm import clean_code


def test_clean_code():
    # Remove markdown-style code blocks
    assert clean_code("```python\nx = 5\n```") == "x = 5"
    assert clean_code("```x = 5```") == "x = 5"

    # Whitespace handling
    assert clean_code("   ```python\nx = 5\n   ```   ") == "x = 5"

    # No markdown syntax
    assert clean_code("x = 5") == "x = 5"

    # Edge cases
    assert clean_code("") == ""
    assert clean_code("```") == ""

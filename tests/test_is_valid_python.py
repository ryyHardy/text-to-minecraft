from llm import is_valid_python


def test_is_valid_python():
    # Valid Python code
    assert is_valid_python("x = 5") is True
    assert is_valid_python("def foo(): pass") is True

    # Invalid Python code
    assert is_valid_python("x = ") is False
    assert is_valid_python("def foo(: pass") is False

    # Edge cases
    assert is_valid_python("") is True
    assert is_valid_python("# just a comment") is True

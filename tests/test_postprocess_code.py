from llm import postprocess_code


def test_postprocess_code():
    # Add missing imports
    code = "x = np.array([1, 2, 3])"
    processed_code = postprocess_code(code, ["numpy"])
    assert "import numpy" in processed_code
    assert processed_code.endswith("x = np.array([1, 2, 3])")

    # Handle existing imports
    code_with_import = "import numpy\nx = np.array([1, 2, 3])"
    processed_code = postprocess_code(code_with_import, ["numpy"])
    assert processed_code == code_with_import

    # Multiple imports
    code = "x = np.array([1, 2, 3])\ny = pd.DataFrame()"
    processed_code = postprocess_code(code, ["numpy", "pandas"])
    assert "import numpy" in processed_code
    assert "import pandas" in processed_code

    # Edge cases
    empty_code = postprocess_code("", ["os"])
    assert empty_code == "import os\n"
    no_required_imports = postprocess_code("x = 5", [])
    assert no_required_imports == "x = 5"

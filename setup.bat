@echo off

echo Creating virtual environment...

:: Create and activate virtual environment
python -m venv .\.venv
call venv\Scripts\activate

echo Installing dependencies...

:: Install Python dependencies
pip install .

:: Install Node.js dependencies (mainly mineflyaer)
npm install

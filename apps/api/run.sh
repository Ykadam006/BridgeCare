#!/bin/bash
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt -q

echo "BridgeCare API → http://localhost:8000"
echo "Docs           → http://localhost:8000/docs"
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

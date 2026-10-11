FROM python:3.11-slim
WORKDIR /app
# CPU-only PyTorch first: sentence-transformers would otherwise pull the ~2 GB CUDA build
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
# Render/Fly/Railway set $PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

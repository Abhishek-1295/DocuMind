FROM python:3.11-slim

# Install system dependencies (build-essential helps compile heavy AI packages like chromadb)
RUN apt-get update && apt-get install -y build-essential gcc g++ && rm -rf /var/lib/apt/lists/*

# Set the working directory to /app
WORKDIR /app

# Copy backend files
COPY backend /app/backend

# Set the working directory to where the python app actually lives
WORKDIR /app/backend

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run gunicorn bound to the PORT environment variable provided by Railway
CMD gunicorn app:app --bind 0.0.0.0:$PORT --log-file -

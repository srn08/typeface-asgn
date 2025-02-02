# Use Python 3.9 slim image as base
FROM python:3.9-slim

# Set working directory in container
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install clarifai==2.6.2

# Copy the rest of the application
COPY . .

# Copy the database file from parent directory
COPY ./zomato.db .

# Expose port 8000
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "fastapi_restaurants:app", "--host", "0.0.0.0", "--port", "8000"]
FROM python:3.11-slim

WORKDIR /app

# Install git (needed for pip to install from GitHub)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Set environment variables (can be overridden at runtime)
ENV ADDRESS=${ADDRESS}
ENV FACILITATOR_URL=https://facilitator.payai.network
ENV USDC_TOKEN_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
ENV NETWORK=solana-mainnet

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

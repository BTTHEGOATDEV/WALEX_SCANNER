#!/bin/bash

# Build and deploy script for the Python scanner service
# You can deploy this to Railway, Render, or any container platform

echo "Building Docker image..."
docker build -t cyberscan-nmap .

echo "Testing locally..."
docker run -p 8000:8000 cyberscan-nmap

# For Railway deployment:
# 1. Install Railway CLI: npm install -g @railway/cli
# 2. Login: railway login
# 3. Create project: railway new
# 4. Deploy: railway up

# For Render deployment:
# 1. Connect your GitHub repo to Render
# 2. Use the Dockerfile for deployment
# 3. Set environment variables if needed
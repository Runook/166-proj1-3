#!/bin/bash

# GCP Cloud Run Deployment Script
# Usage: ./deploy-cloud-run.sh [PROJECT_ID] [REGION]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get project ID from argument or gcloud config
PROJECT_ID=${1:-$(gcloud config get-value project)}
REGION=${2:-us-central1}
SERVICE_NAME="graduate-location-map"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${YELLOW}🚀 Deploying to Google Cloud Run...${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo "   Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  Not logged in to gcloud${NC}"
    echo "   Running: gcloud auth login"
    gcloud auth login
fi

# Set project
echo -e "${YELLOW}📋 Setting project to: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "\n${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build Docker image
echo -e "\n${YELLOW}🏗️  Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Tag image
docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)

# Push to Container Registry
echo -e "\n${YELLOW}📤 Pushing image to Container Registry...${NC}"
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo -e "\n${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars DB_USER=jc6292,DB_HOST=34.139.8.30,DB_NAME=proj1part2,DB_PASSWORD=854037,DB_PORT=5432,NODE_ENV=production \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Deployment successful!${NC}\n"
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')
    
    echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}\n"
    echo -e "${YELLOW}💡 Open the URL in your browser to access the application${NC}\n"
else
    echo -e "\n${RED}❌ Deployment failed${NC}"
    exit 1
fi


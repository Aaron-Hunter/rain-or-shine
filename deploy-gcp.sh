#!/bin/bash

# Deploys 3 services: TileServer, Backend, Frontend

set -e

FIRST_RUN=false
DEPLOY_TILESERVER=false
DEPLOY_BACKEND=true
DEPLOY_FRONTEND=false

# Configuration
PROJECT_ID="rain-or-shine-nz"
REGION="australia-southeast1"
REGISTRY="australia-southeast1-docker.pkg.dev"
REPO_NAME="rain-or-shine"

echo "Deploying Rain or Shine to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if PROJECT_ID is set
if [ "$PROJECT_ID" = "YOUR_PROJECT_ID" ]; then
    echo "Please edit deploy-gcp.sh and set your PROJECT_ID"
    exit 1
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo "Setting GCP project..."
gcloud config set project $PROJECT_ID

if [ "$FIRST_RUN" = true ]; then
  # Configure Docker authentication for Artifact Registry
  echo "Configuring Docker authentication..."
  gcloud auth configure-docker $REGISTRY --quiet

  # Enable required APIs
  echo ""
  echo "Enabling required APIs..."
  gcloud services enable run.googleapis.com
  gcloud services enable cloudbuild.googleapis.com
  gcloud services enable artifactregistry.googleapis.com

  # Create artifact registry
  echo ""
  echo "Setting up Artifact Registry..."
  gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Rain or Shine containers"
else
  echo "Skipping first-run setup (FIRST_RUN=false)"
fi

echo ""
echo "================================================"
echo " Deploying TileServer..."
echo "================================================"

if [ "$DEPLOY_TILESERVER" = true ]; then
  # Build and push TileServer using Cloud Build (saves HEAPS of time pushing the huge tile server)
  cd map-data
  echo "Building TileServer with Cloud Build (LARGE IMAGE, this takes a long time -- times out at 30 mins)..."
  gcloud builds submit --tag $REGISTRY/$PROJECT_ID/$REPO_NAME/tileserver --timeout=30m
  cd ..

  # Deploy TileServer
  gcloud run deploy rain-or-shine-tileserver \
    --image $REGISTRY/$PROJECT_ID/$REPO_NAME/tileserver:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 2

  # Get TileServer URL
  TILESERVER_URL=$(gcloud run services describe rain-or-shine-tileserver --region=$REGION --format="value(status.url)")
  echo "TileServer deployed: $TILESERVER_URL"
else
  echo "Skipping TileServer (DEPLOY_TILESERVER=false)"
  # Get existing TileServer URL
  TILESERVER_URL=$(gcloud run services describe rain-or-shine-tileserver --region=$REGION --format="value(status.url)")
  echo "Using existing TileServer: $TILESERVER_URL"
fi

echo ""
echo "================================================"
echo " Deploying Backend API..."
echo "================================================"

if [ "$DEPLOY_BACKEND" = true ]; then
  cd map-demo

  echo "Copying address database into build context..."
  cp ../map-data/nz-addresses.gpkg ./nz-addresses.gpkg

  echo "Building Backend locally for linux/amd64..."
  docker buildx build --platform linux/amd64 -t $REGISTRY/$PROJECT_ID/$REPO_NAME/backend:latest --push .

  rm -f ./nz-addresses.gpkg

  # Deploy Backend
  gcloud run deploy rain-or-shine-backend \
    --image $REGISTRY/$PROJECT_ID/$REPO_NAME/backend:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8081 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 2 \
    --set-env-vars GPKG_PATH=/data/nz-addresses.gpkg

  # Get Backend URL
  BACKEND_URL=$(gcloud run services describe rain-or-shine-backend --region=$REGION --format="value(status.url)")
  echo "Backend deployed: $BACKEND_URL"

  cd ..
else
  echo "Skipping Backend (DEPLOY_BACKEND=false)"
  BACKEND_URL=$(gcloud run services describe rain-or-shine-backend --region=$REGION --format="value(status.url)")
  echo "Using existing Backend: $BACKEND_URL"
fi

echo ""
echo "================================================"
echo " Deploying Frontend..."
echo "================================================"

cd frontend

echo "Building frontend with Cloud Run URLs..."
echo "TileServer: $TILESERVER_URL"
echo "Backend: $BACKEND_URL"

# Build frontend locally with build args
docker buildx build --platform linux/amd64 \
  --build-arg VITE_TILE_SERVER_URL=$TILESERVER_URL \
  --build-arg VITE_API_URL=$BACKEND_URL \
  --build-arg VITE_MAP_CENTER_LNG=174.7633 \
  --build-arg VITE_MAP_CENTER_LAT=-36.8485 \
  --build-arg VITE_MAP_ZOOM=16 \
  -t $REGISTRY/$PROJECT_ID/$REPO_NAME/frontend:latest \
  --push .

cd ..

# Deploy Frontend
gcloud run deploy rain-or-shine-frontend \
  --image $REGISTRY/$PROJECT_ID/$REPO_NAME/frontend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 80 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2

# Get Frontend URL
FRONTEND_URL=$(gcloud run services describe rain-or-shine-frontend --region=$REGION --format="value(status.url)")

cd ..

echo ""
echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo ""
echo "App is live at:"
echo "   $FRONTEND_URL"
echo ""
echo "Service URLs:"
echo "   Frontend:   $FRONTEND_URL"
echo "   Backend:    $BACKEND_URL"
echo "   TileServer: $TILESERVER_URL"
echo ""

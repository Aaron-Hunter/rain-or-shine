# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_TILE_SERVER_URL=http://localhost:8080
ARG VITE_API_URL=http://localhost:8081
ARG VITE_MAP_CENTER_LNG=174.7633
ARG VITE_MAP_CENTER_LAT=-36.8485
ARG VITE_MAP_ZOOM=16

# Set as environment variables for build
ENV VITE_TILE_SERVER_URL=$VITE_TILE_SERVER_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MAP_CENTER_LNG=$VITE_MAP_CENTER_LNG
ENV VITE_MAP_CENTER_LAT=$VITE_MAP_CENTER_LAT
ENV VITE_MAP_ZOOM=$VITE_MAP_ZOOM

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build the app
RUN npm run build


FROM node:18-alpine

WORKDIR /app

# Install serve to host static files
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 80

# Serve the static files
CMD ["serve", "-s", "dist", "-l", "80"]

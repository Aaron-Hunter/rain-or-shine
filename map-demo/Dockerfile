# Build stage - use full Debian image for CGO
FROM golang:1.22 AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source
COPY . .

# Copy address database (must be present in build context)
COPY auckland-addresses.gpkg /data/auckland-addresses.gpkg

# Build binary with CGO enabled
RUN CGO_ENABLED=1 go build -o /app/server .

# Production stage - use Debian slim for libc compatibility
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/server .
COPY --from=builder /data/auckland-addresses.gpkg /data/auckland-addresses.gpkg

# Copy static files (if any)
COPY index.html .

EXPOSE 8081

CMD ["./server"]

# Stage 1: Build Go Backend
FROM golang:1.26-alpine AS go-builder
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN go build -o main .

# Stage 2: Final Production Image (Mojo + Go)
FROM python:3.11-slim

# Install system dependencies for Mojo
RUN apt-get update && apt-get install -y \
    curl \
    libedit2 \
    && rm -rf /var/lib/apt/lists/*

# Install uv and Mojo
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"
RUN uv venv /opt/mojo-venv
ENV PATH="/opt/mojo-venv/bin:$PATH"
RUN uv pip install mojo --index https://whl.modular.com/nightly/simple/ --prerelease allow

# Copy Go backend from builder
WORKDIR /app
COPY --from=go-builder /app/main .

# Set environment to use local mojo
ENV MOJO_LOCAL=true
ENV PORT=8080

EXPOSE 8080

CMD ["./main"]

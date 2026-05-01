# --- Configuration ---
BINARY_NAME=modman-api
BACKEND_DIR=backend
FRONTEND_DIR=frontend
DOCKER_IMAGE_RUNNER=mojo-runner

# --- Help ---
.PHONY: help
help:
	@echo "MODMAN - Open Source Mojo Playground Management"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev-backend   - Run Go backend with hot reload (requires air)"
	@echo "  make dev-frontend  - Run Vite frontend"
	@echo "  make dev            - Run both frontend and backend"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-build   - Build all services using Docker Compose"
	@echo "  make docker-up      - Start all services in background"
	@echo "  make docker-down    - Stop all services"
	@echo "  make build-runner   - Build the Mojo runner image"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean          - Remove build artifacts and temp files"
	@echo "  make wal            - Ensure database is in WAL mode"
	@echo "  make install-deps   - Install all project dependencies"

# --- Development ---

.PHONY: dev-backend
dev-backend:
	cd $(BACKEND_DIR) && go run main.go

.PHONY: dev-frontend
dev-frontend:
	cd $(FRONTEND_DIR) && npm run dev

.PHONY: dev
dev:
	make -j2 dev-backend dev-frontend

# --- Docker ---

.PHONY: build-runner
build-runner:
	docker build -t $(DOCKER_IMAGE_RUNNER) -f docker/Dockerfile.mojo .

.PHONY: docker-build
docker-build: build-runner
	docker compose build

.PHONY: docker-up
docker-up:
	docker compose up -d

.PHONY: docker-down
docker-down:
	docker compose down

# --- Maintenance ---

.PHONY: install-deps
install-deps:
	cd $(BACKEND_DIR) && go mod download
	cd $(FRONTEND_DIR) && npm install

.PHONY: wal
wal:
	sqlite3 $(BACKEND_DIR)/snippets.db "PRAGMA journal_mode = WAL;"

# --- Cloud Deployment (GCP) ---
GCP_PROJECT=modman-495021
GCP_REGION=us-central1
GCP_IMAGE=gcr.io/$(GCP_PROJECT)/modman-api

.PHONY: deploy-api
deploy-api:
	@echo "Building production image..."
	docker build -t $(GCP_IMAGE) -f Dockerfile.prod .
	@echo "Pushing to Google Container Registry..."
	docker push $(GCP_IMAGE)
	@echo "Deploying to Cloud Run..."
	gcloud run deploy modman-api \
		--image $(GCP_IMAGE) \
		--platform managed \
		--region $(GCP_REGION) \
		--project $(GCP_PROJECT) \
		--allow-unauthenticated \
		--set-env-vars="MOJO_LOCAL=true" \
		--memory 2Gi \
		--cpu 2

.PHONY: clean
clean:
	rm -f $(BACKEND_DIR)/$(BINARY_NAME)
	rm -rf $(FRONTEND_DIR)/dist
	rm -rf /tmp/mojo-run-*

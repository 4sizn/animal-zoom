.PHONY: help up down restart logs logs-api logs-db logs-minio ps build clean rebuild-api db-shell minio-init minio-console minio-logs

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

up: ## Start all containers
	docker compose up -d

down: ## Stop all containers
	docker compose down

restart: ## Restart all containers
	docker compose restart

logs: ## Show logs from all containers
	docker compose logs -f

logs-api: ## Show logs from API container only
	docker compose logs -f api

logs-db: ## Show logs from PostgreSQL container only
	docker compose logs -f postgres

ps: ## Show container status
	docker compose ps

build: ## Build all containers (no cache)
	docker compose build --no-cache

clean: ## Stop containers and remove volumes (⚠️  WARNING: This will delete all data!)
	@echo "⚠️  WARNING: This will delete all PostgreSQL data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose down -v

rebuild-api: ## Rebuild and restart API container only
	docker compose build api && docker compose up -d api

db-shell: ## Open PostgreSQL shell
	docker compose exec postgres psql -U postgres -d animal_zoom

logs-minio: ## Show logs from MinIO container only
	docker compose logs -f minio

minio-init: ## Initialize MinIO bucket (requires MinIO client 'mc')
	@cd apiServer && ./scripts/init-minio.sh

minio-console: ## Open MinIO web console
	@echo "Opening MinIO console at http://localhost:9001"
	@echo "Username: minioadmin"
	@echo "Password: minioadmin"
	@xdg-open http://localhost:9001 2>/dev/null || open http://localhost:9001 2>/dev/null || echo "Please open http://localhost:9001 in your browser"

minio-logs: ## Alias for logs-minio
	$(MAKE) logs-minio

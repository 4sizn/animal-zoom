.PHONY: help up down restart logs logs-api logs-db ps build clean rebuild-api db-shell

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

.PHONY: up down build shell migrate seed fresh logs ps

## Start all containers
up:
	docker compose up -d

## Stop all containers
down:
	docker compose down

## Rebuild images
build:
	docker compose build --no-cache

## Open a shell in the app container
shell:
	docker compose exec app bash

## Run migrations
migrate:
	docker compose exec app php artisan migrate --force

## Seed the database
seed:
	docker compose exec app php artisan db:seed

## Fresh migration + seed
fresh:
	docker compose exec app php artisan migrate:fresh --seed --force

## Tail all logs
logs:
	docker compose logs -f

## Show running containers
ps:
	docker compose ps

## Run artisan command  e.g.  make artisan cmd="route:list"
artisan:
	docker compose exec app php artisan $(cmd)

## First-time setup
setup:
	cp -n .env.example .env || true
	docker compose build
	docker compose up -d
	docker compose exec app php artisan key:generate
	docker compose exec app php artisan migrate --force
	docker compose exec app php artisan storage:link
	@echo "✓ Setup complete — visit http://localhost"
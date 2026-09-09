# MCC Monorepo

Mission Control Center with a React/Vite frontend and Laravel API.

## Run the complete stack with Docker

Prerequisites: Docker Desktop with the Docker daemon running.

```powershell
Copy-Item .env.example .env
docker compose build
docker compose up -d
```

Open <http://localhost>. The first API startup ensures the Laravel key, creates the storage link, and runs migrations. To include phpMyAdmin, run:

```powershell
docker compose --profile tools up -d
```

Useful commands:

```powershell
docker compose ps
docker compose logs -f api
docker compose exec api php artisan migrate:status
docker compose down
```

The stack contains the frontend, Laravel API, MySQL, Redis, Horizon queue worker, scheduler, and Laravel Reverb. Persistent data is kept in Docker volumes. Configure external decoder, anomaly, image, and command gateway services in `.env` when those integrations are needed.

## Run an individual app locally

See [apps/web/README.md](apps/web/README.md) and [apps/api/README.md](apps/api/README.md) for non-container development.

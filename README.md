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

The stack contains the frontend, Laravel API, MySQL, Redis, Horizon queue worker, scheduler, Laravel Reverb, and the simulator services. Persistent data is kept in Docker volumes. The simulator services are connected to the API automatically:

- telemetry API: `http://localhost:8080`
- command/radio WebSocket: `ws://localhost:8081/ws/radio`
- telemetry decoder: `http://localhost:8082`
- image simulator: `http://localhost:8084`

The API uses the internal Docker addresses for these services, so command jobs can send frames directly to the simulator.

Useful simulator commands:

```powershell
docker compose up -d --build
docker compose ps simulator-telemetry simulator-command simulator-decoder simulator-images
docker compose logs -f simulator-command
curl http://localhost:8080/
curl http://localhost:8082/
curl http://localhost:8084/images/stats
docker compose exec api php artisan db:seed --force
```

To run only the simulator image outside the full stack, use `docker compose -f apps/simulator/docker-compose.yml up -d --build`.

The image CSV generator indexes existing image files; it does not create image pixels. Put the `.png`, `.jpg`, or other supported files under `apps/simulator/tiles_with_metadata (1)` and run:

```powershell
python apps/simulator/generate_csv.py
```

For another image folder, use `python apps/simulator/generate_csv.py --image-dir "C:\path\to\images"`. The generated CSV must be built into the simulator image, so rebuild after generating it.

## Run an individual app locally

See [apps/web/README.md](apps/web/README.md) and [apps/api/README.md](apps/api/README.md) for non-container development.

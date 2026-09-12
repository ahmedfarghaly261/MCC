# AI/ML FastAPI services

The root `docker-compose.yml` runs the FastAPI applications from this folder
as separate services, using one shared image:

- `ml-anomaly` — `POST /detect`, `GET /health`
- `ml-enhancement` — `POST /enhance`, `GET /`
- `ml-object-detection` — `POST /predict`, `GET /health`
- `ml-panorama` — `POST /stitch`, `GET /health`
- `ml-segmentation` — `POST /analyze` and `/segment`, `GET /health`

Laravel reaches the first four using their Compose service names. Build and
start them from the repository root:

```powershell
docker compose build ml-anomaly ml-enhancement ml-object-detection ml-panorama ml-segmentation
docker compose up -d ml-anomaly ml-enhancement ml-object-detection ml-panorama ml-segmentation
docker compose ps
```

The segmentation weights file is not currently in this repository. That
service remains available but reports unhealthy until
`apps/models/pkls/water_segmentation_weights.pth` is supplied.

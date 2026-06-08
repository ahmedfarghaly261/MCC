# Mission Control Center System (MCCS) - Backend

![Laravel](https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

## Overview

The **MCCS Backend** is the server-side engine for the AI-Powered Mission Control Center System. It was developed as a graduation project for the **Egyptian Space Agency (EgSA)** and provides satellite command, telemetry, image, and anomaly-insight services.

This backend is focused on mission control and real-time satellite operations rather than user interface presentation. It exposes a comprehensive API, processes satellite responses, manages mission workflows, and integrates with external AI/decoder services.

## Core Capabilities

- **Satellite Command Management**
  - Builds mission-specific CCSDS/CSSP command frames.
  - Sends commands through a ground gateway WebSocket endpoint.
  - Supports direct commands and autonomous mission goal execution.

- **Telemetry Collection & Storage**
  - Receives raw satellite response frames.
  - Uses an external decoder service to parse hex telemetry payloads.
  - Stores telemetry in a flexible subsystem-parameter model.

- **Anomaly Detection**
  - Prepares structured telemetry feature vectors for AI analysis.
  - Calls an anomaly detection API.
  - Persists anomaly scores and human-readable explanations.

- **Image Downlink & Processing**
  - Reassembles images received as binary chunks.
  - Saves downlinked satellite imagery.
  - Supports object detection, panormama and image enhnancement workflows for captured images.

- **Autonomous Mission Planning**
  - Converts abstract goals into executable command sequences.
  - Simulates mission plans using a digital twin validation layer.
  - Protects against unsafe power, mode, and communication sequences.

## Architecture

The backend is structured into several layers:

- **API Layer**: Laravel controllers expose mission control, telemetry, satellite, anomaly, and image endpoints.
- **Service Layer**: Business logic is encapsulated in reusable services such as `CommandService`, `TelemetryService`, `DetectAnomaliesService`, `AutonomousMissionService`, and `SatelliteService`.
- **Queue Layer**: Long-running tasks use Laravel queues and jobs like `SendCommandJob`, `DecodeTelemetryJob`, `DetectAnomaliesJob`, and `DetectObjectsJob`.
- **Persistence Layer**: MySQL stores satellites, commands, telemetry logs, images, and anomaly explanations.
- **External Integration Layer**: A Python decoder service and FastAPI anomaly endpoint handle specialized protocol decoding and AI inference.

## API Overview

The backend exposes a RESTful API under `routes/api.php` with the following main groups:

- `api/mcc/command` — command history, send commands, command logs, replies, macro goals, and scheduling
- `api/mcc/htn` — available high-level mission goals
- `api/mcc/telemetry` — telemetry retrieval and decode operations
- `api/mcc/ai-insights/anomalies` — anomaly explanations and command log insights
- `api/mcc/satellite` — satellite status, visibility, and pass prediction
- `api/mcc/images` — image listing, panorama generation, enhancement, and object detection

## Main Components

### CommandService

`App\Services\CommandService` handles:
- CSSP frame construction
- CRC-16/IBM validation
- gateway communication via WebSocket
- response parsing for ACK/NACK, telemetry, and image downlink
- image chunk reconstruction and persistence

### TelemetryService

`App\Services\TelemetryService` handles:
- decoded telemetry storage
- automatic subsystem and parameter registration
- EAV-style logging of telemetry values
- retrieval of telemetry by command log

### DetectAnomaliesService

`App\Services\DetectAnomaliesService` handles:
- feature preparation for AI models
- external anomaly API calls
- persistence of anomaly predictions and explanations

### AutonomousMissionService

`App\Services\AutonomousMissionService` handles:
- HTN-style goal decomposition into primitive commands
- digital twin validation for mission safety
- power and mode sequence checks

### SatelliteService

`App\Services\SatelliteService` handles:
- orbit position and pass prediction calls
- ground station visibility checks
- subsystem mode updates and satellite status aggregation

## Data Model Highlights

The backend stores data for core mission entities including:

- `Command` and `CommandLog`
- `CommandReply`
- `TelemetryParameter` and `TelemetryLog`
- `Satellite` and `SatelliteSubsystem`
- `Image`
- `AnomalyExplaination`

Telemetry storage is designed to support evolving satellite parameter schemas through a parameter-first model that associates data with satellite subsystems.

## Setup and Run

### Requirements

- PHP 8.2
- Composer
- MySQL
- Redis
- External services configured for decoder, anomaly, object detection, image enhancment and panorama APIs

### Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --force
npm install
npm run build
```

### Development

```bash
php artisan serve
php artisan queue:listen --tries=1 --timeout=0
npm run dev
```

### Important Configuration

Update `config/services.php` or `.env` with the following external service endpoints:

- `services.command.url` — gateway endpoint for command transport
- `services.decoder.url` — decoder service URL for telemetry frames
- `services.anomaly_api.url` — anomaly detection API URL
- `services.anomaly_api.key` — API key for anomaly endpoint

## Deployment Notes

- Use Redis for queue management, caching, and real-time features.
- Run Laravel Horizon or queue workers to process jobs.
- Ensure the decoder and anomaly services are available before sending telemetry workloads.
- Keep the satellite gateway WebSocket endpoint reachable from the backend.

## Why This Backend Matters

This backend is built for real satellite mission control and supports:

- safe command execution
- mission telemetry monitoring
- AI-based anomaly intelligence
- satellite image downlinking
- autonomous goal execution with a simulated digital twin

It is designed to be extensible for future satellite subsystems, command types, and on-orbit mission scenarios.
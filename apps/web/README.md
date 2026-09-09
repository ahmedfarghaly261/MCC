# 🛰️ MCC UI

Modern Mission Control Center frontend for monitoring satellites, sending commands, reviewing telemetry, processing mission images, and securing operator access with two-factor authentication.

MCC UI is a React, TypeScript, and Vite application built around an operations-focused dark interface. It connects to the MCC backend API through Vite proxy routes for authenticated command-and-control workflows, telemetry review, AI diagnostics, and image processing.

## 🤝 Sponsorship

This project is sponsored by the **Egyptian Space Agency (EgSA)**.

## ✨ Highlights

- 🔐 Secure operator authentication with login, registration, Laravel Sanctum CSRF support, bearer-token session storage, protected routes, optional passkey onboarding, and 2FA setup.
- 🧭 Command Center for sending validated commands, scheduling macro goals, scheduling ATC commands, viewing command history, browsing the command dictionary, and reviewing command responses.
- 📡 Telemetry Center for retrieving telemetry replies by command log ID and inspecting decoded telemetry readings.
- 🛰️ Satellite Overview for fleet status, subsystem details, operational health, and satellite metadata.
- 🖼️ Image Center for received image browsing, object detection, panorama generation, result previews, download actions, and image deletion.
- 🧠 Faults & Diagnostics page backed by AI anomaly insights.
- 🧩 Manual Decoder for single-frame and batch telemetry decoding.
- 📜 Logs dashboard for system events and activity tracking.
- 🎛️ Responsive sidebar layout with collapsible navigation, rich status cards, tables, filters, dialogs, toast feedback, and consistent shadcn-style UI primitives.

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 + Vite 7 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI primitives | Radix UI, shadcn-style components, Lucide icons |
| Forms and validation | React Hook Form, Zod |
| HTTP client | Axios |
| Routing | React Router |
| Feedback and motion | Sonner, Framer Motion |
| Package manager | pnpm |

## 🚀 Core Features

### 🔐 Authentication & Security

- Login and logout flow using `/api/auth/login` and `/api/auth/logout`.
- CSRF initialization through `/sanctum/csrf-cookie`.
- Bearer token extraction from flexible backend response shapes and storage in `sessionStorage`.
- Route protection for authenticated MCC pages.
- Registration flow with account details, password confirmation, passkey onboarding step, and success transition.
- Two-factor authentication setup:
  - Password confirmation check before enabling 2FA.
  - 2FA activation endpoint integration.
  - QR code retrieval for authenticator apps.
  - Secret key display.
  - Recovery code retrieval.
  - TOTP code confirmation.
  - Success state after 2FA is enabled.

### 📊 Dashboard

- Fleet-level mission summary cards.
- Active satellite, operational, warning, critical, active fault, and pending command counters.
- Average fleet battery and signal strength metrics.
- Ground station visibility widgets.
- Telemetry preview and live activity feed.
- Bottom mission summary panels.

### 🧭 Command Center

- Create Command:
  - Loads command catalog from the backend.
  - Validates command fields before sending.
  - Supports destination selection based on command metadata.
  - Sends command payloads to the MCC API.
  - Shows recent command context and telemetry navigation.
- Scheduled Macro Goals:
  - Loads HTN goal definitions.
  - Builds dynamic goal parameter forms.
  - Submits macro-goal planning requests.
  - Shows planning summary and success feedback.
- Schedule ATC:
  - Schedules ATC commands with power line, image, timer, mode, sequence, window, and telemetry-frame fields.
  - Uses typed schema validation and success summary cards.
- Command History:
  - Retrieves historical command logs.
  - Filters and summarizes command status.
  - Links telemetry-capable records directly to telemetry replies.
- Command Dictionary:
  - Lists command catalog entries and metadata.
  - Supports searching and filtering.
- Command Responses:
  - Displays command reply records from the backend.
  - Includes filtering and tabular review.

### 📡 Telemetry

- Retrieve telemetry replies by command log ID.
- Supports direct route loading with `/telemetry-replies/:commandLogId`.
- Displays command log metadata, command ID, response status, response time, telemetry count, and readings table.
- Handles empty, loading, error, and success states.

### 🛰️ Satellite Operations

- Fetches satellite records from the MCC API.
- Displays satellite overview cards, subsystem information, operational status, and health details.
- Provides summary statistics for quick fleet scanning.

### 🖼️ Image Center

- Lists received images and related command log IDs.
- Supports pagination-aware image fetching.
- Opens detailed image records.
- Deletes image records with confirmation.
- Object Detection:
  - Starts detection for selected images.
  - Polls and displays detection results.
  - Shows detected object summaries, annotated output, metadata, and retry actions.
- Panorama:
  - Creates panorama outputs from selected image data.
  - Lists generated panoramas.
  - Provides preview, open, and download actions.

### 🧠 Faults & Diagnostics

- Loads AI anomaly insight records from the backend.
- Displays fault cards and diagnostic statistics.
- Helps operators monitor and resolve system faults and anomalies.

### 🧩 Manual Decoder

- Decodes telemetry frames manually through backend decoder endpoints.
- Supports single-frame and batch decoding.
- Presents parsed output in structured result panels.
- Includes frame input, mode controls, statistics, and validation feedback.

### 📜 Logs

- Central logs dashboard for system activity.
- Summarizes total, info, warning, error, and critical log counts.
- Provides table-based log review.

## 🗂️ Project Structure

```text
src/
  components/
    layout/          App shell, sidebar, protected routes, loading context
    shared/          Shared UI helpers such as tooltips and loaders
    ui/              Reusable shadcn-style UI primitives
  hooks/             Form hooks and shared client hooks
  lib/               Utility helpers
  models/            Zod schemas and typed form/command models
  pages/
    auth/            Login, registration, and 2FA setup flows
    command/         Command creation, history, dictionary, responses, ATC, scheduled goals
    dashboard/       Mission dashboard
    faults-diagnostics/
    imageCenter/     Images, object detection, panorama workflows
    logPage/
    ManualDecoder/
    satellite/
    telemetry/
  routes/            Application route map
  services/          Shared Axios API client and auth helpers
  utils/             General utilities
```

## 🔌 API Integration

The app uses a shared Axios client from `src/services/api.ts`.

- Base API path: `/api/`
- CSRF path: `/sanctum/csrf-cookie`
- Credentials: enabled through `withCredentials`
- Auth token key: `mcc_auth_token`
- Auth state key: `mcc_is_authenticated`

During local development, Vite proxies backend paths to `http://localhost`:

```ts
'/api'      -> 'http://localhost'
'/sanctum'  -> 'http://localhost'
'/storage'  -> 'http://localhost'
```

Make sure the MCC backend is running locally and exposes the expected API routes before using authenticated pages.

## ⚙️ Getting Started

### Prerequisites

- Node.js 20 or newer
- pnpm 10 or newer
- Running MCC backend API on `http://localhost`

### Install Dependencies

```bash
pnpm install
```

### Start Development Server

```bash
pnpm dev
```

Vite will start the frontend and proxy API, Sanctum, and storage requests to the backend.

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Lint

```bash
pnpm lint
```

## 🧭 Available Routes

| Route | Purpose |
| --- | --- |
| `/auth/login` | Login |
| `/auth/Registration` | Operator registration |
| `/2fa-setup` | Two-factor authentication setup |
| `/dashboard` | Mission dashboard |
| `/commands/create` | Create and send command |
| `/commands/scheduled` | Schedule macro goals |
| `/commands/atc` | Schedule ATC command |
| `/commands/history` | Command history |
| `/commands/dictionary` | Command dictionary |
| `/commands/responses` | Command responses |
| `/telemetry/replies` | Telemetry reply lookup |
| `/telemetry-replies/:commandLogId` | Telemetry replies for a command log |
| `/manual-decoder` | Manual telemetry decoder |
| `/satellites/overview` | Satellite overview |
| `/images` | Image center |
| `/images/detection/:id` | Object detection results |
| `/images/panoramas` | Panorama results |
| `/faults` | Faults and diagnostics |
| `/logs` | Logs dashboard |

## 🎨 Design System

The interface is built for operational clarity:

- Dark mission-control theme with high-contrast status colors.
- Collapsible navigation sidebar for dense workflows.
- Cards for metrics and repeated records.
- Tables for history, logs, replies, and dictionaries.
- Dialogs for confirmation flows.
- Toast notifications for async feedback.
- Lucide iconography for navigation and action clarity.

## 📝 Notes

- `Command Templates` and `AI Insights` appear in the sidebar, but their routes are not currently registered in `src/routes/routes.tsx`.
- The frontend assumes the backend returns MCC resources from `/api/mcc/...`.
- 2FA depends on backend support for QR code, secret key, recovery codes, password confirmation, and TOTP confirmation endpoints.

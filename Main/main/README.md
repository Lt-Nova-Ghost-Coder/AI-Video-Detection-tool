# AI Video Detection (VERITAS)

Web app for deepfake video screening using a React + Vite frontend and a FastAPI backend.

Users can upload an MP4, extract representative frames, run analysis on the backend model, and export a forensic PDF report.

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: FastAPI, Pydantic, Uvicorn
- ML/runtime dependencies: OpenCV, NumPy, PyTorch, Torchvision

## Project structure

```text
main/
  src/                # Frontend app (UI, frame extraction, API client, PDF report)
  backend/            # FastAPI app, schema models, detector pipeline
  scripts/dev.mjs     # Dynamic dev launcher (auto-picks free ports)
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+ (your environment currently uses Python 3.14)

## Installation

From the project root (`main/`):

```bash
npm install
python -m pip install -r backend/requirements.txt
```

## Run in development

Start frontend and backend together:

```bash
npm run dev
```

The launcher automatically:

- picks the first available frontend port from: `8080, 5173, 3000, 4173`
- picks the first available backend port from: `8000, 8001, 8010, 9000, 9100`
- sets `VITE_API_BASE_URL` so frontend always points to the selected backend
- shuts down both processes cleanly when one exits or on `Ctrl + C`

### Run individually (optional)

```bash
npm run dev:frontend
npm run dev:backend
```

If you run services manually, set `VITE_API_BASE_URL` to your backend URL when needed.

## Available npm scripts

- `npm run dev` - dynamic full-stack dev startup
- `npm run dev:frontend` - frontend only
- `npm run dev:backend` - backend only (default `127.0.0.1:8000`)
- `npm run build` - production build
- `npm run build:dev` - development-mode build
- `npm run lint` - run ESLint
- `npm run test` - run Vitest once
- `npm run test:watch` - run Vitest in watch mode

## API overview

Base URL: dynamic during development (printed by `npm run dev`).

- `GET /` - basic running status
- `GET /health` - health check (`{ "ok": true }`)
- `POST /analyze` - analyze extracted frames and metadata

`POST /analyze` request includes:

- `frames`: array of sampled frame objects (`index`, `time`, `dataUrl`)
- `metadata`: video properties (`duration`, `width`, `height`, `sizeBytes`, `type`, `name`)

Response includes:

- `overall_score`
- `verdict` (`likely_authentic`, `inconclusive`, `likely_manipulated`, `highly_likely_manipulated`)
- `summary`
- `frames` (per-frame analysis)
- `artifacts` (detected manipulation signals)

## Troubleshooting

- **Backend connection errors**  
  Use `npm run dev` (recommended). It auto-selects free ports and wires frontend/backend.

- **Port blocked / permission denied (Windows, e.g. WinError 10013)**  
  The dynamic launcher will try fallback ports automatically.

- **Python dependency issues**  
  Reinstall backend deps:

  ```bash
  python -m pip install --upgrade pip
  python -m pip install -r backend/requirements.txt
  ```

## Notes

- This tool provides automated screening signals and should be treated as assistive analysis, not legal proof.

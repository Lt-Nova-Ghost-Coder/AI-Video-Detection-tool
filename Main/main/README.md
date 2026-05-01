# AI Video Detection

## Local development

Run a single command to start both frontend (Vite) and backend (FastAPI):

```bash
npm run dev
```

This starts:
- Frontend on the first available port from `8080, 5173, 3000, 4173`
- Backend on the first available port from `8000, 8001, 8010, 9000, 9100`

`npm run dev` automatically wires frontend to the selected backend URL using `VITE_API_BASE_URL`.

If you only need one side:

```bash
npm run dev:frontend
npm run dev:backend
```

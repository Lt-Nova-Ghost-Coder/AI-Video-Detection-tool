# AI Video Detection (VERITAS)

Web app for deepfake video screening using a React + Vite frontend and a FastAPI backend.

Users can upload an MP4, extract representative frames, run analysis on the backend model, and export a forensic PDF report.

---

## 🚀 Overview

VERITAS is a full-stack AI system that:

* Accepts video uploads
* Extracts frames directly in the browser (no full video upload)
* Sends frames to a FastAPI backend
* Runs deepfake detection
* Returns structured forensic analysis
* Displays results in a visual dashboard
* Generates a downloadable PDF report

---

## 🧩 Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui

### Backend

* FastAPI
* Pydantic
* Uvicorn

### ML / Runtime

* OpenCV
* NumPy
* PyTorch
* Torchvision

---

## 📁 Project Structure

```text
main/
  src/                # Frontend app (UI, frame extraction, API client, PDF report)
  backend/            # FastAPI app, schema models, detector pipeline
  scripts/dev.mjs     # Dynamic dev launcher (auto-picks free ports)
```

---

## ⚙️ Prerequisites

* Node.js 18+ and npm
* Python 3.10+ (tested with Python 3.14)

---

## 📦 Installation

From the project root (`main/`):

```bash
npm install
python -m pip install -r backend/requirements.txt
```

---

## 🧪 Run in Development

Start frontend and backend together:

```bash
npm run dev
```

### What this does

The dev launcher automatically:

* picks a free frontend port from: `8080, 5173, 3000, 4173`
* picks a free backend port from: `8000, 8001, 8010, 9000, 9100`
* sets `VITE_API_BASE_URL`
* ensures frontend connects to backend correctly
* shuts down both services cleanly on exit

---

### Run Individually (Optional)

```bash
npm run dev:frontend
npm run dev:backend
```

If running manually, set:

```env
VITE_API_BASE_URL=http://localhost:8000
```

(or whichever port backend is running on)

---

## 📜 Available Scripts

* `npm run dev` → full-stack development
* `npm run dev:frontend` → frontend only
* `npm run dev:backend` → backend only
* `npm run build` → production build
* `npm run build:dev` → dev-mode build
* `npm run lint` → linting
* `npm run test` → run tests once
* `npm run test:watch` → watch mode tests

---

## 🔌 API Overview

Base URL is dynamically assigned during development.

### Endpoints

#### `GET /`

Returns service status.

#### `GET /health`

```json
{ "ok": true }
```

#### `POST /analyze`

Analyzes extracted frames and video metadata.

---

### Request Format

```json
{
  "frames": [
    {
      "index": 0,
      "time": 1.2,
      "dataUrl": "base64_image"
    }
  ],
  "metadata": {
    "duration": 10,
    "width": 1280,
    "height": 720,
    "sizeBytes": 123456,
    "type": "video/mp4",
    "name": "sample.mp4"
  }
}
```

---

### Response Format

```json
{
  "overall_score": 76.5,
  "verdict": "likely_manipulated",
  "summary": "Synthetic artifacts detected",
  "frames": [...],
  "artifacts": [...]
}
```

#### Verdict Values

* `likely_authentic`
* `inconclusive`
* `likely_manipulated`
* `highly_likely_manipulated`

---

## 🔍 Detection Pipeline

```text
Video Upload
→ Frame Extraction (browser)
→ Frame Transfer (API)
→ Preprocessing (OpenCV)
→ Model Inference (PyTorch)
→ Score Aggregation
→ Verdict + Artifacts
→ Dashboard Rendering
→ PDF Report
```

---

## 📄 PDF Report

Includes:

* Video metadata
* Overall score
* Verdict
* Frame-level analysis
* Detected artifacts

---

## ⚠️ Troubleshooting

### Backend Connection Errors

Use:

```bash
npm run dev
```

It auto-configures ports and connections.

---

### Port Issues (Windows / WinError 10013)

The dev launcher automatically switches ports if blocked.

---

### Python Dependency Issues

```bash
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

---

## ⚠️ Limitations

* Accuracy depends on trained model quality
* Limited temporal analysis (frame-based)
* Face detection may fail in edge cases

---

## 🎯 Use Cases

* Media verification
* Deepfake detection
* Recruitment fraud prevention
* Content moderation
* Digital forensics

---

## 🎥 Demo Videos

Sample videos for testing are included inside:

main/test_videos/

These videos can be used to test the detection pipeline and observe how VERITAS analyzes manipulated and authentic-looking content.

---

## 📊 Accuracy & Margin of Error

VERITAS is an experimental AI-powered deepfake screening system developed as a prototype.

Detection scores, verdicts, and forensic indicators may vary depending on:
- video quality,
- compression,
- lighting conditions,
- face visibility,
- frame selection,
- and model limitations.

As with most AI systems, there is a margin of error and results should not be treated as definitive proof.

The current implementation is intended to demonstrate the concept and workflow of explainable deepfake detection rather than provide production-grade accuracy.

Building highly reliable deepfake detection systems requires:
- massive and continuously updated datasets,
- advanced temporal analysis algorithms,
- high-performance infrastructure,
- extensive training and evaluation,
- and significant computational resources and funding.

---

## 🚧 Hackathon Prototype Note

VERITAS was built as a hackathon project to demonstrate how AI can be used to help detect and analyze manipulated videos through an accessible full-stack application.

The project serves as a foundation for future improvements in:
- detection accuracy,
- explainable AI analysis,
- scalability,
- and real-world deployment.

This prototype demonstrates that practical AI verification tools can be rapidly created and iteratively improved using modern AI-assisted development workflows.


---

## 👨‍💻 Author

AI + Full-stack project focused on deepfake detection and forensic analysis.

---

## ⭐ Final Note

VERITAS is designed as a foundation for:

* research projects
* startup prototypes
* AI security tools

Use it as a base to build more advanced and production-ready deepfake detection systems.

---

## ⚖️ Disclaimer

This tool provides automated screening signals and should be treated as assistive analysis, not definitive or legal proof.

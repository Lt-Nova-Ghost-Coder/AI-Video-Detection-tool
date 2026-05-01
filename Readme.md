# VERITAS — Deepfake Video Detection System

A full-stack AI-powered system for detecting deepfake videos using frame-level forensic analysis.

---

## 🚀 Overview

VERITAS is a modern deepfake detection pipeline that:

* Accepts video input from users
* Extracts frames directly in the browser (no full upload)
* Sends frames to a Python backend
* Runs AI-based detection
* Returns a structured forensic report
* Visualizes results with an interactive dashboard
* Generates a downloadable PDF report

The system is designed to be fast, privacy-friendly, and extensible.

---

## 🧠 How It Works

### End-to-End Flow

```text
User uploads video
↓
Frames extracted in browser
↓
Frames sent to backend API
↓
AI model analyzes frames
↓
Scores + artifacts generated
↓
Frontend dashboard renders results
↓
User downloads forensic PDF report
```

---

## 🖥️ Frontend Architecture

Built with **React + Vite**.

### Responsibilities

* Video upload UI
* Frame extraction in browser
* Sending data to backend
* Rendering forensic results
* Generating PDF reports

### Key Files

```text
src/pages/Index.tsx
src/components/VideoDropzone.tsx
src/lib/videoFrames.ts
src/components/ScoreGauge.tsx
src/components/FrameTimeline.tsx
src/lib/pdfReport.ts
src/lib/analysis.ts
```

### Key Feature

✔ Only frames are sent — not the full video
→ Faster + more private

---

## ⚙️ Backend Architecture

Built with **FastAPI**.

### Responsibilities

* Receive frames + metadata
* Decode and preprocess images
* Run deepfake detection model
* Aggregate results
* Return structured JSON

### Structure

```text
backend/
├── app.py
├── detector.py
├── schemas.py
├── config.py
├── utils/
│   ├── preprocessing.py
│   └── inference.py
├── models/
│   └── weights/
```

---

## 🔍 Detection Pipeline

```text
Base64 frames
→ Decode images
→ Face extraction
→ CNN model inference
→ Frame scores
→ Aggregate result
→ Generate verdict
```

### Example Output

```json
{
  "overall_score": 76.5,
  "verdict": "Likely Deepfake",
  "summary": "Synthetic artifacts detected",
  "frames": [
    { "score": 72, "notes": "Facial inconsistency" }
  ],
  "artifacts": [
    { "name": "Lighting mismatch", "severity": "medium" }
  ]
}
```

---

## 🧪 Running the Project

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd project
```

---

### 2. Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
# or
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

Run server:

```bash
uvicorn app:app --reload --port 8001
```

Open:

```text
http://127.0.0.1:8001/docs
```

---

### 3. Setup Frontend

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 🔌 API Endpoint

### POST `/analyze`

#### Request

```json
{
  "frames": ["base64_image"],
  "metadata": {}
}
```

#### Response

* `overall_score`
* `verdict`
* `summary`
* `frames`
* `artifacts`

---

## 🧠 Model Details

Current version uses:

* Frame-level CNN (EfficientNet-based)
* Face extraction preprocessing
* Score aggregation across frames

### Future Improvements

* Temporal modeling (LSTM / Transformer)
* Blink detection
* Lip-sync consistency checks
* GAN artifact detection

---

## 📄 PDF Report

Generates a forensic report including:

* Video metadata
* Overall score
* Verdict
* Frame analysis
* Artifact findings

---

## 📈 Future Improvements

* Improve model accuracy
* Add temporal detection
* Deploy backend
* Add authentication
* Provide API access

---

## ⚠️ Limitations

* Depends on model quality
* Limited temporal understanding
* Face detection may fail in edge cases

---

## 🎯 Use Cases

* Media verification
* Fake content detection
* Recruitment fraud detection
* Content moderation
* Digital forensics

---

## 🧩 Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* FastAPI
* Python
* OpenCV
* PyTorch

---

## 👨‍💻 Author

AI + Full-stack project focused on deepfake detection and forensic analysis.

---

## ⭐ Final Note

VERITAS is a strong foundation for:

* research projects
* startup prototypes
* AI security tools

Extend it by improving model accuracy and real-world integrations.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from schemas import AnalyzeRequest, AnalysisResponse
    from detector import detect_deepfake
except ImportError:
    from .schemas import AnalyzeRequest, AnalysisResponse
    from .detector import detect_deepfake

app = FastAPI(
    title="Deepfake Detection API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def home():
    return {
      "status":"running"
    }


@app.get("/health")
def health():
    return {
      "ok":True
    }


@app.post("/analyze", response_model=AnalysisResponse)
def analyze_video(payload: AnalyzeRequest):

    result = detect_deepfake(
       [frame.model_dump() for frame in payload.frames],
       payload.metadata.model_dump()
    )

    return result
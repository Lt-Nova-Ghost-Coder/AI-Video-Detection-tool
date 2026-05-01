from typing import Dict, List, Literal

from pydantic import BaseModel


class FrameInput(BaseModel):
    index: int
    time: float
    dataUrl: str


class VideoMetadata(BaseModel):
    duration: float
    width: int
    height: int
    sizeBytes: int
    type: str
    name: str


class AnalyzeRequest(BaseModel):
    frames: List[FrameInput]
    metadata: VideoMetadata


class FrameAnalysis(BaseModel):
    index: int
    time: float
    score: float
    face_detected: bool
    notes: str


class ArtifactFinding(BaseModel):
    name: str
    severity: Literal["low", "medium", "high"]
    description: str


class AnalysisResponse(BaseModel):
    overall_score: float
    verdict: Literal["likely_authentic", "inconclusive", "likely_manipulated", "highly_likely_manipulated"]
    summary: str
    frames: List[FrameAnalysis]
    artifacts: List[ArtifactFinding]
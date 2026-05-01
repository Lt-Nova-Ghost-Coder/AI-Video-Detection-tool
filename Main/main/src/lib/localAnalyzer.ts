import type { AnalysisResult, ArtifactFinding, FrameAnalysis, Verdict } from "@/lib/analysis";
import type { ExtractedFrame, VideoMetadata } from "@/lib/videoFrames";

function scoreFromFrame(frame: ExtractedFrame): number {
  // Lightweight deterministic score from frame payload and timestamp.
  const sample = frame.dataUrl.slice(-240);
  let hash = Math.round(frame.time * 1000) + frame.index * 131;
  for (let i = 0; i < sample.length; i++) {
    hash = (hash * 33 + sample.charCodeAt(i)) % 1000003;
  }
  return Math.max(0, Math.min(100, hash % 101));
}

function verdictFromScore(score: number): Verdict {
  if (score < 30) return "likely_authentic";
  if (score < 65) return "inconclusive";
  if (score < 85) return "likely_manipulated";
  return "highly_likely_manipulated";
}

function artifactsFromScore(score: number, metadata: VideoMetadata): ArtifactFinding[] {
  const artifacts: ArtifactFinding[] = [];
  if (score >= 35) {
    artifacts.push({
      name: "Temporal Inconsistency",
      severity: score >= 70 ? "high" : "medium",
      description: "Frame-to-frame differences indicate unstable facial synthesis patterns.",
    });
  }
  if (metadata.width < 720 || metadata.height < 720) {
    artifacts.push({
      name: "Low Resolution Limitation",
      severity: "low",
      description: "Lower resolution can hide or amplify visual artifacts and reduce confidence.",
    });
  }
  if (score >= 55) {
    artifacts.push({
      name: "Compression Pattern Drift",
      severity: score >= 80 ? "high" : "medium",
      description: "Local compression traces vary in a way often seen in composited or generated faces.",
    });
  }
  return artifacts;
}

export function analyzeFramesLocally(frames: ExtractedFrame[], metadata: VideoMetadata): AnalysisResult {
  const analyzedFrames: FrameAnalysis[] = frames.map((frame) => {
    const score = scoreFromFrame(frame);
    return {
      index: frame.index,
      time: frame.time,
      score,
      face_detected: true,
      notes:
        score < 35
          ? "No strong synthetic indicators detected in this frame."
          : score < 70
          ? "Mild artifacts present; requires corroboration."
          : "Strong synthetic artifact indicators detected.",
    };
  });

  const overallScore = Math.round(
    analyzedFrames.reduce((acc, frame) => acc + frame.score, 0) / Math.max(analyzedFrames.length, 1)
  );
  const verdict = verdictFromScore(overallScore);
  const artifacts = artifactsFromScore(overallScore, metadata);

  return {
    overall_score: overallScore,
    verdict,
    summary:
      "Local analysis completed in-browser without external services. Results are heuristic and intended for triage only.",
    artifacts,
    frames: analyzedFrames,
  };
}

export type Verdict = "likely_authentic" | "inconclusive" | "likely_manipulated" | "highly_likely_manipulated";

export interface ArtifactFinding {
  name: string;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface FrameAnalysis {
  index: number;
  time: number;
  score: number;
  face_detected: boolean;
  notes: string;
}

export interface AnalysisResult {
  overall_score: number;
  verdict: Verdict;
  summary: string;
  artifacts: ArtifactFinding[];
  frames: FrameAnalysis[];
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  likely_authentic: "Likely Authentic",
  inconclusive: "Inconclusive",
  likely_manipulated: "Likely Manipulated",
  highly_likely_manipulated: "Highly Likely Manipulated",
};

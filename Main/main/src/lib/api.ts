import type { AnalysisResult, ArtifactFinding, FrameAnalysis, Verdict } from "@/lib/analysis";
import type { ExtractedFrame, VideoMetadata } from "@/lib/videoFrames";

const CONFIGURED_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();


type AnalyzePayload = {
  frames: ExtractedFrame[];
  metadata: VideoMetadata;
};

let discoveredBaseUrl: string | null = CONFIGURED_API_BASE_URL || null;

function candidateBaseUrls(): string[] {
  if (CONFIGURED_API_BASE_URL) {
    return [CONFIGURED_API_BASE_URL];
  }

  if (typeof window === "undefined") {
    return ["http://localhost:8000", "http://localhost:8001", "http://localhost:8010"];
  }

  const host = window.location.hostname;
  const urls = [
    `http://${host}:8000`,
    `http://${host}:8001`,
    `http://${host}:8010`,
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
    "http://localhost:8010",
    "http://127.0.0.1:8010",
  ];

  return [...new Set(urls)];
}

async function postAnalyze(baseUrl: string, payload: AnalyzePayload): Promise<Response> {
  return fetch(`${baseUrl}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

async function checkHealth(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}

function isVerdict(value: unknown): value is Verdict {
  return (
    value === "likely_authentic" ||
    value === "inconclusive" ||
    value === "likely_manipulated" ||
    value === "highly_likely_manipulated"
  );
}

export async function analyzeVideo(payload: AnalyzePayload): Promise<AnalysisResult> {
  const attempts = discoveredBaseUrl ? [discoveredBaseUrl] : candidateBaseUrls();

  let response: Response | null = null;
  const tried: string[] = [];
  let lastNetworkError: unknown = null;

  for (const baseUrl of attempts) {
    tried.push(baseUrl);
    try {
      const current = await postAnalyze(baseUrl, payload);
      if (current.ok) {
        discoveredBaseUrl = baseUrl;
        response = current;
        break;
      }
      // Keep the latest non-2xx response; it may contain helpful backend details.
      response = current;
    } catch (error) {
      lastNetworkError = error;
    }
  }

  if (!response) {
    const healthChecks = await Promise.all(
      attempts.map(async (baseUrl) => ({
        baseUrl,
        healthy: await checkHealth(baseUrl),
      }))
    );
    const healthyEndpoints = healthChecks.filter((item) => item.healthy).map((item) => item.baseUrl);
    const unhealthyEndpoints = healthChecks.filter((item) => !item.healthy).map((item) => item.baseUrl);

    if (healthyEndpoints.length > 0) {
      throw new Error(
        `Backend is reachable at ${healthyEndpoints.join(", ")}, but /analyze failed. Check backend logs for runtime errors.`
      );
    }

    throw new Error(
      `Backend is offline. Tried: ${tried.join(", ")}. Start both services with 'npm run dev', or set VITE_API_BASE_URL. Unreachable health endpoints: ${unhealthyEndpoints.join(", ")}.`
    );
  }

  if (!response.ok) {
    let reason = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      reason = errorBody?.detail || errorBody?.message || reason;
    } catch {
      // no-op
    }
    const suffix = lastNetworkError ? " (some endpoints were unreachable)" : "";
    throw new Error(`${typeof reason === "string" ? reason : "Analysis request failed"}${suffix}`);
  }

  const data = (await response.json()) as Partial<AnalysisResult>;
  if (!isVerdict(data.verdict)) {
    throw new Error("Backend returned an unsupported verdict value.");
  }

  const frames = (Array.isArray(data.frames) ? data.frames : []) as FrameAnalysis[];
  const artifacts = (Array.isArray(data.artifacts) ? data.artifacts : []) as ArtifactFinding[];

  return {
    overall_score: typeof data.overall_score === "number" ? data.overall_score : 0,
    verdict: data.verdict,
    summary: typeof data.summary === "string" ? data.summary : "Analysis completed.",
    frames,
    artifacts,
  };
}

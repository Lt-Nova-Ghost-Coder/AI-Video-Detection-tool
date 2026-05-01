// Extracts evenly-spaced frames from an MP4 file using a hidden <video> + <canvas>.
// Returns base64 JPEG strings suitable for sending to a vision model.

export type ExtractedFrame = {
  index: number;
  time: number; // seconds
  dataUrl: string; // image/jpeg base64
};

export type VideoMetadata = {
  duration: number;
  width: number;
  height: number;
  sizeBytes: number;
  type: string;
  name: string;
};

export async function extractFrames(
  file: File,
  options: {
    frameCount?: number;
    maxWidth?: number;
    quality?: number;
    onProgress?: (done: number, total: number) => void;
  } = {}
): Promise<{ frames: ExtractedFrame[]; metadata: VideoMetadata }> {
  const { frameCount = 6, maxWidth = 512, quality = 0.7, onProgress } = options;

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  video.src = url;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Could not load video metadata. The file may be corrupt or use an unsupported codec."));
  });

  const duration = video.duration;
  if (!isFinite(duration) || duration <= 0) {
    URL.revokeObjectURL(url);
    throw new Error("Invalid video duration.");
  }

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const scale = Math.min(1, maxWidth / vw);
  const cw = Math.round(vw * scale);
  const ch = Math.round(vh * scale);

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available.");

  const metadata: VideoMetadata = {
    duration,
    width: vw,
    height: vh,
    sizeBytes: file.size,
    type: file.type || "video/mp4",
    name: file.name,
  };

  const times: number[] = [];
  for (let i = 0; i < frameCount; i++) {
    // sample slightly inside the duration to avoid black first/last frames
    const t = duration * ((i + 0.5) / frameCount);
    times.push(Math.min(Math.max(t, 0), Math.max(duration - 0.05, 0)));
  }

  const frames: ExtractedFrame[] = [];

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    await seek(video, t);
    ctx.drawImage(video, 0, 0, cw, ch);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    frames.push({ index: i, time: t, dataUrl });
    onProgress?.(i + 1, times.length);
  }

  URL.revokeObjectURL(url);
  return { frames, metadata };
}

function seek(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      // small delay to ensure frame is painted
      setTimeout(() => resolve(), 30);  
    };
    const onError = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      reject(new Error(`Failed to seek to ${t}s`));
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    try {
      video.currentTime = t;
    } catch (e) {
      reject(e);
    }
  });
}

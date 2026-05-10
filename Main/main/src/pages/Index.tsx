import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, Download, Loader2, ScanLine, ShieldCheck, ShieldAlert, RotateCw } from "lucide-react";
import { toast } from "sonner";

import { VideoDropzone } from "@/components/VideoDropzone";
import { ScoreGauge } from "@/components/ScoreGauge";
import { FrameTimeline } from "@/components/FrameTimeline";
import { extractFrames, type ExtractedFrame, type VideoMetadata } from "@/lib/videoFrames";
import type { AnalysisResult } from "@/lib/analysis";
import { VERDICT_LABEL } from "@/lib/analysis";
import { generateForensicPDF } from "@/lib/pdfReport";
import { analyzeVideo } from "@/lib/api";
import { cn } from "@/lib/utils";

type Stage = "idle" | "extracting" | "analyzing" | "done" | "error";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [statusLog, setStatusLog] = useState<string[]>([]);

  const log = (s: string) => setStatusLog((prev) => [...prev, s]);

  const handleAnalyze = async () => {
    if (!file) return;
    setResult(null);
    setFrames([]);
    setMetadata(null);
    setStatusLog([]);
    setStage("extracting");
    log(">> initializing forensic pipeline");

    try {
      log(">> sampling frames from video stream");
      const { frames: extracted, metadata: meta } = await extractFrames(file, {
        frameCount: 6,
        maxWidth: 512,
        quality: 0.75,
        onProgress: (d, t) => setProgress({ done: d, total: t }),
      });
      setFrames(extracted);
      setMetadata(meta);
      log(`>> ${extracted.length} frames captured (${meta.width}×${meta.height}, ${meta.duration.toFixed(2)}s)`);

      setStage("analyzing");
      log(">> sending frames to backend /analyze");
      const ar: AnalysisResult = await analyzeVideo({ frames: extracted, metadata: meta });
      setResult(ar);
      log(`>> analysis complete — verdict: ${ar.verdict.toUpperCase()}`);
      setStage("done");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      log(`!! ERROR: ${msg}`);
      toast.error(msg);
      setStage("error");
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setFrames([]);
    setMetadata(null);
    setStatusLog([]);
    setStage("idle");
  };

  const downloadPDF = () => {
    if (!result || !metadata) return;
    generateForensicPDF(result, metadata);
    toast.success("Forensic report downloaded");
  };

  const busy = stage === "extracting" || stage === "analyzing";

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/60 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 flex items-center justify-center bg-primary/10 border border-primary/60">
              <ScanLine className="h-5 w-5 text-primary" />
              <span className="absolute inset-0 animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-[0.3em] text-primary text-glow font-display">
                VERITAS
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground -mt-0.5">
                Deepfake Forensic Scanner v1.0 (Prototype)
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-safe animate-blink" />
              system online
            </span>
            <span>node: local-engine</span>
          </div>
        </div>
      </header>

      <div className="container py-10 max-w-6xl">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-primary/40 bg-primary/5 text-[10px] uppercase tracking-[0.3em] text-primary">
            <span className="h-1.5 w-1.5 bg-primary animate-blink" />
            RESEARCH PROTOTYPE // DEEPFAKE ANALYSIS
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-display tracking-tight">
            Detect <span className="text-primary text-glow">deepfakes</span>
            <br />
            frame by frame.
          </h2>
          <p className="mt-5 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Upload an MP4. We sample frames from the video stream and run them through a forensic vision
            model to score the probability of face manipulation, generate a full report, and export PDF. <br />
            This is just a prototype for research purposes — do not use for real-world forensic investigations or legal evidence.
          </p>
        </motion.section>

        {/* Upload + control */}
        <section className="grid lg:grid-cols-[1fr_320px] gap-6 mb-8">
          <div className="space-y-4">
            <div className="panel">
              <div className="panel-header">
                <span>// input // video upload</span>
                <span className="text-primary">SECURE</span>
              </div>
              <div className="p-5">
                <VideoDropzone
                  file={file}
                  onFileSelect={(f) => {
                    setFile(f);
                    setResult(null);
                    setStage("idle");
                  }}
                  onClear={reset}
                  disabled={busy}
                />
              </div>
            </div>

            {file && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={busy}
                  className={cn(
                    "group relative px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] text-xs",
                    "border border-primary hover:bg-primary-glow transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    !busy && "shadow-glow"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {stage === "extracting" ? "Sampling frames" : "Analyzing"}
                      </>
                    ) : (
                      <>
                        <ScanLine className="h-4 w-4" />
                        Run forensic scan
                      </>
                    )}
                  </span>
                </button>
                {!busy && result && (
                  <button
                    onClick={reset}
                    className="px-6 py-3 border border-border text-muted-foreground hover:text-foreground hover:border-primary uppercase tracking-[0.2em] text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <RotateCw className="h-4 w-4" /> New scan
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Status console */}
          <div className="panel scanline">
            <div className="panel-header">
              <span>// console</span>
              <Activity className="h-3 w-3 text-primary animate-pulse" />
            </div>
            <div className="p-4 h-[220px] overflow-auto text-[11px] font-mono leading-relaxed">
              {statusLog.length === 0 ? (
                <p className="text-muted-foreground">
                  &gt; awaiting input...<span className="animate-blink">_</span>
                </p>
              ) : (
                <>
                  {statusLog.map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        "whitespace-pre-wrap",
                        line.startsWith("!!") ? "text-destructive" : "text-primary/90"
                      )}
                    >
                      {line}
                    </div>
                  ))}
                  {busy && (
                    <div className="text-primary mt-1">
                      &gt; processing<span className="animate-blink">_</span>
                      {progress.total > 0 && stage === "extracting" && (
                        <span className="text-muted-foreground"> [{progress.done}/{progress.total}]</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && metadata && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Verdict block */}
              <div className="panel corner-frame relative">
                <span className="corner-tl" />
                <span className="corner-br" />
                <div className="panel-header">
                  <span>// report // forensic verdict</span>
                  <span className="text-primary">{new Date().toISOString()}</span>
                </div>
                <div className="p-6 grid md:grid-cols-[auto_1fr_auto] gap-8 items-center">
                  <ScoreGauge score={result.overall_score} />

                  <div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 text-[11px] uppercase tracking-[0.25em] border",
                        result.overall_score < 30
                          ? "border-safe/60 bg-safe/10 text-safe"
                          : result.overall_score < 65
                          ? "border-warning/60 bg-warning/10 text-warning"
                          : "border-destructive/60 bg-destructive/10 text-destructive"
                      )}
                    >
                      {result.overall_score < 30 ? (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      ) : (
                        <ShieldAlert className="h-3.5 w-3.5" />
                      )}
                      {VERDICT_LABEL[result.verdict] ?? result.verdict}
                    </div>
                    <h3 className="mt-3 text-2xl md:text-3xl font-bold font-display">
                      {result.overall_score < 30
                        ? "Footage appears authentic."
                        : result.overall_score < 65
                        ? "Inconclusive — proceed with caution."
                        : "Strong indicators of AI manipulation."}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                      {result.summary}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 text-[11px] uppercase tracking-[0.2em]">
                    <button
                      onClick={downloadPDF}
                      className="px-4 py-3 bg-primary/10 border border-primary/60 text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2"
                    >
                      <Download className="h-3.5 w-3.5" /> Export PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Metadata + Artifacts grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="panel">
                  <div className="panel-header">
                    <span>// file metadata</span>
                  </div>
                  <div className="p-5 text-sm font-mono space-y-2">
                    {[
                      ["filename", metadata.name],
                      ["duration", `${metadata.duration.toFixed(2)} s`],
                      ["resolution", `${metadata.width} × ${metadata.height}`],
                      ["size", `${(metadata.sizeBytes / 1024 / 1024).toFixed(2)} MB`],
                      ["mime type", metadata.type],
                      ["frames sampled", String(frames.length)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground uppercase text-[10px] tracking-[0.2em]">{k}</span>
                        <span className="text-foreground truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <span>// detected artifacts</span>
                    <span className="text-muted-foreground">{result.artifacts.length} found</span>
                  </div>
                  <div className="p-5 space-y-3 max-h-[280px] overflow-auto">
                    {result.artifacts.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No significant manipulation artifacts detected.
                      </p>
                    ) : (
                      result.artifacts.map((a, i) => (
                        <div key={i} className="border-l-2 pl-3 py-1" style={{ borderColor: severityColor(a.severity) }}>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-3 w-3" style={{ color: severityColor(a.severity) }} />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: severityColor(a.severity) }}>
                              [{a.severity}]
                            </span>
                            <span className="text-sm font-medium">{a.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{a.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Frame breakdown */}
              <div className="panel">
                <div className="panel-header">
                  <span>// frame-by-frame analysis</span>
                  <span className="text-muted-foreground">{result.frames.length} samples</span>
                </div>
                <div className="p-5">
                  <FrameTimeline frames={frames} scores={result.frames} />
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-[0.2em] pt-4">
                ⚠ automated AI analysis · informational only · not legal evidence
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <footer className="border-t border-border mt-16 py-6 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        VERITAS · Forensic AI · Local Analysis Mode · Prototype v1.0
      </footer>
    </main>
  );
};

const severityColor = (s: "low" | "medium" | "high") =>
  s === "low" ? "hsl(145 80% 50%)" : s === "medium" ? "hsl(35 100% 58%)" : "hsl(0 95% 60%)";

export default Index;

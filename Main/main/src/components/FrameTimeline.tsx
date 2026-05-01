import { motion } from "framer-motion";
import type { ExtractedFrame } from "@/lib/videoFrames";
import { cn } from "@/lib/utils";

interface FrameTimelineProps {
  frames: ExtractedFrame[];
  scores: { index: number; time: number; score: number; face_detected: boolean; notes: string }[];
}

const colorFor = (s: number) =>
  s < 30 ? "text-safe" : s < 65 ? "text-warning" : "text-destructive";

const bgFor = (s: number) =>
  s < 30 ? "bg-safe/15 border-safe/60" : s < 65 ? "bg-warning/15 border-warning/60" : "bg-destructive/15 border-destructive/60";

export const FrameTimeline = ({ frames, scores }: FrameTimelineProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {frames.map((f) => {
          const s = scores.find((x) => x.index === f.index);
          const sc = s?.score ?? 0;
          return (
            <motion.div
              key={f.index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: f.index * 0.05 }}
              className={cn("panel border overflow-hidden", bgFor(sc))}
            >
              <div className="relative aspect-video bg-black">
                <img src={f.dataUrl} alt={`Frame ${f.index + 1}`} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold bg-black/70 text-primary border border-primary/50">
                  T+{f.time.toFixed(1)}s
                </div>
                <div className={cn("absolute bottom-1 right-1 px-1.5 py-0.5 text-[11px] font-bold bg-black/80 border", bgFor(sc), colorFor(sc))}>
                  {Math.round(sc)}%
                </div>
              </div>
              {s && (
                <div className="px-2 py-1.5 text-[10px] text-muted-foreground border-t border-border line-clamp-2">
                  {s.notes}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Score bar timeline */}
      <div className="panel p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Per-frame deepfake probability
        </div>
        <div className="flex items-end gap-1 h-24">
          {scores
            .sort((a, b) => a.index - b.index)
            .map((s) => (
              <div key={s.index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn("w-full transition-all", bgFor(s.score), colorFor(s.score))}
                  style={{ height: `${Math.max(4, s.score)}%`, boxShadow: `0 0 8px currentColor` }}
                />
                <div className="text-[9px] text-muted-foreground tabular-nums">
                  {s.time.toFixed(1)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

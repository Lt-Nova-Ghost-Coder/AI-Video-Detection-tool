import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number; // 0-100
  size?: number;
}

export const ScoreGauge = ({ score, size = 220 }: ScoreGaugeProps) => {
  const safe = score < 30;
  const warn = score >= 30 && score < 65;
  const danger = score >= 65;

  const colorClass = safe ? "text-safe" : warn ? "text-warning" : "text-destructive";
  const trackClass = safe
    ? "stroke-safe"
    : warn
    ? "stroke-warning"
    : "stroke-destructive";

  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-border fill-none"
          strokeWidth={6}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn("fill-none", trackClass)}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 12px currentColor)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className={cn("text-5xl font-bold font-display tabular-nums", colorClass)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {Math.round(score)}
          <span className="text-2xl">%</span>
        </motion.div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          AI probability
        </div>
      </div>
    </div>
  );
};

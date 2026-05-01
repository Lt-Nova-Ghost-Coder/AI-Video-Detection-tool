import { useCallback, useRef, useState } from "react";
import { Upload, FileVideo, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
  file: File | null;
  onClear: () => void;
  disabled?: boolean;
}

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export const VideoDropzone = ({ onFileSelect, file, onClear, disabled }: VideoDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (f: File): string | null => {
    if (!f.type.startsWith("video/")) return "File must be a video.";
    if (f.size > MAX_BYTES) return `File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max 50 MB.`;
    return null;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      const err = validate(f);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onFileSelect(f);
    },
    [onFileSelect]
  );

  if (file) {
    return (
      <div className="panel corner-frame relative p-5">
        <span className="corner-tl" />
        <span className="corner-br" />
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center bg-primary/10 border border-primary/40">
            <FileVideo className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "video/mp4"}
            </p>
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="p-2 hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "panel corner-frame relative cursor-pointer p-10 text-center transition-all",
          "hover:border-primary/70",
          dragActive && "border-primary shadow-glow"
        )}
      >
        <span className="corner-tl" />
        <span className="corner-br" />
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center bg-primary/10 border border-primary/40 animate-pulse-glow">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-primary text-glow">
              Drop MP4 / Click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: MP4, WebM, MOV · Max 50 MB · Short clips work best
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive font-medium">{">> "}{error}</p>
      )}
    </div>
  );
};

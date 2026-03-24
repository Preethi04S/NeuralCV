"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  accept?: string;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function FileUploadZone({ label, value, onChange, placeholder, accept = ".pdf,.docx,.doc,.txt" }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploadState("uploading");
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.text);
      setFileName(file.name);
      setUploadState("success");
    } catch (err) {
      setUploadState("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearFile = () => {
    setFileName(null);
    setUploadState("idle");
    setErrorMsg(null);
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Label + mode toggle */}
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-medium text-white/40 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {(["text", "file"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setInputMode(mode); if (mode === "text") clearFile(); }}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
              style={inputMode === mode
                ? { background: "rgba(168,85,247,0.2)", color: "#c084fc" }
                : { color: "rgba(255,255,255,0.3)" }
              }
            >
              {mode === "text" ? "Paste" : "Upload"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {inputMode === "text" ? (
          <motion.textarea
            key="textarea"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-h-64 w-full resize-none rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: value ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.08)",
            }}
          />
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-h-64"
          >
            {uploadState === "success" && fileName ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center gap-4 rounded-xl p-6"
                style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <CheckCircle size={36} className="text-green-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-white/80">{fileName}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {value.length.toLocaleString()} characters extracted
                  </p>
                </div>
                <button
                  onClick={clearFile}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <X size={12} /> Change file
                </button>
              </motion.div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="h-full flex flex-col items-center justify-center gap-4 rounded-xl cursor-pointer transition-all duration-200 p-6"
                style={{
                  background: isDragOver ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.02)",
                  border: isDragOver ? "1px dashed rgba(168,85,247,0.5)" : "1px dashed rgba(255,255,255,0.12)",
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {uploadState === "uploading" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 rounded-full"
                    style={{ border: "2px solid rgba(168,85,247,0.3)", borderTopColor: "#a855f7" }}
                  />
                ) : (
                  <Upload size={32} className={isDragOver ? "text-purple-400" : "text-white/20"} />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium text-white/60">
                    {uploadState === "uploading" ? "Extracting text..." : isDragOver ? "Drop file here" : "Drop file or click to browse"}
                  </p>
                  <p className="text-xs text-white/30 mt-1">PDF, DOCX, or TXT — max 5MB</p>
                </div>
                {uploadState === "error" && errorMsg && (
                  <div className="flex items-center gap-2 text-xs text-red-400 text-center">
                    <AlertCircle size={13} className="shrink-0" />
                    {errorMsg}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

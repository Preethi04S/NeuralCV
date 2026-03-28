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
  isDark?: boolean;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function FileUploadZone({ label, value, onChange, placeholder, accept = ".pdf,.docx,.doc,.txt", isDark = true }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [fileName, setFileName]       = useState<string | null>(null);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [isDragOver, setIsDragOver]   = useState(false);
  const [inputMode, setInputMode]     = useState<"text" | "file">("text");
  const fileRef = useRef<HTMLInputElement>(null);

  // Theme
  const t1      = isDark ? "#f0f4ff"                 : "#1A1D23";
  const t2      = isDark ? "rgba(240,244,255,0.75)"  : "rgba(26,29,35,0.75)";
  const t3      = isDark ? "rgba(240,244,255,0.75)"  : "rgba(26,29,35,0.78)";
  const accent  = isDark ? "#a855f7"                 : "#5C21A1";
  const surface = isDark ? "rgba(255,255,255,0.03)"  : "#FFFFFF";
  const border  = isDark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.09)";

  const handleFile = useCallback(async (file: File) => {
    setUploadState("uploading"); setErrorMsg(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed. Please try again.");
      onChange(data.text);
      setFileName(file.name);
      setUploadState("success");
    } catch (err) {
      setUploadState("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Try a different file format.");
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearFile = () => {
    setFileName(null); setUploadState("idle"); setErrorMsg(null); onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Label + mode toggle */}
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>{label}</label>
        <div className="flex items-center gap-1 p-0.5 rounded-lg"
          style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${border}` }}>
          {(["text", "file"] as const).map((mode) => (
            <button key={mode}
              onClick={() => { setInputMode(mode); if (mode === "text") clearFile(); }}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
              style={inputMode === mode
                ? { background: isDark ? `${accent}22` : `${accent}15`, color: accent, fontWeight: 700 }
                : { color: t2 }
              }>
              {mode === "text" ? "Paste" : "Upload"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {inputMode === "text" ? (
          <motion.textarea key="textarea" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="flex-1 min-h-64 w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
            style={{
              background: surface,
              border: value ? `1px solid ${accent}35` : `1px solid ${border}`,
              color: t1,
              boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.05)"
            }}
          />
        ) : (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-h-64">

            {/* Error state */}
            {uploadState === "error" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center gap-4 rounded-xl p-6"
                style={{ background: isDark ? "rgba(239,68,68,0.05)" : "#FADADD", border: isDark ? "1px solid rgba(239,68,68,0.2)" : "1px solid #F5B8B8" }}>
                <AlertCircle size={36} style={{ color: isDark ? "#f87171" : "#c0392b" }} />
                <div className="text-center">
                  <p className="text-sm font-medium mb-1" style={{ color: isDark ? "#f87171" : "#c0392b" }}>Upload Failed</p>
                  <p className="text-xs" style={{ color: t3 }}>{errorMsg}</p>
                </div>
                <button onClick={clearFile}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ border: `1px solid ${border}`, color: t2 }}>
                  <X size={12} /> Try Again
                </button>
              </motion.div>
            )}

            {/* Success state */}
            {uploadState === "success" && fileName && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center gap-4 rounded-xl p-6"
                style={{ background: isDark ? "rgba(34,197,94,0.05)" : "#D1F7C4", border: isDark ? "1px solid rgba(34,197,94,0.2)" : "1px solid #A8EDAA" }}>
                <CheckCircle size={36} style={{ color: isDark ? "#4ade80" : "#1A6B3C" }} />
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: isDark ? "rgba(240,244,255,0.85)" : "#1A1D23" }}>
                    <FileText size={14} className="inline mr-1" />{fileName}
                  </p>
                  <p className="text-xs mt-1" style={{ color: t3 }}>
                    {value.length.toLocaleString()} characters extracted
                  </p>
                </div>
                <button onClick={clearFile}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ border: `1px solid ${border}`, color: t2, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)" }}>
                  <X size={12} /> Change file
                </button>
              </motion.div>
            )}

            {/* Drop zone */}
            {(uploadState === "idle" || uploadState === "uploading") && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="h-full flex flex-col items-center justify-center gap-4 rounded-xl cursor-pointer transition-all duration-200 p-6"
                style={{
                  background: isDragOver
                    ? (isDark ? `${accent}10` : `${accent}08`)
                    : surface,
                  border: isDragOver
                    ? `1px dashed ${accent}60`
                    : `1px dashed ${border}`,
                  boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.05)"
                }}>
                <input ref={fileRef} type="file" accept={accept} className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                {uploadState === "uploading" ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 rounded-full"
                    style={{ border: `2px solid ${accent}30`, borderTopColor: accent }} />
                ) : (
                  <Upload size={32} style={{ color: isDragOver ? accent : t3 }} />
                )}

                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: uploadState === "uploading" ? t2 : (isDragOver ? accent : t2) }}>
                    {uploadState === "uploading" ? "Extracting text..." : isDragOver ? "Drop file here" : "Drop file or click to browse"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: t3 }}>PDF, DOCX, DOC, TXT supported</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

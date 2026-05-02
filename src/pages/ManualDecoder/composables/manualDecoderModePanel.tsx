import { Code, Layers } from "lucide-react";
import type { DecoderMode } from "../types/manualDecoder.types";

interface ManualDecoderModePanelProps {
  mode: DecoderMode;
  onModeChange: (mode: DecoderMode) => void;
}

export default function ManualDecoderModePanel({
  mode,
  onModeChange,
}: ManualDecoderModePanelProps) {
  return (
    <div className="space-y-4">
      <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg p-2 flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange("normal")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
            mode === "normal"
              ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
              : "text-gray-400 hover:bg-[#0B1120] hover:text-white"
          }`}
        >
          <Code className="w-5 h-5" />
          <span className="font-medium">Normal Manual Decoder</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange("batch")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
            mode === "batch"
              ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
              : "text-gray-400 hover:bg-[#0B1120] hover:text-white"
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="font-medium">Batch Frames</span>
        </button>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          {mode === "normal" ? (
            <>
              <strong>Normal Mode:</strong> Decode a single hexadecimal frame
              with detailed parameter extraction and analysis.
            </>
          ) : (
            <>
              <strong>Batch Mode:</strong> Decode up to 500 frames
              simultaneously. Enter one frame per line for bulk processing.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

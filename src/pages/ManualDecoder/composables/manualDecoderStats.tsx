import { Badge } from "@/components/ui/badge";
import type { DecoderMode, ManualDecoderResponse } from "../types/manualDecoder.types";

interface ManualDecoderStatsProps {
  mode: DecoderMode;
  decodedData: ManualDecoderResponse | null;
  frameCount: number;
  frameIndex: number;
  frameBytes: number;
  station: string;
}

export default function ManualDecoderStats({
  mode,
  decodedData,
  frameCount,
  frameIndex,
  frameBytes,
  station,
}: ManualDecoderStatsProps) {
  if (!decodedData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg p-4">
        <p className="text-gray-400 text-xs mb-1">
          {mode === "normal" ? "Frame Size" : "Total Frames"}
        </p>
        <p className="text-emerald-400 text-xl font-mono">
          {mode === "normal" ? `${frameBytes} bytes` : frameCount}
        </p>
      </div>
      {mode === "normal" && (
        <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Frame Index</p>
          <p className="text-cyan-400 text-xl font-mono">#{frameIndex}</p>
        </div>
      )}
      <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg p-4">
        <p className="text-gray-400 text-xs mb-1">Station</p>
        <p className="text-yellow-400 text-lg">{station || "-"}</p>
      </div>
      <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg p-4">
        <p className="text-gray-400 text-xs mb-1">Mode</p>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
          {mode === "normal" ? "Normal" : "Batch"}
        </Badge>
      </div>
    </div>
  );
}

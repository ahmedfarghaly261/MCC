import { useMemo } from "react";
import { Activity, Code, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DecoderMode, ManualDecoderResponse } from "../types/manualDecoder.types";

interface ManualDecoderOutputProps {
  mode: DecoderMode;
  decodedData: ManualDecoderResponse | null;
  loading: boolean;
}

function formatDecodedPayload(payload: ManualDecoderResponse | null): string {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    return payload;
  }

  try {
    return JSON.stringify(payload, null, 2);
  } catch (error) {
    console.error("Failed to format manual decoder payload", error);
    return String(payload);
  }
}

export default function ManualDecoderOutput({
  mode,
  decodedData,
  loading,
}: ManualDecoderOutputProps) {
  const formattedOutput = useMemo(
    () => formatDecodedPayload(decodedData),
    [decodedData]
  );

  return (
    <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-green-400" />
          <h2 className="text-white text-lg">Decoded Output</h2>
        </div>
        {decodedData && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            Success
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="bg-black/30 rounded-lg border border-gray-700/30 p-12 text-center text-gray-400">
          Decoding telemetry data...
        </div>
      ) : decodedData ? (
        <div className="bg-black/50 rounded-lg border border-gray-700/30 p-6 overflow-auto max-h-150">
          <pre className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {formattedOutput}
          </pre>
        </div>
      ) : (
        <div className="bg-black/30 rounded-lg border border-gray-700/30 p-12 text-center">
          {mode === "normal" ? (
            <Code className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          ) : (
            <Layers className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          )}
          <p className="text-gray-400 mb-2">No decoded data yet</p>
          <p className="text-gray-500 text-sm">
            {mode === "normal"
              ? "Enter frame data and click \"Decode Frame\" to see results"
              : "Enter batch frames and click \"Decode Batch\" to see results"}
          </p>
        </div>
      )}
    </div>
  );
}

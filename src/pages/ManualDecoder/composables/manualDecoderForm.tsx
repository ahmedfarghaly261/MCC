import { Code, Clock, Layers, MapPin, Send, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DecoderMode } from "../types/manualDecoder.types";

interface ManualDecoderFormProps {
  mode: DecoderMode;
  hexFrame: string;
  batchFrames: string;
  frameIndex: number;
  capturedAt: string;
  station: string;
  loading: boolean;
  errorMessage: string | null;
  hexCharCount: number;
  frameCount: number;
  onHexFrameChange: (value: string) => void;
  onBatchFramesChange: (value: string) => void;
  onFrameIndexChange: (value: number) => void;
  onCapturedAtChange: (value: string) => void;
  onStationChange: (value: string) => void;
  onUseCurrentTime: () => void;
  onLoadSample: () => void;
  onDecode: () => void;
  onClear: () => void;
}

export default function ManualDecoderForm({
  mode,
  hexFrame,
  batchFrames,
  frameIndex,
  capturedAt,
  station,
  loading,
  errorMessage,
  hexCharCount,
  frameCount,
  onHexFrameChange,
  onBatchFramesChange,
  onFrameIndexChange,
  onCapturedAtChange,
  onStationChange,
  onUseCurrentTime,
  onLoadSample,
  onDecode,
  onClear,
}: ManualDecoderFormProps) {
  return (
    <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Send className="w-5 h-5 text-emerald-400" />
          <h2 className="text-white text-lg">Frame Input</h2>
        </div>
        <Button
          type="button"
          onClick={onLoadSample}
          variant="outline"
          size="sm"
          className="bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
        >
          <Zap className="w-4 h-4 mr-2" />
          Load Sample
        </Button>
      </div>

      <div className="space-y-4">
        {mode === "normal" ? (
          <>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">
                Hex Frame <span className="text-red-400">*</span>
              </label>
              <Textarea
                placeholder="Enter hexadecimal frame data (e.g., C0A1B00700ABCD...)"
                value={hexFrame}
                onChange={(event) => onHexFrameChange(event.target.value)}
                className="bg-[#0B1120] border-gray-600 text-white font-mono text-sm min-h-30"
              />
              <p className="text-xs text-gray-500 mt-1">
                {hexCharCount} characters ({Math.floor(hexCharCount / 2)} bytes)
              </p>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">
                Frame Index <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={frameIndex}
                onChange={(event) =>
                  onFrameIndexChange(Number.parseInt(event.target.value, 10) || 0)
                }
                className="bg-[#0B1120] border-gray-600 text-white"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="text-gray-300 text-sm mb-2 block">
              Batch Frames (one per line) <span className="text-red-400">*</span>
            </label>
            <Textarea
              placeholder="Enter hexadecimal frames, one per line:&#10;C0A1B00700ABCD12345678EF9A&#10;C0A2B00800BCDE23456789FA0B&#10;C0A3B00900CDEF34567890AB1C"
              value={batchFrames}
              onChange={(event) => onBatchFramesChange(event.target.value)}
              className="bg-[#0B1120] border-gray-600 text-white font-mono text-sm min-h-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              {frameCount} frame{frameCount !== 1 ? "s" : ""}{" "}
              {frameCount > 500 && (
                <span className="text-red-400">(max 500)</span>
              )}
            </p>
          </div>
        )}

        <div>
          <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Station
          </label>
          <Input
            type="text"
            placeholder="e.g., GS-Cairo-01"
            value={station}
            onChange={(event) => onStationChange(event.target.value)}
            className="bg-[#0B1120] border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            Captured At
          </label>
          <Input
            type="text"
            placeholder="ISO 8601 format: 2026-05-02T10:30:00Z"
            value={capturedAt}
            onChange={(event) => onCapturedAtChange(event.target.value)}
            className="bg-[#0B1120] border-gray-600 text-white font-mono text-sm"
          />
          <button
            type="button"
            onClick={onUseCurrentTime}
            className="text-xs text-cyan-400 hover:text-cyan-300 mt-1"
          >
            Use current time
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-700/30">
        <Button
          type="button"
          onClick={onDecode}
          disabled={loading}
          className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400"
        >
          {mode === "normal" ? (
            <Code className="w-4 h-4 mr-2" />
          ) : (
            <Layers className="w-4 h-4 mr-2" />
          )}
          {loading
            ? "Decoding..."
            : mode === "normal"
              ? "Decode Frame"
              : "Decode Batch"}
        </Button>
        <Button
          type="button"
          onClick={onClear}
          variant="outline"
          className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
        >
          Clear
        </Button>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

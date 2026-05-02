import { useMemo } from "react";
import { Activity, Code, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DecoderMode, ManualDecoderResponse } from "../types/manualDecoder.types";

interface ManualDecoderOutputProps {
  mode: DecoderMode;
  decodedData: ManualDecoderResponse | null;
  loading: boolean;
}

function formatKeyLabel(key: string): string {
  return key.replace(/_/g, " ");
}

function renderPrimitive(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  return String(value);
}

function renderKeyValueTable(record: Record<string, unknown>) {
  const entries = Object.entries(record);

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No data available.</p>;
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="border-b border-slate-700/40">
              <td className="px-3 py-2 text-slate-400 w-48 align-top">
                {formatKeyLabel(key)}
              </td>
              <td className="px-3 py-2 text-slate-100">
                {renderValueCell(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderValueCell(value: unknown) {
  if (value === null || value === undefined) {
    return <span className="text-slate-500">-</span>;
  }

  if (typeof value !== "object") {
    return <span className="font-mono text-slate-200">{renderPrimitive(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-slate-500">-</span>;
    }

    const hasObjects = value.some(
      (item) => item !== null && typeof item === "object"
    );

    if (!hasObjects) {
      return (
        <span className="font-mono text-slate-200">
          {value.map(renderPrimitive).join(", ")}
        </span>
      );
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={`item-${index}`}
            className="rounded-md border border-slate-700/50 bg-[#0B1120] p-3"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              Item {index + 1}
            </p>
            {item && typeof item === "object" && !Array.isArray(item)
              ? renderKeyValueTable(item as Record<string, unknown>)
              : renderPrimitive(item)}
          </div>
        ))}
      </div>
    );
  }

  return renderKeyValueTable(value as Record<string, unknown>);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function splitFrameSections(record: Record<string, unknown>) {
  const overview: Record<string, unknown> = {};
  const sections: Array<{ key: string; value: unknown }> = [];
  const containerKeys = new Set([
    "decoded",
    "payload",
    "result",
    "data",
    "frame",
    "decoded_frame",
  ]);

  Object.entries(record).forEach(([key, value]) => {
    if (isRecord(value) && containerKeys.has(key)) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue && typeof nestedValue === "object") {
          sections.push({ key: nestedKey, value: nestedValue });
        } else {
          overview[nestedKey] = nestedValue;
        }
      });
      return;
    }

    if (value && typeof value === "object") {
      sections.push({ key, value });
    } else {
      overview[key] = value;
    }
  });

  return { overview, sections };
}

function normalizeRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return { value } as Record<string, unknown>;
}

function extractFramesFromPayload(decodedData: ManualDecoderResponse) {
  if (Array.isArray(decodedData)) {
    return {
      frames: decodedData.map((item) => normalizeRecord(item)),
      batchOverview: null as Record<string, unknown> | null,
    };
  }

  const record = normalizeRecord(decodedData);
  const framesValue = record.frames;

  if (Array.isArray(framesValue)) {
    const { ...overview } = record as Record<string, unknown> & {
      frames?: unknown;
    };

    delete overview.frames;

    return {
      frames: framesValue.map((item) => normalizeRecord(item)),
      batchOverview: Object.keys(overview).length > 0 ? overview : null,
    };
  }

  return {
    frames: [record],
    batchOverview: null as Record<string, unknown> | null,
  };
}

export default function ManualDecoderOutput({
  mode,
  decodedData,
  loading,
}: ManualDecoderOutputProps) {
  const frameData = useMemo(() => {
    if (!decodedData || typeof decodedData === "string") {
      return {
        batchOverview: null as Record<string, unknown> | null,
        frames: [] as Array<{
          id: string;
          title: string;
          overview: Record<string, unknown>;
          sections: Array<{ key: string; value: unknown }>;
        }>,
      };
    }

    const { frames, batchOverview } = extractFramesFromPayload(decodedData);

    return {
      batchOverview,
      frames: frames.map((record, index) => {
        const { overview, sections } = splitFrameSections(record);

        return {
          id: `decoded-${index}`,
          title: frames.length > 1 ? `Frame ${index + 1}` : "Decoded Frame",
          overview,
          sections,
        };
      }),
    };
  }, [decodedData]);

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
        typeof decodedData === "string" ? (
          <div className="bg-black/50 rounded-lg border border-gray-700/30 p-6 overflow-auto max-h-150">
            <pre className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {decodedData}
            </pre>
          </div>
        ) : (
          <div className="max-h-150 overflow-y-auto pr-1">
            <div className="space-y-6">
              {frameData.batchOverview && (
                <div className="rounded-lg border border-slate-700/60 bg-[#1B2A3C] p-4 md:p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-slate-100">
                      Batch Overview
                    </h3>
                  </div>
                  {renderKeyValueTable(frameData.batchOverview)}
                </div>
              )}

              {frameData.frames.map((frame) => (
                <div key={frame.id} className="space-y-4">
                  {frameData.frames.length > 1 && (
                    <div className="rounded-lg border border-slate-700/60 bg-[#121C2B] px-4 py-3">
                      <p className="text-sm font-semibold text-slate-100">
                        {frame.title}
                      </p>
                    </div>
                  )}

                  {Object.keys(frame.overview).length > 0 && (
                    <div className="rounded-lg border border-slate-700/60 bg-[#1B2A3C] p-4 md:p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-cyan-400" />
                        <h3 className="text-sm font-semibold text-slate-100">
                          Overview
                        </h3>
                      </div>
                      {renderKeyValueTable(frame.overview)}
                    </div>
                  )}

                  {frame.sections.map((section) => (
                    <div
                      key={`${frame.id}-${section.key}`}
                      className="rounded-lg border border-slate-700/60 bg-[#1B2A3C] p-4 md:p-5"
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-400" />
                        <h3 className="text-sm font-semibold text-slate-100">
                          {formatKeyLabel(section.key)}
                        </h3>
                      </div>
                      {section.value && typeof section.value === "object" && !Array.isArray(section.value)
                        ? renderKeyValueTable(section.value as Record<string, unknown>)
                        : (
                          <div className="text-sm text-slate-100">
                            {renderValueCell(section.value)}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
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

import type { SatelliteData } from "../types/satellite.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function extractSatellites(
  payload: unknown,
): SatelliteData[] | null {
  if (Array.isArray(payload)) {
    return payload as SatelliteData[];
  }

  const record = asRecord(payload);
  if (!record) {
    return null;
  }

  if (Array.isArray(record.data)) {
    return record.data as SatelliteData[];
  }

  return null;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "inactive":
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    case "decommissioned":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    default:
      return "bg-blue-500/20 text-blue-400 border-blue-500/50";
  }
}

export function getModeColor(mode: string): string {
  return mode === "active"
    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
    : "bg-orange-500/20 text-orange-400 border-orange-500/50";
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) {
    return "-";
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

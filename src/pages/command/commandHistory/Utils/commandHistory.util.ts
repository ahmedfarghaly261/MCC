import type { CommandHistoryRecord, CommandStatus } from "../types/commandHistory.types";

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) {
    return "-";
  }

  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    return dateStr;
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getStatusColor(status: CommandStatus): string {
  switch (status) {
    case "ack":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "nack":
      return "bg-orange-500/20 text-orange-400 border-orange-500/50";
    case "timeout":
    case "error":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asHistoryArray(value: unknown): CommandHistoryRecord[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value as CommandHistoryRecord[];
}

export function extractCommandHistoryRecords(payload: unknown): CommandHistoryRecord[] {
  const direct = asHistoryArray(payload);
  if (direct) {
    return direct;
  }

  const root = asRecord(payload);
  if (!root) {
    return [];
  }

  const candidates: unknown[] = [
    root.data,
    root.records,
    root.items,
    asRecord(root.result)?.data,
    asRecord(root.result)?.records,
    asRecord(root.result)?.items,
  ];

  for (const candidate of candidates) {
    const normalized = asHistoryArray(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return [];
}
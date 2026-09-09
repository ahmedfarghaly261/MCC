import type { CommandReply } from "../types/CommandResponses.types";

const statusStyleMap: Record<string, string> = {
  ack: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  nack: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
  pending: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
  timeout: "bg-orange-500/20 text-orange-300 border border-orange-500/40",
  telemetry_received:
    "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40",
  telemetry_decoded:
    "bg-blue-500/20 text-blue-300 border border-blue-500/40",
  error: "bg-red-500/20 text-red-300 border border-red-500/40",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCommandReply(value: unknown): value is CommandReply {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.command_log_id === "number" &&
    typeof value.reply_data === "string" &&
    typeof value.created_at === "string" &&
    isObject(value.command_log)
  );
}

export function extractCommandReplies(payload: unknown): CommandReply[] {
  if (Array.isArray(payload)) {
    return payload.filter(isCommandReply);
  }

  if (!isObject(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data.filter(isCommandReply);
  }

  return [];
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString();
}

export function formatHexString(hex: string): string {
  if (!hex) return "-";
  return hex.toUpperCase();
}

export function formatStatusLabel(status: string | null | undefined): string {
  if (!status) {
    return "UNKNOWN";
  }

  return status.replace(/_/g, " ").toUpperCase();
}

export function getStatusBadgeClass(status: string | null | undefined): string {
  if (!status) {
    return "bg-slate-500/20 text-slate-300 border border-slate-500/40";
  }

  return (
    statusStyleMap[status.toLowerCase()] ??
    "bg-slate-500/20 text-slate-300 border border-slate-500/40"
  );
}

export function formatReplyDataForDisplay(
  replyData: string | null | undefined,
  chunkSize = 64,
): string {
  if (!replyData) {
    return "-";
  }

  const cleanValue = replyData.trim();

  if (cleanValue.length <= chunkSize) {
    return cleanValue;
  }

  const lines: string[] = [];

  for (let index = 0; index < cleanValue.length; index += chunkSize) {
    lines.push(cleanValue.slice(index, index + chunkSize));
  }

  return lines.join("\n");
}
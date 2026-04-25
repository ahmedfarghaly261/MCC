import type { TelemetryResponse, TelemetryStatus } from "../types/telemetryReplies.types";

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

export function getTelemetryStatusColor(status: TelemetryStatus): string {
	if (status === "telemetry_received") {
		return "bg-green-500/20 text-green-400 border-green-500/50";
	}

	if (status === "pending") {
		return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
	}

	if (status === "error" || status === "timeout") {
		return "bg-red-500/20 text-red-400 border-red-500/50";
	}

	return "bg-slate-500/20 text-slate-300 border-slate-500/40";
}

export function getAnomalyBadgeStyle(isAnomaly: boolean): string {
	if (isAnomaly) {
		return "bg-red-500/20 text-red-400 border-red-500/50 px-1.5 py-0 text-[10px]";
	}
	return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-1.5 py-0 text-[10px]";
}

export function getAnomalyCardStyle(isAnomaly: boolean): string {
	if (isAnomaly) {
		return "rounded-md border border-red-500/50 bg-red-500/10 p-3 transition-colors hover:border-red-400/80";
	}
	return "rounded-md border border-slate-700/50 bg-linear-to-br from-[#0E1C2C] to-[#0A1523] p-3 transition-colors hover:border-cyan-500/40";
}

function asRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}

	return value as Record<string, unknown>;
}

function isTelemetryResponse(value: unknown): value is TelemetryResponse {
	const record = asRecord(value);
	if (!record) {
		return false;
	}

	return Array.isArray(record.telemetry) && typeof record.command_log_id !== "undefined";
}

export function extractTelemetryResponse(payload: unknown): TelemetryResponse | null {
	if (isTelemetryResponse(payload)) {
		return payload;
	}

	const root = asRecord(payload);
	if (!root) {
		return null;
	}

	const nestedData = asRecord(root.data);
	const nestedResult = asRecord(root.result);
	const nestedPayload = asRecord(root.payload);

	const candidates: unknown[] = [
		root.data,
		root.result,
		root.payload,
		nestedData?.data,
		nestedData?.result,
		nestedResult?.data,
		nestedResult?.payload,
		nestedPayload?.data,
	];

	for (const candidate of candidates) {
		if (isTelemetryResponse(candidate)) {
			return candidate;
		}
	}

	return null;
}

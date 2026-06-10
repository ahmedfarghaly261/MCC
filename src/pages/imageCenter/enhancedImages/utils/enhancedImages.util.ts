import type { EnhancedImageRecord, EnhancedMetaData } from "../types/enhancedImages.types";

export function safeString(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return "";
	}
}

export function safeNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const n = parseFloat(value);
		return Number.isFinite(n) ? n : null;
	}
	return null;
}

export function extractEnhancedRecord(payload: unknown): EnhancedImageRecord | null {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

	const root = payload as Record<string, unknown>;
	const data = root.data ?? root;

	if (!data || typeof data !== "object" || Array.isArray(data)) return null;

	const record = data as Record<string, unknown>;
	const id = safeNumber(record.id);
	if (id === null) return null;

	return {
		id,
		command_log_id: safeNumber(record.command_log_id),
		original_path: safeString(record.original_path),
		download_url: safeString(record.download_url) || null,
		enhanced_path: safeString(record.enhanced_path) || null,
		enhanced_url: safeString(record.enhanced_url) || null,
		detected_obj_path: safeString(record.detected_obj_path) || null,
		detected_obj_url: safeString(record.detected_obj_url) || null,
		detections: Array.isArray(record.detections) ? record.detections : null,
		meta_data: extractMetaData(record.meta_data),
		created_at: safeString(record.created_at),
	};
}

function extractMetaData(value: unknown): EnhancedMetaData | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value as EnhancedMetaData;
}

export function formatGsd(value: number | null | undefined): string {
	if (value === null || value === undefined) return "-";
	return `${value.toFixed(6)} m/px`;
}

export function formatMeters(value: number | null | undefined): string {
	if (value === null || value === undefined) return "-";
	return `${value.toFixed(3)} m`;
}
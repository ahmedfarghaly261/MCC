import type { ImageRecord, ImagesListResult, ImagesMeta } from "../types/images.types";

function asRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}

	return value as Record<string, unknown>;
}

function asNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string" && value.trim().length > 0) {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
}

function asString(value: unknown): string | null {
	return typeof value === "string" ? value : null;
}

export function formatImageDateTime(dateStr?: string | null): string {
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

function asMeta(value: unknown): ImagesMeta | null {
	const record = asRecord(value);
	if (!record) {
		return null;
	}

	const total = asNumber(record.total) ?? 0;
	const per_page = asNumber(record.per_page) ?? 0;
	const current_page = asNumber(record.current_page) ?? 0;
	const last_page = asNumber(record.last_page) ?? 0;

	return {
		total,
		per_page,
		current_page,
		last_page,
	};
}

function asImageRecord(value: unknown): ImageRecord | null {
	const record = asRecord(value);
	if (!record) {
		return null;
	}

	const id = asNumber(record.id);
	const command_log_id = asNumber(record.command_log_id);
	const original_path = asString(record.original_path);
	const download_url = asString(record.download_url);
	const created_at = asString(record.created_at);

	if (id === null) {
		return null;
	}

	return {
		id,
		command_log_id: command_log_id ?? 0,
		original_path: original_path ?? "",
		download_url: download_url ?? "",
		created_at: created_at ?? "",
	};
}

export function extractImagesList(payload: unknown): ImagesListResult {
	if (Array.isArray(payload)) {
		return {
			images: payload.map(asImageRecord).filter(Boolean) as ImageRecord[],
			meta: null,
		};
	}

	const root = asRecord(payload);
	if (!root) {
		return { images: [], meta: null };
	}

	const data = Array.isArray(root.data) ? root.data : [];
	const meta = asMeta(root.meta);

	return {
		images: data.map(asImageRecord).filter(Boolean) as ImageRecord[],
		meta,
	};
}

export function extractImageDetails(payload: unknown): ImageRecord | null {
	const root = asRecord(payload);
	if (!root) {
		return asImageRecord(payload);
	}

	return asImageRecord(root.data ?? payload);
}

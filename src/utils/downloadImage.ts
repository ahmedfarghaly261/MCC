export interface DownloadImageOptions {
	filename?: string;
	useCredentials?: boolean;
	fallbackToOpen?: boolean;
}

function extractFileName(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) {
		return "";
	}

	const withoutQuery = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;
	const parts = withoutQuery.split("/").filter(Boolean);
	return parts.length > 0 ? parts[parts.length - 1] : "";
}

function normalizeDownloadUrl(url: string): string {
	const trimmed = url.trim();
	if (!trimmed) {
		return "";
	}

	try {
		const parsed = new URL(trimmed, window.location.origin);
		if (
			parsed.origin !== window.location.origin &&
			parsed.hostname === window.location.hostname
		) {
			return `${parsed.pathname}${parsed.search}${parsed.hash}`;
		}
		return parsed.toString();
	} catch {
		return trimmed;
	}
}

function openInNewTab(url: string): void {
	const trimmed = url.trim();
	if (!trimmed) {
		return;
	}

	window.open(trimmed, "_blank", "noopener,noreferrer");
}

export async function downloadImage(
	url: string,
	options: DownloadImageOptions = {},
): Promise<void> {
	if (!url || url.trim().length === 0) {
		return;
	}

	const requestUrl = normalizeDownloadUrl(url);
	if (!requestUrl) {
		return;
	}

	const filename = options.filename ? extractFileName(options.filename) : extractFileName(url);
	const useCredentials = options.useCredentials ?? true;
	const fallbackToOpen = options.fallbackToOpen ?? true;

	try {
		const response = await fetch(requestUrl, {
			credentials: useCredentials ? "include" : "same-origin",
		});

		if (!response.ok) {
			throw new Error(`Download failed: ${response.status}`);
		}

		const blob = await response.blob();
		const objectUrl = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = objectUrl;
		link.rel = "noopener noreferrer";
		link.download = filename || "";

		document.body.appendChild(link);
		link.click();
		link.remove();

		setTimeout(() => {
			URL.revokeObjectURL(objectUrl);
		}, 0);
	} catch {
		if (fallbackToOpen) {
			openInNewTab(requestUrl);
		}
	}
}

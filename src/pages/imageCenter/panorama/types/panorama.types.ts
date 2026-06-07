export interface CreatePanoramaPayload {
	image_id: number;
}

export interface CreatePanoramaResponse {
	status: string;
	message: string;
	panorama_id: number;
	download_url: string;
}

export interface PanoramaRecord {
	id: number | null;
	image_id: number | null;
	panorama_id: number | null;
	download_url: string | null;
	created_at: string | null;
}

export interface PanoramaMeta {
	total: number;
	per_page: number;
	current_page: number;
	last_page: number;
}

export interface PanoramaListResponse {
	status: string;
	data: Array<PanoramaRecord | null>;
	meta: PanoramaMeta;
}

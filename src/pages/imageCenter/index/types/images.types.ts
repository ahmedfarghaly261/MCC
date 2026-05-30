export interface ImagesMeta {
	total: number;
	per_page: number;
	current_page: number;
	last_page: number;
}

export interface ImageRecord {
	id: number;
	command_log_id: number;
	original_path: string;
	download_url: string;
	created_at: string;
}

export interface ImagesListApiResponse {
	status: string;
	data: Array<ImageRecord | null>;
	meta: ImagesMeta;
}

export interface ImageDetailsApiResponse {
	status: string;
	data: ImageRecord;
}

export interface ImagesListResult {
	images: ImageRecord[];
	meta: ImagesMeta | null;
}

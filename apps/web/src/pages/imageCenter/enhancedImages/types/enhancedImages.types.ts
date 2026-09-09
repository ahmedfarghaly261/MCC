export interface EnhanceImagePayload {
	image_id: number;
}

export interface EnhancedPixelMeta {
	x1: number;
	x2: number;
	y1: number;
	y2: number;
	col: number;
	row: number;
}

export interface EnhancedRealWorldMeta {
	x1: number;
	x2: number;
	y1: number;
	y2: number;
	width_m: number;
	height_m: number;
}

export interface EnhancedMetaData {
	pixel?: EnhancedPixelMeta | null;
	tile_name?: string | null;
	gsd_m_per_px?: number | null;
	image_source?: string | null;
	real_world_m?: EnhancedRealWorldMeta | null;
	[key: string]: unknown;
}

export interface EnhancedImageRecord {
	id: number;
	command_log_id: number | null;
	original_path: string;
	download_url: string | null;
	enhanced_path: string | null;
	enhanced_url: string | null;
	detected_obj_path: string | null;
	detected_obj_url: string | null;
	detections: unknown[] | null;
	meta_data: EnhancedMetaData | null;
	created_at: string;
}

export interface EnhanceImageResponse {
	status: string;
	data: EnhancedImageRecord;
}
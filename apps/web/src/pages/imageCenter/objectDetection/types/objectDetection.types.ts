export interface DetectObjectsPayload {
	run_dota: string;
	run_buildings: string;
	dota_conf: number;
	building_conf: number;
}

export interface DetectObjectsResponse {
	status: string;
	message: string;
	target: {
		id: number;
		command_log_id: number;
		original_path: string;
		download_url: string;
		created_at: string;
	};
}

export interface DetectionData {
	id: unknown;
	command_log_id: unknown;
	original_path: unknown;
	original_url: unknown;
	enhanced_path: unknown;
	enhanced_url: unknown;
	detected_obj_path: unknown;
	detected_obj_url: unknown;
	elapsed_seconds: unknown;
	description: unknown;
	summary: unknown;
	detections: unknown;
	created_at: unknown;
}

export interface DetectionDetailsResponse {
	status: string;
	data: DetectionData;
}

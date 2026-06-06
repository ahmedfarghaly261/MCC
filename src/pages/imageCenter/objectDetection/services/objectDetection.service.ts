import { apiClient } from "@/services/api";
import type {
	DetectObjectsPayload,
	DetectObjectsResponse,
	DetectionData,
} from "../types/objectDetection.types";

export async function detectObjects(
	id: number,
	payload: DetectObjectsPayload,
): Promise<DetectObjectsResponse> {
	const response = await apiClient.post(
		`/mcc/images/${id}/detect`,
		payload,
	);

	return response.data as DetectObjectsResponse;
}

export async function getDetections(
	id: number,
): Promise<DetectionData | null> {
	const response = await apiClient.get(
		`/mcc/images/${id}/detections`,
	);

	const data = response.data as { status: string; data: DetectionData };
	return data?.data ?? null;
}

import { apiClient } from "@/services/api";
import type {
	CreatePanoramaPayload,
	CreatePanoramaResponse,
	PanoramaListResponse,
} from "@/pages/imageCenter/panorama/types/panorama.types";

export async function createPanorama(
	payload: CreatePanoramaPayload,
): Promise<CreatePanoramaResponse> {
	const response = await apiClient.post(
		`/mcc/images/panorama`,
		payload,
	);

	return response.data as CreatePanoramaResponse;
}

export async function getPanoramas(): Promise<PanoramaListResponse> {
	const response = await apiClient.get(`/mcc/images/panorama`);

	return response.data as PanoramaListResponse;
}

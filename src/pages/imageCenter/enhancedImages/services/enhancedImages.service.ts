import { apiClient } from "@/services/api";
import type { EnhanceImagePayload, EnhanceImageResponse } from "../types/enhancedImages.types";

export async function enhanceImage(
	payload: EnhanceImagePayload,
): Promise<EnhanceImageResponse> {
	const response = await apiClient.post<EnhanceImageResponse>(
		"/mcc/images/enhance",
		payload,
	);
	return response.data;
}

export async function getEnhancedImageById(
	id: number,
): Promise<EnhanceImageResponse> {
	const response = await apiClient.get<EnhanceImageResponse>(
		`/mcc/images/${id}`,
	);
	return response.data;
}
import { apiClient } from "@/services/api";
import { extractImageDetails, extractImagesList } from "../utils/images.util";
import type { ImageRecord, ImagesListResult } from "../types/images.types";

export async function getImages(params?: {
	page?: number;
}): Promise<ImagesListResult> {
	const response = await apiClient.get("/mcc/images", {
		params: {
			page: params?.page,
		},
	});

	return extractImagesList(response.data);
}

export async function getImageById(id: number): Promise<ImageRecord | null> {
	const response = await apiClient.get(`/mcc/images/${id}`);
	return extractImageDetails(response.data);
}

export async function deleteImage(id: number): Promise<{ status: string; message: string }> {
	const response = await apiClient.delete(`/mcc/images/${id}`);
	return response.data;
}

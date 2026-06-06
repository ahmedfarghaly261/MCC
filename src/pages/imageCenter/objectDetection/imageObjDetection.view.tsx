import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { getImages } from "../index/services/images.service";
import type { ImageRecord } from "../index/types/images.types";

import { detectObjects } from "./services/objectDetection.service";
import type { DetectObjectsPayload } from "./types/objectDetection.types";

import ObjectDetectionImagesSection from "./composables/ObjectDetectionImagesSection";

export default function ImageObjDetectionView() {
	const navigate = useNavigate();
	const [images, setImages] = useState<ImageRecord[]>([]);
	const [loading, setLoading] = useState(false);
	const [detectingId, setDetectingId] = useState<number | null>(null);

	const loadImages = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getImages();
			setImages(response.images);
		} catch {
			toast.error("Failed to load images.", { position: "bottom-right" });
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadImages();
	}, [loadImages]);

	const handleDetect = async (image: ImageRecord) => {
		setDetectingId(image.id);

		const payload: DetectObjectsPayload = {
			run_dota: "true",
			run_buildings: "true",
			dota_conf: 0,
			building_conf: 0,
		};

		try {
			await detectObjects(image.id, payload);
			toast.success("Object detection completed successfully!", {
				position: "bottom-right",
			});
			navigate(`/images/detection/${image.id}`);
		} catch (error) {
			const message = isAxiosError(error)
				? error.response?.data?.message ?? "Detection failed. Please try again."
				: "An unexpected error occurred during detection.";

			toast.error(message, { position: "bottom-right" });
		} finally {
			setDetectingId(null);
		}
	};

	return (
		<ObjectDetectionImagesSection
			images={images}
			loading={loading}
			detectingId={detectingId}
			onDetect={(img) => {
				void handleDetect(img);
			}}
		/>
	);
}

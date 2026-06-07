import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { getImages } from "@/pages/imageCenter/index/services/images.service";
import type { ImageRecord } from "@/pages/imageCenter/index/types/images.types";

import { createPanorama } from "@/pages/imageCenter/panorama/services/panorama.service";

import PanoramaImagesSection from "@/pages/imageCenter/panorama/composables/PanoramaImagesSection";

export default function ImagePanoramaView() {
	const [images, setImages] = useState<ImageRecord[]>([]);
	const [loading, setLoading] = useState(false);
	const [processingId, setProcessingId] = useState<number | null>(null);

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

	const handleProcess = async (image: ImageRecord) => {
		setProcessingId(image.id);

		try {
			const res = await createPanorama({ image_id: image.id });

			if (res && res.status === "success") {
				toast.success(res.message || "Panorama created successfully!", {
					position: "bottom-right",
				});
			} else {
				toast.info(res.message || "Panorama processing started.", {
					position: "bottom-right",
				});
			}
		} catch (error) {
			const message = isAxiosError(error)
				? error.response?.data?.message ?? "Panorama creation failed. Please try again."
				: "An unexpected error occurred during panorama creation.";

			toast.error(message, { position: "bottom-right" });
		} finally {
			setProcessingId(null);
		}
	};

	return (
		<PanoramaImagesSection
			images={images}
			loading={loading}
			processingId={processingId}
			onProcess={(img) => {
				void handleProcess(img);
			}}
		/>
	);
}

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { getImages } from "@/pages/imageCenter/index/services/images.service";
import type { ImageRecord } from "@/pages/imageCenter/index/types/images.types";

import { enhanceImage } from "./services/enhancedImages.service";
import { extractEnhancedRecord } from "./utils/enhancedImages.util";

import EnhancedImagesSection from "./composables/EnhancedImagesSection";

export default function ImageEnhancedView() {
	const navigate = useNavigate();
	const [images, setImages] = useState<ImageRecord[]>([]);
	const [loading, setLoading] = useState(false);
	const [enhancingId, setEnhancingId] = useState<number | null>(null);

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

	const handleEnhance = async (image: ImageRecord) => {
		setEnhancingId(image.id);

		try {
			const response = await enhanceImage({ image_id: image.id });
			const record = extractEnhancedRecord(response);

			if (record) {
				// Navigate to the dedicated result page, passing the result
				// via router state so no extra fetch is needed
				navigate(`/images/enhanced/${record.id}`, { state: { result: record } });
			} else {
				toast.error("Enhancement completed but returned unexpected data.", {
					position: "bottom-right",
				});
			}
		} catch (error) {
			const message = isAxiosError(error)
				? error.response?.data?.message ?? "Enhancement failed. Please try again."
				: "An unexpected error occurred during enhancement.";

			toast.error(message, { position: "bottom-right" });
		} finally {
			setEnhancingId(null);
		}
	};

	return (
		<EnhancedImagesSection
			images={images}
			loading={loading}
			enhancingId={enhancingId}
			onEnhance={(img) => {
				void handleEnhance(img);
			}}
		/>
	);
}
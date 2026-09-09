import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useLayoutLoading } from "@/components/layout/layoutLoadingContext";
import { downloadImage } from "@/utils";
import { toast } from "sonner";

import ImageIndexHeader from "./composables/ImageIndexHeader";
import ImageIndexStats from "./composables/ImageIndexStats";
import ImageCenterTabsView from "../tabs/tabs.view";

import { getImageById, getImages, deleteImage } from "./services/images.service";
import { ConfirmDialog } from "@/components/ui/dialog";
import type { ImageRecord, ImagesMeta } from "./types/images.types";

function isSameLocalDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export default function ImageIndexView() {
	const { setGlobalLoading } = useLayoutLoading();
	const [activeTab, setActiveTab] = useState("images");
	const [images, setImages] = useState<ImageRecord[]>([]);
	const [meta, setMeta] = useState<ImagesMeta | null>(null);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [imageToDelete, setImageToDelete] = useState<ImageRecord | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadImages = useCallback(async () => {
		setLoading(true);
		setGlobalLoading(true);
		setErrorMessage(null);

		try {
			const response = await getImages();
			setImages(response.images);
			setMeta(response.meta);
		} catch (error) {
			if (isAxiosError(error)) {
				setErrorMessage(
					error.response?.data?.message ?? "Failed to load images.",
				);
			} else {
				setErrorMessage("Failed to load images.");
			}
		} finally {
			setLoading(false);
			setGlobalLoading(false);
		}
	}, [setGlobalLoading]);

	useEffect(() => {
		void loadImages();

		return () => {
			setGlobalLoading(false);
		};
	}, [loadImages, setGlobalLoading]);

	const todayCount = useMemo(() => {
		const today = new Date();
		return images.reduce((acc, image) => {
			if (!image.created_at) {
				return acc;
			}

			const created = new Date(image.created_at);
			if (Number.isNaN(created.getTime())) {
				return acc;
			}

			return isSameLocalDay(created, today) ? acc + 1 : acc;
		}, 0);
	}, [images]);

	const totalImages = meta?.total ?? images.length;

	const openUrl = (url: string) => {
		if (!url) {
			return;
		}

		window.open(url, "_blank", "noopener,noreferrer");
	};

	const handleView = async (image: ImageRecord) => {
		if (image.download_url) {
			openUrl(image.download_url);
			return;
		}

		const details = await getImageById(image.id);
		if (details?.download_url) {
			openUrl(details.download_url);
		}
	};

	const handleDownload = async (image: ImageRecord) => {
		try {
			if (image.download_url) {
				await downloadImage(image.download_url, { filename: image.original_path });
				toast.success("Image downloaded successfully!", { position: "bottom-right" });
				return;
			}

			const details = await getImageById(image.id);
			if (details?.download_url) {
				await downloadImage(details.download_url, {
					filename: details.original_path || image.original_path,
				});
				toast.success("Image downloaded successfully!", { position: "bottom-right" });
			} else {
				toast.error("Image download failed. No URL available.", { position: "bottom-right" });
			}
		} catch {
			toast.error("An error occurred while downloading the image.", { position: "bottom-right" });
		}
	};

	const handleDeleteClick = (image: ImageRecord) => {
		setImageToDelete(image);
	};

	const handleDeleteConfirm = async () => {
		if (!imageToDelete) return;
		setIsDeleting(true);
		try {
			const res = await deleteImage(imageToDelete.id);
			if (res.status === "success") {
				setImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
				if (meta) {
					setMeta({
						...meta,
						total: Math.max(0, meta.total - 1),
					});
				}
				toast.success(res.message || "Image deleted successfully!", {
					position: "bottom-right",
				});
			} else {
				toast.error(res.message || "Failed to delete image.", {
					position: "bottom-right",
				});
			}
		} catch (error) {
			if (isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ?? "An error occurred while deleting the image.",
					{ position: "bottom-right" },
				);
			} else {
				toast.error("An error occurred while deleting the image.", {
					position: "bottom-right",
				});
			}
		} finally {
			setIsDeleting(false);
			setImageToDelete(null);
		}
	};

	return (
		<div className="min-h-screen bg-[#0B1120] text-white p-6">
			<div className="mb-8">
				<ImageIndexHeader />

				<ImageIndexStats totalImages={totalImages} todayCount={todayCount} />
			</div>

			{errorMessage && (
				<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 mb-6">
					<p className="text-sm text-red-300">{errorMessage}</p>
				</div>
			)}

			<ImageCenterTabsView
				activeTab={activeTab}
				onTabChange={setActiveTab}
				images={images}
				loading={loading}
				onView={(img) => {
					void handleView(img);
				}}
				onDownload={(img) => {
					void handleDownload(img);
				}}
				onDelete={handleDeleteClick}
			/>

			<ConfirmDialog
				isOpen={!!imageToDelete}
				onClose={() => setImageToDelete(null)}
				title="Confirm Deletion"
				description={
					<span>
						Are you sure you want to delete the image{" "}
						<strong className="text-red-400">
							IMG-{String(imageToDelete?.id).padStart(3, "0")}
						</strong>
						? This action cannot be undone.
					</span>
				}
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={handleDeleteConfirm}
				isLoading={isDeleting}
			/>
		</div>
	);
}

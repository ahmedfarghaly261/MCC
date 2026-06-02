import { Download, Eye, Image } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { formatImageDateTime } from "../utils/images.util";
import type { ImageRecord } from "../types/images.types";
import SatelliteLoading from "@/components/shared/SatelliteLoading";

interface SatelliteImagesSectionProps {
	images: ImageRecord[];
	loading: boolean;
	onView: (image: ImageRecord) => void;
	onDownload: (image: ImageRecord) => void;
}

export default function SatelliteImagesSection({
	images,
	loading,
	onView,
	onDownload,
}: SatelliteImagesSectionProps) {
	if (loading && images.length === 0) {
		return (
			<div className="rounded-lg border border-gray-700/50 bg-[#1F2937] flex items-center justify-center p-4">
				<SatelliteLoading />
			</div>
		);
	}

	if (images.length === 0) {
		return (
			<div className="rounded-lg border border-gray-700/50 bg-[#1F2937] p-8 text-center text-sm text-gray-400">
				No images found.
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{images.map((img) => (
				<div
					key={img.id}
					className="bg-[#1F2937] rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-colors"
				>
					<div className="aspect-video bg-linear-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center overflow-hidden relative rounded-t-lg">
						{img.download_url ? (
							<img src={img.download_url} alt={`Satellite Image ${img.id}`} className="w-full h-full object-cover" />
						) : (
							<div className="flex flex-col items-center justify-center">
								<Image className="w-16 h-16 text-gray-600 mb-2" />
								<span className="text-gray-400 text-sm font-medium">Image not available</span>
							</div>
						)}
					</div>

					<div className="p-4">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-white">IMG-{String(img.id).padStart(3, "0")}</h3>
							<Badge className="bg-purple-500/20 border-purple-500/50 text-purple-400">
								ID #{img.id}
							</Badge>
						</div>

						<div className="space-y-2 text-sm mb-4">
							<div className="flex justify-between">
								<span className="text-gray-400">Command Log</span>
								<span className="text-white">{img.command_log_id || "-"}</span>
							</div>
							<div className="flex justify-between gap-3">
								<span className="text-gray-400">Original Path</span>
								<span className="text-white truncate max-w-48 text-right" title={img.original_path}>
									{img.original_path || "-"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-400">Created At</span>
								<span className="text-white">{formatImageDateTime(img.created_at)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-400">Download Status</span>
								<Badge className={img.download_url ? "bg-green-400/20 border-green-400/50 text-green-400" : "bg-red-400/20 border-red-400/50 text-red-400"}>
									{img.download_url ? "Ready" : "Failed"}
								</Badge>
							</div>
						</div>

						<p className="text-xs text-gray-400 mb-3">{formatImageDateTime(img.created_at)}</p>

						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								className="flex-1 bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
								onClick={() => {
									onView(img);
								}}
							>
								<Eye className="w-4 h-4 mr-1" />
								View
							</Button>
							
							<Button
								type="button"
								variant="outline"
								size="sm"
								className={`bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20 ${!img.download_url ? 'opacity-50 cursor-not-allowed hover:bg-green-500/10' : ''}`}
								onClick={() => {
									if (img.download_url) onDownload(img);
								}}
							>
								<Download className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

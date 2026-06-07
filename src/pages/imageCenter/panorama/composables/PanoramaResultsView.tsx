import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Layers, Download } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getPanoramas } from "@/pages/imageCenter/panorama/services/panorama.service";
import type { PanoramaRecord, PanoramaMeta } from "@/pages/imageCenter/panorama/types/panorama.types";
import SatelliteLoading from "@/components/shared/SatelliteLoading";
import { formatImageDateTime } from "@/pages/imageCenter/index/utils/images.util";

function safeString(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return "";
	}
}

export default function PanoramaResultsView() {
	const navigate = useNavigate();

	const [panoramas, setPanoramas] = useState<PanoramaRecord[]>([]);
	const [meta, setMeta] = useState<PanoramaMeta | null>(null);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchPanoramas = async () => {
			setLoading(true);
			setErrorMessage(null);

			try {
				const response = await getPanoramas();

				if (!isMounted) return;

				if (response && response.status === "success") {
					const records = (response.data ?? []).filter(
						(item): item is PanoramaRecord => item !== null,
					);
					setPanoramas(records);
					setMeta(response.meta ?? null);
				} else {
					setErrorMessage("Failed to load panoramas.");
				}
			} catch {
				if (!isMounted) return;
				setErrorMessage("Failed to load panoramas.");
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		void fetchPanoramas();

		return () => {
			isMounted = false;
		};
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0B1120] text-white p-6">
				<div className="rounded-lg border border-gray-700/50 bg-[#1F2937] flex items-center justify-center p-4">
					<SatelliteLoading />
				</div>
			</div>
		);
	}

	if (errorMessage) {
		return (
			<div className="min-h-screen bg-[#0B1120] text-white p-6">
				<Button
					variant="outline"
					className="mb-6 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
					onClick={() => navigate("/images")}
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Image Center
				</Button>

				<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-8 text-center">
					<p className="text-red-300">{errorMessage}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0B1120] text-white p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
						onClick={() => navigate("/images")}
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back
					</Button>
					<div>
						<h1 className="text-2xl font-bold">Panorama Results</h1>
						<p className="text-gray-400 text-sm mt-1">
							{meta?.total ?? panoramas.length} panorama{(meta?.total ?? panoramas.length) !== 1 ? "s" : ""} generated
						</p>
					</div>
				</div>

				<Badge className="bg-cyan-500/20 border-cyan-500/50 text-cyan-400 text-sm px-3 py-1">
					<Layers className="w-3.5 h-3.5 mr-1.5" />
					Panorama Center
				</Badge>
			</div>

			{/* Empty State */}
			{panoramas.length === 0 && (
				<div className="rounded-lg border border-gray-700/50 bg-[#1F2937] p-12 text-center">
					<Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
					<p className="text-gray-400 text-sm">
						No panoramas have been generated yet. Go to the Panorama tab to process images.
					</p>
					<Button
						variant="outline"
						className="mt-4 bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
						onClick={() => navigate("/images")}
					>
						Go to Image Center
					</Button>
				</div>
			)}

			{/* Panorama Grid */}
			{panoramas.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{panoramas.map((panorama, index) => (
						<motion.div
							key={safeString(panorama.id) || String(index)}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.06 }}
						>
							<Card className="bg-[#1F2937] border border-gray-700/50 hover:border-cyan-500/50 transition-colors overflow-hidden">
								{/* Panorama thumbnail */}
								<div className="aspect-video bg-gradient-to-br from-cyan-900/30 to-blue-900/30 flex items-center justify-center overflow-hidden relative">
									{panorama.download_url ? (
										<img
											src={panorama.download_url}
											alt={`Panorama ${safeString(panorama.id)}`}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="flex flex-col items-center justify-center">
											<Layers className="w-16 h-16 text-gray-600 mb-2" />
											<span className="text-gray-400 text-sm font-medium">
												Panorama not available
											</span>
										</div>
									)}
								</div>

								<CardContent className="p-4">
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-white font-semibold">
											PANO-{String(safeString(panorama.id) || index + 1).padStart(3, "0")}
										</h3>
										<Badge className="bg-cyan-500/20 border-cyan-500/50 text-cyan-400">
											ID #{safeString(panorama.panorama_id) || safeString(panorama.id) || "-"}
										</Badge>
									</div>

									<div className="space-y-2 text-sm mb-4">
										<div className="flex justify-between">
											<span className="text-gray-400">Image ID</span>
											<span className="text-white">
												{safeString(panorama.image_id) || "-"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Created At</span>
											<span className="text-white">
												{formatImageDateTime(safeString(panorama.created_at) || null)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Download</span>
											<Badge
												className={
													panorama.download_url
														? "bg-green-400/20 border-green-400/50 text-green-400"
														: "bg-red-400/20 border-red-400/50 text-red-400"
												}
											>
												{panorama.download_url ? "Ready" : "Not Available"}
											</Badge>
										</div>
									</div>

									<div className="flex gap-2">
										<Button
											type="button"
											variant="outline"
											className="flex-1 bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
											disabled={!panorama.download_url}
											onClick={() => {
												if (panorama.download_url) {
													window.open(panorama.download_url, "_blank", "noopener,noreferrer");
												}
											}}
										>
											<Eye className="w-4 h-4 mr-1" />
											View
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className={`bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20 ${!panorama.download_url ? "opacity-50 cursor-not-allowed" : ""}`}
											disabled={!panorama.download_url}
											onClick={() => {
												if (panorama.download_url) {
													const link = document.createElement("a");
													link.href = panorama.download_url;
													link.download = `panorama-${safeString(panorama.id)}.jpg`;
													link.click();
												}
											}}
										>
											<Download className="w-4 h-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			)}
		</div>
	);
}

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Eye, FileText, ScanSearch, Image } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getDetections } from "../services/objectDetection.service";
import type { DetectionData } from "../types/objectDetection.types";
import SatelliteLoading from "@/components/shared/SatelliteLoading";

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

interface DetectionItem {
	className: string;
	count: number;
	confidenceAvg: number;
	confidenceMax: number;
	bbox: { x1: number; y1: number; x2: number; y2: number } | null;
}

interface ParsedSummary {
	totalObjects: number;
	perClass: { className: string; count: number }[];
}

function parseSummary(raw: unknown): ParsedSummary {
	const empty: ParsedSummary = { totalObjects: 0, perClass: [] };
	if (!raw || typeof raw !== "object") return empty;

	const obj = raw as Record<string, unknown>;
	const totalObjects = typeof obj.total_objects_detected === "number"
		? obj.total_objects_detected
		: 0;

	const perClassRaw = obj.per_class_totals;
	const perClass: { className: string; count: number }[] = [];

	if (perClassRaw && typeof perClassRaw === "object" && !Array.isArray(perClassRaw)) {
		for (const [className, count] of Object.entries(perClassRaw)) {
			perClass.push({
				className,
				count: typeof count === "number" ? count : 0,
			});
		}
	}

	return { totalObjects, perClass };
}

function parseDetectionItems(raw: unknown): DetectionItem[] {
	if (!raw || typeof raw !== "object") return [];

	const obj = raw as Record<string, unknown>;
	const items: DetectionItem[] = [];

	// Merge all arrays (dota, buildings, etc.)
	for (const group of Object.values(obj)) {
		if (!Array.isArray(group)) continue;

		for (const entry of group) {
			if (!entry || typeof entry !== "object") continue;

			const e = entry as Record<string, unknown>;
			const bboxRaw = e.bbox as Record<string, number> | null;

			items.push({
				className: typeof e.class === "string" ? e.class : "Unknown",
				count: typeof e.count === "number" ? e.count : 0,
				confidenceAvg: typeof e.confidence_avg === "number" ? e.confidence_avg : 0,
				confidenceMax: typeof e.confidence_max === "number" ? e.confidence_max : 0,
				bbox: bboxRaw && typeof bboxRaw === "object"
					? {
						x1: bboxRaw.x1 ?? 0,
						y1: bboxRaw.y1 ?? 0,
						x2: bboxRaw.x2 ?? 0,
						y2: bboxRaw.y2 ?? 0,
					}
					: null,
			});
		}
	}

	return items;
}

export default function DetectionResultsView() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [detection, setDetection] = useState<DetectionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		const fetchDetections = async () => {
			setLoading(true);
			setErrorMessage(null);

			try {
				const result = await getDetections(Number(id));
				setDetection(result);
			} catch {
				setErrorMessage("Failed to load detection results.");
			} finally {
				setLoading(false);
			}
		};

		void fetchDetections();
	}, [id]);

	const summaryResult = useMemo(
		() => parseSummary(detection?.summary),
		[detection],
	);

	const detectionItems = useMemo(
		() => parseDetectionItems(detection?.detections),
		[detection],
	);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0B1120] text-white p-6">
				<div className="rounded-lg border border-gray-700/50 bg-[#1F2937] flex items-center justify-center p-4">
					<SatelliteLoading />
				</div>
			</div>
		);
	}

	if (errorMessage || !detection) {
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
					<p className="text-red-300">
						{errorMessage || "No detection results found for this image."}
					</p>
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
						<h1 className="text-2xl font-bold">
							Detection Results
						</h1>
						<p className="text-gray-400 text-sm mt-1">
							Image ID: {safeString(detection.id)}
						</p>
					</div>
				</div>

				{safeString(detection.elapsed_seconds) && (
					<Badge className="bg-blue-500/20 border-blue-500/50 text-blue-400 text-sm px-3 py-1">
						<Clock className="w-3.5 h-3.5 mr-1.5" />
						{safeString(detection.elapsed_seconds)}s elapsed
					</Badge>
				)}
			</div>

			{/* Images Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				{/* Original Image */}
				<Card className="bg-[#1F2937] border border-gray-700/50 overflow-hidden">
					<div className="px-4 pt-4 pb-2">
						<h3 className="text-white font-semibold flex items-center gap-2">
							<Image className="w-4 h-4 text-blue-400" />
							Original Image
						</h3>
					</div>
					<CardContent className="p-4 pt-0">
						<div className="aspect-video bg-linear-to-br from-blue-900/30 to-purple-900/30 rounded-lg overflow-hidden flex items-center justify-center">
							{safeString(detection.original_url) ? (
								<img
									src={safeString(detection.original_url)}
									alt="Original satellite image"
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-gray-500 text-sm">
									Original image not available
								</span>
							)}
						</div>
						{safeString(detection.original_url) && (
							<Button
								type="button"
								variant="outline"
								className="w-full mt-3 bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
								onClick={() => window.open(safeString(detection.original_url), "_blank", "noopener,noreferrer")}
							>
								<Eye className="w-4 h-4 mr-2" />
								View Full Image
							</Button>
						)}
					</CardContent>
				</Card>

				{/* Detected Objects Image */}
				<Card className="bg-[#1F2937] border border-gray-700/50 overflow-hidden">
					<div className="px-4 pt-4 pb-2">
						<h3 className="text-white font-semibold flex items-center gap-2">
							<ScanSearch className="w-4 h-4 text-purple-400" />
							Detected Objects
						</h3>
					</div>
					<CardContent className="p-4 pt-0">
						<div className="aspect-video bg-linear-to-br from-purple-900/30 to-pink-900/30 rounded-lg overflow-hidden flex items-center justify-center">
							{safeString(detection.detected_obj_url) ? (
								<img
									src={safeString(detection.detected_obj_url)}
									alt="Detected objects overlay"
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-gray-500 text-sm">
									Detection image not available
								</span>
							)}
						</div>
						{safeString(detection.detected_obj_url) && (
							<Button
								type="button"
								variant="outline"
								className="w-full mt-3 bg-purple-500/10 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
								onClick={() => window.open(safeString(detection.detected_obj_url), "_blank", "noopener,noreferrer")}
							>
								<Eye className="w-4 h-4 mr-2" />
								View Full Image
							</Button>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Metadata */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				{safeString(detection.description) && (
					<Card className="bg-[#1F2937] border border-gray-700/50 lg:col-span-2">
						<CardContent className="p-5">
							<h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
								<div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
								Description
							</h4>
							<p className="text-gray-200 text-sm leading-relaxed">
								{safeString(detection.description)}
							</p>
						</CardContent>
					</Card>
				)}

	

				<Card className="bg-[#1F2937] border border-gray-700/50">
					<CardContent className="p-5">
						<h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
							Details
						</h4>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-gray-400">Command Log ID</span>
								<span className="text-white">
									{safeString(detection.command_log_id) || "-"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-400">Created At</span>
								<span className="text-white">
									{safeString(detection.created_at) || "-"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-400">Elapsed</span>
								<span className="text-white">
									{safeString(detection.elapsed_seconds)
										? `${safeString(detection.elapsed_seconds)}s`
										: "-"}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Summary Totals */}
			{summaryResult.perClass.length > 0 && (
				<Card className="bg-[#1F2937] border border-gray-700/50 mb-8">
					<div className="px-6 pt-5 pb-3 flex items-center justify-between">
						<h3 className="text-white font-semibold flex items-center gap-2">
							<FileText className="w-4 h-4 text-green-400" />
							Summary
						</h3>
						<Badge className="bg-green-500/20 border-green-500/50 text-green-400">
							{summaryResult.totalObjects} total object{summaryResult.totalObjects !== 1 ? "s" : ""}
						</Badge>
					</div>
					<CardContent className="px-6 pb-6">
						<div className="flex flex-wrap gap-3">
							{summaryResult.perClass.map((cls, i) => (
								<div
									key={i}
									className="bg-[#0B1220] rounded-lg border border-gray-800 px-4 py-3 flex items-center gap-3"
								>
									<span className="text-white font-medium text-sm capitalize">{cls.className}</span>
									<Badge className="bg-green-500/10 border-green-500/20 text-green-400 text-xs">
										{cls.count}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Detailed Detections */}
			<Card className="bg-[#1F2937] border border-gray-700/50">
				<div className="px-6 pt-5 pb-3 flex items-center justify-between">
					<h3 className="text-white font-semibold flex items-center gap-2">
						<FileText className="w-4 h-4 text-orange-400" />
						Detection Details
					</h3>
					<Badge className="bg-orange-500/20 border-orange-500/50 text-orange-400">
						{detectionItems.length} group{detectionItems.length !== 1 ? "s" : ""}
					</Badge>
				</div>
				<CardContent className="px-6 pb-6">
					{detectionItems.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{detectionItems.map((det, i) => (
								<div
									key={i}
									className="bg-[#0B1220] rounded-lg border border-gray-800 p-4 hover:border-orange-500/30 transition-colors"
								>
									<div className="flex items-center justify-between mb-3">
										<span className="text-white font-semibold text-sm capitalize">
											{det.className}
										</span>
										<Badge className="bg-purple-500/10 border-purple-500/20 text-purple-400 text-xs">
											{det.count} detected
										</Badge>
									</div>

									<div className="space-y-1.5 text-xs">
										<div className="flex justify-between">
											<span className="text-gray-500">Avg Confidence</span>
											<Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
												{(det.confidenceAvg * 100).toFixed(1)}%
											</Badge>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-500">Max Confidence</span>
											<Badge className="bg-blue-500/10 border-blue-500/20 text-blue-400">
												{(det.confidenceMax * 100).toFixed(1)}%
											</Badge>
										</div>
										{det.bbox && (
											<div className="flex justify-between">
												<span className="text-gray-500">Bounding Box</span>
												<span className="text-gray-400 font-mono">
													({det.bbox.x1}, {det.bbox.y1}) → ({det.bbox.x2}, {det.bbox.y2})
												</span>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p className="text-sm">
								No objects detected in this image.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Eye, FileText, ScanSearch, Image } from "lucide-react";
import { motion } from "framer-motion";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getDetections, detectObjects } from "../services/objectDetection.service";
import type { DetectionData, DetectObjectsPayload } from "../types/objectDetection.types";
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
	const [processing, setProcessing] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [retrying, setRetrying] = useState(false);
	const [triggerCount, setTriggerCount] = useState(0);

	useEffect(() => {
		if (!id) return;

		let isMounted = true;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		const MAX_POLLS = 20;

		const fetchDetections = async (retryCount = 0, pollCount = 0) => {
			try {
				const response = await getDetections(Number(id));

				if (!isMounted) return;

				if (response && response.status === "processing") {
					if (pollCount >= MAX_POLLS) {
						setErrorMessage("Object detection took too long to complete. Please try again.");
						setProcessing(false);
						setLoading(false);
						return;
					}
					setProcessing(true);
					setLoading(false);
					setErrorMessage(null);
					timeoutId = setTimeout(() => fetchDetections(0, pollCount + 1), 3000);
				} else if (response && response.status === "success" && response.data) {
					setDetection(response.data);
					setProcessing(false);
					setLoading(false);
					setErrorMessage(null);
				} else {
					setDetection(response?.data || null);
					setProcessing(false);
					setLoading(false);
					setErrorMessage(null);
				}
			} catch {
				if (!isMounted) return;

				if (retryCount < 10) {
					setProcessing(true);
					setLoading(false);
					timeoutId = setTimeout(() => fetchDetections(retryCount + 1, pollCount), 3000);
				} else {
					setErrorMessage("Failed to load detection results after multiple attempts.");
					setLoading(false);
					setProcessing(false);
				}
			}
		};

		setLoading(true);
		setErrorMessage(null);
		setProcessing(false);
		void fetchDetections();

		return () => {
			isMounted = false;
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [id, triggerCount]);

	const handleRetry = async () => {
		if (!id) return;
		setRetrying(true);
		setErrorMessage(null);
		setLoading(true);

		const payload: DetectObjectsPayload = {
			run_dota: "true",
			run_buildings: "true",
			dota_conf: 0,
			building_conf: 0,
		};

		try {
			const res = await detectObjects(Number(id), payload);
			if (res && res.status === "processing") {
				toast.info(res.message || "Object detection restarted in the background.", {
					position: "bottom-right",
				});
			} else {
				toast.success("Object detection started successfully!", {
					position: "bottom-right",
				});
			}
			setTriggerCount(prev => prev + 1);
		} catch (error) {
			const msg = isAxiosError(error)
				? error.response?.data?.message ?? "Failed to restart object detection."
				: "An unexpected error occurred.";
			setErrorMessage(msg);
			setLoading(false);
		} finally {
			setRetrying(false);
		}
	};

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

	if (processing) {
		return (
			<div className="min-h-screen bg-[#0B1120] text-white p-6 flex flex-col justify-center items-center">
				<div className="w-full max-w-2xl mb-8 flex justify-start">
					<Button
						variant="outline"
						className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
						onClick={() => navigate("/images")}
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Image Center
					</Button>
				</div>

				<div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-800 bg-[#0F172A]/80 p-8 text-center shadow-2xl backdrop-blur-md flex flex-col items-center animate-in fade-in-50 duration-500">
					<div className="relative w-48 h-48 mb-8 flex items-center justify-center">
						<motion.div
							className="absolute inset-0 rounded-full border border-blue-500/20"
							animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
							transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
						/>
						<motion.div
							className="absolute inset-4 rounded-full border border-purple-500/20"
							animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
							transition={{ repeat: Infinity, duration: 3, ease: "easeOut", delay: 1 }}
						/>
						<motion.div
							className="absolute inset-8 rounded-full border border-blue-500/30"
							animate={{ scale: [1, 1.2], opacity: [0.4, 0] }}
							transition={{ repeat: Infinity, duration: 3, ease: "easeOut", delay: 2 }}
						/>

						<div className="w-36 h-36 rounded-full border-2 border-blue-500/30 relative overflow-hidden bg-blue-950/20 flex items-center justify-center">
							<motion.div
								className="absolute inset-0 origin-center bg-gradient-to-tr from-transparent via-transparent to-blue-500/40"
								style={{ borderRadius: "50%" }}
								animate={{ rotate: 360 }}
								transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
							/>

							<motion.div
								animate={{ scale: [0.95, 1.05, 0.95] }}
								transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
								className="text-blue-400 z-10"
							>
								<ScanSearch size={44} className="animate-pulse" />
							</motion.div>

							<motion.div
								className="absolute top-8 left-12 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"
								animate={{ opacity: [0, 1, 0] }}
								transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
							/>
							<motion.div
								className="absolute bottom-10 right-10 w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
								animate={{ opacity: [0, 1, 0] }}
								transition={{ repeat: Infinity, duration: 1.8, delay: 0.8 }}
							/>
							<motion.div
								className="absolute top-16 right-8 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"
								animate={{ opacity: [0, 1, 0] }}
								transition={{ repeat: Infinity, duration: 1.2, delay: 0.5 }}
							/>
						</div>
					</div>

					<h3 className="text-xl font-bold tracking-tight text-white mb-2">
						Analyzing Satellite Imagery
					</h3>
					
					<p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
						Object detection analysis is running in the background. The AI model is scanning the image for vehicles, buildings, and other targets.
					</p>

					<div className="w-full max-w-sm bg-gray-800 h-1.5 rounded-full overflow-hidden relative mb-4">
						<motion.div
							className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
							initial={{ width: "0%" }}
							animate={{ width: ["10%", "90%"] }}
							transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
						/>
					</div>

					<span className="text-xs text-gray-500 animate-pulse">
						Polling for completion...
					</span>
				</div>
			</div>
		);
	}

	if (errorMessage || !detection) {
		return (
			<div className="min-h-screen bg-[#0B1120] text-white p-6 flex flex-col items-center justify-center">
				<div className="w-full max-w-2xl mb-8 flex justify-start">
					<Button
						variant="outline"
						className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
						onClick={() => navigate("/images")}
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Image Center
					</Button>
				</div>

				<div className="rounded-2xl border border-red-500/30 bg-[#1e151d] p-8 text-center max-w-2xl w-full flex flex-col items-center shadow-xl animate-in fade-in-50 duration-500">
					<div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 mb-6">
						<ScanSearch size={28} className="animate-pulse" />
					</div>

					<p className="text-red-300 mb-8 text-base font-medium">
						{errorMessage || "No detection results found for this image."}
					</p>
					
					<div className="flex gap-4">
						<Button
							variant="outline"
							className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700"
							onClick={() => navigate("/images")}
						>
							Cancel
						</Button>
						
						<motion.div
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Button
								className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/20"
								disabled={retrying}
								onClick={handleRetry}
							>
								{retrying ? (
									<span className="flex items-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Retrying...
									</span>
								) : (
									"Try Again"
								)}
							</Button>
						</motion.div>
					</div>
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

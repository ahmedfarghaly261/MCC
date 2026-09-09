import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, Download, Sparkles, Image, MapPin, Layers, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { isAxiosError } from "axios";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getEnhancedImageById } from "../services/enhancedImages.service";
import { extractEnhancedRecord, safeString, formatGsd, formatMeters } from "../utils/enhancedImages.util";
import type { EnhancedImageRecord } from "../types/enhancedImages.types";
import { formatImageDateTime } from "@/pages/imageCenter/index/utils/images.util";
import SatelliteLoading from "@/components/shared/SatelliteLoading";

export default function EnhancedResultView() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const location = useLocation();

	const [result, setResult] = useState<EnhancedImageRecord | null>(
		(location.state as { result?: EnhancedImageRecord } | null)?.result ?? null,
	);
	const [loading, setLoading] = useState(!result);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (result) return;
		if (!id) return;

		let isMounted = true;

		const fetchResult = async () => {
			setLoading(true);
			setErrorMessage(null);

			try {
				const response = await getEnhancedImageById(Number(id));
				if (!isMounted) return;

				const record = extractEnhancedRecord(response);
				if (record) {
					setResult(record);
				} else {
					setErrorMessage("No enhancement data found for this image.");
				}
			} catch (error) {
				if (!isMounted) return;
				const message = isAxiosError(error)
					? error.response?.data?.message ?? "Failed to load enhanced image."
					: "An unexpected error occurred.";
				setErrorMessage(message);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		void fetchResult();

		return () => { isMounted = false; };
	}, [id, result]);

	const openUrl = (url: string | null) => {
		if (!url) return;
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const downloadUrl = (url: string | null, filename: string) => {
		if (!url) return;
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.click();
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0B1120] text-white p-6">
				<div className="rounded-lg border border-gray-700/50 bg-[#1F2937] flex items-center justify-center p-4">
					<SatelliteLoading />
				</div>
			</div>
		);
	}

	if (errorMessage || !result) {
		return (
			<div className="min-h-screen bg-[#0B1120] text-white p-6 flex flex-col items-center justify-center">
				<div className="w-full max-w-2xl mb-8 flex justify-start">
					<Button variant="outline" className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50" onClick={() => navigate("/images")}>
						<ArrowLeft className="w-4 h-4 mr-2" />Back to Image Center
					</Button>
				</div>
				<div className="rounded-2xl border border-red-500/30 bg-[#1e151d] p-8 text-center max-w-2xl w-full flex flex-col items-center shadow-xl animate-in fade-in-50 duration-500">
					<div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 mb-6">
						<Sparkles size={28} className="animate-pulse" />
					</div>
					<p className="text-red-300 mb-8 text-base font-medium">
						{errorMessage || "No enhancement results found for this image."}
					</p>
					<Button variant="outline" className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700" onClick={() => navigate("/images")}>
						Back to Image Center
					</Button>
				</div>
			</div>
		);
	}

	const meta = result.meta_data;
	const pixel = meta?.pixel;
	const realWorld = meta?.real_world_m;

	return (
		<div className="min-h-screen bg-[#0B1120] text-white p-6">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-4">
					<Button variant="outline" className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50" onClick={() => navigate("/images")}>
						<ArrowLeft className="w-4 h-4 mr-2" />Back
					</Button>
					<div>
						<h1 className="text-2xl font-bold">Enhancement Result</h1>
						<p className="text-gray-400 text-sm mt-1">Image ID: {result.id}</p>
					</div>
				</div>
				<Badge className="bg-emerald-500/20 border-emerald-500/50 text-emerald-400 text-sm px-3 py-1">
					<Sparkles className="w-3.5 h-3.5 mr-1.5" />AI Enhanced
				</Badge>
			</div>

			{/* Images comparison */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				<Card className="bg-[#1F2937] border border-gray-700/50 overflow-hidden">
					<div className="px-4 pt-4 pb-2">
						<h3 className="text-white font-semibold flex items-center gap-2">
							<Image className="w-4 h-4 text-blue-400" />Original Image
						</h3>
					</div>
					<CardContent className="p-4 pt-0">
						<div className="aspect-video bg-linear-to-br from-blue-900/30 to-purple-900/30 rounded-lg overflow-hidden flex items-center justify-center">
							{result.download_url ? <img src={result.download_url} alt="Original satellite image" className="w-full h-full object-cover" /> : <span className="text-gray-500 text-sm">Original not available</span>}
						</div>
						<div className="flex gap-2 mt-3">
							<Button type="button" variant="outline" className={`flex-1 bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 ${!result.download_url ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!result.download_url} onClick={() => openUrl(result.download_url)}>
								<Eye className="w-4 h-4 mr-2" />View Full
							</Button>
							<Button type="button" variant="outline" size="sm" className={`bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20 ${!result.download_url ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!result.download_url} onClick={() => downloadUrl(result.download_url, `original-img-${result.id}.png`)}>
								<Download className="w-4 h-4" />
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-[#1F2937] border border-emerald-700/40 overflow-hidden">
					<div className="px-4 pt-4 pb-2">
						<h3 className="text-white font-semibold flex items-center gap-2">
							<Sparkles className="w-4 h-4 text-emerald-400" />Enhanced Image
						</h3>
					</div>
					<CardContent className="p-4 pt-0">
						<div className="aspect-video bg-linear-to-br from-emerald-900/30 to-teal-900/30 rounded-lg overflow-hidden flex items-center justify-center">
							{result.enhanced_url ? <img src={result.enhanced_url} alt="Enhanced satellite image" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center gap-2"><Sparkles className="w-10 h-10 text-gray-600" /><span className="text-gray-500 text-sm">Enhanced image not yet available</span></div>}
						</div>
						<div className="flex gap-2 mt-3">
							<Button type="button" variant="outline" className={`flex-1 bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 ${!result.enhanced_url ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!result.enhanced_url} onClick={() => openUrl(result.enhanced_url)}>
								<Eye className="w-4 h-4 mr-2" />View Full
							</Button>
							<Button type="button" variant="outline" size="sm" className={`bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20 ${!result.enhanced_url ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!result.enhanced_url} onClick={() => downloadUrl(result.enhanced_url, `enhanced-img-${result.id}.png`)}>
								<Download className="w-4 h-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Metadata */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				<Card className="bg-[#1F2937] border border-gray-700/50">
					<CardContent className="p-5">
						<h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />Image Details
						</h4>
						<div className="space-y-2 text-sm">
							<MetaRow label="Image ID" value={String(result.id)} />
							<MetaRow label="Command Log ID" value={safeString(result.command_log_id) || "-"} />
							<MetaRow label="Created At" value={formatImageDateTime(result.created_at)} />
							<MetaRow label="Enhanced" value={<Badge className={result.enhanced_url ? "bg-emerald-400/20 border-emerald-400/50 text-emerald-400" : "bg-yellow-400/20 border-yellow-400/50 text-yellow-400"}>{result.enhanced_url ? "Ready" : "Pending"}</Badge>} />
						</div>
					</CardContent>
				</Card>

				{meta && (
					<Card className="bg-[#1F2937] border border-gray-700/50">
						<CardContent className="p-5">
							<h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
								<div className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />Source & Resolution
							</h4>
							<div className="space-y-2 text-sm">
								<MetaRow label="Image Source" value={safeString(meta.image_source) || "-"} />
								<MetaRow label="Tile Name" value={safeString(meta.tile_name) || "-"} />
								<MetaRow label="GSD" value={formatGsd(meta.gsd_m_per_px ?? null)} />
							</div>
						</CardContent>
					</Card>
				)}

				{pixel && (
					<Card className="bg-[#1F2937] border border-gray-700/50">
						<CardContent className="p-5">
							<h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
								<Layers className="w-3 h-3 text-purple-400" />Pixel Coordinates
							</h4>
							<div className="space-y-2 text-sm">
								<MetaRow label="Col / Row" value={`${pixel.col} / ${pixel.row}`} />
								<MetaRow label="X" value={`${pixel.x1} → ${pixel.x2}`} />
								<MetaRow label="Y" value={`${pixel.y1} → ${pixel.y2}`} />
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{realWorld && (
				<Card className="bg-[#1F2937] border border-gray-700/50 mb-8">
					<div className="px-5 pt-5 pb-2 flex items-center gap-2">
						<MapPin className="w-4 h-4 text-orange-400" />
						<h3 className="text-white font-semibold">Real-World Extent</h3>
					</div>
					<CardContent className="px-5 pb-5">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<MetaBlock label="X1" value={formatMeters(realWorld.x1)} color="text-orange-300" />
							<MetaBlock label="X2" value={formatMeters(realWorld.x2)} color="text-orange-300" />
							<MetaBlock label="Y1" value={formatMeters(realWorld.y1)} color="text-yellow-300" />
							<MetaBlock label="Y2" value={formatMeters(realWorld.y2)} color="text-yellow-300" />
							<MetaBlock label="Width" value={formatMeters(realWorld.width_m)} color="text-cyan-300" />
							<MetaBlock label="Height" value={formatMeters(realWorld.height_m)} color="text-cyan-300" />
						</div>
					</CardContent>
				</Card>
			)}

			<Card className="bg-[#1F2937] border border-gray-700/50">
				<div className="px-5 pt-5 pb-2 flex items-center gap-2">
					<FileText className="w-4 h-4 text-gray-400" />
					<h3 className="text-white font-semibold">Storage Paths</h3>
				</div>
				<CardContent className="px-5 pb-5">
					<div className="space-y-2 text-xs font-mono">
						<PathRow label="original_path" value={result.original_path} />
						<PathRow label="enhanced_path" value={result.enhanced_path} />
						<PathRow label="detected_obj_path" value={result.detected_obj_path} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex justify-between items-center gap-2">
			<span className="text-gray-400 shrink-0">{label}</span>
			<span className="text-white text-right">{value}</span>
		</div>
	);
}

function MetaBlock({ label, value, color }: { label: string; value: string; color: string }) {
	return (
		<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0B1220] rounded-lg border border-gray-800 px-3 py-2">
			<p className="text-gray-500 text-xs mb-0.5">{label}</p>
			<p className={`font-mono font-semibold text-sm ${color}`}>{value}</p>
		</motion.div>
	);
}

function PathRow({ label, value }: { label: string; value: string | null }) {
	return (
		<div className="flex items-start gap-3">
			<span className="text-gray-500 shrink-0 w-36">{label}</span>
			<span className={`${value ? "text-gray-300" : "text-gray-600"} break-all`}>{value || "—"}</span>
		</div>
	);
}
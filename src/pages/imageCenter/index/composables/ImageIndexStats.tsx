interface ImageIndexStatsProps {
	totalImages: number;
	todayCount: number;
	totalSizeLabel?: string;
	avgConfidenceLabel?: string;
}

export default function ImageIndexStats({
	totalImages,
	todayCount,
	totalSizeLabel = "-",
	avgConfidenceLabel = "-",
}: ImageIndexStatsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
			<div className="p-4 bg-[#1F2937] rounded-lg border border-gray-700/50">
				<p className="text-gray-400 text-sm mb-1">Total Images</p>
				<p className="text-blue-400">{totalImages}</p>
			</div>

			<div className="p-4 bg-[#1F2937] rounded-lg border border-green-400/30">
				<p className="text-gray-400 text-sm mb-1">Today</p>
				<p className="text-green-400">{todayCount}</p>
			</div>

			<div className="p-4 bg-[#1F2937] rounded-lg border border-purple-400/30">
				<p className="text-gray-400 text-sm mb-1">Total Size</p>
				<p className="text-purple-400">{totalSizeLabel}</p>
			</div>

			<div className="p-4 bg-[#1F2937] rounded-lg border border-yellow-400/30">
				<p className="text-gray-400 text-sm mb-1">Avg Confidence</p>
				<p className="text-yellow-400">{avgConfidenceLabel}</p>
			</div>
		</div>
	);
}

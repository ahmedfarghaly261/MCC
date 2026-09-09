import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatDateTime, getAnomalyBadgeStyle, getAnomalyCardStyle } from "../Utils/telemetryReplies.util";
import type { TelemetryResponse } from "../types/telemetryReplies.types";

interface TelemetryRepliesTableProps {
	response: TelemetryResponse | null;
	loading: boolean;
}

export default function TelemetryRepliesTable({
	response,
	loading,
}: TelemetryRepliesTableProps) {
	if (loading) {
		return (
			<div className="rounded-lg border border-slate-700/60 bg-[#1B2A3C] p-10 text-center text-sm text-slate-400">
				Loading telemetry readings...
			</div>
		);
	}

	if (!response) {
		return (
			<div className="rounded-lg border border-slate-700/60 bg-[#1B2A3C] p-10 text-center text-sm text-slate-400">
				No telemetry loaded.
			</div>
		);
	}

	if (response.telemetry.length === 0) {
		return (
			<div className="rounded-lg border border-slate-700/60 bg-[#1B2A3C] p-10 text-center text-sm text-slate-400">
				No telemetry readings found.
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-slate-700/60 bg-[#1B2A3C] p-4 md:p-5">
			<div className="mb-4 flex items-center justify-between gap-3">
				<h2 className="text-sm font-semibold text-slate-100">Telemetry Readings</h2>
				<Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
					{response.telemetry.length} parameters
				</Badge>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
				{response.telemetry.map((reading) => (
					<div
						key={`${reading.id}-${reading.parameter.id}`}
						className={getAnomalyCardStyle(reading.is_anomaly)}
					>
						<div className="mb-2 flex items-start justify-between gap-2">
							<div className="min-w-0">
								<p className="truncate font-mono text-[11px] text-cyan-300">{reading.parameter.name}</p>
								<p className="text-[10px] text-slate-500">ID: {reading.parameter.id}</p>
							</div>
							{reading.unit && (
								<Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 px-1.5 py-0 text-[10px] text-blue-300">
									{reading.unit}
								</Badge>
							)}
						</div>

						<div className="space-y-1.5 text-[11px]">
							<div className="flex items-center justify-between border-b border-slate-700/40 pb-1">
								<span className="text-slate-400">Raw Value</span>
								<span className="font-mono text-yellow-400">{reading.raw_value}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-400">Converted</span>
								<span className="font-mono text-base font-semibold text-emerald-400">{reading.converted_value}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-400">Anomaly</span>
								<span className="font-mono text-base font-semibold">
									<Badge variant="outline" className={getAnomalyBadgeStyle(reading.is_anomaly)}>
										{reading.is_anomaly ? "Yes" : "No"}
									</Badge>
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-400">Anomaly Score</span>
								<span className="font-mono text-base font-semibold text-pink-400">
									{reading.anomaly_score !== null ? reading.anomaly_score.toFixed(2) : "-"}
								</span>
							</div>
						</div>

						<p className="mt-2 flex items-center text-[10px] text-slate-500">
							<Clock className="mr-1 h-3 w-3" />
							{formatDateTime(reading.sampled_at)}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

import { Badge } from "@/components/ui/badge";
import { getTelemetryStatusColor } from "../Utils/telemetryReplies.util";
import type { TelemetryResponse } from "../types/telemetryReplies.types";

interface TelemetryRepliesStatsProps {
	response: TelemetryResponse;
}

interface StatCardProps {
	title: string;
	value: string;
	valueClassName?: string;
	borderClassName?: string;
}

function StatCard({
	title,
	value,
	valueClassName = "text-cyan-400",
	borderClassName = "border-slate-700/60",
}: StatCardProps) {
	return (
		<div className={`rounded-xl border ${borderClassName} bg-card p-5`}>
			<p className="text-sm text-muted-foreground">{title}</p>
			<p className={`mt-2 text-2xl font-semibold ${valueClassName}`}>{value}</p>
		</div>
	);
}

export default function TelemetryRepliesStats({ response }: TelemetryRepliesStatsProps) {
	const responseTimeLabel = response.response_time_ms ? `${response.response_time_ms} ms` : "N/A";

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<StatCard title="Command Log" value={`#${response.command_log_id}`} valueClassName="text-blue-400" />
			<StatCard
				title="Telemetry Count"
				value={String(response.telemetry_count)}
				valueClassName="text-green-400"
				borderClassName="border-green-500/30"
			/>
			<StatCard
				title="Response Time"
				value={responseTimeLabel}
				valueClassName="text-yellow-400"
				borderClassName="border-yellow-500/30"
			/>
			<div className="rounded-xl border border-slate-700/60 bg-card p-5">
				<p className="text-sm text-muted-foreground">Status</p>
				<div className="mt-3">
					<Badge variant="outline" className={getTelemetryStatusColor(response.status)}>
						{response.status.replaceAll("_", " ").toUpperCase()}
					</Badge>
				</div>
			</div>
		</div>
	);
}

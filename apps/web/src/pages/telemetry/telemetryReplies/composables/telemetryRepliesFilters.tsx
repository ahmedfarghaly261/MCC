import { Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TelemetryRepliesFiltersProps {
	commandLogId: string;
	onCommandLogIdChange: (value: string) => void;
	onFetchTelemetry: () => void;
	loading: boolean;
}

export default function TelemetryRepliesFilters({
	commandLogId,
	onCommandLogIdChange,
	onFetchTelemetry,
	loading,
}: TelemetryRepliesFiltersProps) {
	return (
		<div className="rounded-lg border border-slate-700/60 bg-[#1B2A3C] p-3">
			<div className="flex flex-col gap-3 md:flex-row md:items-center">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
					<Input
						type="number"
						min={1}
						value={commandLogId}
						onChange={(event) => onCommandLogIdChange(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								onFetchTelemetry();
							}
						}}
						placeholder="Enter command log ID..."
						className="h-10 border-slate-700/70 bg-[#0B1627] pl-9 text-sm"
					/>
				</div>

				<Button
					type="button"
					onClick={onFetchTelemetry}
					disabled={loading || commandLogId.trim().length === 0}
					className="h-10 min-w-36 border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
				>
					<Send className="mr-2 h-4 w-4" />
					{loading ? "Fetching..." : "Fetch Telemetry"}
				</Button>
			</div>

			<p className="mt-1 text-[11px] text-slate-500">
				Try command log IDs that exist in backend telemetry replies.
			</p>
		</div>
	);
}

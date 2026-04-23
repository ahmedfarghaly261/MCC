import { useState } from "react";
import { isAxiosError } from "axios";
import { Activity, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLayoutLoading } from "@/components/layout/layoutLoadingContext";
import TelemetryRepliesFilters from "./composables/telemetryRepliesFilters";
import TelemetryRepliesTable from "./composables/telemetryRepliesTable";
import { formatDateTime, getTelemetryStatusColor } from "./Utils/telemetryReplies.util";
import { getTelemetryByCommandLog } from "./services/telemetryReplies.service";
import type { TelemetryResponse } from "./types/telemetryReplies.types";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function TelemetryRepliesView() {
	const { setGlobalLoading } = useLayoutLoading();
	const [commandLogId, setCommandLogId] = useState("");
	const [response, setResponse] = useState<TelemetryResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { commandLogId: routeCommandLogId } =
  useParams();
 

useEffect(() => {
  if (routeCommandLogId) {
    setCommandLogId(routeCommandLogId);

    void loadTelemetryById(
      Number(routeCommandLogId)
    );
  }
}, [routeCommandLogId]);
const loadTelemetryById = async (
  id: number
) => {
  setLoading(true);
  setGlobalLoading(true);
  setErrorMessage(null);

  try {
    const telemetryResponse =
      await getTelemetryByCommandLog(id);

    setResponse(telemetryResponse);
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        setErrorMessage(
          `No telemetry data found for command log ID: ${id}.`
        );
      } else {
        setErrorMessage(
          "Failed to load telemetry replies."
        );
      }
    } else {
      setErrorMessage(
        "Failed to load telemetry replies."
      );
    }

    setResponse(null);
  } finally {
    setLoading(false);
    setGlobalLoading(false);
  }
};

const loadTelemetry = async () => {
  const parsedId = Number(
    commandLogId.trim()
  );

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    setErrorMessage(
      "Please enter a valid command log ID."
    );
    setResponse(null);
    return;
  }

  await loadTelemetryById(parsedId);
};

	return (
		<div className="min-h-screen bg-background p-4 text-white md:p-6">
			<div className="mb-4 flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-cyan-400">
						<Activity className="h-5 w-5" />
					</div>
					<div>
						<h1 className="text-base font-semibold text-white">Telemetry Replies</h1>
						<p className="text-xs text-muted-foreground md:text-sm">
							Retrieve command telemetry from the MCC endpoint by command log ID
						</p>
					</div>
				</div>

				<Button
					type="button"
					variant="outline"
					className="border-slate-700/70 bg-[#142233] text-muted-foreground hover:bg-[#1B2D42]"
					onClick={() => {
						void loadTelemetry();
					}}
					disabled={loading || commandLogId.trim().length === 0}
				>
					Refresh Data
				</Button>
			</div>

			<TelemetryRepliesFilters
				commandLogId={commandLogId}
				onCommandLogIdChange={setCommandLogId}
				onFetchTelemetry={() => {
					void loadTelemetry();
				}}
				loading={loading}
			/>

			{errorMessage && (
				<div className="mb-4 mt-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
					<p className="text-sm text-red-300">{errorMessage}</p>
				</div>
			)}

			{response && (
				<div className="mt-4 space-y-4">
					<div className="rounded-lg border border-slate-700/60 bg-[#1B2A3C] p-4 md:p-5">
						<div className="mb-4 flex items-center gap-2">
							<Radio className="h-4 w-4 text-cyan-400" />
							<h2 className="text-sm font-semibold text-slate-100">
									Command Overview
								</h2>
							</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="space-y-2.5 text-xs md:text-sm">
								<div className="flex items-center justify-between border-b border-slate-700/40 py-1.5">
									<span className="text-slate-400">Command Log ID</span>
									<span className="font-mono text-cyan-400">#{response.command_log_id}</span>
								</div>
								<div className="flex items-center justify-between border-b border-slate-700/40 py-1.5">
									<span className="text-slate-400">Command ID</span>
									<span className="font-mono text-green-400">{response.command_id}</span>
								</div>
								<div className="flex items-center justify-between border-b border-slate-700/40 py-1.5">
									<span className="text-slate-400">Status</span>
									<Badge variant="outline" className={getTelemetryStatusColor(response.status)}>
										{response.status.replaceAll("_", " ").toUpperCase()}
									</Badge>
								</div>
							</div>

							<div className="space-y-2.5 text-xs md:text-sm">
								<div className="flex items-center justify-between border-b border-slate-700/40 py-1.5">
									<span className="text-slate-400">Source Address</span>
									<span className="font-mono text-yellow-300">{response.src_address}</span>
								</div>
								<div className="flex items-center justify-between border-b border-slate-700/40 py-1.5">
									<span className="text-slate-400">Dest Address</span>
									<span className="font-mono text-yellow-300">{response.dest_address}</span>
								</div>
								<div className="flex items-center justify-between border-b border-slate-700/40 py-1.5">
									<span className="text-slate-400">Response Time</span>
									<span className="text-green-400">
										{response.response_time_ms ? `${response.response_time_ms}ms` : "N/A"}
									</span>
								</div>
							</div>

							<div className="space-y-2.5 text-xs md:text-sm">
								<div className="flex items-center justify-between border-b border-slate-700/40 py-1.5">
									<span className="text-slate-400">Sent At</span>
									<span className="text-right font-mono text-slate-300">{formatDateTime(response.sent_at)}</span>
								</div>
								<div className="flex items-center justify-between border-b border-slate-700/40 py-1.5">
									<span className="text-slate-400">Replied At</span>
									<span className="text-right font-mono text-slate-300">{formatDateTime(response.replied_at)}</span>
								</div>
								<div className="flex items-center justify-between border-b border-slate-700/40 py-1.5">
									<span className="text-slate-400">Telemetry Count</span>
									<Badge className="border-purple-500/40 bg-purple-500/15 text-purple-300">
										{response.telemetry_count} readings
									</Badge>
								</div>
							</div>
							</div>
						</div>

						<div className="rounded-lg border border-slate-700/60 bg-[#1B2A3C] p-4 md:p-5">
							<div className="mb-4 flex items-center gap-2">
								<Activity className="h-4 w-4 text-purple-400" />
								<h2 className="text-sm font-semibold text-slate-100">
									Subsystem Information
								</h2>
							</div>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
								<div className="rounded-md border border-slate-700/50 bg-[#102033] p-3">
									<p className="text-xs text-muted-foreground">Subsystem ID</p>
									<p className="mt-1 text-cyan-400">{response.subsystem_id}</p>
								</div>
								<div className="rounded-md border border-slate-700/50 bg-[#102033] p-3">
									<p className="text-xs text-muted-foreground">Address</p>
									<p className="mt-1 text-cyan-400">{response.subsystem_address}</p>
								</div>
								<div className="rounded-md border border-slate-700/50 bg-[#102033] p-3">
									<p className="text-xs text-muted-foreground">Mode</p>
									<p className="mt-1 text-cyan-400">{response.subsystem_mode}</p>
								</div>
								<div className="rounded-md border border-slate-700/50 bg-[#102033] p-3">
									<p className="text-xs text-muted-foreground">Subsystem Time</p>
									<p className="mt-1 text-[12px] text-cyan-400">{formatDateTime(response.subsystem_time)}</p>
								</div>
								<div className="rounded-md border border-slate-700/50 bg-[#102033] p-3">
									<p className="text-xs text-muted-foreground">Subsystem RTC</p>
									<p className="mt-1 text-[12px] text-cyan-400">{formatDateTime(response.subsystem_rtc)}</p>
								</div>
							</div>
						</div>

					<TelemetryRepliesTable response={response} loading={loading} />
				</div>
			)}

			{!response && !errorMessage && !loading && (
				<div className="mt-4 rounded-lg border border-slate-700/70 bg-[#1B2A3C] p-12 text-center">
					<Activity className="mx-auto mb-3 h-12 w-12 text-slate-500" />
					<p className="text-muted-foreground">Enter a command log ID to load telemetry replies.</p>
				</div>
			)}
		</div>
	);
}

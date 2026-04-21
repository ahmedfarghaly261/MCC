import { apiClient } from "@/services/api";
import { extractTelemetryResponse } from "../Utils/telemetryReplies.util";
import type { TelemetryResponse } from "../types/telemetryReplies.types";

export async function getTelemetryByCommandLog(commandLog: number): Promise<TelemetryResponse> {
	const response = await apiClient.get(`mcc/telemetry/command-log/${commandLog}`);
	const telemetry = extractTelemetryResponse(response.data);

	if (!telemetry) {
		throw new Error("Telemetry response format is invalid.");
	}

	return telemetry;
}

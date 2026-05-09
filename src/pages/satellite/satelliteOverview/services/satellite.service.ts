import { apiClient } from "@/services/api";
import { extractSatellites } from "../utils/satelliteOverview.util";
import type { SatelliteData } from "../types/satellite.types";

export async function getSatellites(): Promise<SatelliteData[]> {
	const response = await apiClient.get("mcc/satellite");
	const satellites = extractSatellites(response.data);

	if (!satellites) {
		throw new Error("Satellite response format is invalid.");
	}

	return satellites;
}

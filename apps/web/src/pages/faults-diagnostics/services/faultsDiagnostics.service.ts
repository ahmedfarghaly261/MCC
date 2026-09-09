import { apiClient } from "@/services/api";
import type { FaultRecord } from "../types/faultsDiagnostics.types";

export async function getFaultsDiagnostics(): Promise<FaultRecord[]> {
  const response = await apiClient.get(
    "mcc/ai-insights/anomalies"
  );

  return response.data;
}
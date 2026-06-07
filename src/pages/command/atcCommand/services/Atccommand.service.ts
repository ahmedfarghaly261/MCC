import { apiClient } from "@/services/api";
import type { AtcCommandPayload, AtcCommandResponse } from "../types/Atccommand.types";

export async function scheduleAtcCommand(
  payload: AtcCommandPayload,
): Promise<AtcCommandResponse> {
  const response = await apiClient.post<AtcCommandResponse>(
    "mcc/command/schedule-atc",
    payload,
  );
  return response.data;
}
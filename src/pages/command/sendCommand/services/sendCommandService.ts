import { apiClient } from "@/services/api";
import type { SendCommandPayload } from "../types/command.types";

export async function sendCommand(payload: SendCommandPayload): Promise<unknown> {
  const response = await apiClient.post("mcc/command/send", payload);
  return response.data;
}

import { apiClient } from "@/services/api";
import type {
  SendCommandPayload,
  SendCommandResponse,
} from "../types/command.types";

export async function sendCommand(
  payload: SendCommandPayload
): Promise<SendCommandResponse> {

  const response =
    await apiClient.post(
      "mcc/command/send",
      payload
    );

  return response.data;
}
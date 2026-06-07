import { apiClient } from "@/services/api";

import type {
  MacroGoalPayload,
  MacroGoalResponse,
} from "../types/scheduledCommands.types";

export async function createMacroGoal(
  payload: MacroGoalPayload,
): Promise<MacroGoalResponse> {
  const response =
    await apiClient.post<MacroGoalResponse>(
      "mcc/command/macro-goals",
      payload,
    );

  return response.data;
}
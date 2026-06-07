import { apiClient } from "@/services/api";

import type {
  HTNGoal,
  HTNGoalsResponse,
} from "../types/scheduledCommands.types";

export async function getHTNGoals(): Promise<HTNGoal[]> {
  const response =
    await apiClient.get<HTNGoalsResponse>(
      "mcc/htn/goals",
    );

  return response.data.data ?? [];
}
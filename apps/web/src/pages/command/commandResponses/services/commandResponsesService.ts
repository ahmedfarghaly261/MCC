import { apiClient } from "@/services/api";
import { extractCommandReplies } from "../Utils/commandResponses.util";
import type { CommandReply } from "../types/CommandResponses.types";

export async function getCommandReplies(): Promise<CommandReply[]> {
  const response = await apiClient.get("mcc/command/replies");
  return extractCommandReplies(response.data);
}
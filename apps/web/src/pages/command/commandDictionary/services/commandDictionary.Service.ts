import { apiClient } from "@/services/api";
import type { CommandDictionary } from "../types/commandDictionaryTypes";

export async function getCommandsDictionary(): Promise<CommandDictionary[]> {
  const response = await apiClient.get("mcc/command");
  return response.data;
}
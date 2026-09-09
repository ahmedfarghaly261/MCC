import { apiClient } from "@/services/api";
import { extractCommandHistoryRecords } from "../Utils/commandHistory.util";
import type { CommandHistoryRecord } from "../types/commandHistory.types";

export async function getCommandHistory(): Promise<CommandHistoryRecord[]> {
	const response = await apiClient.get("mcc/command/history");
	return extractCommandHistoryRecords(response.data);
}

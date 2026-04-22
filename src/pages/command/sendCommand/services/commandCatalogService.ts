import { apiClient } from "@/services/api";
import { extractCommandCatalog } from "../Utils/commandCatalog.util";
import type { CommandCatalogItem } from "../types/commandCatalog.types";

export async function getCommandCatalog(): Promise<CommandCatalogItem[]> {
  const response = await apiClient.get("mcc/command");
  return extractCommandCatalog(response.data);
}
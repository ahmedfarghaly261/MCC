import { apiClient } from "@/services/api";
import type { CurrentUser } from "../types/profile.types";

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await apiClient.get<CurrentUser>("user");
  return response.data;
}

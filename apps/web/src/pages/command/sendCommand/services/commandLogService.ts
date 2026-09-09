import { apiClient } from "@/services/api";
import type { CommandStatus } from "@/pages/command/commandHistory/types/commandHistory.types";

export interface CommandLog {
  id: number;
  command_id: number;
  dest_address: string;
  src_address: string;
  raw_binary_sent: string;
  status: CommandStatus;
  sent_at: string;
  replied_at: string | null;
  response_time_ms: number | null;
  created_at: string;
  updated_at: string;

  command: {
    id: number;
    name: string;
    cmd_id: number;
    description: string;
    expected_data_len: number;
    requires_ack: number;
  };
}

export async function getCommandLogById(
  id: string | number
): Promise<CommandLog> {

  const response = await apiClient.get(
    `mcc/command/log/${id}`
  );

  return response.data;
}
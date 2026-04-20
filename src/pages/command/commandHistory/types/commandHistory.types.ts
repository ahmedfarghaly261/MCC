export interface CommandDefinition {
  id: number;
  name: string;
  cmd_id: number;
  description: string;
  allowed_sources: string[];
  allowed_destinations: string[];
  expected_data_len: number;
  requires_ack: number;
  created_at: string;
  updated_at: string;
}

export type CommandStatus = 'pending' | 'ack' | 'nack' | 'timeout' | 'error';

export type CommandStatusFilter = CommandStatus | 'all';

export interface CommandHistoryRecord {
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
  command_definition?: CommandDefinition;
}

export interface CommandHistoryFilters {
  status: CommandStatusFilter;
  destination: string;
}
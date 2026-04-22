export interface CommandInfo {
  id: number;
  name: string;
}

export interface CommandLog {
  id: number;
  command_id: number;
  dest_address: string;
  src_address: string;
  raw_binary_sent: string;
  status: string;
  sent_at: string;
  replied_at: string | null;
  response_time_ms: number | null;
  created_at: string;
  updated_at: string;
  command: CommandInfo;
}

export interface CommandReply {
  id: number;
  command_log_id: number;
  reply_data: string;
  created_at: string;
  command_log: CommandLog;
}
export interface CommandDictionary {
  id: number;
  name: string;
  cmd_id: number;
  description: string | null;
  allowed_sources: string[];
  allowed_destinations: string[];
  expected_data_len: number;
  requires_ack: number;
  created_at: string | null;
  updated_at: string | null;
}
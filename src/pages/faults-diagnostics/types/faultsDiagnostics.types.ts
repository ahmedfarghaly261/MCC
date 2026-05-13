export interface TopAnomaly {
  shap: number;
  value: number;
  feature: string;
}

export interface CommandLog {
  id: number;
  command_id: number;
  dest_address: string;
  src_address: string;
  raw_binary_sent: string;
  status: string;
  data: number[];
  sent_at: string;
  replied_at: string | null;
  response_time_ms: number | null;
  created_at: string;
  updated_at: string;
  decoding_retry_count: number;
  last_decoding_retry_at: string | null;
  anomaly_score: number;
  is_anomaly: boolean;
  processed_at: string | null;
}

export interface FaultExplanation {
  message: string;
}

export interface FaultRecord {
  id: number;
  command_log_id: number;
  explaination: FaultExplanation;
  root_cause: string;
  top_3_anomalies: TopAnomaly[];
  created_at: string;
  updated_at: string;
  command_log: CommandLog;
}
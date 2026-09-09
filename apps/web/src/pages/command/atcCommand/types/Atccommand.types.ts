export interface AtcDataPayload {
  pwrl_id?: string | null;
  image_id?: number | null;
  timer_value?: number | null;
  mode_id?: string | null;
  sequence_number?: number | null;
  window_size?: number | null;
  tlm_frame_seq_no?: number | null;
}

export interface AtcCommandPayload {
  command_id: number;
  dest_address: number;
  execute_at: string;
  data: AtcDataPayload;
}

export interface AtcCommandResponse {
  status: string;
  message: string;
  schedule_id: number;
}
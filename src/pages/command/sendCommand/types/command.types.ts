export interface SendCommandPayload {
  command_id: number;
  dest_address: number;
  data: number[];
}

export interface SendCommandResponse {
  message: string;
  log_id: string;
}
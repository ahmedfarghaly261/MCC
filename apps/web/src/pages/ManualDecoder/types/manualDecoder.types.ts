export type DecoderMode = "normal" | "batch";

export interface ManualDecodeFrame {
  hex_frame: string;
  frame_index: number;
}

export interface ManualDecodeRequest {
  hex_frame: string;
  frame_index: number;
  captured_at: string | null;
  station: string | null;
}

export interface ManualDecodeBatchRequest {
  frames: ManualDecodeFrame[];
}

export type ManualDecoderRecord = Record<string, unknown>;
export type ManualDecoderResponse = ManualDecoderRecord | ManualDecoderRecord[];

export type DecoderMode = "normal" | "batch";

export interface ManualDecodeRequest {
  hex_frame: string;
  frame_index: number;
  captured_at: string | null;
  station: string | null;
}

export type ManualDecoderRecord = Record<string, unknown>;
export type ManualDecoderResponse = ManualDecoderRecord | ManualDecoderRecord[];

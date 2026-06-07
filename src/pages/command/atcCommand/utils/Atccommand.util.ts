import type { AtcCommandSchema } from "./Atccommand.schema";
import type { AtcCommandPayload, AtcDataPayload } from "../types/Atccommand.types";

export function parseIntOrHex(value: string | undefined): number | null {
  if (!value) return null;
  const v = value.trim();
  if (/^0x[0-9a-fA-F]+$/.test(v)) {
    const n = parseInt(v, 16);
    return Number.isFinite(n) ? n : null;
  }
  if (/^-?\d+$/.test(v)) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function buildAtcPayload(values: AtcCommandSchema): AtcCommandPayload {
  const data: AtcDataPayload = {};

  const pwrlId = values.pwrlId?.trim();
  if (pwrlId) data.pwrl_id = pwrlId;

  const imageId = parseIntOrHex(values.imageId);
  if (imageId !== null) data.image_id = imageId;

  const timerValue = parseIntOrHex(values.timerValue);
  if (timerValue !== null) data.timer_value = timerValue;

  const modeId = values.modeId?.trim();
  if (modeId) data.mode_id = modeId;

  const sequenceNumber = parseIntOrHex(values.sequenceNumber);
  if (sequenceNumber !== null) data.sequence_number = sequenceNumber;

  const windowSize = parseIntOrHex(values.windowSize);
  if (windowSize !== null) data.window_size = windowSize;

  const tlmFrameSeqNo = parseIntOrHex(values.tlmFrameSeqNo);
  if (tlmFrameSeqNo !== null) data.tlm_frame_seq_no = tlmFrameSeqNo;

  return {
    command_id:   parseIntOrHex(values.commandId) as number,
    dest_address: parseIntOrHex(values.destAddress) as number,
    execute_at:   new Date(values.executeAt).toISOString(),
    data,
  };
}

export function formatAtcDateTime(iso: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}
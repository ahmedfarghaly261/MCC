import { apiClient } from "@/services/api";
import type {
  ManualDecodeBatchRequest,
  ManualDecodeRequest,
  ManualDecoderRecord,
  ManualDecoderResponse,
} from "../types/manualDecoder.types";

function asRecord(value: unknown): ManualDecoderRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as ManualDecoderRecord;
}

function isRecordArray(value: unknown): value is ManualDecoderRecord[] {
  return Array.isArray(value) && value.every((item) => asRecord(item));
}

function isManualDecoderResponse(value: unknown): value is ManualDecoderResponse {
  return Boolean(asRecord(value)) || isRecordArray(value);
}

function extractManualDecoderResponse(
  payload: unknown
): ManualDecoderResponse | null {
  if (isManualDecoderResponse(payload)) {
    return payload;
  }

  const root = asRecord(payload);
  if (!root) {
    return null;
  }

  const nestedData = asRecord(root.data);
  const nestedResult = asRecord(root.result);
  const nestedPayload = asRecord(root.payload);

  const candidates: unknown[] = [
    root.data,
    root.result,
    root.payload,
    nestedData?.data,
    nestedData?.result,
    nestedResult?.data,
    nestedResult?.payload,
    nestedPayload?.data,
  ];

  for (const candidate of candidates) {
    if (isManualDecoderResponse(candidate)) {
      return candidate;
    }
  }

  return null;
}

export async function decodeManualFrame(
  payload: ManualDecodeRequest
): Promise<ManualDecoderResponse> {
  const response = await apiClient.post("mcc/telemetry/decode", payload);
  const decoded = extractManualDecoderResponse(response.data);

  if (!decoded) {
    throw new Error("Manual decoder response format is invalid.");
  }

  return decoded;
}

export async function decodeManualBatch(
  payload: ManualDecodeBatchRequest
): Promise<ManualDecoderResponse> {
  const response = await apiClient.post(
    "mcc/telemetry/decode/batch",
    payload
  );
  const decoded = extractManualDecoderResponse(response.data);

  if (!decoded) {
    throw new Error("Manual decoder response format is invalid.");
  }

  return decoded;
}

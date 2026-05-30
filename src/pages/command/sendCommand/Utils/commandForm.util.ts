import type { CommandSchema } from "@/models/command/commandSchema";

const stringDataFields = new Set(["pwrl_id", "mode_id"]);

const payloadFieldAliases: Record<string, string> = {
  img_id: "image_id",
};

function resolvePayloadField(field: string): string {
  return payloadFieldAliases[field] ?? field;
}

export function isStringDataField(field: string): boolean {
  return stringDataFields.has(field);
}

export function parseNumericValue(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    const parsed = Number.parseInt(trimmed, 16);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (/^-?\d+$/.test(trimmed)) {
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function formatFieldLabel(value: string): string {
  if (value === "pwrl_id") {
    return "Power Line";
  }

  if (value === "mode_id") {
    return "Satellite Mode";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function normalizeRequiredFields(
  fields: Array<string | number | null | undefined>,
): string[] {
  return fields
    .map((field) =>
      field === null || field === undefined
        ? ""
        : String(field).trim(),
    )
    .filter((field) => field.length > 0);
}

export function buildDataPayload(
  values: CommandSchema,
  requiredFields: string[],
): Record<string, string | number> {
  if (requiredFields.length === 0) {
    return {};
  }

  const dataFields = values.dataFields ?? {};
  const payload: Record<string, string | number> = {};

  requiredFields.forEach((field) => {
    const payloadField = resolvePayloadField(field);
    const raw =
      typeof dataFields[field] === "string"
        ? dataFields[field]
        : typeof dataFields[field] === "number"
        ? String(dataFields[field])
        : "";

    if (isStringDataField(field)) {
      const trimmed = raw.trim();
      if (trimmed.length > 0) {
        payload[payloadField] = trimmed;
      }
      return;
    }

    const parsed = parseNumericValue(raw);
    if (parsed !== null) {
      payload[payloadField] = parsed;
      return;
    }

    if (raw.trim().length > 0) {
      payload[payloadField] = raw.trim();
    }
  });

  return payload;
}

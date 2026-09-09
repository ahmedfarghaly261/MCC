import type {
  CommandCatalogItem,
  DestinationOption,
} from "../types/commandCatalog.types";

const destinationByLabel: Record<string, number> = {
  power: 0x10,
  communication: 0x20,
  payload: 0x30,
  navigation: 0x40,
  thermal: 0x50,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCommandCatalogItem(value: unknown): value is CommandCatalogItem {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.cmd_id === "string" &&
    Array.isArray(value.allowed_destinations)
  );
}

export function formatAsHex(value: number): string {
  return `${value.toString(16).padStart(2, "0")}`;
}

function parseDestinationValue(raw: string): number | null {
  const input = raw.trim();

  if (!input) {
    return null;
  }

  const hexMatch = input.match(/0x[0-9a-fA-F]+/);

  if (hexMatch) {
    const parsedHex = Number.parseInt(hexMatch[0], 16);
    return Number.isFinite(parsedHex) ? parsedHex : null;
  }

  const decimalMatch = input.match(/\b\d+\b/);

  if (decimalMatch) {
    const parsedDecimal = Number.parseInt(decimalMatch[0], 10);
    return Number.isFinite(parsedDecimal) ? parsedDecimal : null;
  }

  const normalizedLabel = input
    .replace(/[()_\-|:,]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return destinationByLabel[normalizedLabel] ?? null;
}

export function extractCommandCatalog(payload: unknown): CommandCatalogItem[] {
  if (Array.isArray(payload)) {
    return payload.filter(isCommandCatalogItem);
  }

  if (!isObject(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data.filter(isCommandCatalogItem);
  }

  return [];
}

export function getDestinationOptions(
  command: CommandCatalogItem | undefined,
): DestinationOption[] {
  if (!command) {
    return [];
  }

  const uniqueByValue = new Map<number, DestinationOption>();

  const subsystemMap = new Map<number, string>();
  if (Array.isArray(command.subsystems)) {
    command.subsystems.forEach((sub) => {
      const parsedHex = parseDestinationValue(sub.hex_code);
      if (parsedHex !== null) {
        subsystemMap.set(parsedHex, sub.name);
      }
    });
  }

  command.allowed_destinations.forEach((rawValue, index) => {
    const parsedValue = parseDestinationValue(rawValue);

    if (parsedValue === null) {
      return;
    }

    if (!uniqueByValue.has(parsedValue)) {
      uniqueByValue.set(parsedValue, {
        key: `${command.id}-${parsedValue}-${index}`,
        value: parsedValue,
        code: formatAsHex(parsedValue),
        label: subsystemMap.get(parsedValue) ?? `Address ${formatAsHex(parsedValue)}`,
      });
    }
  });

  return Array.from(uniqueByValue.values()).sort((a, b) => a.value - b.value);
}
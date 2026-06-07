export function parseParameters(
  value: string,
): string[] {
  if (!value.trim()) {
    return [];
  }

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatDateTime(
  date?: string | null,
): string {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString();
}
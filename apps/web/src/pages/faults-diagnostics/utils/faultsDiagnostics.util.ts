export function formatDate(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getSeverity(rootCause: string) {
  if (rootCause.toLowerCase().includes("temp")) {
    return "warning";
  }

  return "critical";
}
export function getDestinationButtonClass(label: string, isSelected: boolean): string {
  const normalized = label.trim().toUpperCase();

  let baseClass = "border-gray-600 bg-[#0B1220] text-gray-200 hover:border-gray-400 hover:bg-gray-800";

  switch (normalized) {
    case "EPS":
      baseClass = "border-orange-500/60 bg-orange-500/10 text-white hover:bg-orange-500/20";
      if (isSelected) baseClass += " ring-2 ring-orange-500/50 bg-orange-500/20";
      break;
    case "ASIB":
      baseClass = "border-violet-500/60 bg-violet-500/10 text-white hover:bg-violet-500/20";
      if (isSelected) baseClass += " ring-2 ring-violet-500/50 bg-violet-500/20";
      break;
    case "RF":
      baseClass = "border-blue-500/60 bg-blue-500/10 text-white hover:bg-blue-500/20";
      if (isSelected) baseClass += " ring-2 ring-blue-500/50 bg-blue-500/20";
      break;
    case "PA":
      baseClass = "border-rose-500/60 bg-rose-500/10 text-white hover:bg-rose-500/20";
      if (isSelected) baseClass += " ring-2 ring-rose-500/50 bg-rose-500/20";
      break;
    case "ANTS":
      baseClass = "border-emerald-500/60 bg-emerald-500/10 text-white hover:bg-emerald-500/20";
      if (isSelected) baseClass += " ring-2 ring-emerald-500/50 bg-emerald-500/20";
      break;
    case "SW":
      baseClass = "border-cyan-500/60 bg-cyan-500/10 text-white hover:bg-cyan-500/20";
      if (isSelected) baseClass += " ring-2 ring-cyan-500/50 bg-cyan-500/20";
      break;
    case "GCS":
      baseClass = "border-indigo-500/60 bg-indigo-500/10 text-white hover:bg-indigo-500/20";
      if (isSelected) baseClass += " ring-2 ring-indigo-500/50 bg-indigo-500/20";
      break;
    case "BROADCAST":
      baseClass = "border-fuchsia-500/60 bg-fuchsia-500/10 text-white hover:bg-fuchsia-500/20";
      if (isSelected) baseClass += " ring-2 ring-fuchsia-500/50 bg-fuchsia-500/20";
      break;
    default:
      // Fallback for unknown labels matches the default gray styling
      if (isSelected) {
        baseClass = "border-gray-400 bg-gray-800 text-white ring-2 ring-gray-400/50";
      }
      break;
  }

  return baseClass;
}

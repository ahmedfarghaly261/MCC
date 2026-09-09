import type { FaultRecord } from "../types/faultsDiagnostics.types";

interface Props {
  records: FaultRecord[];
}

export default function FaultsStats({
  records,
}: Props) {
  const total = records.length;

  const critical = records.filter(
    (record) =>
      !record.root_cause.toLowerCase().includes("temp")
  ).length;

  const warnings = records.filter(
    (record) =>
      record.root_cause.toLowerCase().includes("temp")
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="rounded-xl border border-slate-800 bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Active Faults
        </p>

        <p className="text-2xl text-red-400 font-semibold mt-2">
          {total}
        </p>
      </div>

      <div className="rounded-xl border border-red-500/30 bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Critical
        </p>

        <p className="text-2xl text-red-400 font-semibold mt-2">
          {critical}
        </p>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Warnings
        </p>

        <p className="text-2xl text-yellow-400 font-semibold mt-2">
          {warnings}
        </p>
      </div>

      <div className="rounded-xl border border-green-500/30 bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Resolved Today
        </p>

        <p className="text-2xl text-green-400 font-semibold mt-2">
          0
        </p>
      </div>
    </div>
  );
}
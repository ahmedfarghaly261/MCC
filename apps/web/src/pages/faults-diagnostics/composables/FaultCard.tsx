import {
  AlertTriangle,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import type { FaultRecord } from "../types/faultsDiagnostics.types";

import {
  formatDate,
  getSeverity,
} from "../utils/faultsDiagnostics.util";

interface Props {
  record: FaultRecord;
}

export default function FaultCard({
  record,
}: Props) {
  const severity = getSeverity(record.root_cause);

  const isCritical = severity === "critical";

  return (
    <div
      className={`rounded-2xl border p-6 bg-card ${
        isCritical
          ? "border-red-500/40"
          : "border-yellow-500/40"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isCritical
                ? "bg-red-500/10 border border-red-500/30"
                : "bg-yellow-500/10 border border-yellow-500/30"
            }`}
          >
            <AlertTriangle
              className={`w-7 h-7 ${
                isCritical
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">
                {record.root_cause}
              </h2>

              <span
                className={`px-3 py-1 rounded-full text-xs border ${
                  isCritical
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                }`}
              >
                {severity}
              </span>

              <span className="px-3 py-1 rounded-full text-xs border bg-red-500/10 border-red-500/30 text-red-400">
                active
              </span>
            </div>

            <p className="text-gray-400 mt-1">
              Command Log #{record.command_log_id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <Clock3 className="w-4 h-4" />

          <span>
            {formatDate(record.created_at)}
          </span>
        </div>
      </div>

      <p className="text-lg text-white mt-6">
        {record.explaination.message}
      </p>

      <div className="mt-6 rounded-xl bg-[#020817] p-5 border border-slate-800">
        <p className="text-sm text-gray-400 mb-3">
          Top Detected Anomalies
        </p>

        <div className="space-y-3">
          {record.top_3_anomalies.map((item) => (
            <div
              key={item.feature}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />

                <span className="text-white">
                  {item.feature}
                </span>
              </div>

              <span className="text-gray-400 text-sm">
                value: {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <Button
          className="bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20"
          variant="outline"
        >
          Run Diagnostics
        </Button>

        <Button
          className="bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20"
          variant="outline"
        >
          Mark Resolved
        </Button>
      </div>
    </div>
  );
}
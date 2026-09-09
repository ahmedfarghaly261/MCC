import { useEffect, useState } from "react";

import { AlertTriangle } from "lucide-react";

import FaultCard from "./composables/FaultCard";

import FaultsStats from "./composables/FaultsStats";

import { getFaultsDiagnostics } from "./services/faultsDiagnostics.service";

import type { FaultRecord } from "./types/faultsDiagnostics.types";

export default function FaultsDiagnosticsView() {
  const [records, setRecords] = useState<FaultRecord[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response =
          await getFaultsDiagnostics();

        setRecords(response);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  return (
    <div className="p-6 bg-background min-h-screen text-white">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            Faults & Diagnostics
          </h1>

          <p className="text-gray-400">
            Monitor and resolve system faults and anomalies
          </p>
        </div>
      </div>

      <FaultsStats records={records} />

      <div className="space-y-6">
        {!loading &&
          records.map((record) => (
            <FaultCard
              key={record.id}
              record={record}
            />
          ))}
      </div>
    </div>
  );
}
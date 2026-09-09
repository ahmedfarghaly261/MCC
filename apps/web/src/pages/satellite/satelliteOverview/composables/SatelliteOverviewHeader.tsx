import { Satellite } from "lucide-react";

export default function SatelliteOverviewHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <Satellite
            className="w-6 h-6 text-blue-400"
            style={{
              filter: "drop-shadow(0 0 8px rgb(59 130 246 / 0.5))",
            }}
          />
        </div>
        <div>
          <h1 className="text-white">Satellites Overview</h1>
          <p className="text-sm text-gray-400">
            Manage and monitor all registered satellites
          </p>
        </div>
      </div>
    </div>
  );
}

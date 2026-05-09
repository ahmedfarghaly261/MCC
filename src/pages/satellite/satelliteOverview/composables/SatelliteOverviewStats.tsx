import type { SatelliteData } from "../types/satellite.types";

interface SatelliteOverviewStatsProps {
  satellites: SatelliteData[];
}

export default function SatelliteOverviewStats({
  satellites,
}: SatelliteOverviewStatsProps) {
  const total = satellites.length;
  const active = satellites.filter(
    (satellite) => satellite.status === "active",
  ).length;
  const totalSubsystems = satellites.reduce(
    (acc, satellite) => acc + satellite.subsystems.length,
    0,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg p-4">
        <p className="text-gray-400 text-xs mb-1">
          Total Satellites
        </p>
        <p className="text-blue-400 text-2xl font-mono">
          {total}
        </p>
      </div>
      <div className="bg-[#1F2937] border border-green-500/30 rounded-lg p-4">
        <p className="text-gray-400 text-xs mb-1">
          Active Satellites
        </p>
        <p className="text-green-400 text-2xl font-mono">
          {active}
        </p>
      </div>
      <div className="bg-[#1F2937] border border-cyan-500/30 rounded-lg p-4">
        <p className="text-gray-400 text-xs mb-1">
          Total Subsystems
        </p>
        <p className="text-cyan-400 text-2xl font-mono">
          {totalSubsystems}
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Satellite } from "lucide-react";
import type { SatelliteData } from "../types/satellite.types";
import SatelliteOverviewCard from "./SatelliteOverviewCard";

interface SatelliteOverviewListProps {
  satellites: SatelliteData[];
}

export default function SatelliteOverviewList({
  satellites,
}: SatelliteOverviewListProps) {
  const [expandedSatellites, setExpandedSatellites] =
    useState<Set<number>>(() => new Set());

  const toggleSatellite = (id: number) => {
    setExpandedSatellites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (satellites.length === 0) {
    return (
      <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg p-12 text-center">
        <Satellite className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <p className="text-gray-400">No satellites found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {satellites.map((satellite) => (
        <SatelliteOverviewCard
          key={satellite.id}
          satellite={satellite}
          expanded={expandedSatellites.has(satellite.id)}
          onToggle={toggleSatellite}
        />
      ))}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Cpu,
  Flag,
  Info,
  Satellite,
  Zap,
} from "lucide-react";
import type { SatelliteData } from "../types/satellite.types";
import {
  formatDate,
  getModeColor,
  getStatusColor,
} from "../utils/satelliteOverview.util";

interface SatelliteOverviewCardProps {
  satellite: SatelliteData;
  expanded: boolean;
  onToggle: (id: number) => void;
}

export default function SatelliteOverviewCard({
  satellite,
  expanded,
  onToggle,
}: SatelliteOverviewCardProps) {
  const subsystems = satellite.subsystems ?? [];

  return (
    <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg overflow-hidden hover:border-blue-500/30 transition-colors">
      <div
        className="p-6 cursor-pointer"
        onClick={() => onToggle(satellite.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Satellite className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-white text-xl font-semibold">
                  {satellite.name}
                </h3>
                <Badge className={getStatusColor(satellite.status)}>
                  {satellite.status}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {satellite.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-500 text-xs mb-1">NORAD ID</p>
                  <p className="text-cyan-400 font-mono text-sm">
                    {satellite.norad_id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">COSPAR ID</p>
                  <p className="text-yellow-400 font-mono text-sm">
                    {satellite.cospar_id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    Country
                  </p>
                  <p className="text-gray-300 text-sm">
                    {satellite.owner_country}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Launch Date
                  </p>
                  <p className="text-gray-300 text-sm">
                    {formatDate(satellite.launch_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-400 border-purple-500/30"
            >
              {subsystems.length} subsystems
            </Badge>
            {expanded ? (
              <ChevronDown className="w-6 h-6 text-blue-400" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-700/50 bg-linear-to-r from-[#0B1120] to-black/50 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/30 rounded-lg border border-gray-700/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-blue-400" />
                  <h4 className="text-gray-300 text-sm font-medium">
                    Satellite Information
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-700/20">
                    <span className="text-gray-400 text-sm">Database ID</span>
                    <span className="text-cyan-400 font-mono">
                      #{satellite.id}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700/20">
                    <span className="text-gray-400 text-sm">Owner Country</span>
                    <span className="text-green-400">
                      {satellite.owner_country}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400 text-sm">Status</span>
                    <Badge className={getStatusColor(satellite.status)}>
                      {satellite.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg border border-gray-700/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-gray-300 text-sm font-medium">
                    Timeline
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-700/20">
                    <span className="text-gray-400 text-sm">Launch Date</span>
                    <span className="text-yellow-400 text-sm">
                      {formatDate(satellite.launch_date)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700/20">
                    <span className="text-gray-400 text-sm">Created</span>
                    <span className="text-gray-300 text-sm">
                      {formatDate(satellite.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400 text-sm">Last Updated</span>
                    <span className="text-gray-300 text-sm">
                      {formatDate(satellite.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {subsystems.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <h4 className="text-white text-lg">
                    Subsystems ({subsystems.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subsystems.map((subsystem) => (
                    <div
                      key={subsystem.id}
                      className="bg-linear-to-br from-black/40 to-black/20 rounded-lg p-4 border border-gray-700/30 hover:border-purple-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="text-cyan-400 font-mono text-sm mb-1">
                            {subsystem.name}
                          </h5>
                          <Badge
                            variant="outline"
                            className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-mono text-xs"
                          >
                            {subsystem.hex_code}
                          </Badge>
                        </div>
                        <Badge className={getModeColor(subsystem.mode)}>
                          <Zap className="w-3 h-3 mr-1" />
                          {subsystem.mode}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {subsystem.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-black/30 rounded-lg border border-gray-700/30 p-8 text-center">
                <Cpu className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">
                  No subsystems configured for this satellite
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

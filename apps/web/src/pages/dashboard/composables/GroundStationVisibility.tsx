import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type GroundStationVisibilityProps = {
  stationName: string;
  satellitesInZone: number;
};

export default function GroundStationVisibility({
  stationName,
  satellitesInZone,
}: GroundStationVisibilityProps) {
  return (
    <Card className="bg-[#1A2333] border border-gray-700 rounded-xl mt-10">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold">Ground Station Visibility</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#0B1220] px-5 py-2 rounded-lg font-medium">
            {stationName}
          </div>
          <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full">
            {satellitesInZone} satellite
            {satellitesInZone === 1 ? "" : "s"} in visibility zone
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

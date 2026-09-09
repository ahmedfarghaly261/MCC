import { Battery, Signal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type {
  TelemetryItem,
  TelemetryStatus,
} from "../types/dashboard.types";

const STATUS_STYLES: Record<TelemetryStatus, string> = {
  operational: "bg-green-500/20 text-green-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  critical: "bg-red-500/20 text-red-400",
};

type TelemetryPreviewProps = {
  telemetry: TelemetryItem[];
};

export default function TelemetryPreview({
  telemetry,
}: TelemetryPreviewProps) {
  return (
    <div className="lg:col-span-2">
      <h2 className="text-lg font-semibold mb-6">
        Satellite Telemetry Preview
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {telemetry.map((sat) => (
          <Card
            key={sat.id}
            className="bg-[#1A2333] border border-gray-700 rounded-xl"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">
                    EGSA Satellite-{sat.id}
                  </h3>
                  <p className="text-xs text-gray-400">
                    EGSA-SAT-{sat.id}
                  </p>
                </div>

                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${STATUS_STYLES[sat.status]}`}
                >
                  {sat.status}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2 text-gray-400">
                    <Battery className="w-4 h-4" /> Battery
                  </span>
                  <span>{sat.battery}%</span>
                </div>
                <div className="w-full h-2 bg-[#0B1220] rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${sat.battery}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Temperature</span>
                <span>{sat.temp}°C</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-400">
                  <Signal className="w-4 h-4" /> Signal
                </span>
                <span>{sat.signal}%</span>
              </div>

              <div className="flex justify-between text-sm text-gray-400">
                <span>Last Contact</span>
                <span>2 min ago</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

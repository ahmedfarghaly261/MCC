import { Activity, Battery } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CurrentVisibility } from "../types/dashboard.types";

type CurrentVisibilityCardProps = {
  data: CurrentVisibility;
};

export default function CurrentVisibilityCard({
  data,
}: CurrentVisibilityCardProps) {
  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <h2 className="text-lg font-semibold">
          Current Satellite in Visibility Zone
        </h2>
        <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
          LIVE
        </span>
      </div>

      <Card className="bg-[#1A2333] border border-green-500/40 rounded-xl">
        <CardContent className="p-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{data.name}</h3>
              <p className="text-gray-400">{data.mission}</p>
              <p className="text-gray-500 text-sm">{data.code}</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2 text-gray-400">
                  <Activity className="w-4 h-4" />
                  Remaining Visibility Time
                </span>
                <span className="text-blue-400 font-medium">
                  {data.remainingTime}
                </span>
              </div>
              <div className="w-full h-2 bg-[#0B1220] rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${data.remainingPercent}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Signal Strength</span>
              <span className="text-green-400 font-medium">
                {data.signalPercent}%
              </span>
            </div>

            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-400">Communication Status</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${data.communicationStatusClassName}`}
              >
                {data.communicationStatus}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm items-center">
              <span className="flex items-center gap-2 text-gray-400">
                <Battery className="w-4 h-4" />
                Battery
              </span>
              <span className="text-green-400 font-medium">
                {data.batteryPercent}%
              </span>
            </div>

            <div className="w-full h-2 bg-[#0B1220] rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${data.batteryPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Temperature</span>
              <span>{data.temperature}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Altitude</span>
              <span>{data.altitude}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Last Contact</span>
              <span>{data.lastContact}</span>
            </div>

            <button className="w-full mt-6 bg-blue-600/20 border border-blue-500 text-blue-400 py-3 rounded-lg hover:bg-blue-600/30 transition">
              {data.actionLabel}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

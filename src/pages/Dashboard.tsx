"use client";

import React, { memo, useMemo } from "react";
import {
  Satellite,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Wrench,
  Clock,
  MapPin,
  Activity,
  Battery,
  Signal,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  valueColor: string;
};

const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  valueColor,
}: StatCardProps) {
  return (
    <Card className="bg-[#1A2333] border border-gray-700 rounded-lg hover:border-blue-500 transition-all duration-300">
      <CardContent className="p-3 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400 mb-2">{title}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </CardContent>
    </Card>
  );
});



type Sat = { id: string; battery: number; temp: number; signal: number; status: string };
type FeedEvent = { type: "command" | "alert" | "anomaly"; text: string; time: string };

export default function Dashboard() {
  // Stable data - created once per mount, prevents unnecessary re-renders
  const telemetry = useMemo<Sat[]>(
    () => [
      { id: "01", battery: 78, temp: 23, signal: 92, status: "operational" },
      { id: "02", battery: 45, temp: 31, signal: 85, status: "warning" },
      { id: "03", battery: 92, temp: 21, signal: 95, status: "operational" },
      { id: "04", battery: 88, temp: 24, signal: 89, status: "operational" },
      { id: "05", battery: 18, temp: 35, signal: 67, status: "critical" },
      { id: "06", battery: 95, temp: 22, signal: 98, status: "operational" },
    ],
    []
  );

  const feedEvents = useMemo<FeedEvent[]>(
    () => [
      {
        type: "command",
        text: "Battery optimization command executed successfully",
        time: "4m ago",
      },
      {
        type: "alert",
        text: "Temperature threshold exceeded",
        time: "7m ago",
      },
      {
        type: "anomaly",
        text: "Critical battery level detected",
        time: "17m ago",
      },
    ],
    []
  );

  // Stable icons for StatCard memoization
  const statIcons = useMemo(
    () => ({
      active: <Satellite className="w-6 h-6 text-blue-400" />,
      operational: <CheckCircle2 className="w-6 h-6 text-green-400" />,
      warnings: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
      critical: <Siren className="w-6 h-6 text-red-500" />,
      faults: <Wrench className="w-6 h-6 text-orange-400" />,
      pending: <Clock className="w-6 h-6 text-purple-400" />,
    }),
    []
  );

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">

      {/* Main */}
      <div className="px-8 py-10">
        <h1 className="text-2xl font-bold mb-2">
          Mission Overview Dashboard
        </h1>
        <p className="text-gray-400 mb-8">
          Real-time satellite fleet monitoring and control
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard
            title="Active Satellites"
            value={6}
            valueColor="text-blue-400"
            icon={statIcons.active}
          />
          <StatCard
            title="Operational"
            value={4}
            valueColor="text-green-400"
            icon={statIcons.operational}
          />
          <StatCard
            title="Warnings"
            value={1}
            valueColor="text-yellow-400"
            icon={statIcons.warnings}
          />
          <StatCard
            title="Critical"
            value={1}
            valueColor="text-red-500"
            icon={statIcons.critical}
          />
          <StatCard
            title="Active Faults"
            value={2}
            valueColor="text-orange-400"
            icon={statIcons.faults}
          />
          <StatCard
            title="Pending Commands"
            value={5}
            valueColor="text-purple-400"
            icon={statIcons.pending}
          />
        </div>

        {/* Ground Station Visibility */}
        <Card className="bg-[#1A2333] border border-gray-700 rounded-xl mt-10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Ground Station Visibility</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-[#0B1220] px-5 py-2 rounded-lg font-medium">
                Cairo Station
              </div>
              <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full">
                1 satellite in visibility zone
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Current Satellite Section */}
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
              {/* Left Side */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">EGSA Satellite-04</h3>
                  <p className="text-gray-400">GPS Navigation</p>
                  <p className="text-gray-500 text-sm">EGSA-SAT-04</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Activity className="w-4 h-4" />
                      Remaining Visibility Time
                    </span>
                    <span className="text-blue-400 font-medium">5:37</span>
                  </div>
                  <div className="w-full h-2 bg-[#0B1220] rounded-full">
                    <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Signal Strength</span>
                  <span className="text-green-400 font-medium">79%</span>
                </div>

                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-400">Communication Status</span>
                  <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                    intermittent
                  </span>
                </div>
              </div>

              {/* Right Side */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm items-center">
                  <span className="flex items-center gap-2 text-gray-400">
                    <Battery className="w-4 h-4" />
                    Battery
                  </span>
                  <span className="text-green-400 font-medium">89%</span>
                </div>

                <div className="w-full h-2 bg-[#0B1220] rounded-full">
                  <div className="w-[89%] h-2 bg-green-500 rounded-full"></div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Temperature</span>
                  <span>24°C</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Altitude</span>
                  <span>800 km</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Last Contact</span>
                  <span>3 min ago</span>
                </div>

                <button className="w-full mt-6 bg-blue-600/20 border border-blue-500 text-blue-400 py-3 rounded-lg hover:bg-blue-600/30 transition">
                  Send Command to EGSA Satellite-04
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Telemetry & Live Feed */}
        <div className="mt-14 grid lg:grid-cols-3 gap-8">
          {/* LEFT: Telemetry Grid */}
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
                        className={`px-2 py-0.5 text-xs rounded-full
                          ${
                            sat.status === "operational"
                              ? "bg-green-500/20 text-green-400"
                              : sat.status === "warning"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                      >
                        {sat.status}
                      </span>
                    </div>

                    {/* Battery */}
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

          {/* RIGHT: Live Activity Feed */}
          <div>
            <h2 className="text-lg font-semibold mb-6">
              Live Activity Feed
            </h2>

            <Card className="bg-[#1A2333] border border-gray-700 rounded-xl">
              <CardContent className="p-4 h-[600px] overflow-y-auto space-y-4">
                {feedEvents.map((event, i) => (
                  <div
                    key={i}
                    className="bg-[#0B1220] p-4 rounded-lg border border-gray-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {event.type === "command" && (
                        <Activity className="w-4 h-4 text-blue-400" />
                      )}
                      {event.type === "alert" && (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      )}
                      {event.type === "anomaly" && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}

                      <span className="text-xs text-gray-400 uppercase">
                        {event.type}
                      </span>
                    </div>

                    <p className="text-sm">{event.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {event.time}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Summary Cards */}
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <Card className="bg-[#1A2333] border border-green-500/30">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Avg Fleet Battery</p>
                <p className="text-green-400 text-2xl font-bold">69%</p>
              </div>
              <Battery className="text-green-400" />
            </CardContent>
          </Card>

          <Card className="bg-[#1A2333] border border-blue-500/30">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Avg Signal Strength</p>
                <p className="text-blue-400 text-2xl font-bold">88%</p>
              </div>
              <Signal className="text-blue-400" />
            </CardContent>
          </Card>

          <Card className="bg-[#1A2333] border border-purple-500/30">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Next Scheduled Pass</p>
                <p className="text-purple-400 font-medium">
                  EGSA-SAT-03 • 12m
                </p>
              </div>
              <Clock className="text-purple-400" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

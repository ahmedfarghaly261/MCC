"use client";

import {
  Satellite,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Wrench,
  Clock,
  Battery,
  Signal,
} from "lucide-react";
import DashboardStats from "./composables/DashboardStats";
import GroundStationVisibility from "./composables/GroundStationVisibility";
import CurrentVisibilityCard from "./composables/CurrentVisibilityCard";
import TelemetryPreview from "./composables/TelemetryPreview";
import LiveActivityFeed from "./composables/LiveActivityFeed";
import BottomSummary from "./composables/BottomSummary";
import type {
  CurrentVisibility,
  FeedEvent,
  StatCardData,
  SummaryCardData,
  TelemetryItem,
} from "./types/dashboard.types";

const STAT_CARDS: StatCardData[] = [
  {
    title: "Active Satellites",
    value: 6,
    valueColor: "text-blue-400",
    icon: Satellite,
    iconClassName: "text-blue-400",
  },
  {
    title: "Operational",
    value: 4,
    valueColor: "text-green-400",
    icon: CheckCircle2,
    iconClassName: "text-green-400",
  },
  {
    title: "Warnings",
    value: 1,
    valueColor: "text-yellow-400",
    icon: AlertTriangle,
    iconClassName: "text-yellow-400",
  },
  {
    title: "Critical",
    value: 1,
    valueColor: "text-red-500",
    icon: Siren,
    iconClassName: "text-red-500",
  },
  {
    title: "Active Faults",
    value: 2,
    valueColor: "text-orange-400",
    icon: Wrench,
    iconClassName: "text-orange-400",
  },
  {
    title: "Pending Commands",
    value: 5,
    valueColor: "text-purple-400",
    icon: Clock,
    iconClassName: "text-purple-400",
  },
];

const TELEMETRY: TelemetryItem[] = [
  { id: "01", battery: 78, temp: 23, signal: 92, status: "operational" },
  { id: "02", battery: 45, temp: 31, signal: 85, status: "warning" },
  { id: "03", battery: 92, temp: 21, signal: 95, status: "operational" },
  { id: "04", battery: 88, temp: 24, signal: 89, status: "operational" },
  { id: "05", battery: 18, temp: 35, signal: 67, status: "critical" },
  { id: "06", battery: 95, temp: 22, signal: 98, status: "operational" },
];

const FEED_EVENTS: FeedEvent[] = [
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
];

const CURRENT_VISIBILITY: CurrentVisibility = {
  name: "EGSA Satellite-04",
  mission: "GPS Navigation",
  code: "EGSA-SAT-04",
  remainingTime: "5:37",
  remainingPercent: 75,
  signalPercent: 79,
  communicationStatus: "intermittent",
  communicationStatusClassName: "bg-yellow-500/20 text-yellow-400",
  batteryPercent: 89,
  temperature: "24°C",
  altitude: "800 km",
  lastContact: "3 min ago",
  actionLabel: "Send Command to EGSA Satellite-04",
};

const SUMMARY_CARDS: SummaryCardData[] = [
  {
    title: "Avg Fleet Battery",
    value: "69%",
    valueClassName: "text-green-400 text-2xl font-bold",
    icon: Battery,
    iconClassName: "text-green-400",
    borderClassName: "border border-green-500/30",
  },
  {
    title: "Avg Signal Strength",
    value: "88%",
    valueClassName: "text-blue-400 text-2xl font-bold",
    icon: Signal,
    iconClassName: "text-blue-400",
    borderClassName: "border border-blue-500/30",
  },
  {
    title: "Next Scheduled Pass",
    value: "EGSA-SAT-03 • 12m",
    valueClassName: "text-purple-400 font-medium",
    icon: Clock,
    iconClassName: "text-purple-400",
    borderClassName: "border border-purple-500/30",
  },
];

export default function DashboardView() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="px-8 py-10">
        <h1 className="text-2xl font-bold mb-2">
          Mission Overview Dashboard
        </h1>
        <p className="text-gray-400 mb-8">
          Real-time satellite fleet monitoring and control
        </p>

        <DashboardStats stats={STAT_CARDS} />

        <GroundStationVisibility
          stationName="Cairo Station"
          satellitesInZone={1}
        />

        <CurrentVisibilityCard data={CURRENT_VISIBILITY} />

        <div className="mt-14 grid lg:grid-cols-3 gap-8">
          <TelemetryPreview telemetry={TELEMETRY} />
          <LiveActivityFeed events={FEED_EVENTS} />
        </div>

        <BottomSummary summary={SUMMARY_CARDS} />
      </div>
    </div>
  );
}

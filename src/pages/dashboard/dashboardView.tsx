"use client";

import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Battery,
  Code2,
  FileText,
  MessageSquareText,
  Radio,
  Signal,
  Terminal,
} from "lucide-react";
import GroundStationVisibility from "./composables/GroundStationVisibility";
import CurrentVisibilityCard from "./composables/CurrentVisibilityCard";
import MissionControlOperations from "./composables/MissionControlOperations";
import LiveActivityFeed from "./composables/LiveActivityFeed";
import BottomSummary from "./composables/BottomSummary";
import type {
  CurrentVisibility,
  FeedEvent,
  OperationModule,
  SummaryCardData,
} from "./types/dashboard.types";


const FEED_EVENTS: FeedEvent[] = [
  {
    type: "command",
    text: "Command executed successfully",
    time: "4m ago",
  },
  {
    type: "telemetry",
    text: "Telemetry frame received",
    time: "6m ago",
  },
  {
    type: "dictionary",
    text: "Dictionary updated",
    time: "11m ago",
  },
  {
    type: "decoder",
    text: "Manual decode completed",
    time: "14m ago",
  },
  {
    type: "anomaly",
    text: "Battery warning detected",
    time: "18m ago",
  },
  {
    type: "link",
    text: "Ground station link established",
    time: "22m ago",
  },
];

const OPERATION_MODULES: OperationModule[] = [
  {
    title: "Command Center",
    description: "Transmit secured commands to active satellites.",
    status: "Secured",
    route: "/command-center",
    icon: Terminal,
  },
  {
    title: "Telemetry Monitor",
    description: "Monitor live decoded telemetry and satellite health.",
    status: "Live",
    route: "/telemetry",
    icon: Signal,
  },
  {
    title: "Command Responses",
    description: "Track command execution, ACK/NACK, and failures.",
    status: "Monitoring",
    route: "/command-responses",
    icon: MessageSquareText,
  },
  {
    title: "Telemetry Replies",
    description: "Inspect received satellite telemetry reply frames.",
    status: "Online",
    route: "/telemetry-replies",
    icon: Radio,
  },
  {
    title: "Dictionary Manager",
    description: "Manage command and telemetry definitions.",
    status: "Ready",
    route: "/dictionary",
    icon: BookOpen,
  },
  {
    title: "Manual Decoder",
    description: "Decode raw satellite frames manually.",
    status: "Ready",
    route: "/manual-decoder",
    icon: Code2,
  },
  {
    title: "Anomaly Detection",
    description: "Review warnings, alerts, and abnormal behavior.",
    status: "Monitoring",
    route: "/anomaly-detection",
    icon: AlertTriangle,
  },
  {
    title: "Mission Logs",
    description: "Browse system activity, command history, and operator events.",
    status: "Online",
    route: "/mission-logs",
    icon: FileText,
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
  const location = useLocation();
  const shouldAnimateEntry =
    Boolean((location.state as { bootComplete?: boolean } | null)?.bootComplete);

  return (
    <motion.div
      className="min-h-screen bg-[#0B1220] text-white"
      initial={shouldAnimateEntry ? { opacity: 0, scale: 0.985 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      <div className="px-8 py-10">
        <h1 className="text-2xl font-bold mb-2">
          Mission Overview Dashboard
        </h1>
        <p className="text-gray-400 mb-8">
          Real-time satellite fleet monitoring and control
        </p>

        {/* <DashboardStats stats={STAT_CARDS} /> */}

        <GroundStationVisibility
          stationName="Cairo Station"
          satellitesInZone={1}
        />

        <CurrentVisibilityCard data={CURRENT_VISIBILITY} />

        <div className="mt-14 grid gap-8 xl:grid-cols-[minmax(0,2fr)_390px]">
          <MissionControlOperations modules={OPERATION_MODULES} />
          <LiveActivityFeed events={FEED_EVENTS} />
        </div>

        <BottomSummary summary={SUMMARY_CARDS} />
      </div>
    </motion.div>
  );
}

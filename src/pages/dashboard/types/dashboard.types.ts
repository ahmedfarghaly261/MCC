import type { LucideIcon } from "lucide-react";

export type StatCardData = {
  title: string;
  value: number;
  valueColor: string;
  icon: LucideIcon;
  iconClassName: string;
};

export type TelemetryStatus = "operational" | "warning" | "critical";

export type TelemetryItem = {
  id: string;
  battery: number;
  temp: number;
  signal: number;
  status: TelemetryStatus;
};

export type FeedEventType = "command" | "alert" | "anomaly";

export type FeedEvent = {
  type: FeedEventType;
  text: string;
  time: string;
};

export type SummaryCardData = {
  title: string;
  value: string;
  valueClassName: string;
  icon: LucideIcon;
  iconClassName: string;
  borderClassName: string;
};

export type CurrentVisibility = {
  name: string;
  mission: string;
  code: string;
  remainingTime: string;
  remainingPercent: number;
  signalPercent: number;
  communicationStatus: string;
  communicationStatusClassName: string;
  batteryPercent: number;
  temperature: string;
  altitude: string;
  lastContact: string;
  actionLabel: string;
};

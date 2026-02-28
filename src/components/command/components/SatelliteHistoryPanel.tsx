import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";

type TelemetryItem = {
  time: string;
  label: string;
  value: string;
  status: "normal" | "warning";
};

type CommandItem = {
  time: string;
  command: string;
  status: "success" | "pending";
};

interface SatelliteHistoryPanelProps {
  satelliteName: string;
  telemetry: TelemetryItem[];
  commands: CommandItem[];
}

const StatusBadge = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "green" | "yellow" | "blue";
}) => {
  const styles = {
    green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    yellow: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  };

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

const RowContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-between bg-[#0b1220] px-4 py-3 rounded-lg border border-white/5 hover:border-white/10 transition">
    {children}
  </div>
);

const SatelliteHistoryPanel: React.FC<SatelliteHistoryPanelProps> = ({
  satelliteName,
  telemetry,
  commands,
}) => {
  return (
    <Card className="bg-card text-white p-6 rounded-2xl border border-white/10 shadow-xl w-full max-w-3xl">
      {/* Header */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold">
          History of Current Visible Satellite
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Viewing history for:
          <span className="text-blue-400 ml-1">{satelliteName}</span>
        </p>
      </Card>

      {/* Telemetry */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-3 text-gray-300">
          <FileText size={18} />
          <h3 className="text-sm font-medium">Recent Telemetry Logs</h3>
        </div>

        <div className="space-y-3">
          {telemetry.map((item, index) => (
            <RowContainer key={index}>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">{item.time}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm">{item.value}</span>
                <StatusBadge
                  variant={item.status === "normal" ? "green" : "yellow"}
                >
                  {item.status}
                </StatusBadge>
              </div>
            </RowContainer>
          ))}
        </div>
      </Card>

      {/* Commands */}
      <Card className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">
          Last Commands Sent
        </h3>

        <div className="space-y-3">
          {commands.map((cmd, index) => (
            <RowContainer key={index}>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">{cmd.time}</span>
                <span className="text-sm text-blue-400 font-medium">
                  {cmd.command}
                </span>
              </div>

              {cmd.status === "success" ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <AlertCircle size={18} className="text-yellow-400" />
              )}
            </RowContainer>
          ))}
        </div>
      </Card>

      {/* Faults */}
      <Card className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">
          Recent Faults
        </h3>

        <div className="bg-[#0b1220] border border-yellow-500/30 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">
                Minor power fluctuation detected
              </p>
              <span className="text-xs text-gray-500">09:15:33</span>
            </div>

            <StatusBadge variant="blue">Low</StatusBadge>
          </div>
        </div>
      </Card>

      {/* Last Image */}
      <Card>
        <div className="flex items-center gap-2 mb-3 text-gray-300">
          <ImageIcon size={18} />
          <h3 className="text-sm font-medium">Last Image Received</h3>
        </div>

        <div className="bg-[#0b1220] rounded-lg p-4 border border-white/5 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Timestamp</span>
            <span>10:25:18</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Resolution</span>
            <span>4096x4096</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">File Size</span>
            <span>12.5 MB</span>
          </div>
        </div>
      </Card>
    </Card>
  );
};

export default SatelliteHistoryPanel;
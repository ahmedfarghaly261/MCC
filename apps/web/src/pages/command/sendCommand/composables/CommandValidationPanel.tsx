import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { formatAsHex } from "../Utils/commandCatalog.util";
import type { CommandCatalogItem } from "../types/commandCatalog.types";

export type ValidationState = "idle" | "valid" | "invalid" | "loading";

interface CommandValidationPanelProps {
  validationState: ValidationState;
  satellite: string;
  command?: CommandCatalogItem | null;
  priority: "low" | "normal" | "high";
  message?: string;
}

const StatusIcon = ({ state }: { state: ValidationState }) => {
  switch (state) {
    case "valid":
      return <CheckCircle2 size={48} className="text-emerald-400" />;
    case "invalid":
      return <AlertCircle size={48} className="text-red-400" />;
    case "loading":
      return (
        <Loader2
          size={48}
          className="text-blue-400 animate-spin"
        />
      );
    default:
      return (
        <AlertCircle
          size={48}
          className="text-gray-500 opacity-70"
        />
      );
  }
};

const PriorityBadge = ({
  priority,
}: {
  priority: "low" | "normal" | "high";
}) => {
  const styles = {
    low: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    normal:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    high: "bg-red-500/10 text-red-400 border border-red-500/30",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[priority]}`}
    >
      {priority}
    </span>
  );
};

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-card rounded-2xl border border-white/10 p-6 shadow-lg">
    {children}
  </div>
);

const CommandValidationPanel: React.FC<
  CommandValidationPanelProps
> = ({
  validationState,
  satellite,
  command,
  priority,
  message,
}) => {
  const subsystems =
    command?.subsystems
      ?.map((subsystem) => `${subsystem.name} (${subsystem.hex_code})`)
      .join(", ") || "-";
  const destinations =
    command?.allowed_destinations?.length
      ? command.allowed_destinations.join(", ")
      : "-";
  const requiredFields =
    command?.required_data_fields?.length
      ? command.required_data_fields
          .filter((field) => field !== null && field !== undefined)
          .join(", ")
      : "None";

  const getMessage = () => {
    if (message) {
      return message;
    }

    switch (validationState) {
      case "valid":
        return "Command dispatched successfully";
      case "invalid":
        return "Command dispatch failed";
      case "loading":
        return "Sending command...";
      default:
        return "Fill in command details and send command";
    }
  };

  return (
    <div className="space-y-6 w-full text-white">
      <Card>
        <h2 className="text-lg font-semibold mb-6">
          Validation Status
        </h2>

        <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
          <StatusIcon state={validationState} />
          <p className="text-gray-400 text-sm">
            {getMessage()}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-6">
          Command Summary
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Satellite:</span>
            <span className="text-blue-400 font-medium">
              {satellite}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Command ID:</span>
            <span className="font-mono text-cyan-300">
              {command ? formatAsHex(command.cmd_id) : "-"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Command:</span>
            <span className="text-right font-medium">
              {command?.name || "-"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Catalog ID:</span>
            <span>{command?.id ?? "-"}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Subsystems:</span>
            <span className="text-right">{subsystems}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Destinations:</span>
            <span className="text-right">{destinations}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Required Data:</span>
            <span className="text-right">{requiredFields}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Priority:</span>
            <PriorityBadge priority={priority} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommandValidationPanel;

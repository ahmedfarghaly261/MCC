import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type ValidationState = "idle" | "valid" | "invalid" | "loading";

interface CommandValidationPanelProps {
  validationState: ValidationState;
  satellite: string;
  type?: string;
  command?: string;
  priority: "low" | "normal" | "high";
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
  <div className="bg-[#1a2332] rounded-2xl border border-white/10 p-6 shadow-lg">
    {children}
  </div>
);

const CommandValidationPanel: React.FC<
  CommandValidationPanelProps
> = ({
  validationState,
  satellite,
  type,
  command,
  priority,
}) => {
  const getMessage = () => {
    switch (validationState) {
      case "valid":
        return "Command validated successfully";
      case "invalid":
        return "Command validation failed";
      case "loading":
        return "Validating command...";
      default:
        return "Fill in command details and click validate";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl text-white py-9">
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
            <span className="text-gray-400">Type:</span>
            <span>{type || "-"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Command:</span>
            <span>{command || "-"}</span>
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
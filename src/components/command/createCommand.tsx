import { FileText } from "lucide-react";
import SatelliteHistoryPanel from "./components/SatelliteHistoryPanel";
import CommandForm from "./components/commandForm";
import CommandValidationPanel from "./components/CommandValidationPanel";

export default function CreateCommand() {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="px-8 py-10">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create Command</h1>
            <p className="text-gray-400 text-sm">
              Create and validate commands before sending to satellites
            </p>
          </div>
        </div>
        {/* Form + Validation side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-8 items-start">
          <CommandForm />
          <CommandValidationPanel
            validationState="valid"
            satellite="EGSA Satellite-06"
            type="Telemetry"
            command="TELEMETRY_COLLECT"
            priority="high"
          />
        </div>

        <br />
        <SatelliteHistoryPanel
          satelliteName="EGSA Satellite-02"
          telemetry={[
            {
              time: "10:45:23",
              label: "Battery",
              value: "78%",
              status: "normal",
            },
            {
              time: "10:45:18",
              label: "Temperature",
              value: "23°C",
              status: "normal",
            },
            {
              time: "10:45:15",
              label: "Signal",
              value: "92%",
              status: "normal",
            },
          ]}
          commands={[
            {
              time: "10:40:12",
              command: "TELEMETRY_COLLECT",
              status: "success",
            },
            {
              time: "10:35:45",
              command: "BATTERY_OPTIMIZE",
              status: "success",
            },
            { time: "10:30:22", command: "IMAGE_CAPTURE", status: "pending" },
          ]}
        />
      </div>
    </div>
  );
}

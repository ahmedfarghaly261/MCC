import { useState } from "react";
import { FileText } from "lucide-react";
import CommandForm from "./composables/commandForm";
import CommandValidationPanel from "./composables/CommandValidationPanel";
import LastCommandRow from "./composables/lastCommandRow";

import type {
  CommandLog,
} from "./services/commandLogService";

export default function CreateCommand() {
  const [lastCommand, setLastCommand] =
    useState<CommandLog | null>(null);

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="px-8 py-10">

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Create Command
            </h1>

            <p className="text-gray-400 text-sm">
              Create and validate commands before sending to satellites
            </p>
          </div>
        </div>

        {/* Form + Validation */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-8 items-start">
          <CommandForm
            onCommandSent={setLastCommand}
          />

          <CommandValidationPanel
            validationState="valid"
            satellite="EGSA Satellite-02"
            type="Telemetry"
            command="TELEMETRY_COLLECT"
            priority="normal"
          />
        </div>

        {/* Last Sent Command */}
        {lastCommand && (
          <>
            <h2 className="text-lg font-semibold mt-10 mb-4">
              Last Sent Command
            </h2>

            <LastCommandRow

              record={lastCommand}
            />
          </>
        )}

      </div>
    </div>
  );
}
import { useCallback, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import CommandForm from "./composables/commandForm";
import CommandValidationPanel, {
  type ValidationState,
} from "./composables/CommandValidationPanel";
import LastCommandRow from "./composables/lastCommandRow";
import { useSatelliteVisibilityCycle } from "@/pages/dashboard/composables/CurrentVisibilityCard";

import type {
  CommandLog,
} from "./services/commandLogService";
import type { SatelliteData } from "./composables/satCard";
import type { CommandCatalogItem } from "./types/commandCatalog.types";

export default function CreateCommand() {
  const [lastCommand, setLastCommand] =
    useState<CommandLog | null>(null);
  const [validationState, setValidationState] =
    useState<ValidationState>("idle");
  const [validationMessage, setValidationMessage] =
    useState<string | undefined>();
  const [selectedCommand, setSelectedCommand] =
    useState<CommandCatalogItem | null>(null);
  const currentVisibility = useSatelliteVisibilityCycle();

  const linkedSatellite = useMemo<SatelliteData>(
    () => ({
      name: currentVisibility.activeSatellite.name,
      code: currentVisibility.activeSatellite.code,
      visibilityStatus: currentVisibility.isInZone
        ? "IN VISIBILITY ZONE"
        : "OUT OF RANGE",
      visibilityRemaining: currentVisibility.pass.remainingTime,
      communicationStatus: currentVisibility.isInZone ? "active" : "inactive",
    }),
    [currentVisibility],
  );

  const handleCommandSelectionChange = useCallback(
    (command: CommandCatalogItem | null) => {
      setSelectedCommand((currentCommand) => {
        if (command && command.id !== currentCommand?.id) {
          setValidationState("idle");
          setValidationMessage(undefined);
        }

        return command;
      });
    },
    [],
  );

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
            satellite={linkedSatellite}
            onCommandSendStart={() => {
              setValidationState("loading");
              setValidationMessage("Sending command to MCC backend...");
            }}
            onCommandSent={(log) => {
              setLastCommand(log);
              setValidationState("valid");
              setValidationMessage("Command dispatched successfully.");
            }}
            onCommandSendError={(message) => {
              setValidationState("invalid");
              setValidationMessage(message);
            }}
            onCommandSelectionChange={handleCommandSelectionChange}
          />

          <CommandValidationPanel
            validationState={validationState}
            satellite={linkedSatellite.name}
            command={selectedCommand}
            priority="normal"
            message={validationMessage}
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

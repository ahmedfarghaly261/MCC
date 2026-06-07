import { useCallback, useState } from "react";
import { CalendarClock } from "lucide-react";

import AtcCommandForm from "./composables/Atccommandform";
import AtcSummaryCard from "./composables/Atcsummarycard";
import AtcSuccessCard from "./composables/Atcsuccesscard";

import type { AtcCommandResponse } from "./types/Atccommand.types";
import type { AtcCommandSchema } from "./utils/Atccommand.schema";

export default function AtcCommandView() {
  const [result, setResult] =
    useState<AtcCommandResponse | null>(null);

  const [formValues, setFormValues] =
    useState<Partial<AtcCommandSchema>>({});

  const [commandName, setCommandName] =
    useState<string | undefined>(undefined);

  const [destLabel, setDestLabel] =
    useState<string | undefined>(undefined);

  const handleSuccess = (response: AtcCommandResponse) => {
    setResult(response);
  };

  const handleFormChange = useCallback(
    (
      values: Partial<AtcCommandSchema>,
      cmdName?: string,
      dstLabel?: string,
    ) => {
      setFormValues(values);
      setCommandName(cmdName);
      setDestLabel(dstLabel);
    },
    [],
  );

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="px-8 py-10">

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
            <CalendarClock className="h-5 w-5 text-amber-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Schedule ATC
            </h1>
            <p className="text-sm text-gray-400">
              Stage a standalone Absolute Time Command for future satellite execution
            </p>
          </div>
        </div>

        {/* Form + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
          <div className="space-y-6">
            <AtcCommandForm
              onSuccess={handleSuccess}
              onFormChange={handleFormChange}
            />

            {/* Success card rendered below the form */}
            <AtcSuccessCard result={result} />
          </div>

          <AtcSummaryCard
            values={formValues}
            commandName={commandName}
            destLabel={destLabel}
          />
        </div>

      </div>
    </div>
  );
}
import { useState } from "react";
import { CalendarClock } from "lucide-react";

import type {
  HTNGoal,
} from "./types/scheduledCommands.types";

import ScheduledGoalForm from "./composables/ScheduledGoalForm";
import PlanningSummaryCard from "./composables/PlanningSummaryCard";

export default function ScheduledCommandsView() {
  const [selectedGoal, setSelectedGoal] =
    useState<HTNGoal | null>(null);

  const [executeAt, setExecuteAt] =
    useState("");

  const [parameterCount, setParameterCount] =
    useState(0);

  return (
    <div className="min-h-screen bg-background text-white">

      <div className="px-8 py-10">

        <div className="flex items-center gap-4 mb-8">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
            <CalendarClock className="h-5 w-5 text-purple-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Scheduled Macro Goals
            </h1>

            <p className="text-sm text-gray-400">
              Create and schedule
              high-level mission goals
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">

          <ScheduledGoalForm
            onGoalChange={
              setSelectedGoal
            }
            onExecutionChange={(
              date,
              count,
            ) => {
              setExecuteAt(date);
              setParameterCount(
                count,
              );
            }}
          />

          <PlanningSummaryCard
            selectedGoal={
              selectedGoal
            }
            executeAt={
              executeAt
            }
            parameterCount={
              parameterCount
            }
          />

        </div>

      </div>

    </div>
  );
}
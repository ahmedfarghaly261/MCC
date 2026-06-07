import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle } from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  HTNGoal,
  MacroGoalResponse,
  GoalParameter,
} from "../types/scheduledCommands.types";

import { getHTNGoals } from "../services/htnGoals.service";
import { createMacroGoal } from "../services/macroGoal.service";

import GoalSelectorCard from "./GoalSelectorCard";
import ScheduledGoalSuccessCard from "./ScheduledGoalSuccessCard";

interface Props {
  onGoalChange: (goal: HTNGoal | null) => void;
  onExecutionChange: (
    executeAt: string,
    parameterCount: number,
  ) => void;
}

export default function ScheduledGoalForm({
  onGoalChange,
  onExecutionChange,
}: Props) {
  const [goals, setGoals] = useState<HTNGoal[]>([]);
  const [loadingGoals, setLoadingGoals] =
    useState(true);

  const [selectedGoalId, setSelectedGoalId] =
    useState("");

  const [executeAt, setExecuteAt] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [result, setResult] =
    useState<MacroGoalResponse | null>(null);

  const [parameterValues, setParameterValues] =
    useState<Record<string, string>>({});

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoadingGoals(true);

        const response =
          await getHTNGoals();

        setGoals(response);
      } catch (error) {
        console.error(error);

        toast.error(
          "Failed to load HTN goals",
        );
      } finally {
        setLoadingGoals(false);
      }
    };

    void loadGoals();
  }, []);

  const selectedGoal = useMemo(
    () =>
      goals.find(
        (goal) =>
          goal.id === selectedGoalId,
      ) ?? null,
    [goals, selectedGoalId],
  );

  useEffect(() => {
    if (!selectedGoal) {
      setParameterValues({});
      return;
    }

    if (
      Array.isArray(
        selectedGoal.parameters,
      )
    ) {
      setParameterValues({});
      return;
    }

    const defaults: Record<
      string,
      string
    > = {};

    Object.entries(
      selectedGoal.parameters,
    ).forEach(
      ([key, rawConfig]) => {
        const config =
          rawConfig as GoalParameter;

        defaults[key] =
          config.default !== undefined
            ? String(config.default)
            : "";
      },
    );

    setParameterValues(defaults);
  }, [selectedGoal]);

  useEffect(() => {
    onGoalChange(selectedGoal);

    onExecutionChange(
      executeAt,
      Object.keys(
        parameterValues,
      ).length,
    );
  }, [
    selectedGoal,
    executeAt,
    parameterValues,
    onGoalChange,
    onExecutionChange,
  ]);

  async function handleSchedule() {
    if (!selectedGoal) {
      toast.error(
        "Please select a goal",
      );
      return;
    }

    if (!executeAt) {
      toast.error(
        "Please select execution time",
      );
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await createMacroGoal({
          goal_name:
            selectedGoal.id,
          execute_at:
            new Date(
              executeAt,
            ).toISOString(),
          parameters:
            parameterValues as unknown as string[],
        });

      setResult(response);

      toast.success(
        response.message ||
          "Goal scheduled successfully",
      );

      if (
        !Array.isArray(
          selectedGoal.parameters,
        )
      ) {
        const defaults: Record<
          string,
          string
        > = {};

        Object.entries(
          selectedGoal.parameters,
        ).forEach(
          ([key, rawConfig]) => {
            const config =
              rawConfig as GoalParameter;

            defaults[key] =
              config.default !==
              undefined
                ? String(
                    config.default,
                  )
                : "";
          },
        );

        setParameterValues(
          defaults,
        );
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(
          "Macro goal API error",
          error.response?.data,
        );
      }

      toast.error(
        "Failed to schedule goal",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-slate-700">
        <CardHeader>
          <CardTitle>
            Mission Goal
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Select Goal
            </label>

            <Select
              value={
                selectedGoalId
              }
              onValueChange={
                setSelectedGoalId
              }
              disabled={
                loadingGoals
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingGoals
                      ? "Loading goals..."
                      : "Select goal"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {goals.map(
                  (goal) => (
                    <SelectItem
                      key={goal.id}
                      value={
                        goal.id
                      }
                    >
                      {goal.name}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <GoalSelectorCard
            goal={
              selectedGoal
            }
          />
        </CardContent>
      </Card>

      <Card className="bg-card border-slate-700">
        <CardHeader>
          <CardTitle>
            Execution Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Execute At
            </label>

            <Input
              type="datetime-local"
              value={
                executeAt
              }
              onChange={(
                event,
              ) =>
                setExecuteAt(
                  event.target
                    .value,
                )
              }
            />
          </div>

          {selectedGoal &&
            !Array.isArray(
              selectedGoal.parameters,
            ) &&
            Object.keys(
              selectedGoal.parameters,
            ).length > 0 && (
              <div>
                <label className="text-sm text-gray-300 mb-3 block">
                  Parameters
                </label>

                <div className="space-y-4">
                  {Object.entries(
                    selectedGoal.parameters,
                  ).map(
                    ([
                      key,
                      rawConfig,
                    ]) => {
                      const config =
                        rawConfig as GoalParameter;

                      return (
                        <div
                          key={
                            key
                          }
                        >
                          <label className="text-sm text-gray-300 mb-2 block">
                            {key}

                            {config.required && (
                              <span className="text-red-400 ml-1">
                                *
                              </span>
                            )}
                          </label>

                          <Input
                            value={
                              parameterValues[
                                key
                              ] ??
                              ""
                            }
                            onChange={(
                              event,
                            ) =>
                              setParameterValues(
                                (
                                  prev,
                                ) => ({
                                  ...prev,
                                  [key]:
                                    event
                                      .target
                                      .value,
                                }),
                              )
                            }
                            placeholder={
                              config.default !==
                              undefined
                                ? String(
                                    config.default,
                                  )
                                : config.type
                            }
                          />
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}
        </CardContent>

        <CardFooter className="gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Validate Plan
          </Button>

          <Button
            type="button"
            disabled={
              submitting
            }
            onClick={
              handleSchedule
            }
            className="flex-1 border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
          >
            <CalendarClock className="mr-2 h-4 w-4" />

            {submitting
              ? "Scheduling..."
              : "Schedule Goal"}
          </Button>
        </CardFooter>
      </Card>

      <ScheduledGoalSuccessCard
        result={result}
      />
    </div>
  );
}

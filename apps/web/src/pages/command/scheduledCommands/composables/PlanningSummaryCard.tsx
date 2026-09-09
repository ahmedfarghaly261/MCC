import type {
  HTNGoal,
} from "../types/scheduledCommands.types";

interface Props {
  selectedGoal: HTNGoal | null;
  executeAt: string;
  parameterCount: number;
}

export default function PlanningSummaryCard({
  selectedGoal,
  executeAt,
  parameterCount,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-700 bg-card p-5">

      <h3 className="text-white font-semibold mb-5">
        Mission Planning
      </h3>

      <div className="space-y-4 text-sm">

        <div>
          <p className="text-gray-400">
            Goal
          </p>

          <p className="text-white">
            {selectedGoal?.name ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-gray-400">
            Execute At
          </p>

          <p className="text-white">
            {executeAt || "-"}
          </p>
        </div>

        <div>
          <p className="text-gray-400">
            Parameters
          </p>

          <p className="text-cyan-400">
            {parameterCount}
          </p>
        </div>

        <div>
          <p className="text-gray-400">
            Planner
          </p>

          <p className="text-purple-400">
            HTN Engine
          </p>
        </div>

      </div>
    </div>
  );
}
import type { HTNGoal } from "../types/scheduledCommands.types";

interface Props {
  goal: HTNGoal | null;
}

export default function GoalSelectorCard({
  goal,
}: Props) {
  if (!goal) {
    return (
      <div className="rounded-xl border border-slate-700 bg-[#0B1220] p-4">
        <p className="text-sm text-gray-400">
          Select a goal to view its details.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-[#0B1220] p-5">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Goal Name
          </p>

          <p className="text-white font-medium">
            {goal.name}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Description
          </p>

          <p className="text-sm text-gray-300">
            {goal.description || "No description provided"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Parameters Schema
          </p>

         <div>
  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
    Parameters
  </p>

  {Array.isArray(goal.parameters) ||
  Object.keys(goal.parameters).length === 0 ? (
    <p className="text-sm text-gray-400">
      No parameters required
    </p>
  ) : (
    <div className="space-y-2">
      {Object.entries(goal.parameters).map(
        ([name, config]) => (
          <div
            key={name}
            className="rounded-lg border border-slate-700 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-cyan-400">
                {name}
              </span>

              <span className="text-xs text-gray-400">
                {config.type}
              </span>
            </div>

            <div className="mt-1 text-xs text-gray-400">
              Required:{" "}
              {config.required ? "Yes" : "No"}
            </div>

            {"default" in config && (
              <div className="text-xs text-gray-400">
                Default: {String(config.default)}
              </div>
            )}
          </div>
        ),
      )}
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
}
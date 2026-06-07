import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Badge,
} from "@/components/ui/badge";

import type {
  MacroGoalResponse,
} from "../types/scheduledCommands.types";

interface Props {
  result: MacroGoalResponse | null;
}

export default function ScheduledGoalSuccessCard({
  result,
}: Props) {
  if (!result) {
    return null;
  }

  return (
    <Card className="bg-card border-green-500/30">
      <CardContent className="p-5">

        <h3 className="text-green-400 font-semibold mb-4">
          Goal Scheduled Successfully
        </h3>

        <div className="space-y-4">

          <div>
            <p className="text-xs text-gray-400 mb-1">
              Batch UUID
            </p>

            <code className="text-cyan-400 break-all">
              {result.batch_uuid}
            </code>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">
              Scheduled Commands
            </p>

            <div className="flex flex-wrap gap-2">
              {result.scheduled_ids.map((id) => (
                <Badge
                  key={id}
                  variant="outline"
                >
                  #{id}
                </Badge>
              ))}
            </div>
          </div>

        </div>

      </CardContent>
    </Card>
  );
}
import type { LucideIcon } from "lucide-react";
import { Activity, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type {
  FeedEvent,
  FeedEventType,
} from "../types/dashboard.types";

const EVENT_CONFIG: Record<
  FeedEventType,
  { Icon: LucideIcon; iconClassName: string }
> = {
  command: { Icon: Activity, iconClassName: "text-blue-400" },
  alert: { Icon: AlertTriangle, iconClassName: "text-yellow-400" },
  anomaly: { Icon: AlertTriangle, iconClassName: "text-red-500" },
};

type LiveActivityFeedProps = {
  events: FeedEvent[];
};

export default function LiveActivityFeed({
  events,
}: LiveActivityFeedProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Live Activity Feed</h2>

      <Card className="bg-[#1A2333] border border-gray-700 rounded-xl">
        <CardContent className="p-4 h-150 overflow-y-auto space-y-4">
          {events.map((event, index) => {
            const { Icon, iconClassName } = EVENT_CONFIG[event.type];

            return (
              <div
                key={`${event.type}-${index}`}
                className="bg-[#0B1220] p-4 rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${iconClassName}`} />
                  <span className="text-xs text-gray-400 uppercase">
                    {event.type}
                  </span>
                </div>

                <p className="text-sm">{event.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {event.time}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

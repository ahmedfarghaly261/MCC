import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Radio,
  RadioTower,
  ScanLine,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type {
  FeedEvent,
  FeedEventType,
} from "../types/dashboard.types";

const EVENT_CONFIG: Record<
  FeedEventType,
  { Icon: LucideIcon; iconClassName: string }
> = {
  command: { Icon: CheckCircle2, iconClassName: "text-emerald-300" },
  telemetry: { Icon: Radio, iconClassName: "text-cyan-300" },
  dictionary: { Icon: BookOpen, iconClassName: "text-blue-300" },
  decoder: { Icon: ScanLine, iconClassName: "text-violet-300" },
  alert: { Icon: AlertTriangle, iconClassName: "text-yellow-400" },
  link: { Icon: RadioTower, iconClassName: "text-cyan-300" },
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
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
          System Stream
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Live Activity Feed
        </h2>
      </div>

      <Card className="rounded-xl border border-cyan-300/12 bg-slate-950/55 shadow-[0_18px_44px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur">
        <CardContent className="max-h-[640px] space-y-3 overflow-y-auto p-4">
          {events.map((event, index) => {
            const { Icon, iconClassName } = EVENT_CONFIG[event.type];

            return (
              <motion.div
                key={`${event.type}-${index}`}
                className="rounded-lg border border-slate-800/80 bg-[#07111f]/85 p-4"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: index * 0.05 }}
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
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

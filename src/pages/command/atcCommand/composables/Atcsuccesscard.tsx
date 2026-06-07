import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AtcCommandResponse } from "../types/Atccommand.types";

interface Props {
  result: AtcCommandResponse | null;
}

export default function AtcSuccessCard({ result }: Props) {
  if (!result) return null;

  return (
    <Card className="border-emerald-500/30 bg-card">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <h3 className="font-semibold text-emerald-400">
            ATC Scheduled Successfully
          </h3>
        </div>

        <p className="text-sm text-gray-300">{result.message}</p>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Schedule ID</span>
          <Badge
            variant="outline"
            className="border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-mono"
          >
            #{result.schedule_id}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
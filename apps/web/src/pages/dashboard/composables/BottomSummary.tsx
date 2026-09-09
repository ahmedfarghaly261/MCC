import { Card, CardContent } from "@/components/ui/card";
import type { SummaryCardData } from "../types/dashboard.types";

type BottomSummaryProps = {
  summary: SummaryCardData[];
};

export default function BottomSummary({ summary }: BottomSummaryProps) {
  return (
    <div className="mt-10 grid md:grid-cols-3 gap-6">
      {summary.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.title}
            className={`bg-[#1A2333] ${item.borderClassName}`}
          >
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">{item.title}</p>
                <p className={item.valueClassName}>{item.value}</p>
              </div>
              <Icon className={item.iconClassName} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

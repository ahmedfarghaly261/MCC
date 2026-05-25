import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  iconClassName: string;
  valueColor: string;
};

const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  valueColor,
}: StatCardProps) {
  return (
    <Card className="bg-[#1A2333] border border-gray-700 rounded-lg hover:border-blue-500 transition-all duration-300">
      <CardContent className="p-3 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400 mb-2">{title}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
        <Icon className={`w-6 h-6 ${iconClassName}`} />
      </CardContent>
    </Card>
  );
});

export default StatCard;

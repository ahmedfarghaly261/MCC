import StatCard from "./StatCard";
import type { StatCardData } from "../types/dashboard.types";

type DashboardStatsProps = {
  stats: StatCardData[];
};

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          valueColor={stat.valueColor}
          icon={stat.icon}
          iconClassName={stat.iconClassName}
        />
      ))}
    </div>
  );
}

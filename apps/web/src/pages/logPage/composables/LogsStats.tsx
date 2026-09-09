
type Severity = "info" | "warning" | "critical"

export interface Log {
  id: number
  timestamp: string
  type: string
  satellite: string
  user: string
  action: string
  severity: Severity
  details: string
}

interface LogsStatsProps {
  logs: Log[]
}

export default function LogsStats({ logs }: LogsStatsProps) {
  const total = logs.length
  const info = logs.filter((log) => log.severity === "info").length
  const warnings = logs.filter((log) => log.severity === "warning").length
  const critical = logs.filter((log) => log.severity === "critical").length

  // If you later add "error" severity:
  const errors = logs.filter(
    (log) => log.severity === "error" as any
  ).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 ">
      {/* Total */}
      <StatCard title="Total Logs" value={total} color="text-blue-400" />

      {/* Info */}
      <StatCard
        title="Info"
        value={info}
        color="text-blue-400"
        border="border-blue-500/30"
      />

      {/* Warnings */}
      <StatCard
        title="Warnings"
        value={warnings}
        color="text-yellow-400"
        border="border-yellow-500/30"
      />

      {/* Errors */}
      <StatCard
        title="Errors"
        value={errors}
        color="text-orange-400"
        border="border-orange-500/30"
      />

      {/* Critical */}
      <StatCard
        title="Critical"
        value={critical}
        color="text-red-400"
        border="border-red-500/30"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  color: string
  border?: string
}

function StatCard({ title, value, color, border }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border ${
        border ?? "border-slate-800"
      } bg-card p-5`}
    >
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-2xl font-semibold mt-2 ${color}`}>{value}</p>
    </div>
  )
}
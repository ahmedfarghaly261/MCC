import { Search, Download, Calendar } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LogsStats from "./LogsStats"

type LogType = "command" | "fault" | "telemetry" | "user" | "system"
type Severity = "info" | "warning" | "critical"

interface Log {
  id: number
  timestamp: string
  type: LogType
  satellite: string
  user: string
  action: string
  severity: Severity
  details: string
}

const logs: Log[] = [
  {
    id: 1,
    timestamp: "Feb 28, 04:42:08 PM",
    type: "command",
    satellite: "EGSA-SAT-01",
    user: "Mission Control",
    action: "BATTERY_OPTIMIZE executed",
    severity: "info",
    details: "Command completed successfully",
  },
  {
    id: 2,
    timestamp: "Feb 28, 04:39:08 PM",
    type: "fault",
    satellite: "EGSA-SAT-02",
    user: "System",
    action: "Temperature threshold exceeded",
    severity: "warning",
    details: "Temperature reached 31°C",
  },
  {
    id: 3,
    timestamp: "Feb 28, 04:29:08 PM",
    type: "telemetry",
    satellite: "EGSA-SAT-05",
    user: "System",
    action: "Battery level critical",
    severity: "critical",
    details: "Battery at 18%",
  },
  {
    id: 4,
    timestamp: "Feb 28, 04:14:08 PM",
    type: "user",
    satellite: "N/A",
    user: "Admin",
    action: "User logged in",
    severity: "info",
    details: "Login from IP 192.168.1.100",
  },
  {
    id: 5,
    timestamp: "Feb 28, 03:59:08 PM",
    type: "system",
    satellite: "All",
    user: "System",
    action: "Daily health check completed",
    severity: "info",
    details: "All systems operational",
  },
]

const typeStyles: Record<LogType, string> = {
  command: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  fault: "bg-red-500/10 text-red-400 border-red-500/20",
  telemetry: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  user: "bg-green-500/10 text-green-400 border-green-500/20",
  system: "bg-gray-500/10 text-gray-400 border-gray-500/20",
}

const severityStyles: Record<Severity, string> = {
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function LogsTable() {
  return (
    <div className="p-6 bg-background min-h-screen text-white">
        <LogsStats logs={logs} />
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-9 bg-card border-slate-800"
          />
        </div>

        <div className="flex gap-3 flex-wrap w-[110%]">
          <Select>
            <SelectTrigger className="w-[150px] bg-card border-slate-800">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="command">Command</SelectItem>
              <SelectItem value="fault">Fault</SelectItem>
              <SelectItem value="telemetry">Telemetry</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[150px] bg-card border-slate-800">
              <SelectValue placeholder="All Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="bg-card border-slate-800 text-muted-foreground"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>

          <Button className="bg-card hover:bg-slate-700">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead>Timestamp</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Satellite</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow
                key={log.id}
                className="border-slate-800 transition hover:bg-background"
              >
                <TableCell className="text-muted-foreground">
                  {log.timestamp}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={typeStyles[log.type]}
                  >
                    {log.type}
                  </Badge>
                </TableCell>

                <TableCell>{log.satellite}</TableCell>

                <TableCell className="text-muted-foreground">
                  {log.user}
                </TableCell>

                <TableCell>{log.action}</TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={severityStyles[log.severity]}
                  >
                    {log.severity}
                  </Badge>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {log.details}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
import { Fragment, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDateTime,
  getStatusColor,
} from "../Utils/commandHistory.util";
import type { CommandHistoryRecord } from "../types/commandHistory.types";

interface CommandHistoryTableProps {
  records: CommandHistoryRecord[];
  loading: boolean;
}

function getCommandName(
  record: CommandHistoryRecord
): string {
  return (
    record.command_definition?.name ??
    `CMD-${record.command_id}`
  );
}

/**
 * FINAL:
 * show status exactly as backend sends it
 */
function formatStatusLabel(
  status: CommandHistoryRecord["status"]
): string {
  return status.toUpperCase();
}
function isTelemetryStatus(status: string) {
  return [
    "telemetry_received",
    "telemetry_decoded",
  ].includes(status);
}

function formatResponseTime(
  value: number | null
): string {
  return value
    ? `${value} ms`
    : "N/A";
}

function formatAck(
  value?: number
): string {
  return value === 1
    ? "Yes"
    : "No";
}

export default function CommandHistoryTable({
  records,
  loading,
}: CommandHistoryTableProps) {
  const navigate =
    useNavigate();

  const [
    expandedById,
    setExpandedById,
  ] = useState<
    Record<number, boolean>
  >({});

  const toggleRow = (
    id: number
  ) => {
    setExpandedById(
      (prev) => ({
        ...prev,
        [id]: !prev[id],
      })
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-linear-to-b from-[#0A1426] to-[#070E1B] shadow-lg">
      <Table>
        <TableHeader className="bg-card backdrop-blur-sm">
          <TableRow className="border-slate-700/70 hover:bg-transparent">
            <TableHead className="w-12 px-4" />

            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Name
            </TableHead>

            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Status
            </TableHead>

            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Sent At
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow className="border-slate-800/70">
              <TableCell
                className="px-4 py-10 text-center text-muted-foreground"
                colSpan={4}
              >
                Loading command history...
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            records.length === 0 && (
              <TableRow className="border-slate-800/70">
                <TableCell
                  className="px-4 py-10 text-center text-muted-foreground"
                  colSpan={4}
                >
                  No command history found.
                </TableCell>
              </TableRow>
            )}

          {!loading &&
            records.map(
              (record) => {
                const isExpanded =
                  expandedById[
                    record.id
                  ] ?? false;

                return (
                  <Fragment
                    key={
                      record.id
                    }
                  >
                    <TableRow
                      className={`group border-slate-800/70 transition-colors duration-200 cursor-pointer hover:bg-slate-900/60 focus-visible:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                        isExpanded
                          ? "bg-slate-900/50"
                          : ""
                      }`}
                      onClick={() =>
                        toggleRow(
                          record.id
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                            "Enter" ||
                          event.key ===
                            " "
                        ) {
                          event.preventDefault();
                          toggleRow(
                            record.id
                          );
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={
                        isExpanded
                      }
                    >
                      <TableCell className="px-4 py-3">
                        <span className="inline-flex items-center justify-center rounded-md border border-slate-700/70 bg-slate-900/70 p-1.5 text-slate-300 transition-colors group-hover:bg-slate-800">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-purple-500/40 bg-purple-500/10 px-2.5 text-[11px] text-purple-300"
                          >
                            #{record.id}
                          </Badge>

                          <span className="font-medium text-slate-100">
                            {getCommandName(
                              record
                            )}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getStatusColor(
                              record.status
                            )}
                          >
                            {formatStatusLabel(
                              record.status
                            )}
                          </Badge>

                         {isTelemetryStatus(record.status) && (
  <Button
    size="sm"
    variant="secondary"
    className="h-7 px-2 text-xs"
    onClick={(event) => {
      event.stopPropagation();
      navigate(`/telemetry-replies/${record.id}`);
    }}
  >
    View Telemetry
  </Button>
)}
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-slate-300">
                        {formatDateTime(
                          record.sent_at
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="border-slate-800/70 bg-[#050C18]/80">
                        <TableCell
                          colSpan={4}
                          className="px-5 py-5 md:px-6 md:py-6"
                        >
                          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">

                            {/* LEFT */}
                            <div className="space-y-4">

                              <div className="rounded-xl border border-slate-700/70 bg-[#040B18] p-5">
                                <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">
                                  Command Execution
                                </p>

                                <div className="space-y-3 text-sm">

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      Record ID
                                    </span>
                                    <span className="text-green-400">
                                      #{record.id}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      Command ID
                                    </span>
                                    <span className="text-green-400">
                                      {record.command_id}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      Source Address
                                    </span>
                                    <span className="text-green-400">
                                      {record.src_address}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      Dest Address
                                    </span>
                                    <span className="text-green-400">
                                      {record.dest_address}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      Status
                                    </span>

                                    <Badge
                                      variant="outline"
                                      className={getStatusColor(
                                        record.status
                                      )}
                                    >
                                      {formatStatusLabel(
                                        record.status
                                      )}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      Response Time
                                    </span>
                                    <span className="text-green-400">
                                      {formatResponseTime(
                                        record.response_time_ms
                                      )}
                                    </span>
                                  </div>

                                </div>
                              </div>

                              <div className="rounded-xl border border-slate-700/70 bg-[#040B18] p-5">
                                <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">
                                  Raw Binary
                                </p>

                                <p className="font-mono text-sm text-green-400 break-all">
                                  {record.raw_binary_sent || "N/A"}
                                </p>
                              </div>

                            </div>

                            {/* RIGHT */}
                            <div className="space-y-4">

                              <div className="rounded-xl border border-slate-700/70 bg-[#040B18] p-5">
                                <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">
                                  Command Definition
                                </p>

                                <div className="space-y-3 text-sm">

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      Name
                                    </span>
                                    <span className="text-green-400">
                                      {getCommandName(record)}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      CMD ID
                                    </span>
                                    <span className="text-green-400">
                                      {record.command_definition?.cmd_id ??
                                        record.command_id}
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-cyan-300">
                                      Description
                                    </span>

                                    <p className="text-white/90">
                                      {record.command_definition?.description ??
                                        "N/A"}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      Requires ACK
                                    </span>

                                    <Badge
                                      variant="outline"
                                      className="border-slate-700 text-slate-300 bg-slate-800/60"
                                    >
                                      {formatAck(
                                        record.command_definition?.requires_ack
                                      )}
                                    </Badge>
                                  </div>

                                </div>
                              </div>

                              <div className="rounded-xl border border-slate-700/70 bg-[#040B18] p-5">
                                <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">
                                  Timestamps
                                </p>

                                <div className="space-y-3 text-sm">

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      Sent At
                                    </span>
                                    <span className="text-white">
                                      {formatDateTime(record.sent_at)}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-300">
                                      Replied At
                                    </span>
                                    <span className="text-white">
                                      {formatDateTime(record.replied_at)}
                                    </span>
                                  </div>

                                </div>
                              </div>

                            </div>

                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                  </Fragment>
                );
              }
            )}
        </TableBody>
      </Table>
    </div>
  );
}
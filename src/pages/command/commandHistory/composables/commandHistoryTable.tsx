import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDateTime, getStatusColor } from "../Utils/commandHistory.util";
import type { CommandHistoryRecord } from "../types/commandHistory.types";

interface CommandHistoryTableProps {
	records: CommandHistoryRecord[];
	loading: boolean;
}

function getCommandName(record: CommandHistoryRecord): string {
	return record.command_definition?.name ?? `CMD-${record.command_id}`;
}

function formatStatusLabel(status: CommandHistoryRecord["status"]): string {
	return status.toUpperCase();
}

function formatResponseTime(value: number | null): string {
	return value ? `${value} ms` : "N/A";
}

function formatAck(value?: number): string {
	return value === 1 ? "Yes" : "No";
}

export default function CommandHistoryTable({ records, loading }: CommandHistoryTableProps) {
	const [expandedById, setExpandedById] = useState<Record<number, boolean>>({});

	const toggleRow = (id: number) => {
		setExpandedById((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	return (
		<div className="rounded-xl border border-slate-800 overflow-hidden bg-card">
			<Table>
				<TableHeader>
					<TableRow className="border-slate-800">
						<TableHead className="w-12" />
						<TableHead>Name</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Sent At</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{loading && (
						<TableRow className="border-slate-800">
							<TableCell className="text-muted-foreground" colSpan={4}>
								Loading command history...
							</TableCell>
						</TableRow>
					)}

					{!loading && records.length === 0 && (
						<TableRow className="border-slate-800">
							<TableCell className="text-muted-foreground" colSpan={4}>
								No command history found.
							</TableCell>
						</TableRow>
					)}

					{!loading &&
						records.map((record) => {
							const isExpanded = expandedById[record.id] ?? false;

							return (
								<Fragment key={record.id}>
									<TableRow className="border-slate-800 transition hover:bg-background">
										<TableCell>
											<button
												type="button"
												onClick={() => toggleRow(record.id)}
												className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-300 hover:bg-slate-800"
												aria-label={isExpanded ? "Collapse row" : "Expand row"}
											>
												{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
											</button>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10">
													#{record.id}
												</Badge>
												<span className="font-medium text-white">{getCommandName(record)}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline" className={getStatusColor(record.status)}>
												{formatStatusLabel(record.status)}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground">{formatDateTime(record.sent_at)}</TableCell>
									</TableRow>

									{isExpanded && (
										<TableRow className="border-slate-800 bg-[#050C18]">
											<TableCell colSpan={4} className="p-4">
												<div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
													<div className="space-y-4">
														<div className="rounded-xl border border-slate-800 bg-[#040B18] p-4">
															<p className="text-xs uppercase tracking-wide text-gray-400 mb-4">Command Execution</p>
															<div className="space-y-3 text-sm">
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">Record ID</span>
																	<span className="text-green-400">#{record.id}</span>
																</div>
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">Command ID</span>
																	<span className="text-green-400">{record.command_id}</span>
																</div>
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">Source Address</span>
																	<span className="text-green-400">{record.src_address}</span>
																</div>
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">Dest Address</span>
																	<span className="text-green-400">{record.dest_address}</span>
																</div>
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">Status</span>
																	<Badge variant="outline" className={getStatusColor(record.status)}>
																		{formatStatusLabel(record.status)}
																	</Badge>
																</div>
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">Response Time</span>
																	<span className="text-green-400">{formatResponseTime(record.response_time_ms)}</span>
																</div>
															</div>
														</div>

														<div className="rounded-xl border border-slate-800 bg-[#040B18] p-4">
															<p className="text-xs uppercase tracking-wide text-gray-400 mb-3">Raw Binary</p>
															<p className="font-mono text-sm text-green-400 break-all">
																{record.raw_binary_sent || "N/A"}
															</p>
														</div>
													</div>

													<div className="space-y-4">
														<div className="rounded-xl border border-slate-800 bg-[#040B18] p-4">
															<p className="text-xs uppercase tracking-wide text-gray-400 mb-4">Command Definition</p>
															<div className="space-y-3 text-sm">
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">Name</span>
																	<span className="text-green-400">{getCommandName(record)}</span>
																</div>
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">CMD ID</span>
																	<span className="text-green-400">{record.command_definition?.cmd_id ?? record.command_id}</span>
																</div>
																<div className="space-y-1">
																	<span className="text-cyan-300">Description</span>
																	<p className="text-white/90">
																		{record.command_definition?.description ?? "N/A"}
																	</p>
																</div>
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">Requires ACK</span>
																	<Badge variant="outline" className="border-slate-700 text-slate-300 bg-slate-800/60">
																		{formatAck(record.command_definition?.requires_ack)}
																	</Badge>
																</div>
															</div>
														</div>

														<div className="rounded-xl border border-slate-800 bg-[#040B18] p-4">
															<p className="text-xs uppercase tracking-wide text-gray-400 mb-4">Timestamps</p>
															<div className="space-y-3 text-sm">
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">Sent At</span>
																	<span className="text-white">{formatDateTime(record.sent_at)}</span>
																</div>
																<div className="flex items-center justify-between gap-4">
																	<span className="text-cyan-300">Replied At</span>
																	<span className="text-white">{formatDateTime(record.replied_at)}</span>
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
						})}
				</TableBody>
			</Table>
		</div>
	);
}

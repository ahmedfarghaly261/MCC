import type { CommandHistoryRecord } from "../types/commandHistory.types";

interface CommandHistoryStatsProps {
	records: CommandHistoryRecord[];
}

interface StatCardProps {
	title: string;
	value: number;
	color: string;
	border?: string;
}

function StatCard({ title, value, color, border }: StatCardProps) {
	return (
		<div className={`rounded-xl border ${border ?? "border-slate-800"} bg-card p-5`}>
			<p className="text-sm text-muted-foreground">{title}</p>
			<p className={`text-2xl font-semibold mt-2 ${color}`}>{value}</p>
		</div>
	);
}

export default function CommandHistoryStats({ records }: CommandHistoryStatsProps) {
	const total = records.length;
	const ack = records.filter((record) => record.status === "ack").length;
	const pending = records.filter((record) => record.status === "pending").length;
	const errors = records.filter(
		(record) => record.status === "error" || record.status === "timeout" || record.status === "nack",
	).length;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
			<StatCard title="Total Commands" value={total} color="text-blue-400" />
			<StatCard title="Ack" value={ack} color="text-green-400" border="border-green-500/30" />
			<StatCard
				title="Pending"
				value={pending}
				color="text-yellow-400"
				border="border-yellow-500/30"
			/>
			<StatCard title="Issues" value={errors} color="text-red-400" border="border-red-500/30" />
		</div>
	);
}

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	CommandHistoryFilters,
	CommandStatusFilter,
} from "../types/commandHistory.types";

interface CommandHistoryFiltersProps {
	filters: CommandHistoryFilters;
	onStatusChange: (status: CommandStatusFilter) => void;
	onDestinationChange: (destination: string) => void;
}

export default function CommandHistoryFillters({
	filters,
	onStatusChange,
	onDestinationChange,
}: CommandHistoryFiltersProps) {
	return (
		<div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
			<div className="relative w-full md:w-1/3">
				<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
				<Input
					value={filters.destination}
					onChange={(event) => onDestinationChange(event.target.value)}
					placeholder="Filter by destination..."
					className="pl-9 bg-card border-slate-800"
				/>
			</div>

			<div className="flex gap-3 flex-wrap">
				<Select
					value={filters.status}
					onValueChange={(value) => onStatusChange(value as CommandStatusFilter)}
				>
					<SelectTrigger className="w-45 bg-card border-slate-800">
						<SelectValue placeholder="All Status" />
					</SelectTrigger>
					<SelectContent position="popper">
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="ack">Ack</SelectItem>
						<SelectItem value="nack">Nack</SelectItem>
						<SelectItem value="timeout">Timeout</SelectItem>
						<SelectItem value="error">Error</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

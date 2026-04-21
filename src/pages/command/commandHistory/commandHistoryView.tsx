import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLayoutLoading } from "@/components/layout/layoutLoadingContext";
import CommandHistoryFillters from "./composables/commandHistoryFillters";
import CommandHistoryStats from "./composables/commandHistoryStats";
import CommandHistoryTable from "./composables/commandHistoryTable";
import { getCommandHistory } from "./services/commandHistory.service";
import type {
	CommandHistoryFilters,
	CommandHistoryRecord,
	CommandStatusFilter,
} from "./types/commandHistory.types";

const INITIAL_FILTERS: CommandHistoryFilters = {
	status: "all",
	destination: "",
};

export default function CommandHistoryView() {
	const { setGlobalLoading } = useLayoutLoading();
	const [records, setRecords] = useState<CommandHistoryRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [filters, setFilters] = useState<CommandHistoryFilters>(INITIAL_FILTERS);

	const loadHistory = async () => {
		setLoading(true);
		setGlobalLoading(true);
		setErrorMessage(null);

		try {
			const response = await getCommandHistory();
			setRecords(response);
		} catch (error) {
			if (isAxiosError(error)) {
				console.error("Command history API error", {
					status: error.response?.status,
					statusText: error.response?.statusText,
					url: error.config?.url,
					method: error.config?.method,
					response: error.response?.data,
				});
			} else {
				console.error("Command history unexpected error", error);
			}

			setErrorMessage("Failed to load command history.");
		} finally {
			setLoading(false);
			setGlobalLoading(false);
		}
	};

	useEffect(() => {
		void loadHistory();

		return () => {
			setGlobalLoading(false);
		};
	}, []);

	const filteredRecords = useMemo(() => {
		const destination = filters.destination.trim().toLowerCase();

		return records.filter((record) => {
			const statusMatches =
				filters.status === "all" ? true : record.status === filters.status;

			const destinationMatches =
				destination.length === 0
					? true
					: String(record.dest_address).toLowerCase().includes(destination);

			return statusMatches && destinationMatches;
		});
	}, [records, filters.destination, filters.status]);

	const onStatusChange = (status: CommandStatusFilter) => {
		setFilters((prev) => ({ ...prev, status }));
	};

	const onDestinationChange = (destination: string) => {
		setFilters((prev) => ({ ...prev, destination }));
	};

	return (
		<div className="p-6 bg-background min-h-screen text-white">
			<div className="flex items-center justify-between gap-4 bg-background rounded-md mb-6">
				<div className="flex items-center gap-4">
					<div className="shrink-0 text-blue-500 text-2xl">
						<History />
					</div>

					<div>
						<h1 className="text-white text-lg font-semibold">Command History</h1>
						<p className="text-gray-400 text-sm">Live history from mission control command endpoint</p>
					</div>
				</div>

				<Button
					type="button"
					variant="outline"
					className="bg-card border-slate-800 text-muted-foreground"
					onClick={() => {
						void loadHistory();
					}}
					disabled={loading}
				>
					<RotateCcw className="mr-2 h-4 w-4" />
					Refresh
				</Button>
			</div>

			<CommandHistoryStats records={filteredRecords} />

			<CommandHistoryFillters
				filters={filters}
				onStatusChange={onStatusChange}
				onDestinationChange={onDestinationChange}
			/>

			{errorMessage && (
				<p className="text-sm text-red-400 mb-4">{errorMessage}</p>
			)}

			<CommandHistoryTable records={filteredRecords} loading={loading} />
		</div>
	);
}

import { FileText, ScrollText } from "lucide-react";
import LogsTable from "./composables/LogsTable";

function LogPage() {
  return (
    <>
      <div className="flex items-center gap-4 bg-background p-4 rounded-md">
        {/* Icon */}
        <div className="flex-shrink-0 text-blue-500 text-2xl">
          <ScrollText />
        </div>

        {/* Title and Description */}
        <div>
          <h1 className="text-white text-lg font-semibold">Logs Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Comprehensive system logs and activity tracking
          </p>
        </div>
      </div>
      <LogsTable />

    </>
  );
}

export default LogPage;

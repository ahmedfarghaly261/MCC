import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

import CommandResponsesTable from "./composables/CommandResponsesTable";
import CommandResponsesFilters from "./composables/CommandResponsesFilters";

import { getCommandReplies } from "./services/commandResponsesService";
import { type CommandReply} from "./types/CommandResponses.types";

export default function CommandResponses() {
  const commandLogId = 1;

  const [data, setData] =
    useState<CommandReply[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [expandedRow, setExpandedRow] =
    useState<number | null>(null);

  useEffect(() => {
    fetchReplies();
  }, [commandLogId]);

  const fetchReplies = async () => {
    setLoading(true);

    try {
      const replies =
        await getCommandReplies(
          commandLogId
        );

      setData(replies);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(
    (reply) =>
      reply.id
        .toString()
        .includes(search)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="bg-blue-500/10 p-3 rounded-xl">
          <Activity className="text-blue-400" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold">
            Command Responses
          </h1>

          <p className="text-gray-400 text-sm">
            Real-time command reply telemetry
          </p>
        </div>
      </div>

      <CommandResponsesFilters
        search={search}
        setSearch={setSearch}
        onRefresh={fetchReplies}
      />

      <CommandResponsesTable
        data={filteredData}
        loading={loading}
        expandedRow={expandedRow}
        setExpandedRow={setExpandedRow}
      />
    </div>
  );
}
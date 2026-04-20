import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

import CommandDictionaryTable from "./composables/CommandDictionaryTable";
import CommandDictionaryFilters from "./composables/CommandDictionaryFilters";

import { getCommandsDictionary } from "./services/commandDictionaryService";

import { type CommandDictionary } from "./types/commandDictionaryTypes";

export default function CommandDictionaryPage() {
  const [data, setData] =
    useState<CommandDictionary[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [expandedRow, setExpandedRow] =
    useState<number | null>(null);

  useEffect(() => {
    fetchCommands();
  }, []);

  const fetchCommands = async () => {
    setLoading(true);

    try {
      const commands =
        await getCommandsDictionary();

      setData(commands);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(
    (cmd) =>
      cmd.name
        .toLowerCase()
        .includes(search.toLowerCase())
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
            Command Dictionary
          </h1>

          <p className="text-gray-400 text-sm">
            Real-time command telemetry
          </p>
        </div>
      </div>

      <CommandDictionaryFilters
        search={search}
        setSearch={setSearch}
        onRefresh={fetchCommands}
      />

      <CommandDictionaryTable
        data={filteredData}
        loading={loading}
        expandedRow={expandedRow}
        setExpandedRow={setExpandedRow}
      />
    </div>
  );
}
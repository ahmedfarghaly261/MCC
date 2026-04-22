import { useEffect, useState, useCallback } from "react";
import { isAxiosError } from "axios";
import { MessageCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLayoutLoading } from "@/components/layout/layoutLoadingContext";
import CommandResponsesFilters from "./composables/CommandResponsesFilters";
import CommandResponsesTable from "./composables/CommandResponsesTable";
import { getCommandReplies } from "./services/commandResponsesService";
import type { CommandReply } from "./types/CommandResponses.types";

export default function CommandResponses() {
  const { setGlobalLoading } = useLayoutLoading();
  const [replies, setReplies] = useState<CommandReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const loadReplies = useCallback(async () => {
    setLoading(true);
    setGlobalLoading(true);
    setErrorMessage(null);

    try {
      const response = await getCommandReplies();
      setReplies(response);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Command replies API error", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          response: error.response?.data,
        });
      } else {
        console.error("Command replies unexpected error", error);
      }

      setErrorMessage("Failed to load command replies.");
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, [setGlobalLoading]);

  useEffect(() => {
    void loadReplies();

    return () => {
      setGlobalLoading(false);
    };
  }, [loadReplies, setGlobalLoading]);

  const filteredReplies = replies.filter((reply) =>
    reply.id.toString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-background min-h-screen text-white">
      <div className="flex items-center justify-between gap-4 bg-background rounded-md mb-6">
        <div className="flex items-center gap-4">
          <div className="shrink-0 text-blue-500 text-2xl">
            <MessageCircle />
          </div>

          <div>
            <h1 className="text-white text-lg font-semibold">Command Responses</h1>
            <p className="text-gray-400 text-sm">Real-time command reply telemetry</p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="bg-card border-slate-800 text-muted-foreground"
          onClick={() => {
            void loadReplies();
          }}
          disabled={loading}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <CommandResponsesFilters search={search} setSearch={setSearch} onRefresh={loadReplies} />

      {errorMessage && <p className="text-sm text-red-400 mb-4">{errorMessage}</p>}

      <CommandResponsesTable
        data={filteredReplies}
        loading={loading}
        expandedRow={expandedRow}
        setExpandedRow={setExpandedRow}
      />
    </div>
  );
}
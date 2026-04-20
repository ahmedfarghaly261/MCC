import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type CommandReply} from "../types/CommandResponses.types";

interface Props {
  data: CommandReply[];
  loading: boolean;
  expandedRow: number | null;
  setExpandedRow: (id: number | null) => void;
}

export default function CommandResponsesTable({
  data,
  loading,
  expandedRow,
  setExpandedRow,
}: Props) {
  const formatTime = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const getReplyStatus = (reply: CommandReply) => {
    if (!reply.reply_data || reply.reply_data.length === 0) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400">
          EMPTY
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-500/20 text-green-400">
        RECEIVED
      </Badge>
    );
  };

  return (
    <Card className="bg-[#1A2333] border border-gray-700">
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0B1220] text-gray-400">
            <tr>
              <th className="text-left p-4"></th>
              <th className="text-left p-4">Reply ID</th>
              <th className="text-left p-4">Command Log ID</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Created Time</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  No replies found
                </td>
              </tr>
            ) : (
              data.map((reply) => (
                <>
                  <tr
                    key={reply.id}
                    className="border-t border-gray-700 hover:bg-[#0B1220]/50"
                  >
                    <td className="p-4">
                      <button
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === reply.id
                              ? null
                              : reply.id
                          )
                        }
                      >
                        {expandedRow === reply.id ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    </td>

                    <td className="p-4 font-medium">
                      {reply.id}
                    </td>

                    <td className="p-4">
                      {reply.command_log_id}
                    </td>

                    <td className="p-4">
                      {getReplyStatus(reply)}
                    </td>

                    <td className="p-4 text-gray-400">
                      {formatTime(reply.created_at)}
                    </td>
                  </tr>

                  {expandedRow === reply.id && (
                    <tr className="bg-[#0B1220]">
                      <td colSpan={5} className="p-6">
                        <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-xs overflow-x-auto">
                          {JSON.stringify(
                            reply.reply_data,
                            null,
                            2
                          )}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
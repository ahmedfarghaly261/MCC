import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Activity,
  RefreshCcw,
} from "lucide-react";



interface CommandReply {
  id: number;
  command_log_id: number;
  reply_data: any[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function CommandResponses() {
 
  const commandLogId = 1;

  const [data, setData] = useState<CommandReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    fetchReplies();
  }, [commandLogId]);

  const fetchReplies = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost/api/mcc/command/replies/${commandLogId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching command replies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((reply) =>
    reply.id
      .toString()
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatTime = (date: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  const getReplyStatus = (reply: CommandReply) => {
    if (!reply.reply_data || reply.reply_data.length === 0)
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400">
          EMPTY
        </Badge>
      );

    return (
      <Badge className="bg-green-500/20 text-green-400">
        RECEIVED
      </Badge>
    );
  };

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

      {/* Filters */}
      <Card className="bg-[#1A2333] border border-gray-700">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <Input
              placeholder="Search reply ID..."
              className="pl-9 bg-[#0B1220] border-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button
            onClick={fetchReplies}
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-[#1A2333] border border-gray-700">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0B1220] text-gray-400">
              <tr>
                <th className="text-left p-4"></th>
                <th className="text-left p-4">Reply ID</th>
                <th className="text-left p-4">
                  Command Log ID
                </th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">
                  Created Time
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
                    No replies found
                  </td>
                </tr>
              ) : (
                filteredData.map((reply) => (
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
                          <div className="space-y-4">
                            <div>
                              <p className="text-gray-400 text-sm mb-2">
                                Reply Data (Raw JSON)
                              </p>

                              <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-xs overflow-x-auto">
{JSON.stringify(
  reply.reply_data,
  null,
  2
)}
                              </pre>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                              <div>
                                <p className="text-gray-400">
                                  Created At
                                </p>
                                <p className="mt-1">
                                  {formatTime(
                                    reply.created_at
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-gray-400">
                                  Updated At
                                </p>
                                <p className="mt-1">
                                  {formatTime(
                                    reply.updated_at
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
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
    </div>
  );
}

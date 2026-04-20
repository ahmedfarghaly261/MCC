import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Search,
  
} from "lucide-react";

interface CommandDictionary {
  id: number;
  name: string;
  cmd_id: number;
  description: string | null;
  allowed_sources: string[];
  allowed_destinations: string[];
  expected_data_len: number;
  requires_ack: number;
  created_at: string | null;
  updated_at: string | null;
}

export default function CommandDictionary() {
  const [data, setData] = useState<CommandDictionary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    fetchCommands();
  }, []);

  const fetchCommands = async () => {
    try {
      const res = await fetch("http://localhost/api/mcc/command", {
        headers: {
          Accept: "application/json",
        },
      });

      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching commands:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (requires_ack: number) => {
    if (requires_ack === 1)
      return <Badge className="bg-green-500/20 text-green-400">ACK</Badge>;

    return (
      <Badge className="bg-yellow-500/20 text-yellow-400">
        NO ACK
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-500/10 p-3 rounded-xl">

        </div>

        <div>
          <h1 className="text-2xl font-semibold">
            Command Dictionary
          </h1>
          <p className="text-gray-400 text-sm">
            Real-time command telemetry and acknowledgments
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#1A2333] border border-gray-700">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search telemetry..."
              className="pl-9 bg-[#0B1220] border-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button onClick={fetchCommands}>
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
                <th className="text-left p-4">Command Name</th>
                <th className="text-left p-4">Command ID</th>
                <th className="text-left p-4">Expected Data</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Created</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center">
                    No data found
                  </td>
                </tr>
              ) : (
                filteredData.map((cmd) => (
                  <>
                    <tr
                      key={cmd.id}
                      className="border-t border-gray-700 hover:bg-[#0B1220]/50"
                    >
                      <td className="p-4">
                        <button
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === cmd.id
                                ? null
                                : cmd.id
                            )
                          }
                        >
                          {expandedRow === cmd.id ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                      </td>

                      <td className="p-4 font-medium">
                        {cmd.name}
                      </td>

                      <td className="p-4">
                        {cmd.cmd_id}
                      </td>

                      <td className="p-4">
                        {cmd.expected_data_len}
                      </td>

                      <td className="p-4">
                        {getStatusBadge(cmd.requires_ack)}
                      </td>

                      <td className="p-4 text-gray-400">
                        {cmd.created_at
                          ? new Date(
                              cmd.created_at
                            ).toLocaleString()
                          : "-"}
                      </td>
                    </tr>

                    {expandedRow === cmd.id && (
                      <tr className="bg-[#0B1220]">
                        <td colSpan={6} className="p-6">
                          <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div>
                              <p className="text-gray-400">
                                Description
                              </p>
                              <p className="mt-1">
                                {cmd.description ||
                                  "No description"}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-400">
                                Allowed Sources
                              </p>
                              <p className="mt-1">
                                {cmd.allowed_sources?.join(", ") ||
                                  "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-400">
                                Allowed Destinations
                              </p>
                              <p className="mt-1">
                                {cmd.allowed_destinations?.join(", ") ||
                                  "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-400">
                                Last Updated
                              </p>
                              <p className="mt-1">
                                {cmd.updated_at
                                  ? new Date(
                                      cmd.updated_at
                                    ).toLocaleString()
                                  : "-"}
                              </p>
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

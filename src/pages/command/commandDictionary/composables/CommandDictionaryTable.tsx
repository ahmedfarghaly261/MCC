import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { type CommandDictionary } from "../types/commandDictionaryTypes";

interface Props {
  data: CommandDictionary[];
  loading: boolean;
  expandedRow: number | null;
  setExpandedRow: (id: number | null) => void;
}

export default function CommandDictionaryTable({
  data,
  loading,
  expandedRow,
  setExpandedRow,
}: Props) {
  const getStatusBadge = (
    requires_ack: number
  ) => {
    if (requires_ack === 1) {
      return (
        <Badge className="bg-green-500/20 text-green-400">
          ACK
        </Badge>
      );
    }

    return (
      <Badge className="bg-yellow-500/20 text-yellow-400">
        NO ACK
      </Badge>
    );
  };

  const formatTime = (
    date: string | null
  ) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const formatList = (items?: string[]) => {
    if (!items || items.length === 0) return "-";
    return items.join(", ");
  };

  const formatSubsystems = (
    items?: CommandDictionary["subsystems"]
  ) => {
    if (!items || items.length === 0) return "-";
    return items
      .map(
        (subsystem) =>
          `${subsystem.hex_code} (${subsystem.name})`
      )
      .join(", ");
  };

  return (
    <Card className="bg-[#1A2333] border border-gray-700">
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0B1220] text-gray-400">
            <tr>
              <th className="p-4"></th>
              <th className="p-4 text-left">
                Command Name
              </th>
              <th className="p-4 text-left">
                Command ID
              </th>
              <th className="p-4 text-left">
                Expected Data
              </th>
              <th className="p-4 text-left">
                Status
              </th>
              <th className="p-4 text-left">
                Created
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center"
                >
                  No commands found
                </td>
              </tr>
            ) : (
              data.map((cmd) => (
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
                      {getStatusBadge(
                        cmd.requires_ack
                      )}
                    </td>

                    <td className="p-4 text-gray-400">
                      {formatTime(
                        cmd.created_at
                      )}
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
                              Required Data Fields
                            </p>

                            <p className="mt-1">
                              {formatList(
                                cmd.required_data_fields
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400">
                              Allowed Sources
                            </p>

                            <p className="mt-1">
                              {cmd.allowed_sources?.join(
                                ", "
                              ) || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400">
                              Allowed Destinations
                            </p>

                            <p className="mt-1">
                              {cmd.allowed_destinations?.join(
                                ", "
                              ) || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400">
                              Subsystems
                            </p>

                            <p className="mt-1">
                              {formatSubsystems(
                                cmd.subsystems
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400">
                              Updated At
                            </p>

                            <p className="mt-1">
                              {formatTime(
                                cmd.updated_at
                              )}
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
  );
}
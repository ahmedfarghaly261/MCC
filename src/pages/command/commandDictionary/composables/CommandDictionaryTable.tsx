import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { type CommandDictionary } from "../types/commandDictionaryTypes";
import SatelliteLoading from "@/components/shared/SatelliteLoading";

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
        <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
          ACK
        </Badge>
      );
    }

    return (
      <Badge className="bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
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



  return (
    <Card className="bg-[#0a1325] border border-gray-800 shadow-xl overflow-hidden rounded-xl">
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card text-gray-400 border-b border-gray-800">
            <tr>
              <th className="p-4 w-12"></th>
              <th className="p-4 text-left font-medium uppercase tracking-wider text-xs">
                Command Name
              </th>
              <th className="p-4 text-left font-medium uppercase tracking-wider text-xs">
                Command ID
              </th>
              <th className="p-4 text-left font-medium uppercase tracking-wider text-xs">
                Hex ID
              </th>
              <th className="p-4 text-left font-medium uppercase tracking-wider text-xs">
                Expected Data
              </th>
              <th className="p-4 text-left font-medium uppercase tracking-wider text-xs">
                Status
              </th>
              <th className="p-4 text-left font-medium uppercase tracking-wider text-xs">
                Created
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-12">
                  <SatelliteLoading />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-12 text-center text-gray-500"
                >
                  No commands found matching your criteria.
                </td>
              </tr>
            ) : (
              data.map((cmd) => (
                <>
                  <tr
                    key={cmd.id}
                    onClick={() => setExpandedRow(expandedRow === cmd.id ? null : cmd.id)}
                    className={`group hover:bg-[#1F2937]/60 cursor-pointer transition-all duration-200 ${
                      expandedRow === cmd.id ? "bg-[#1F2937]/40" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${expandedRow === cmd.id ? 'bg-gray-700/50 text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                        {expandedRow === cmd.id ? (
                          <ChevronDown size={14} className="transition-transform duration-200" />
                        ) : (
                          <ChevronRight size={14} className="transition-transform duration-200" />
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-gray-200">
                      {cmd.name}
                    </td>
                    
                    <td className="p-4 text-gray-400">
                      #{cmd.id}
                    </td>

                    <td className="p-4 font-mono text-blue-400/90 bg-blue-500/5 px-2 rounded w-fit inline-block mt-3">
                      {cmd.cmd_id}
                    </td>

                    <td className="p-4 text-gray-300">
                      {cmd.expected_data_len} <span className="text-gray-500 text-xs">bytes</span>
                    </td>

                    <td className="p-4">
                      {getStatusBadge(
                        cmd.requires_ack
                      )}
                    </td>

                    <td className="p-4 text-gray-400 text-xs whitespace-nowrap">
                      {formatTime(
                        cmd.created_at
                      )}
                    </td>
                  </tr>

                  {expandedRow === cmd.id && (
                    <tr>
                      <td colSpan={7} className="p-0 border-b-0">
                        <div className="bg-linear-to-b from-[#111827] to-[#0B1220] p-6 shadow-inner border-y border-gray-800/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2">
                              <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                Description
                              </p>
                              <p className="text-gray-300 leading-relaxed pl-3 border-l border-gray-700/50">
                                {cmd.description ||
                                  "No description available for this command."}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                                Required Data Fields
                              </p>
                              <div className="pl-3">
                                {cmd.required_data_fields && cmd.required_data_fields.length > 0 && cmd.required_data_fields.some(f => f) ? (
                                  <div className="flex flex-wrap gap-2">
                                    {cmd.required_data_fields.filter(f => f).map((field, i) => (
                                      <Badge key={i} className="bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700">
                                        {String(field)}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 italic">None</span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                Subsystems
                              </p>
                              <div className="pl-3">
                                {cmd.subsystems && cmd.subsystems.length > 0 ? (
                                  <div className="flex flex-col gap-1.5">
                                    {cmd.subsystems.map((sub, i) => (
                                      <div key={i} className="flex items-center gap-2 text-gray-300">
                                        <span className="font-mono text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{sub.hex_code}</span>
                                        <span>{sub.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 italic">-</span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
                                Allowed Sources
                              </p>
                              <div className="pl-3 flex flex-wrap gap-2">
                                {cmd.allowed_sources && cmd.allowed_sources.length > 0 ? (
                                  cmd.allowed_sources.map((src, i) => (
                                    <Badge key={i} className="bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20">
                                      {src}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-gray-500 italic">Any</span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-500/50" />
                                Allowed Destinations
                              </p>
                              <div className="pl-3 flex flex-wrap gap-2">
                                {cmd.allowed_destinations && cmd.allowed_destinations.length > 0 ? (
                                  cmd.allowed_destinations.map((dst, i) => (
                                    <Badge key={i} className="bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20">
                                      {dst}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-gray-500 italic">Any</span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-500/50" />
                                Last Updated
                              </p>
                              <p className="pl-3 text-gray-400 text-sm">
                                {formatTime(cmd.updated_at)}
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
  );
}
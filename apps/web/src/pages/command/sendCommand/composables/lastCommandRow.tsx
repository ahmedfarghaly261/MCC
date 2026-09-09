import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Activity,
} from "lucide-react";

import type { CommandLog } from "../services/commandLogService";
import { useNavigate } from "react-router-dom";

interface Props {
  record: CommandLog | null;
}

function getStatusBadgeClass(status?: string) {
  switch (status?.toLowerCase()) {
    case "ack":
      return "bg-purple-500/20 text-purple-400 border border-purple-500/40";

    case "nack":
      return "bg-orange-500/20 text-orange-400 border border-orange-500/40";

    case "telemetry_decoded":
      return "bg-blue-500/20 text-blue-400 border border-blue-500/40";

    default:
      return "bg-gray-500/20 text-gray-400 border border-gray-500/40";
  }
}

export default function LastCommandRow({ record }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
  if (!record) return null;

  const status =
    record.status ||
    record.command?.name;

  const isTelemetry =
    status
      ?.toLowerCase()
      .includes("telemetry");

  function handleRowClick() {
    if (isTelemetry) {
        navigate("/telemetry-replies/" + record?.id);
      return;
    }

    setIsExpanded(!isExpanded);
  }

  return (
    <div className="mt-8">

      {/* Row Container */}
      <div className="border border-gray-700 rounded-xl overflow-hidden">

        {/* Header Row */}
        <div
          className="
            flex items-center justify-between
            px-5 py-4
            bg-gradient-to-r from-[#020817] to-[#0B1220]
            hover:from-[#0B1220]
            hover:to-[#111827]
            transition-colors
            cursor-pointer
          "
          onClick={handleRowClick}
        >
          <div className="flex items-center gap-4">

            {/* Arrow */}
            <div className="text-gray-400">
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </div>

            {/* Command ID Badge */}
            <span className="
              px-2.5 py-1
              rounded-lg
              text-xs
              font-semibold
              bg-purple-500/20
              text-purple-300
            ">
              #{record.id}
            </span>

            {/* Command Name */}
            <span className="text-white font-medium">
              {record.command?.name}
            </span>

            {/* Status Badge */}
            <span
              className={`
                px-3 py-1
                rounded-full
                text-xs
                font-medium
                ${getStatusBadgeClass(status)}
              `}
            >
              {status}
            </span>

          </div>

          <div className="flex items-center gap-6">

            {/* Timestamp */}
            <span className="text-sm text-gray-400">
              {new Date(
                record.created_at
              ).toLocaleString()}
            </span>

            {/* View Telemetry Button */}
            {isTelemetry && (
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate("/telemetry-replies/" + record.id);
                  
                }}
                className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-xl
                  border
                  border-blue-500/40
                  bg-blue-500/10
                  text-blue-400
                  hover:bg-blue-500/20
                  transition
                "
              >
                <Activity size={16} />

                View Telemetry
              </button>
            )}

          </div>
        </div>

        {/* Dropdown Details */}
        {isExpanded && (
          <div className="
            bg-[#020817]
            border-t border-gray-700
            px-5 py-5
          ">

            <div className="
              grid grid-cols-1 md:grid-cols-2
              gap-5
              text-sm
            ">

              <div>
                <span className="text-gray-400">
                  Description
                </span>

                <div className="text-white mt-1">
                  {record.command?.description ||
                    "No description available."}
                </div>
              </div>

              <div>
                <span className="text-gray-400">
                  Requires ACK
                </span>

                <div className="text-white mt-1">
                  {record.command?.requires_ack
                    ? "Yes"
                    : "No"}
                </div>
              </div>

              <div>
                <span className="text-gray-400">
                  Expected Data Length
                </span>

                <div className="text-white mt-1">
                  {record.command?.expected_data_len}
                </div>
              </div>

              <div>
                <span className="text-gray-400">
                  Destination Address
                </span>

                <div className="text-white mt-1">
                  {record.dest_address}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
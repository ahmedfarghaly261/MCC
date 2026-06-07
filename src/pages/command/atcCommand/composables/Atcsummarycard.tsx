import { CalendarClock, Terminal, MapPin } from "lucide-react";
import type { AtcCommandSchema } from "../utils/Atccommand.schema";
import { formatAtcDateTime } from "../utils/Atccommand.util";

interface Props {
  values: Partial<AtcCommandSchema>;
  commandName?: string;
  destLabel?: string;
}

export default function AtcSummaryCard({
  values,
  commandName,
  destLabel,
}: Props) {
  const hasData = [
    values.pwrlId,
    values.imageId,
    values.timerValue,
    values.modeId,
    values.sequenceNumber,
    values.windowSize,
    values.tlmFrameSeqNo,
  ].some((v) => v !== undefined && v !== "");

  return (
    <div className="rounded-xl border border-slate-700 bg-card p-5 space-y-5 text-sm">
      <h3 className="text-white font-semibold">Schedule Summary</h3>

      {/* Command */}
      <div className="flex items-start gap-3">
        <Terminal className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">
            Command
          </p>
          <p className="text-white">
            {commandName ?? (values.commandId ? `ID ${values.commandId}` : "—")}
          </p>
        </div>
      </div>

      {/* Destination */}
      <div className="flex items-start gap-3">
        <MapPin className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">
            Destination
          </p>
          <p className="text-white">
            {destLabel ?? (values.destAddress ? `0x${parseInt(values.destAddress, 10).toString(16).toUpperCase()}` : "—")}
          </p>
        </div>
      </div>

      {/* Execute At */}
      <div className="flex items-start gap-3">
        <CalendarClock className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">
            Execute At
          </p>
          <p className="text-white font-mono text-xs">
            {values.executeAt ? formatAtcDateTime(values.executeAt) : "—"}
          </p>
        </div>
      </div>

      {/* Data fields summary */}
      <div className="border-t border-slate-700/60 pt-4">
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">
          Data Fields
        </p>

        {!hasData ? (
          <p className="text-gray-500 text-xs">No data fields provided</p>
        ) : (
          <div className="space-y-1.5">
            {values.pwrlId && (
              <Row label="pwrl_id" value={values.pwrlId} color="text-orange-300" />
            )}
            {values.imageId && (
              <Row label="image_id" value={values.imageId} color="text-yellow-300" />
            )}
            {values.timerValue && (
              <Row label="timer_value" value={values.timerValue} color="text-green-300" />
            )}
            {values.modeId && (
              <Row label="mode_id" value={values.modeId} color="text-pink-300" />
            )}
            {values.sequenceNumber && (
              <Row label="sequence_number" value={values.sequenceNumber} color="text-cyan-300" />
            )}
            {values.windowSize && (
              <Row label="window_size" value={values.windowSize} color="text-blue-300" />
            )}
            {values.tlmFrameSeqNo && (
              <Row label="tlm_frame_seq_no" value={values.tlmFrameSeqNo} color="text-violet-300" />
            )}
          </div>
        )}
      </div>

      {/* Type badge */}
      <div className="pt-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
          <CalendarClock className="h-3 w-3" />
          Absolute Time Command
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400 font-mono">{label}</span>
      <span className={`text-xs font-mono ${color}`}>{value}</span>
    </div>
  );
}
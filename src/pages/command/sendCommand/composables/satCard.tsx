"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Lock,
  Radio,
  Satellite,
  SignalHigh,
  TimerReset,
  Wifi,
} from "lucide-react"

export interface SatelliteData {
  name: string
  code: string
  visibilityStatus: "IN VISIBILITY ZONE" | "OUT OF RANGE"
  visibilityRemaining: string
  communicationStatus: "active" | "inactive"
}

interface SatCardProps {
  satellite: SatelliteData
}

export default function SatCard({ satellite }: SatCardProps) {
  const isActive = satellite.communicationStatus === "active"
  const accent = isActive ? "green" : "yellow"
  const accentClasses = {
    green: {
      border: "border-emerald-400/35",
      glow: "shadow-[0_0_34px_rgba(16,185,129,0.16)]",
      icon: "text-emerald-300",
      soft: "bg-emerald-500/10",
      text: "text-emerald-300",
      ring: "border-emerald-400/30",
      beam: "from-emerald-300/0 via-emerald-300/60 to-cyan-300/0",
    },
    yellow: {
      border: "border-yellow-400/35",
      glow: "shadow-[0_0_34px_rgba(234,179,8,0.14)]",
      icon: "text-yellow-300",
      soft: "bg-yellow-500/10",
      text: "text-yellow-300",
      ring: "border-yellow-400/30",
      beam: "from-yellow-300/0 via-yellow-300/55 to-cyan-300/0",
    },
  }[accent]

  return (
    <Field>
      <FieldLabel className="flex items-center justify-between text-sm font-semibold text-gray-300">
        <span>Target Satellite</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-cyan-200">
          <Lock className="h-3 w-3" />
          Auto-linked
        </span>
      </FieldLabel>

      <div
        className={`relative overflow-hidden rounded-xl border bg-[#07111f] p-4 ${accentClasses.border} ${accentClasses.glow}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(34,211,238,0.14),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0),rgba(56,189,248,0.08))]" />
        <motion.div
          className={`pointer-events-none absolute left-[-18%] top-8 h-px w-[58%] bg-linear-to-r ${accentClasses.beam}`}
          animate={{ x: ["0%", "245%"], opacity: [0, 1, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <motion.div
              className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${accentClasses.ring} ${accentClasses.soft}`}
              animate={isActive ? { y: [0, -4, 0], rotate: [-3, 3, -3] } : {}}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {isActive && (
                <motion.span
                  className="absolute inset-0 rounded-xl border border-emerald-300/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <Satellite className={`h-7 w-7 ${accentClasses.icon}`} />
            </motion.div>

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">
                {satellite.name}
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-slate-400">
                {satellite.code}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${accentClasses.ring} ${accentClasses.soft} ${accentClasses.text}`}
          >
            {satellite.visibilityStatus}
          </span>
        </div>

        <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-3">
          <StatusMetric
            icon={<TimerReset className="h-4 w-4" />}
            label="Visibility"
            value={satellite.visibilityRemaining}
            accentClassName={accentClasses.text}
          />
          <StatusMetric
            icon={<Wifi className="h-4 w-4" />}
            label="Communication"
            value={satellite.communicationStatus}
            accentClassName={accentClasses.text}
          />
          <StatusMetric
            icon={<SignalHigh className="h-4 w-4" />}
            label="Link"
            value={isActive ? "Locked" : "Standby"}
            accentClassName={accentClasses.text}
          />
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-950/45 px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio className={`h-4 w-4 ${accentClasses.icon}`} />
            <span>Synced with dashboard visibility zone</span>
          </div>
          <motion.span
            className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-300" : "bg-yellow-300"}`}
            animate={{ opacity: [0.45, 1, 0.45], scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-yellow-500/80">
        <Lock className="w-3 h-3" />
        Satellite locked to current visibility zone
      </p>
    </Field>
  )
}

type StatusMetricProps = {
  icon: ReactNode
  label: string
  value: string
  accentClassName: string
}

function StatusMetric({
  icon,
  label,
  value,
  accentClassName,
}: StatusMetricProps) {
  return (
    <div className="rounded-lg border border-slate-700/70 bg-slate-950/45 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-slate-500">
        <span className={accentClassName}>{icon}</span>
        {label}
      </div>
      <p className={`truncate font-mono text-sm font-semibold ${accentClassName}`}>
        {value}
      </p>
    </div>
  )
}

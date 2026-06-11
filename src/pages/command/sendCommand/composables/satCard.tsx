"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { Lock, Satellite } from "lucide-react"

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
  const isActive = satellite.communicationStatus === "active";

  return (
    <>
    <Field>
      <FieldLabel className="text-sm font-semibold text-gray-300">
        Target Satellite (Auto-Linked)
      </FieldLabel>

      <div
        className={`rounded-lg border bg-[#0B1220] p-4 ${
          isActive ? "border-green-500/40" : "border-yellow-500/40"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Satellite
              className={`w-5 h-5 ${
                isActive ? "text-green-400" : "text-yellow-400"
              }`}
            />
            <div>
              <p className="font-semibold text-white">
                {satellite.name}
              </p>
              <p className="text-xs text-gray-400">
                {satellite.code}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 text-xs font-semibold border rounded-full ${
              isActive
                ? "border-green-500/40 text-green-400"
                : "border-yellow-500/40 text-yellow-400"
            }`}
          >
            {satellite.visibilityStatus}
          </span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-400">
            Visibility Remaining
          </span>

          <div className="flex items-center gap-4">
            <span
              className={`font-mono font-semibold ${
                isActive ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {satellite.visibilityRemaining}
            </span>

            <span className="text-sm text-gray-300">
              Communication
            </span>

            <span
              className={`px-2 py-0.5 text-xs rounded-full border ${
                isActive
                  ? "border-green-500/40 bg-green-500/20 text-green-400"
                  : "border-yellow-500/40 bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {satellite.communicationStatus}
            </span>
          </div>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-yellow-500/80 mt-1">
        <Lock className="w-3 h-3" />
        Satellite locked to current visibility zone
      </p>
    </Field>
    </>
  )
}

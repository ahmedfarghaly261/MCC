import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Crosshair,
} from "lucide-react";

type MissionBootTransitionProps = {
  onComplete: () => void;
  durationMs?: number;
};

type Phase = 1 | 2 | 3;

const TELEMETRY = [
  "LAT 29.987 N",
  "LON 31.211 E",
  "ALT 512 KM",
  "VEL 7.62 KM/S",
  "AZ 213.8 DEG",
  "EL 47.3 DEG",
];

const STARS = Array.from({ length: 72 }, (_, index) => ({
  id: index,
  left: `${(index * 23 + 9) % 100}%`,
  top: `${(index * 41 + 13) % 92}%`,
  delay: (index % 9) * 0.14,
  size: index % 8 === 0 ? 2 : 1,
}));

const PACKETS = Array.from({ length: 9 }, (_, index) => index);
const CLOUDS = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  left: `${8 + index * 12}%`,
  top: `${52 + (index % 3) * 8}%`,
  width: 120 + (index % 4) * 46,
  delay: index * 0.18,
  opacity: 0.18 + (index % 3) * 0.08,
}));

function getPhase(progress: number): Phase {
  if (progress < 34) {
    return 1;
  }

  if (progress < 70) {
    return 2;
  }

  return 3;
}

export default function MissionBootTransition({
  onComplete,
  durationMs = 6200,
}: MissionBootTransitionProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min(100, (elapsed / durationMs) * 100));
    }, 40);

    const exitTimerId = window.setTimeout(() => {
      setIsExiting(true);
    }, Math.max(0, durationMs - 520));

    const completeTimerId = window.setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(exitTimerId);
      window.clearTimeout(completeTimerId);
    };
  }, [durationMs, onComplete]);

  const phase = getPhase(progress);
  const telemetryShift = useMemo(
    () => Math.floor(progress * 17),
    [progress],
  );

  return (
    <motion.div
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#02040b] text-white"
      initial={{ opacity: 0 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        scale: isExiting ? 1.04 : 1,
      }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <DeepSpaceBackground phase={phase} />
      <EarthApproach phase={phase} />
      <AtmosphereClouds phase={phase} />
      <OrbitSystem phase={phase} />
      <SignalBeam phase={phase} />
      <GroundStation phase={phase} />
      <TelemetryLayer progress={progress} shift={telemetryShift} />
      <PhaseHud phase={phase} progress={progress} />

      {phase === 3 && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(103,232,249,0.34),transparent_38%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.08] }}
          transition={{ duration: 0.95, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
}

function DeepSpaceBackground({ phase }: { phase: Phase }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(14,165,233,0.24),transparent_28%),radial-gradient(circle_at_22%_30%,rgba(59,130,246,0.14),transparent_26%),linear-gradient(180deg,#02040b_0%,#06101f_58%,#01030a_100%)]"
        animate={{
          filter:
            phase === 3
              ? "brightness(1.34) saturate(1.18)"
              : phase === 2
              ? "brightness(1.12) saturate(1.08)"
              : "brightness(1) saturate(1)",
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:84px_84px] opacity-30 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      {STARS.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-cyan-100"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.25],
            scale: phase === 2 ? [1, 1.8, 1] : [0.85, 1.25, 0.85],
            y: phase === 2 ? [0, 16] : [0, 0],
          }}
          transition={{
            duration: phase === 2 ? 1.15 : 2.7,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

function EarthApproach({ phase }: { phase: Phase }) {
  return (
    <motion.div
      className="absolute left-1/2 rounded-[100%] border border-cyan-200/25 bg-[radial-gradient(circle_at_50%_0%,rgba(125,211,252,0.55),rgba(14,165,233,0.18)_30%,rgba(15,23,42,0.96)_65%)] shadow-[0_-40px_130px_rgba(14,165,233,0.28)]"
      initial={false}
      animate={{
        bottom: phase === 1 ? "-60%" : phase === 2 ? "-35%" : "-16%",
        width: phase === 1 ? "46vw" : phase === 2 ? "94vw" : "136vw",
        height: phase === 1 ? "27vw" : phase === 2 ? "53vw" : "74vw",
        x: "-50%",
        opacity: phase === 1 ? 0.72 : 1,
        filter:
          phase === 3
            ? "drop-shadow(0 -34px 94px rgba(103,232,249,0.5))"
            : "drop-shadow(0 -16px 46px rgba(14,165,233,0.28))",
      }}
      transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-x-[8%] top-[10%] h-px bg-cyan-200/25" />
      <div className="absolute inset-x-[18%] top-[18%] h-px bg-cyan-200/15" />
      <div className="absolute inset-x-[4%] top-[2%] h-12 rounded-[100%] bg-cyan-100/10 blur-xl" />
      <motion.div
        className="absolute left-[44%] top-[11%] h-2 w-24 rounded-full bg-cyan-200/35 blur-md"
        animate={{ opacity: [0.25, 0.85, 0.25], x: [-18, 18, -18] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function AtmosphereClouds({ phase }: { phase: Phase }) {
  const visible = phase === 3;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 42,
        scale: visible ? 1 : 0.96,
      }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-x-0 bottom-[16%] h-40 bg-[linear-gradient(180deg,transparent,rgba(186,230,253,0.08),rgba(14,165,233,0.1),transparent)] blur-sm" />
      {CLOUDS.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute rounded-full bg-white blur-2xl"
          style={{
            left: cloud.left,
            top: cloud.top,
            width: cloud.width,
            height: cloud.width * 0.32,
            opacity: cloud.opacity,
          }}
          animate={{
            x: [-28, 36, -28],
            scale: [0.96, 1.08, 0.96],
            opacity: [cloud.opacity * 0.72, cloud.opacity, cloud.opacity * 0.72],
          }}
          transition={{
            duration: 4.8 + cloud.id * 0.35,
            repeat: Infinity,
            delay: cloud.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-[47%] h-24 w-24 -translate-x-1/2 rounded-full bg-cyan-200/20 blur-2xl"
        animate={{ scale: [0.8, 1.8, 1.05], opacity: [0, 0.68, 0.18] }}
        transition={{ duration: 1.25, ease: "easeOut" }}
      />
    </motion.div>
  );
}

function OrbitSystem({ phase }: { phase: Phase }) {
  return (
    <motion.div
      className="absolute left-1/2 top-[27%] h-64 w-64 -translate-x-1/2 -translate-y-1/2"
      animate={{
        top: phase === 1 ? "31%" : phase === 2 ? "22%" : "42%",
        scale: phase === 1 ? 1.15 : phase === 2 ? 0.84 : 0.28,
        opacity: phase === 3 ? 0.82 : 1,
      }}
      transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full border border-cyan-300/20"
          style={{
            transform: `rotate(${ring * 26}deg) scale(${1 + ring * 0.18})`,
          }}
          animate={{ rotate: [ring * 26, ring * 26 + 360] }}
          transition={{
            duration: 5 + ring * 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          x: phase === 1 ? [-18, 18, -18] : phase === 2 ? [0, 10, 0] : [0, -6, 0],
          y: phase === 1 ? [8, -10, 8] : phase === 2 ? [0, -8, 0] : [0, 8, 0],
          rotate: phase === 3 ? [2, -4, 2] : [-7, 8, -7],
        }}
        transition={{ duration: phase === 3 ? 1.9 : 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <SatelliteModel close={phase === 1} />
      </motion.div>
    </motion.div>
  );
}

function SatelliteModel({ close }: { close: boolean }) {
  return (
    <div
      className={`relative ${close ? "scale-125" : "scale-95"} transition-transform duration-1000`}
    >
      <div className="absolute inset-[-18px] rounded-full bg-cyan-300/15 blur-2xl" />
      <svg className="relative h-28 w-56 drop-shadow-[0_0_30px_rgba(34,211,238,0.55)]" viewBox="0 0 224 112" fill="none">
        <defs>
          <linearGradient id="bootPanel" x1="18" x2="82" y1="34" y2="58">
            <stop stopColor="#0f172a" />
            <stop offset="0.48" stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="bootBody" x1="92" x2="132" y1="34" y2="78">
            <stop stopColor="#f8fafc" />
            <stop offset="0.55" stopColor="#94a3b8" />
            <stop offset="1" stopColor="#334155" />
          </linearGradient>
        </defs>
        <motion.rect
          x="18"
          y="35"
          width="68"
          height="28"
          fill="url(#bootPanel)"
          stroke="#67e8f9"
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.rect
          x="138"
          y="35"
          width="68"
          height="28"
          fill="url(#bootPanel)"
          stroke="#67e8f9"
          animate={{ opacity: [1, 0.65, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <path d="M86 49H96M128 49H138" stroke="#cbd5e1" strokeWidth="3" />
        <rect x="96" y="31" width="32" height="38" rx="5" fill="url(#bootBody)" stroke="#e2e8f0" />
        <circle cx="112" cy="50" r="8" fill="#020617" stroke="#67e8f9" />
        <circle cx="112" cy="50" r="3" fill="#67e8f9" />
        <path d="M112 31V16" stroke="#f8fafc" strokeLinecap="round" />
        <circle cx="112" cy="13" r="3" fill="#67e8f9" />
        <path d="M101 69L92 88H132L123 69" fill="#475569" stroke="#94a3b8" />
      </svg>
    </div>
  );
}

function SignalBeam({ phase }: { phase: Phase }) {
  const visible = phase >= 2;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.45 }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 700" preserveAspectRatio="none">
        <defs>
          <linearGradient id="descentBeam" x1="500" y1="120" x2="500" y2="650" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67e8f9" stopOpacity="0.1" />
            <stop offset="0.42" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="1" stopColor="#86efac" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <motion.path
          d="M500 130 C540 260 526 410 500 650"
          fill="none"
          stroke="url(#descentBeam)"
          strokeWidth={phase === 3 ? 12 : 8}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: visible ? 1 : 0 }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        />
        <path
          d="M500 130 C540 260 526 410 500 650"
          fill="none"
          stroke="rgba(103,232,249,0.12)"
          strokeWidth={phase === 3 ? 58 : 42}
          strokeLinecap="round"
        />
      </svg>

      {PACKETS.map((packet) => (
        <motion.span
          key={packet}
          className="absolute left-1/2 top-[17%] h-1.5 w-5 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.9)]"
          animate={{
            y: visible ? ["0vh", phase === 3 ? "64vh" : "58vh"] : "0vh",
            x: ["-8px", "18px", "-4px"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: phase === 3 ? 0.95 : 1.15,
            repeat: Infinity,
            delay: packet * 0.14,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

function GroundStation({ phase }: { phase: Phase }) {
  const visible = phase === 3;

  return (
    <motion.div
      className="absolute bottom-[12%] left-1/2 z-20 -translate-x-1/2"
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 40,
        scale: visible ? 1 : 0.82,
      }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <GroundStationDish />
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute left-1/2 top-14 h-14 w-14 -translate-x-1/2 rounded-full border border-cyan-200/35"
          animate={{ scale: [0.2, 3.5], opacity: [0.9, 0] }}
          transition={{
            duration: 1.9,
            repeat: Infinity,
            delay: ring * 0.34,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}

function GroundStationDish() {
  return (
    <svg className="h-32 w-40 drop-shadow-[0_0_26px_rgba(34,211,238,0.5)]" viewBox="0 0 160 128" fill="none">
      <path
        d="M42 50C56 20 104 16 128 42C104 76 66 78 42 50Z"
        fill="url(#dishBoot)"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <path d="M62 66L74 100" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
      <path d="M48 108H112L98 98H64L48 108Z" fill="#475569" stroke="#94a3b8" />
      <path d="M36 116H122" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
      <path d="M76 55L132 20" stroke="#67e8f9" strokeWidth="2" />
      <circle cx="76" cy="55" r="5" fill="#22d3ee" />
      <defs>
        <linearGradient id="dishBoot" x1="42" x2="128" y1="24" y2="64">
          <stop stopColor="#f8fafc" />
          <stop offset="0.52" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TelemetryLayer({
  progress,
  shift,
}: {
  progress: number;
  shift: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 hidden p-5 font-mono text-[11px] uppercase tracking-[0.12em] text-cyan-200/75 sm:block">
      <div className="absolute left-5 top-5 space-y-2">
        {TELEMETRY.slice(0, 3).map((item, index) => (
          <motion.p
            key={item}
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.3, repeat: Infinity, delay: index * 0.18 }}
          >
            {item} +{(shift + index * 7).toString().padStart(4, "0")}
          </motion.p>
        ))}
      </div>

      <div className="absolute right-5 top-5 space-y-2 text-right">
        {TELEMETRY.slice(3).map((item, index) => (
          <motion.p
            key={item}
            animate={{ opacity: [1, 0.42, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.2 }}
          >
            {item} / {(progress + index * 13).toFixed(1)}
          </motion.p>
        ))}
      </div>

      <div className="absolute bottom-5 left-5 flex items-center gap-2 text-emerald-300">
        <Crosshair className="h-4 w-4" />
        TRACKING VECTOR STABLE
      </div>
    </div>
  );
}

function PhaseHud({
  phase,
  progress,
}: {
  phase: Phase;
  progress: number;
}) {
  const title =
    phase === 1
      ? "ORBIT ACCESS"
      : phase === 2
      ? "SIGNAL DESCENT"
      : "GROUND STATION LOCK";

  const lines =
    phase === 1
      ? ["AUTHENTICATION VERIFIED"]
      : phase === 2
      ? ["SATELLITE LINK ACQUIRED", "ORBITAL SIGNAL LOCKED"]
      : ["MCC CONNECTION ESTABLISHED"];

  return (
    <div className="absolute inset-x-0 bottom-8 z-40 mx-auto w-[min(92vw,920px)]">
      <motion.div
        className="rounded-2xl border border-cyan-300/20 bg-slate-950/58 p-4 shadow-[0_0_70px_rgba(14,165,233,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-5"
        animate={{
          y: phase === 3 ? -8 : 0,
          borderColor:
            phase === 3 ? "rgba(103,232,249,0.42)" : "rgba(103,232,249,0.2)",
        }}
        transition={{ duration: 0.65, ease: "easeInOut" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              PHASE {phase}
            </p>
            <h1 className="mt-1 text-2xl font-bold uppercase tracking-[0.08em] text-white sm:text-4xl">
              {title}
            </h1>
          </div>
          <div className="grid gap-2 font-mono text-xs text-emerald-300 sm:text-right">
            {lines.map((line) => (
              <motion.span
                key={line}
                className="inline-flex items-center gap-2 sm:justify-end"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
              >
                <CheckCircle2 className="h-4 w-4" />
                {line}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-cyan-300 via-blue-400 to-emerald-300 shadow-[0_0_24px_rgba(34,211,238,0.72)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            ["SIG", "98%"],
            ["U/L", "ONLINE"],
            ["D/L", "SYNC"],
            ["LOCK", `${Math.min(100, Math.round(progress + 8))}%`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-cyan-300/12 bg-slate-900/58 px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                {label}
              </p>
              <p className="mt-1 font-mono text-xs font-semibold text-cyan-100 sm:text-sm">
                {value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

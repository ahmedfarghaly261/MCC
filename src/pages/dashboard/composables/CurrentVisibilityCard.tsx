import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Clock3,
  Eye,
  Hourglass,
  Radio,
  ShieldCheck,
  Signal,
  SignalHigh,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CurrentVisibility } from "../types/dashboard.types";

type CurrentVisibilityCardProps = {
  data: CurrentVisibility;
};

type Metric = {
  label: string;
  value: string;
  icon: LucideIcon;
  progress?: number;
};

type Telemetry = {
  label: string;
  value: string;
  icon?: LucideIcon;
  accent: "green" | "blue" | "purple";
  sparkline?: number[];
  gauge?: number;
};

export type TrackedSatellite = {
  name: string;
  code: string;
  orbit: string;
  altitude: string;
  inclination: string;
  velocity: string;
  mission: string;
  station: {
    code: string;
    location: string;
  };
  passDurationSeconds: number;
  signalPower: number;
  telemetry: Telemetry[];
};

export type VisibilityData = {
  isInZone: boolean;
  activeSatellite: TrackedSatellite;
  nextSatellite: TrackedSatellite;
  pass: {
    enteredZone: string;
    remainingTime: string;
    remainingPercent: number;
    signalPower: number;
    nextPass: string;
    aosIn: string;
    maxDuration: string;
  };
  telemetry: Telemetry[];
};

const SATELLITES: TrackedSatellite[] = [
  {
    name: "EGSACUB-ED",
    code: "EGSACUB-ED",
    orbit: "LEO",
    altitude: "512 KM",
    inclination: "51.6 DEG",
    velocity: "7.62 KM/S",
    mission: "Educational CubeSat",
    station: {
      code: "GS-02",
      location: "Cairo, Egypt",
    },
    passDurationSeconds: 583,
    signalPower: 82,
    telemetry: [
      {
        label: "Downlink Rate",
        value: "125.4 Mbps",
        accent: "green",
        sparkline: [18, 20, 19, 26, 21, 34, 29, 37, 31, 48, 22, 43],
      },
      {
        label: "Uplink Rate",
        value: "32.7 Mbps",
        accent: "blue",
        sparkline: [15, 22, 17, 28, 19, 31, 23, 34, 20, 29, 25, 32],
      },
      {
        label: "Latency",
        value: "24 ms",
        accent: "purple",
        sparkline: [28, 22, 31, 24, 35, 27, 40, 25, 37, 21, 33, 30],
      },
      {
        label: "Elevation",
        value: "47.3 deg",
        accent: "blue",
        gauge: 63,
      },
      {
        label: "Azimuth",
        value: "213.8 deg",
        accent: "green",
        gauge: 72,
      },
      {
        label: "Link Quality",
        value: "Good",
        accent: "green",
        icon: ShieldCheck,
      },
    ],
  },
  {
    name: "FUNcube-1",
    code: "AO-73",
    orbit: "LEO",
    altitude: "635 KM",
    inclination: "97.8 DEG",
    velocity: "7.54 KM/S",
    mission: "Amateur Radio Education",
    station: {
      code: "GS-01",
      location: "Cairo, Egypt",
    },
    passDurationSeconds: 501,
    signalPower: 79,
    telemetry: [
      {
        label: "Downlink Rate",
        value: "112.8 Mbps",
        accent: "green",
        sparkline: [16, 19, 18, 25, 23, 31, 28, 35, 30, 41, 26, 37],
      },
      {
        label: "Uplink Rate",
        value: "29.6 Mbps",
        accent: "blue",
        sparkline: [13, 20, 16, 24, 18, 28, 22, 30, 21, 27, 24, 31],
      },
      {
        label: "Latency",
        value: "28 ms",
        accent: "purple",
        sparkline: [30, 24, 34, 26, 37, 29, 39, 27, 36, 25, 33, 29],
      },
      {
        label: "Elevation",
        value: "43.8 deg",
        accent: "blue",
        gauge: 58,
      },
      {
        label: "Azimuth",
        value: "198.6 deg",
        accent: "green",
        gauge: 66,
      },
      {
        label: "Link Quality",
        value: "Good",
        accent: "green",
        icon: ShieldCheck,
      },
    ],
  },
];

const INITIAL_REMAINING_SECONDS = 495;
const VISUAL_WIDTH = 640;
const VISUAL_HEIGHT = 360;
const satellitePoint = { x: 345, y: 68 };
const dishPoint = { x: 284, y: 247 };
const stationBasePoint = { x: 284, y: 292 };
const CYCLE_START_MS =
  Date.now() -
  (SATELLITES[0].passDurationSeconds - INITIAL_REMAINING_SECONDS) * 1000;

export default function CurrentVisibilityCard({
  data,
}: CurrentVisibilityCardProps) {
  void data;

  return <SatelliteVisibilityZone />;
}

function SatelliteVisibilityZone() {
  const data = useSatelliteVisibilityCycle();

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#020713] p-3 text-white shadow-[0_0_70px_rgba(14,165,233,0.13),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="relative rounded-xl border border-cyan-300/15 bg-[radial-gradient(circle_at_17%_8%,rgba(20,184,166,0.2),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(59,130,246,0.14),transparent_30%),linear-gradient(180deg,rgba(8,18,34,0.96),rgba(1,6,16,0.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
        <StarField />

        <header className="relative z-10 flex flex-col gap-4 border-b border-cyan-400/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-slate-100 sm:text-3xl">
              Satellite Visibility Zone
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Real-time visibility and link status between satellite and ground
              station
            </p>
          </div>

          <StatusBadge
            dotClassName="bg-green-400 shadow-[0_0_18px_rgba(74,222,128,0.9)]"
            label="System Status"
            value="Nominal"
          />
        </header>

        <div className="relative z-10 mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(360px,1fr)]">
          <ActivePassVisualization data={data} />
          <OutOfZoneVisualization data={data} />
        </div>

        <SummaryStrip data={data} />
      </div>
    </section>
  );
}

export function useSatelliteVisibilityCycle() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  return useMemo(() => buildVisibilityData(now), [now]);
}

function buildVisibilityData(now: number): VisibilityData {
  const totalCycleSeconds = SATELLITES.reduce(
    (total, satellite) => total + satellite.passDurationSeconds,
    0,
  );
  let elapsedInCycle = Math.floor((now - CYCLE_START_MS) / 1000);
  elapsedInCycle =
    ((elapsedInCycle % totalCycleSeconds) + totalCycleSeconds) %
    totalCycleSeconds;

  let activeIndex = 0;
  let elapsedInPass = elapsedInCycle;

  for (let index = 0; index < SATELLITES.length; index += 1) {
    const duration = SATELLITES[index].passDurationSeconds;

    if (elapsedInPass < duration) {
      activeIndex = index;
      break;
    }

    elapsedInPass -= duration;
  }

  const activeSatellite = SATELLITES[activeIndex];
  const nextSatellite = SATELLITES[(activeIndex + 1) % SATELLITES.length];
  const remainingSeconds =
    activeSatellite.passDurationSeconds - elapsedInPass;
  const passStartedAt = now - elapsedInPass * 1000;
  const nextPassAt = now + remainingSeconds * 1000;

  return {
    isInZone: true,
    activeSatellite,
    nextSatellite,
    pass: {
      enteredZone: `${formatUtcTime(passStartedAt)} UTC`,
      remainingTime: formatCountdown(remainingSeconds),
      remainingPercent:
        (remainingSeconds / activeSatellite.passDurationSeconds) * 100,
      signalPower: activeSatellite.signalPower,
      nextPass: `${formatUtcTime(nextPassAt)} UTC`,
      aosIn: formatCountdown(remainingSeconds),
      maxDuration: formatCountdown(nextSatellite.passDurationSeconds),
    },
    telemetry: activeSatellite.telemetry,
  };
}

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m`;
  }

  return `${minutes.toString().padStart(2, "0")}m ${seconds
    .toString()
    .padStart(2, "0")}s`;
}

function formatUtcTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(timestamp);
}

function ActivePassVisualization({ data }: { data: VisibilityData }) {
  const metrics: Metric[] = [
    {
      label: "Entered Zone",
      value: data.pass.enteredZone,
      icon: Clock3,
    },
    {
      label: "Remaining Time",
      value: data.pass.remainingTime,
      icon: Hourglass,
      progress: data.pass.remainingPercent,
    },
    {
      label: "Signal Power",
      value: `${data.pass.signalPower}%`,
      icon: SignalHigh,
      progress: data.pass.signalPower,
    },
    {
      label: "Next Pass",
      value: data.pass.nextPass,
      icon: Calendar,
    },
  ];

  return (
    <Card
      className={cn(
        "relative min-h-[620px] overflow-hidden rounded-xl border bg-[linear-gradient(145deg,rgba(3,16,29,0.96),rgba(2,8,18,0.96))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        data.isInZone
          ? "border-green-300/45 shadow-[0_0_42px_rgba(34,197,94,0.15),0_0_90px_rgba(14,165,233,0.08)]"
          : "border-slate-700/70 opacity-75",
      )}
    >
      <CardContent className="relative h-full min-h-[620px] p-4 sm:p-5">
        <div className="relative z-30 flex items-start justify-between gap-3">
          <PanelTitle active={data.isInZone} title="Current Pass" subtitle="In View" />
          <StatusBadge
            className={data.isInZone ? "" : "opacity-40"}
            dotClassName="bg-green-400"
            icon={Signal}
            label=""
            value={data.isInZone ? "Link Active" : "Standby"}
          />
        </div>

        <div className="relative z-20 mt-4 grid gap-4 lg:grid-cols-[236px_minmax(0,1fr)]">
          <div className="space-y-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>

          <ActivePassScene data={data} />
        </div>

        <div className="relative z-30 mt-4 grid gap-0 overflow-hidden rounded-xl border border-cyan-400/20 bg-[#061629]/90 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {data.telemetry.map((telemetry) => (
            <TelemetryCard key={telemetry.label} telemetry={telemetry} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivePassScene({ data }: { data: VisibilityData }) {
  const satelliteLeft = `${(satellitePoint.x / VISUAL_WIDTH) * 100}%`;
  const satelliteTop = `${(satellitePoint.y / VISUAL_HEIGHT) * 100}%`;

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_18%,rgba(56,189,248,0.22),transparent_28%),radial-gradient(circle_at_50%_68%,rgba(34,197,94,0.12),transparent_42%),linear-gradient(180deg,rgba(2,8,23,0.48),rgba(2,6,23,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <EarthHorizon />
      <CoverageDome enabled={data.isInZone} />
      <SignalBeam enabled={data.isInZone} />
      <GroundStationLabel data={data} />
      <SatelliteLabel data={data} />
      <motion.div
        className="absolute z-30 origin-center drop-shadow-[0_0_24px_rgba(96,165,250,0.48)]"
        style={{ left: satelliteLeft, top: satelliteTop }}
        animate={{
          x: data.isInZone ? [-5, 6, 9, -3, -5] : 0,
          y: data.isInZone ? [3, -5, -2, 4, 3] : 0,
          rotate: data.isInZone ? [-9, -5, -3, -8, -9] : -8,
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div style={{ transform: "translate(-88px, -40px)" }}>
          <SatelliteGraphic />
        </div>
      </motion.div>
    </div>
  );
}

function OutOfZoneVisualization({ data }: { data: VisibilityData }) {
  return (
    <Card
      className={cn(
        "relative min-h-[620px] overflow-hidden rounded-xl border bg-[radial-gradient(circle_at_50%_24%,rgba(30,64,175,0.18),transparent_36%),linear-gradient(145deg,rgba(3,11,22,0.96),rgba(2,6,16,0.98))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        data.isInZone
          ? "border-slate-600/70"
          : "border-blue-400/45 shadow-[0_0_34px_rgba(59,130,246,0.12)]",
      )}
    >
      <CardContent className="relative flex h-full min-h-[620px] flex-col p-4 sm:p-5">
        <div className="relative z-20 flex items-start justify-between gap-3">
          <PanelTitle
            active={!data.isInZone}
            title={data.nextSatellite.name}
            subtitle="Out of Zone"
          />
          <StatusBadge
            className="border-slate-500/25 bg-slate-900/70 text-slate-300"
            icon={Radio}
            label=""
            value="No Link"
          />
        </div>

        <div className="relative mx-auto mt-8 h-[360px] w-full max-w-[520px]">
          <div className="absolute inset-4 rounded-full bg-sky-500/10 blur-3xl" />
          <svg
            className="absolute left-1/2 top-1/2 h-[290px] w-[460px] -translate-x-1/2 -translate-y-1/2 overflow-visible"
            viewBox="0 0 460 290"
          >
            <ellipse
              cx="230"
              cy="145"
              rx="205"
              ry="95"
              fill="none"
              stroke="rgba(203,213,225,0.36)"
              strokeDasharray="7 8"
              strokeWidth="1.4"
              transform="rotate(-13 230 145)"
            />
            <ellipse
              cx="230"
              cy="145"
              rx="205"
              ry="95"
              fill="none"
              stroke="rgba(56,189,248,0.18)"
              strokeWidth="8"
              transform="rotate(-13 230 145)"
            />
          </svg>
          <EarthGlobe />
          <motion.div
            className="absolute left-1/2 top-1/2 z-30 w-24 origin-[0_0]"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <div className="translate-x-[168px] -translate-y-[34px] rotate-[22deg]">
              <SatelliteGraphic compact />
            </div>
          </motion.div>
        </div>

        <div className="relative z-20 mt-2 text-center">
          <p className="text-sm uppercase tracking-[0.08em] text-slate-300">
            {data.nextSatellite.name} currently out of visibility zone
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Waiting for next pass opportunity
          </p>
        </div>

        <div className="relative z-20 mt-auto grid gap-0 overflow-hidden rounded-xl border border-cyan-400/15 bg-[#061629]/90 sm:grid-cols-3">
          <PassInfo icon={Calendar} label="Next Pass" value={data.pass.nextPass} />
          <PassInfo icon={Clock3} label="AOS In" value={data.pass.aosIn} />
          <PassInfo icon={Eye} label="Max Duration" value={data.pass.maxDuration} />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="rounded-xl border border-cyan-300/18 bg-[linear-gradient(145deg,rgba(15,35,59,0.88),rgba(3,12,25,0.86))] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-sky-300/10 bg-sky-400/10 text-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.12)]">
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">
            {metric.label}
          </p>
          <p className="mt-1 text-2xl font-light text-slate-100">
            {metric.value}
          </p>
        </div>
      </div>

      {typeof metric.progress === "number" ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.55)]">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e,#86efac)] shadow-[0_0_14px_rgba(74,222,128,0.78)]"
            initial={{ width: 0 }}
            animate={{ width: `${metric.progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      ) : null}
    </div>
  );
}

function TelemetryCard({ telemetry }: { telemetry: Telemetry }) {
  const Icon = telemetry.icon;
  const accentClassName = {
    green: "text-green-400",
    blue: "text-sky-400",
    purple: "text-purple-400",
  }[telemetry.accent];

  return (
    <div className="relative min-h-[104px] border-b border-r border-cyan-300/10 bg-[linear-gradient(180deg,rgba(15,35,59,0.42),rgba(2,8,23,0.16))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] last:border-r-0 sm:border-b-0">
      <p className="text-xs uppercase tracking-[0.08em] text-slate-400">
        {telemetry.label}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p
          className={cn(
            "text-lg font-light",
            telemetry.label === "Link Quality" ? accentClassName : "text-white",
          )}
        >
          {telemetry.value}
        </p>
        {Icon ? (
          <div className="rounded-lg border border-green-300/15 bg-green-400/10 p-2 text-green-400 shadow-[0_0_18px_rgba(34,197,94,0.18)]">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      {telemetry.sparkline ? (
        <Sparkline values={telemetry.sparkline} accent={telemetry.accent} />
      ) : null}

      {typeof telemetry.gauge === "number" ? (
        <GaugeDial value={telemetry.gauge} accent={telemetry.accent} />
      ) : null}
    </div>
  );
}

function SummaryStrip({ data }: { data: VisibilityData }) {
  const summary = [
    ["Satellite", data.activeSatellite.name],
    ["Code", data.activeSatellite.code],
    ["Orbit", data.activeSatellite.orbit],
    ["Altitude", data.activeSatellite.altitude],
    ["Inclination", data.activeSatellite.inclination],
    ["Velocity", data.activeSatellite.velocity],
    ["Mission", data.activeSatellite.mission],
  ];

  return (
    <div className="relative z-10 mt-4 grid gap-0 overflow-hidden rounded-xl border border-cyan-400/15 bg-[#061629]/90 md:grid-cols-[repeat(3,minmax(0,1fr))] xl:grid-cols-[repeat(7,minmax(0,1fr))_220px]">
      {summary.map(([label, value]) => (
        <div
          key={label}
          className="border-b border-r border-cyan-400/10 p-4 xl:border-b-0"
        >
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.04em] text-slate-100">
            {value}
          </p>
        </div>
      ))}

      <div className="flex items-center p-4">
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/20 bg-slate-800/80 px-4 text-xs font-medium uppercase tracking-[0.06em] text-slate-100 transition hover:border-cyan-300/45 hover:bg-cyan-400/10">
          View Satellite Details
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Sparkline({
  values,
  accent,
}: {
  values: number[];
  accent: Telemetry["accent"];
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 96;
      const y = 30 - ((value - min) / (max - min || 1)) * 24;
      return `${x},${y}`;
    })
    .join(" ");
  const stroke = {
    green: "#22c55e",
    blue: "#38bdf8",
    purple: "#a855f7",
  }[accent];

  return (
    <svg className="mt-3 h-8 w-full overflow-visible" viewBox="0 0 96 34">
      <motion.polyline
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        points={points}
        initial={{ pathLength: 0, opacity: 0.45 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </svg>
  );
}

function GaugeDial({
  value,
  accent,
}: {
  value: number;
  accent: Telemetry["accent"];
}) {
  const color = {
    green: "#22c55e",
    blue: "#38bdf8",
    purple: "#a855f7",
  }[accent];

  return (
    <div className="absolute right-4 top-8 grid h-12 w-12 place-items-center rounded-full bg-slate-900/60">
      <motion.div
        className="h-12 w-12 rounded-full"
        initial={{
          background: `conic-gradient(${color} 0deg, rgba(71,85,105,0.45) 0deg)`,
        }}
        animate={{
          background: `conic-gradient(${color} ${value * 3.6}deg, rgba(71,85,105,0.45) 0deg)`,
        }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      <div className="absolute h-8 w-8 rounded-full bg-[#061629]" />
      <div className="absolute h-1.5 w-1.5 rounded-full bg-cyan-200" />
    </div>
  );
}

function PassInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-r border-cyan-300/10 bg-[linear-gradient(180deg,rgba(15,35,59,0.38),rgba(2,8,23,0.12))] p-5 last:border-r-0 sm:border-b-0">
      <Icon className="h-5 w-5 text-sky-400" />
      <p className="mt-5 text-xs uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-light text-slate-100">{value}</p>
    </div>
  );
}

function PanelTitle({
  active,
  title,
  subtitle,
}: {
  active: boolean;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-cyan-300/18 bg-slate-950/50 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          active
            ? "bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]"
            : "bg-slate-500",
        )}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-200">
        {title} <span className="text-slate-500">&ndash;</span>{" "}
        <span className="text-slate-400">{subtitle}</span>
      </p>
    </div>
  );
}

function StatusBadge({
  className,
  dotClassName,
  icon: Icon,
  label,
  value,
}: {
  className?: string;
  dotClassName?: string;
  icon?: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-xl border border-green-300/22 bg-green-400/10 px-4 py-3 text-xs uppercase tracking-[0.06em] text-green-300 shadow-[0_0_24px_rgba(34,197,94,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur",
        className,
      )}
    >
      {Icon ? (
        <Icon className="h-4 w-4" />
      ) : (
        <span className={cn("h-2.5 w-2.5 rounded-full", dotClassName)} />
      )}
      {label ? <span className="text-slate-400">{label}</span> : null}
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  );
}

function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-80">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.72)_0_1px,transparent_1.4px),radial-gradient(circle_at_68%_28%,rgba(125,211,252,0.55)_0_1px,transparent_1.5px),radial-gradient(circle_at_84%_63%,rgba(255,255,255,0.44)_0_1px,transparent_1.4px),radial-gradient(circle_at_31%_71%,rgba(255,255,255,0.42)_0_1px,transparent_1.4px),radial-gradient(circle_at_44%_14%,rgba(34,211,238,0.55)_0_1px,transparent_1.6px),radial-gradient(circle_at_76%_82%,rgba(255,255,255,0.35)_0_1px,transparent_1.5px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_28%,rgba(14,165,233,0.18),transparent_26%),radial-gradient(circle_at_74%_18%,rgba(34,197,94,0.1),transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,165,233,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(14,165,233,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
    </div>
  );
}

function EarthHorizon() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="earth-horizon-real absolute inset-0">
        <div className="earth-scene-overlay absolute inset-0" />
        <div className="earth-city-overlay absolute inset-0" />
        <div className="earth-grid-overlay absolute inset-x-[8%] bottom-[2%] h-[42%]" />
      </div>
      <div className="earth-atmosphere-glow absolute inset-x-[-8%] bottom-[30%] h-24 rounded-[100%]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#020617]/88 via-[#020617]/34 to-transparent" />
    </div>
  );
}

function CoverageDome({ enabled }: { enabled: boolean }) {
  const domeLeft = stationBasePoint.x - 175;
  const domeRight = stationBasePoint.x + 175;
  const domeTop = stationBasePoint.y - 110;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox={`0 0 ${VISUAL_WIDTH} ${VISUAL_HEIGHT}`}
    >
      <defs>
        <radialGradient id="coverageDomeFill" cx="50%" cy="100%" r="90%">
          <stop offset="0" stopColor="#22c55e" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#22c55e" stopOpacity="0.12" />
          <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
        <filter id="coverageDomeGlow" x="-30%" y="-40%" width="160%" height="180%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d={`M ${domeLeft} ${stationBasePoint.y} Q ${stationBasePoint.x} ${domeTop} ${domeRight} ${stationBasePoint.y} Z`}
        fill="url(#coverageDomeFill)"
        stroke="rgba(134,239,172,0.58)"
        strokeWidth="1.4"
        filter="url(#coverageDomeGlow)"
        animate={{
          opacity: enabled ? [0.5, 0.9, 0.5] : 0.12,
          scale: enabled ? [1, 1.018, 1] : 1,
        }}
        style={{ transformOrigin: `${stationBasePoint.x}px ${stationBasePoint.y}px` }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {[42, 72, 106].map((radius, index) => (
        <motion.ellipse
          key={radius}
          cx={stationBasePoint.x}
          cy={stationBasePoint.y - 6}
          rx={radius}
          ry={radius * 0.32}
          fill="none"
          stroke="rgba(103,232,249,0.25)"
          strokeWidth="1"
          animate={{
            opacity: enabled ? [0.18, 0.58, 0.18] : 0.08,
            rx: [radius * 0.82, radius, radius * 1.08],
            ry: [radius * 0.24, radius * 0.32, radius * 0.36],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeOut",
            delay: index * 0.22,
          }}
        />
      ))}
    </svg>
  );
}

function SignalBeam({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20">
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${VISUAL_WIDTH} ${VISUAL_HEIGHT}`}
      >
        <defs>
          <linearGradient
            id="activeBeamGradient"
            x1={satellitePoint.x}
            y1={satellitePoint.y}
            x2={dishPoint.x}
            y2={dishPoint.y}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#67e8f9" stopOpacity="0.18" />
            <stop offset="0.44" stopColor="#86efac" stopOpacity="0.95" />
            <stop offset="1" stopColor="#22c55e" stopOpacity="0.22" />
          </linearGradient>
          <filter id="activeBeamGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path
          d={`M ${satellitePoint.x} ${satellitePoint.y} L ${dishPoint.x} ${dishPoint.y}`}
          stroke="url(#activeBeamGradient)"
          strokeLinecap="round"
          strokeWidth="5"
          fill="none"
          filter="url(#activeBeamGlow)"
          animate={{ opacity: [0.55, 1, 0.62] }}
          transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
        />
        <path
          d={`M ${satellitePoint.x} ${satellitePoint.y} L ${dishPoint.x} ${dishPoint.y}`}
          stroke="rgba(187,247,208,0.28)"
          strokeLinecap="round"
          strokeWidth="17"
          fill="none"
          filter="url(#activeBeamGlow)"
        />
        {[0, 1, 2, 3, 4, 5].map((wave) => (
          <motion.ellipse
            key={wave}
            cx="0"
            cy="0"
            rx="34"
            ry="8"
            fill="none"
            stroke="rgba(103,232,249,0.78)"
            strokeWidth="1.6"
            animate={{
              cx: [
                satellitePoint.x,
                satellitePoint.x * 0.75 + dishPoint.x * 0.25,
                satellitePoint.x * 0.5 + dishPoint.x * 0.5,
                satellitePoint.x * 0.25 + dishPoint.x * 0.75,
                dishPoint.x,
              ],
              cy: [
                satellitePoint.y,
                satellitePoint.y * 0.75 + dishPoint.y * 0.25,
                satellitePoint.y * 0.5 + dishPoint.y * 0.5,
                satellitePoint.y * 0.25 + dishPoint.y * 0.75,
                dishPoint.y,
              ],
              rx: [8, 20, 32, 40, 14],
              ry: [3, 6, 8, 10, 4],
              opacity: [0, 0.9, 0.75, 0.2, 0],
            }}
            transition={{
              duration: 2.35,
              delay: wave * 0.24,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
        {[0, 1, 2].map((arc) => (
          <motion.path
            key={arc}
            d={`M ${satellitePoint.x - 28 - arc * 14} ${
              satellitePoint.y + 54 + arc * 42
            } Q ${satellitePoint.x + 26 - arc * 18} ${
              satellitePoint.y + 70 + arc * 42
            } ${satellitePoint.x - 14 - arc * 16} ${
              satellitePoint.y + 92 + arc * 42
            }`}
            fill="none"
            stroke="rgba(34,211,238,0.48)"
            strokeLinecap="round"
            strokeWidth="1.4"
            animate={{ opacity: [0.15, 0.8, 0.15] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: arc * 0.22,
            }}
          />
        ))}
      </svg>
      <motion.div
        className="absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-300/25 blur-xl"
        style={{
          left: `${(dishPoint.x / VISUAL_WIDTH) * 100}%`,
          top: `${(dishPoint.y / VISUAL_HEIGHT) * 100}%`,
        }}
        animate={{ opacity: [0.28, 0.8, 0.28], scale: [0.8, 1.18, 0.8] }}
        transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function GroundStationLabel({ data }: { data: VisibilityData }) {
  return (
    <>
      <div
        className="absolute z-30"
        style={{
          left: `${(dishPoint.x / VISUAL_WIDTH) * 100}%`,
          top: `${(dishPoint.y / VISUAL_HEIGHT) * 100}%`,
          transform: "translate(-59px, -37px)",
        }}
      >
        <GroundStationGraphic />
      </div>
      <div
        className="absolute z-30 rounded-lg border border-cyan-300/20 bg-slate-950/72 px-4 py-3 text-xs shadow-[0_0_22px_rgba(14,165,233,0.16)] backdrop-blur"
        style={{
          left: `${((stationBasePoint.x + 48) / VISUAL_WIDTH) * 100}%`,
          top: `${((stationBasePoint.y - 22) / VISUAL_HEIGHT) * 100}%`,
        }}
      >
        <p className="flex items-center gap-2 font-semibold uppercase tracking-[0.08em] text-slate-100">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Ground Station
        </p>
        <p className="mt-2 uppercase text-slate-400">
          {data.activeSatellite.station.code} &middot;{" "}
          {data.activeSatellite.station.location}
        </p>
      </div>
    </>
  );
}

function SatelliteLabel({ data }: { data: VisibilityData }) {
  return (
    <div
      className="absolute z-30 rounded-lg border border-cyan-300/20 bg-slate-950/68 px-4 py-3 text-xs shadow-[0_0_18px_rgba(14,165,233,0.14)] backdrop-blur"
      style={{
        left: `${((satellitePoint.x + 105) / VISUAL_WIDTH) * 100}%`,
        top: `${((satellitePoint.y + 42) / VISUAL_HEIGHT) * 100}%`,
      }}
    >
      <p className="flex items-center gap-2 font-semibold text-slate-100">
        <span className="h-2 w-2 rounded-full bg-green-400" />
        {data.activeSatellite.name}
      </p>
      <p className="mt-2 text-slate-400">
        {data.activeSatellite.code} &middot; {data.activeSatellite.orbit}{" "}
        &middot; {data.activeSatellite.altitude}
      </p>
      <p className="mt-1 text-slate-400">{data.activeSatellite.velocity}</p>
    </div>
  );
}

function EarthGlobe() {
  return (
    <div className="earth-globe-real absolute left-1/2 top-1/2 z-20 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/45">
      <div className="globe-atmosphere absolute inset-[-10px] rounded-full" />
      <div className="globe-shadow-overlay absolute inset-0 rounded-full" />
      <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent_46%,rgba(255,255,255,0.075)_48%,transparent_50%),linear-gradient(180deg,transparent_48%,rgba(255,255,255,0.065)_50%,transparent_52%)] opacity-70" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_22%_28%,rgba(255,255,255,0.34),transparent_16%),linear-gradient(120deg,rgba(255,255,255,0.15),transparent_32%)]" />
    </div>
  );
}

function SatelliteGraphic({ compact = false }: { compact?: boolean }) {
  const sizeClassName = compact ? "h-12 w-24" : "h-20 w-44";

  return (
    <svg className={sizeClassName} viewBox="0 0 176 80" fill="none">
      <g filter="url(#satelliteGlow)">
        <path
          d="M88 19L99 29L92 35L80 26Z"
          fill="url(#satelliteGold)"
          stroke="#fde68a"
          strokeWidth="0.7"
        />
        <rect
          x="74"
          y="27"
          width="28"
          height="26"
          rx="4"
          fill="url(#satelliteBody)"
          stroke="#94a3b8"
        />
        <path d="M87 53L80 67H98L93 53" fill="#475569" stroke="#94a3b8" />
        <circle cx="88" cy="40" r="6" fill="#020617" stroke="#67e8f9" />
        <circle cx="88" cy="40" r="2" fill="#67e8f9" />
        <rect
          x="16"
          y="24"
          width="52"
          height="18"
          fill="url(#panelLeft)"
          stroke="#60a5fa"
        />
        <rect
          x="108"
          y="24"
          width="52"
          height="18"
          fill="url(#panelRight)"
          stroke="#60a5fa"
        />
        <path d="M68 33H74M102 33H108" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M78 54L67 62M98 54L110 62" stroke="#cbd5e1" strokeLinecap="round" />
        <path d="M89 27V12" stroke="#e2e8f0" strokeLinecap="round" />
        <circle cx="89" cy="10" r="2" fill="#67e8f9" />
        <path d="M28 24V42M42 24V42M56 24V42M120 24V42M134 24V42M148 24V42" stroke="#60a5fa" strokeOpacity="0.5" />
        <path d="M16 33H68M108 33H160" stroke="#60a5fa" strokeOpacity="0.45" />
      </g>
      <defs>
        <linearGradient id="satelliteBody" x1="74" y1="27" x2="102" y2="53" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8fafc" />
          <stop offset="0.58" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="satelliteGold" x1="80" y1="19" x2="99" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="panelLeft" x1="16" y1="24" x2="68" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f172a" />
          <stop offset="0.5" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="panelRight" x1="108" y1="24" x2="160" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f172a" />
          <stop offset="0.5" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <filter id="satelliteGlow" x="0" y="0" width="176" height="80">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#60A5FA" floodOpacity="0.6" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#22D3EE" floodOpacity="0.18" />
        </filter>
      </defs>
    </svg>
  );
}

function GroundStationGraphic() {
  return (
    <svg className="mx-auto h-24 w-28 drop-shadow-[0_0_18px_rgba(34,197,94,0.35)]" viewBox="0 0 112 96" fill="none">
      <defs>
        <linearGradient id="dishMetal" x1="26" y1="18" x2="78" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8fafc" />
          <stop offset="0.46" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
        <radialGradient id="stationGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(56 77) rotate(90) scale(18 36)">
          <stop stopColor="#86efac" stopOpacity="0.45" />
          <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="56" cy="78" rx="36" ry="12" fill="url(#stationGlow)" />
      <path
        d="M28 36C38 14 70 12 86 29C69 51 44 53 28 36Z"
        fill="url(#dishMetal)"
        stroke="#cbd5e1"
        strokeWidth="1.8"
      />
      <path d="M37 36C49 43 66 40 80 29" stroke="#e2e8f0" strokeOpacity="0.55" />
      <path d="M47 42C57 45 67 41 78 31" stroke="#0f172a" strokeOpacity="0.35" />
      <path d="M59 47L52 72" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      <path d="M42 82H75L68 71H49L42 82Z" fill="#475569" stroke="#94a3b8" />
      <path d="M33 87H82" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      <path d="M59 37L88 14" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="59" cy="37" r="4" fill="#22c55e" stroke="#bbf7d0" />
      <motion.path
        d="M80 20Q93 30 84 44"
        stroke="#67e8f9"
        strokeLinecap="round"
        strokeWidth="1.6"
        fill="none"
        animate={{ opacity: [0.25, 0.9, 0.25] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M88 12Q107 30 91 53"
        stroke="#67e8f9"
        strokeLinecap="round"
        strokeWidth="1.2"
        fill="none"
        animate={{ opacity: [0.15, 0.65, 0.15] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
    </svg>
  );
}

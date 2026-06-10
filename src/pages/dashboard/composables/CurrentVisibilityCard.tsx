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

type VisibilityData = {
  isInZone: boolean;
  satellite: {
    name: string;
    orbit: string;
    altitude: string;
    inclination: string;
    velocity: string;
    mission: string;
  };
  station: {
    code: string;
    location: string;
  };
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

const isInZone = true;

const VISIBILITY_DATA: VisibilityData = {
  isInZone,
  satellite: {
    name: "SAT-7A",
    orbit: "LEO",
    altitude: "512 KM",
    inclination: "97.6 deg",
    velocity: "7.62 KM/S",
    mission: "Earth Observation",
  },
  station: {
    code: "GS-01",
    location: "Cairo, Egypt",
  },
  pass: {
    enteredZone: "14:32 UTC",
    remainingTime: "08m 21s",
    remainingPercent: 56,
    signalPower: 82,
    nextPass: "16:07 UTC",
    aosIn: "01h 26m",
    maxDuration: "09m 43s",
  },
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
};

export default function CurrentVisibilityCard({
  data,
}: CurrentVisibilityCardProps) {
  void data;

  return <SatelliteVisibilityZone data={VISIBILITY_DATA} />;
}

function SatelliteVisibilityZone({ data }: { data: VisibilityData }) {
  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-blue-400/20 bg-[#020815] p-3 text-white shadow-[0_0_45px_rgba(14,165,233,0.08)]">
      <div className="relative rounded-xl border border-cyan-400/15 bg-[radial-gradient(circle_at_18%_10%,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,rgba(8,18,34,0.94),rgba(1,6,16,0.96))] p-4 sm:p-6">
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
        "relative min-h-[620px] overflow-hidden rounded-xl border bg-[#03101d]/90 text-white",
        data.isInZone
          ? "border-green-400/45 shadow-[0_0_32px_rgba(34,197,94,0.12)]"
          : "border-slate-700/70 opacity-75",
      )}
    >
      <CardContent className="relative h-full min-h-[620px] p-4 sm:p-5">
        <div className="relative z-30 flex items-start justify-between gap-3">
          <PanelTitle
            active={data.isInZone}
            title="Current Pass"
            subtitle="In View"
          />
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

          <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-cyan-400/10 bg-[radial-gradient(circle_at_50%_28%,rgba(59,130,246,0.16),transparent_34%)]">
            <EarthHorizon />
            <CoverageDome enabled={data.isInZone} />
            <SignalBeam enabled={data.isInZone} />
            <GroundStationLabel data={data} />
            <SatelliteLabel data={data} />
            <motion.div
              className="absolute left-[48%] top-[13%] z-30 w-44 max-w-[42vw] origin-center"
              animate={{
                x: data.isInZone ? [0, 16, -10, 0] : 0,
                y: data.isInZone ? [0, -8, 4, 0] : 0,
                rotate: data.isInZone ? [-8, -4, -11, -8] : -8,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <SatelliteGraphic />
            </motion.div>
          </div>
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

function OutOfZoneVisualization({ data }: { data: VisibilityData }) {
  return (
    <Card
      className={cn(
        "relative min-h-[620px] overflow-hidden rounded-xl border bg-[#030b16]/90 text-white",
        data.isInZone
          ? "border-slate-600/70"
          : "border-blue-400/45 shadow-[0_0_34px_rgba(59,130,246,0.12)]",
      )}
    >
      <CardContent className="relative flex h-full min-h-[620px] flex-col p-4 sm:p-5">
        <div className="relative z-20 flex items-start justify-between gap-3">
          <PanelTitle
            active={!data.isInZone}
            title="Next Pass"
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
          <div className="absolute left-1/2 top-1/2 h-[250px] w-[420px] -translate-x-1/2 -translate-y-1/2 rotate-[-13deg] rounded-[50%] border border-dashed border-slate-400/45" />
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
            Satellite currently out of visibility zone
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
    <div className="rounded-xl border border-cyan-400/15 bg-[#07182a]/85 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-sky-400">
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
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700/70">
          <motion.div
            className="h-full rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.7)]"
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
    <div className="relative min-h-[104px] border-b border-r border-cyan-400/10 p-4 last:border-r-0 sm:border-b-0">
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
          <div className="rounded-lg bg-green-400/10 p-2 text-green-400">
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
    ["Satellite", data.satellite.name],
    ["Orbit", data.satellite.orbit],
    ["Altitude", data.satellite.altitude],
    ["Inclination", data.satellite.inclination],
    ["Velocity", data.satellite.velocity],
    ["Mission", data.satellite.mission],
  ];

  return (
    <div className="relative z-10 mt-4 grid gap-0 overflow-hidden rounded-xl border border-cyan-400/15 bg-[#061629]/90 md:grid-cols-[repeat(3,minmax(0,1fr))] xl:grid-cols-[repeat(6,minmax(0,1fr))_220px]">
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
    <div className="border-b border-r border-cyan-400/10 p-5 last:border-r-0 sm:border-b-0">
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
    <div className="flex items-center gap-3 rounded-lg border border-cyan-400/15 bg-slate-950/40 px-3 py-2">
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
        "inline-flex items-center gap-3 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-xs uppercase tracking-[0.06em] text-green-300",
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
    <div className="pointer-events-none absolute inset-0 opacity-70">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.5)_0_1px,transparent_1px),radial-gradient(circle_at_68%_28%,rgba(125,211,252,0.45)_0_1px,transparent_1px),radial-gradient(circle_at_84%_63%,rgba(255,255,255,0.38)_0_1px,transparent_1px),radial-gradient(circle_at_31%_71%,rgba(255,255,255,0.36)_0_1px,transparent_1px)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:70px_70px]" />
    </div>
  );
}

function EarthHorizon() {
  return (
    <div className="absolute inset-x-[-12%] bottom-[-32%] h-[72%] overflow-hidden rounded-t-[100%]">
      <div className="absolute inset-0 rounded-t-[100%] border-t-2 border-sky-400/70 bg-[radial-gradient(circle_at_55%_24%,rgba(96,165,250,0.55),transparent_4%),radial-gradient(circle_at_62%_40%,rgba(250,204,21,0.62),transparent_2%),radial-gradient(circle_at_73%_35%,rgba(250,204,21,0.58),transparent_2%),radial-gradient(circle_at_42%_52%,rgba(250,204,21,0.48),transparent_2%),linear-gradient(180deg,rgba(45,96,155,0.72),rgba(9,38,63,0.88)_34%,rgba(4,19,35,0.98)_72%)] shadow-[0_-22px_40px_rgba(59,130,246,0.32)]" />
      <div className="absolute inset-x-[12%] top-[32%] h-[42%] rounded-[100%] border border-green-400/18 bg-[linear-gradient(90deg,rgba(34,197,94,0.16)_1px,transparent_1px),linear-gradient(180deg,rgba(34,197,94,0.12)_1px,transparent_1px)] bg-[size:34px_34px]" />
    </div>
  );
}

function CoverageDome({ enabled }: { enabled: boolean }) {
  return (
    <motion.div
      className={cn(
        "absolute bottom-[11%] left-[29%] h-[34%] w-[45%] rounded-t-full border border-green-400/45 bg-green-400/12 shadow-[0_0_42px_rgba(34,197,94,0.28)]",
        !enabled && "opacity-15",
      )}
      animate={{
        opacity: enabled ? [0.48, 0.75, 0.48] : 0.15,
        scale: enabled ? [1, 1.025, 1] : 1,
      }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function SignalBeam({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20">
      <motion.div
        className="absolute left-[49%] top-[25%] h-[245px] w-1 origin-top rotate-[18deg] rounded-full bg-green-300 shadow-[0_0_22px_rgba(74,222,128,0.95)]"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {[0, 1, 2, 3, 4].map((wave) => (
        <motion.div
          key={wave}
          className="absolute left-[49%] top-[29%] h-8 w-20 origin-center -translate-x-1/2 rounded-[50%] border border-cyan-300/70"
          animate={{
            x: [0, -34],
            y: [wave * 20, 160 + wave * 8],
            rotate: [18, 18],
            opacity: [0, 0.9, 0],
            scale: [0.3, 1.2, 0.55],
          }}
          transition={{
            duration: 2.2,
            delay: wave * 0.22,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function GroundStationLabel({ data }: { data: VisibilityData }) {
  return (
    <div className="absolute bottom-[18%] left-[44%] z-30">
      <GroundStationGraphic />
      <div className="mt-2 rounded-lg border border-cyan-400/20 bg-slate-950/70 px-4 py-3 text-xs shadow-[0_0_20px_rgba(14,165,233,0.12)] backdrop-blur">
        <p className="flex items-center gap-2 font-semibold uppercase tracking-[0.08em] text-slate-100">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Ground Station
        </p>
        <p className="mt-2 uppercase text-slate-400">
          {data.station.code} &middot; {data.station.location}
        </p>
      </div>
    </div>
  );
}

function SatelliteLabel({ data }: { data: VisibilityData }) {
  return (
    <div className="absolute right-[8%] top-[28%] z-30 rounded-lg border border-cyan-400/20 bg-slate-950/65 px-4 py-3 text-xs backdrop-blur">
      <p className="flex items-center gap-2 font-semibold text-slate-100">
        <span className="h-2 w-2 rounded-full bg-green-400" />
        {data.satellite.name}
      </p>
      <p className="mt-2 text-slate-400">
        {data.satellite.orbit} &middot; {data.satellite.altitude}
      </p>
      <p className="mt-1 text-slate-400">{data.satellite.velocity}</p>
    </div>
  );
}

function EarthGlobe() {
  return (
    <div className="absolute left-1/2 top-1/2 z-20 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/40 bg-[radial-gradient(circle_at_26%_34%,rgba(255,255,255,0.86),transparent_10%),radial-gradient(circle_at_36%_42%,rgba(59,130,246,0.82),transparent_24%),radial-gradient(circle_at_62%_40%,rgba(34,197,94,0.28),transparent_12%),radial-gradient(circle_at_56%_64%,rgba(15,23,42,0.86),transparent_38%),linear-gradient(135deg,#1d4ed8,#020617_68%)] shadow-[0_0_35px_rgba(96,165,250,0.56)]">
      <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent_46%,rgba(255,255,255,0.08)_48%,transparent_50%),linear-gradient(180deg,transparent_48%,rgba(255,255,255,0.08)_50%,transparent_52%)]" />
      <div className="absolute inset-[18%] rounded-[42%] bg-yellow-300/20 blur-[2px]" />
      <div className="absolute inset-y-0 right-0 w-1/2 rounded-r-full bg-black/36" />
    </div>
  );
}

function SatelliteGraphic({ compact = false }: { compact?: boolean }) {
  const sizeClassName = compact ? "h-12 w-24" : "h-20 w-44";

  return (
    <svg className={sizeClassName} viewBox="0 0 176 80" fill="none">
      <g filter="url(#satelliteGlow)">
        <rect
          x="74"
          y="27"
          width="28"
          height="26"
          rx="4"
          fill="#e5e7eb"
          stroke="#94a3b8"
        />
        <path d="M82 27L91 16L100 27" fill="#f59e0b" />
        <path d="M87 53L82 65H96L93 53" fill="#64748b" />
        <circle cx="88" cy="40" r="5" fill="#0f172a" />
        <rect
          x="16"
          y="24"
          width="52"
          height="18"
          fill="#172554"
          stroke="#60a5fa"
        />
        <rect
          x="108"
          y="24"
          width="52"
          height="18"
          fill="#172554"
          stroke="#60a5fa"
        />
        <path d="M68 33H74M102 33H108" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M28 24V42M42 24V42M56 24V42M120 24V42M134 24V42M148 24V42" stroke="#60a5fa" strokeOpacity="0.5" />
        <path d="M16 33H68M108 33H160" stroke="#60a5fa" strokeOpacity="0.45" />
      </g>
      <defs>
        <filter id="satelliteGlow" x="0" y="0" width="176" height="80">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#60A5FA" floodOpacity="0.45" />
        </filter>
      </defs>
    </svg>
  );
}

function GroundStationGraphic() {
  return (
    <svg className="mx-auto h-20 w-24" viewBox="0 0 96 80" fill="none">
      <path
        d="M28 30C36 13 62 12 73 26C59 41 40 43 28 30Z"
        fill="#cbd5e1"
        stroke="#64748b"
        strokeWidth="2"
      />
      <path d="M51 39L46 58" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
      <path d="M34 66H63L58 58H40L34 66Z" fill="#475569" />
      <path d="M28 70H70" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 31L72 15" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="51" cy="31" r="3" fill="#22c55e" />
    </svg>
  );
}

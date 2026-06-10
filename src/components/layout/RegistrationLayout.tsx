import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Satellite } from "lucide-react";

type RegistrationLayoutProps = {
  children: ReactNode;
};

const STARS = [
  { left: "8%", top: "13%", size: 2, delay: 0.2, duration: 3.2 },
  { left: "17%", top: "72%", size: 1, delay: 1.1, duration: 4.1 },
  { left: "23%", top: "25%", size: 2, delay: 0.7, duration: 3.8 },
  { left: "31%", top: "84%", size: 1, delay: 1.8, duration: 4.4 },
  { left: "43%", top: "11%", size: 1, delay: 0.4, duration: 3.6 },
  { left: "54%", top: "68%", size: 2, delay: 1.4, duration: 4 },
  { left: "61%", top: "20%", size: 1, delay: 0.9, duration: 3.4 },
  { left: "72%", top: "79%", size: 2, delay: 0.1, duration: 4.2 },
  { left: "79%", top: "34%", size: 1, delay: 1.6, duration: 3.7 },
  { left: "89%", top: "16%", size: 2, delay: 0.5, duration: 4.5 },
  { left: "93%", top: "63%", size: 1, delay: 1.2, duration: 3.5 },
  { left: "38%", top: "48%", size: 1, delay: 2, duration: 4.3 },
  { left: "12%", top: "39%", size: 1, delay: 0.8, duration: 3.9 },
  { left: "27%", top: "58%", size: 2, delay: 2.2, duration: 4.6 },
  { left: "48%", top: "31%", size: 1, delay: 1.7, duration: 3.3 },
  { left: "66%", top: "54%", size: 1, delay: 0.3, duration: 4.8 },
  { left: "84%", top: "87%", size: 2, delay: 2.5, duration: 3.6 },
  { left: "96%", top: "42%", size: 1, delay: 1.9, duration: 4.7 },
];

const SIGNALS = [
  { top: "18%", width: "28rem", delay: 0 },
  { top: "46%", width: "34rem", delay: 1.2 },
  { top: "78%", width: "24rem", delay: 2.1 },
];

const SHOOTING_STARS = [
  { left: "6%", top: "21%", delay: 0.5, duration: 5.8 },
  { left: "58%", top: "9%", delay: 2.7, duration: 6.4 },
  { left: "18%", top: "64%", delay: 4.2, duration: 7 },
];

const PINGS = [
  { left: "19%", top: "78%", delay: 0 },
  { left: "82%", top: "24%", delay: 1.4 },
  { left: "68%", top: "68%", delay: 2.6 },
];

const MINI_SATELLITES = [
  {
    left: "11%",
    top: "22%",
    delay: 0.4,
    duration: 12,
    path: { x: [0, 95, 42, 0], y: [0, 32, 78, 0], rotate: [-18, 10, 24, -18] },
  },
  {
    left: "74%",
    top: "70%",
    delay: 2,
    duration: 14,
    path: { x: [0, -86, -28, 0], y: [0, -42, -88, 0], rotate: [18, -16, -32, 18] },
  },
  {
    left: "52%",
    top: "18%",
    delay: 3.4,
    duration: 16,
    path: { x: [0, 58, 116, 0], y: [0, -24, 44, 0], rotate: [8, -10, 18, 8] },
  },
];

const DATA_PARTICLES = [
  { left: "15%", top: "52%", delay: 0.2 },
  { left: "34%", top: "18%", delay: 1.1 },
  { left: "59%", top: "82%", delay: 2.4 },
  { left: "86%", top: "48%", delay: 3.1 },
];

export default function RegistrationLayout({ children }: RegistrationLayoutProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_50%_92%,rgba(34,211,238,0.12),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(15,23,42,0.08),rgba(15,23,42,0.68)_48%,rgba(11,17,32,0.94))]" />
        <motion.div
          className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(59,130,246,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.14)_1px,transparent_1px)] [background-size:72px_72px]"
          animate={reduceMotion ? undefined : { backgroundPosition: ["0px 0px", "72px 72px"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute left-1/2 top-1/2 h-[58rem] w-[58rem] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="h-full w-full rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.18),transparent_22%,transparent_100%)] opacity-60 blur-sm"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10" />
        <div className="absolute left-1/2 top-1/2 h-[31rem] w-[31rem] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="relative h-full w-full rounded-full border border-emerald-400/15"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.9)]" />
            <span className="absolute bottom-8 right-12 h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.85)]" />
          </motion.div>
        </div>
        <div className="absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="relative h-full w-full rounded-full border border-dashed border-cyan-300/15"
            animate={reduceMotion ? undefined : { rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute right-4 top-14 h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_16px_rgba(96,165,250,0.9)]" />
          </motion.div>
        </div>

        {STARS.map((star) => (
          <motion.span
            key={`${star.left}-${star.top}`}
            className="absolute rounded-full bg-slate-100 shadow-[0_0_12px_rgba(226,232,240,0.85)]"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
            }}
            animate={reduceMotion ? undefined : { opacity: [0.25, 1, 0.35], scale: [1, 1.8, 1] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {SIGNALS.map((signal) => (
          <motion.span
            key={signal.top}
            className="absolute -left-24 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent"
            style={{ top: signal.top, width: signal.width }}
            animate={reduceMotion ? undefined : { x: ["0vw", "115vw"], opacity: [0, 0.75, 0] }}
            transition={{
              duration: 7.5,
              delay: signal.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {SHOOTING_STARS.map((star) => (
          <motion.span
            key={`${star.left}-${star.top}`}
            className="absolute"
            style={{ left: star.left, top: star.top }}
            animate={reduceMotion ? undefined : { x: ["0vw", "34vw"], y: [0, 110], opacity: [0, 1, 0] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 4,
            }}
          >
            <span className="block h-px w-44 -rotate-12 bg-gradient-to-r from-transparent via-slate-100/80 to-cyan-300/0 shadow-[0_0_18px_rgba(125,211,252,0.5)]" />
          </motion.span>
        ))}

        {PINGS.map((ping) => (
          <div key={`${ping.left}-${ping.top}`} className="absolute" style={{ left: ping.left, top: ping.top }}>
            {[0, 1, 2].map((ring) => (
              <motion.span
                key={ring}
                className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full border border-emerald-300/35"
                animate={reduceMotion ? undefined : { scale: [0.35, 3.6], opacity: [0.7, 0] }}
                transition={{
                  duration: 3.2,
                  delay: ping.delay + ring * 0.55,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        ))}

        {DATA_PARTICLES.map((particle) => (
          <motion.span
            key={`${particle.left}-${particle.top}`}
            className="absolute hidden h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.85)] sm:block"
            style={{ left: particle.left, top: particle.top }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: [0, 22, -16, 0],
                    y: [0, -28, 18, 0],
                    opacity: [0.15, 1, 0.4, 0.15],
                    scale: [0.8, 1.5, 1, 0.8],
                  }
            }
            transition={{
              duration: 5.5,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {MINI_SATELLITES.map((satellite) => (
          <motion.div
            key={`${satellite.left}-${satellite.top}`}
            className="absolute hidden items-center justify-center text-cyan-100/80 md:flex"
            style={{ left: satellite.left, top: satellite.top }}
            animate={reduceMotion ? undefined : satellite.path}
            transition={{
              duration: satellite.duration,
              delay: satellite.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="absolute h-12 w-12 rounded-full border border-cyan-300/10 bg-cyan-300/5 blur-[1px]" />
            <Satellite className="h-7 w-7 drop-shadow-[0_0_12px_rgba(125,211,252,0.7)]" strokeWidth={1.5} />
            <span className="absolute left-9 top-1/2 h-px w-16 bg-gradient-to-r from-cyan-200/45 to-transparent" />
          </motion.div>
        ))}

        <motion.div
          className="absolute right-[8%] top-[14%] hidden h-24 w-24 items-center justify-center rounded-full border border-blue-300/15 bg-blue-500/10 text-blue-200 shadow-[0_0_40px_rgba(59,130,246,0.24)] backdrop-blur-sm sm:flex"
          animate={reduceMotion ? undefined : { x: [0, -34, 12, 0], y: [0, -18, 22, 0], rotate: [4, -8, 10, 4] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <Satellite className="h-11 w-11" strokeWidth={1.5} />
          <span className="absolute h-36 w-36 rounded-full border border-blue-300/10" />
          <span className="absolute h-48 w-48 rounded-full border border-cyan-300/5" />
          <motion.span
            className="absolute right-20 top-1/2 h-px w-28 bg-gradient-to-l from-blue-200/50 to-transparent"
            animate={reduceMotion ? undefined : { opacity: [0.15, 0.75, 0.15], scaleX: [0.7, 1.2, 0.7] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div
          className="absolute bottom-[12%] left-[8%] hidden h-28 w-28 rounded-full border border-emerald-300/15 bg-emerald-400/10 shadow-[0_0_42px_rgba(16,185,129,0.2)] backdrop-blur-sm md:block"
          animate={reduceMotion ? undefined : { scale: [1, 1.06, 1], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300" />
          <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/20" />
          <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/10" />
        </motion.div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(11,17,32,0.18)_48%,rgba(11,17,32,0.82)_100%)]" />
      </div>

      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </main>
  );
}

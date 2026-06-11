import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { OperationModule } from "../types/dashboard.types";

type MissionControlOperationsProps = {
  modules: OperationModule[];
};

const statusClassName: Record<OperationModule["status"], string> = {
  Online: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  Live: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
  Ready: "border-blue-400/30 bg-blue-500/10 text-blue-300",
  Secured: "border-violet-400/30 bg-violet-500/10 text-violet-300",
  Monitoring: "border-amber-400/30 bg-amber-500/10 text-amber-300",
};

export default function MissionControlOperations({
  modules,
}: MissionControlOperationsProps) {
  const navigate = useNavigate();

  return (
    <section>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Control Hub
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Mission Control Operations
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Access command, telemetry, decoding, and monitoring tools from one
          control hub.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((module, index) => {
          const Icon = module.icon;

          return (
            <motion.button
              key={module.title}
              type="button"
              onClick={() => navigate(module.route)}
              className="group relative overflow-hidden rounded-xl border border-cyan-300/12 bg-slate-950/55 p-5 text-left shadow-[0_18px_44px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur transition-colors hover:border-cyan-300/45 hover:bg-slate-900/70"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.015 }}
              transition={{
                duration: 0.35,
                delay: index * 0.04,
                ease: "easeOut",
              }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(34,211,238,0.18),transparent_32%),linear-gradient(135deg,rgba(59,130,246,0.12),transparent_44%)]" />
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/70 to-transparent" />
              </div>

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
                  <Icon className="h-6 w-6" />
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] ${statusClassName[module.status]}`}
                >
                  {module.status}
                </span>
              </div>

              <div className="relative z-10 mt-5">
                <h3 className="text-base font-semibold text-white">
                  {module.title}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                  {module.description}
                </p>
              </div>

              <div className="relative z-10 mt-5 flex items-center gap-2 text-sm font-medium text-cyan-300">
                <span>Open Module</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

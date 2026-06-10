import { CheckCircle2, Loader2 } from 'lucide-react';

export default function SuccessStep() {
  return (
    <div className="space-y-6 py-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-500/10 shadow-[0_0_42px_rgba(16,185,129,0.22)]">
        <CheckCircle2 className="h-12 w-12 text-emerald-300" strokeWidth={1.6} />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
          Access created
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Account Created</h2>
        <p className="mt-2 text-sm text-slate-400">Preparing your two-factor setup.</p>
      </div>

      <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4">
        <p className="text-sm text-emerald-200">
          Your operator profile is ready. You will be redirected to finish account security.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
        Redirecting...
      </div>
    </div>
  );
}

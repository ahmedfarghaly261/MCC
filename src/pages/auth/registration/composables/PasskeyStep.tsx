import { Fingerprint, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PasskeyStepProps = {
  loading: boolean;
  onCreatePasskey: () => void;
  onSkip: () => void;
};

const BENEFITS = [
  'Resistant to phishing attempts',
  'Works with fingerprint, face, or security key',
  'Keeps operator access fast and passwordless',
];

export default function PasskeyStep({ loading, onCreatePasskey, onSkip }: PasskeyStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-300/30 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.22)]">
          <Fingerprint className="h-11 w-11 text-blue-300" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300/80">
            Passwordless layer
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Secure Your Account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Add a passkey before configuring two-factor authentication.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-400/20 bg-blue-400/10 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-200">
          <KeyRound className="h-4 w-4" />
          Passkey benefits
        </div>
        <ul className="space-y-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onCreatePasskey}
        disabled={loading}
        className="h-12 w-full rounded-lg border border-blue-300/40 bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold text-white shadow-lg shadow-blue-950/40 hover:from-blue-400 hover:to-cyan-400"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Passkey...
          </>
        ) : (
          <>
            <Fingerprint className="mr-2 h-5 w-5" />
            Create Passkey
          </>
        )}
      </Button>

      <button
        onClick={onSkip}
        disabled={loading}
        className="w-full rounded-lg border border-slate-700/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-50"
      >
        Skip for now
      </button>
    </div>
  );
}

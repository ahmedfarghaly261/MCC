import { useState, type FormEvent } from 'react';
import { Loader2, ShieldCheck, RadioTower } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TwoFactorConfirmFormProps {
  loading: boolean;
  error: string | null;
  onSubmit: (code: string) => void;
}

export default function TwoFactorConfirmForm({
  loading,
  error,
  onSubmit,
}: TwoFactorConfirmFormProps) {
  const [code, setCode] = useState('');

  const isValid = /^\d{6}$/.test(code);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-400/10 shadow-[0_0_24px_rgba(16,185,129,0.14)]">
            <RadioTower className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Confirm authenticator code</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>
        </div>

        <Input
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          disabled={loading}
          className="h-16 rounded-xl border-slate-700/80 bg-slate-950/80 text-center font-mono text-3xl tracking-[0.42em] text-white shadow-inner shadow-black/30 placeholder:text-slate-700 placeholder:tracking-[0.42em] focus-visible:border-emerald-300/70 focus-visible:ring-emerald-300/20"
        />

        {error && (
          <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isValid || loading}
        className="h-12 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition-colors hover:from-emerald-400 hover:to-cyan-400"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Confirm and Enable 2FA
          </>
        )}
      </Button>
    </form>
  );
}

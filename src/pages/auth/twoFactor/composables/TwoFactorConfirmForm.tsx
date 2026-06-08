import { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-slate-700 bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Confirm your authenticator code</p>
            <p className="text-xs text-muted-foreground">
              Open your app and enter the 6-digit code shown for this account
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
          className="bg-slate-900 border-slate-700 text-white text-center text-2xl font-mono tracking-[0.5em] h-14 placeholder:tracking-normal"
        />

        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isValid || loading}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying…
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Confirm & Enable 2FA
          </>
        )}
      </Button>
    </form>
  );
}

import { useState, type FormEvent } from 'react';
import { KeyRound, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ConfirmPasswordFormProps {
  loading: boolean;
  error: string | null;
  onSubmit: (password: string) => void;
}

export default function ConfirmPasswordForm({
  loading,
  error,
  onSubmit,
}: ConfirmPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValid = password.length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(password);
  };

  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-400/10 shadow-[0_0_24px_rgba(251,191,36,0.12)]">
          <KeyRound className="h-5 w-5 text-amber-300" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">Confirm your password</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            Re-authenticate before enabling two-factor protection.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <ShieldAlert className="h-4 w-4 text-amber-300" />
            Current password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-12 rounded-lg border-slate-700/80 bg-slate-950/70 pr-11 text-white placeholder:text-slate-600 focus-visible:border-amber-300/70 focus-visible:ring-amber-300/20"
              autoComplete="current-password"
              autoFocus
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition-colors hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={!isValid || loading}
          className="h-12 w-full rounded-lg bg-amber-400 font-semibold text-slate-950 shadow-lg shadow-amber-950/20 transition-colors hover:bg-amber-300"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-4 w-4" />
              Confirm Password
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

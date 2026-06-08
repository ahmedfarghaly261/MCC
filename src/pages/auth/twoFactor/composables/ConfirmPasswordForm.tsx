import { useState } from 'react';
import { KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
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

  const isValid = password.length >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(password);
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20">
          <KeyRound className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Confirm your password</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            For your security, please re-enter your password before enabling
            Two-Factor Authentication.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password input with show/hide toggle */}
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Your current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="bg-slate-900 border-slate-700 text-white h-11 pr-10"
            autoComplete="current-password"
            autoFocus
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <Button
          type="submit"
          disabled={!isValid || loading}
          className="w-full h-11 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming…
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

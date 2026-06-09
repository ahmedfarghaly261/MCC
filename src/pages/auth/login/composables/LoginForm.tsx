import type { FormEvent, ReactNode } from 'react';
import { LogIn, Loader2, Mail, Lock, type LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { LoginFormData } from '../types/login.types';

type LoginFormProps = {
  formData: LoginFormData;
  loading: boolean;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

type FieldProps = {
  icon: LucideIcon;
  label: string;
  required?: boolean;
  children: ReactNode;
};

const inputClassName =
  'h-12 rounded-lg border-slate-700/80 bg-slate-950/70 px-4 text-white shadow-inner shadow-black/20 placeholder:text-slate-600 focus-visible:border-cyan-400/70 focus-visible:ring-cyan-400/20';

function Field({ icon: Icon, label, required = false, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
        <Icon className="h-4 w-4 text-cyan-300" />
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function LoginForm({ formData, loading, onInputChange, onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Secure operator access
        </p>
        <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
        <p className="text-sm text-slate-400">Sign in to your Mission Control operator account.</p>
      </div>

      <Field icon={Mail} label="Email Address" required>
        <Input
          id="login-email"
          type="email"
          placeholder="operator@missioncontrol.space"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className={inputClassName}
          disabled={loading}
          autoComplete="email"
        />
      </Field>

      <Field icon={Lock} label="Password" required>
        <Input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => onInputChange('password', e.target.value)}
          className={inputClassName}
          disabled={loading}
          autoComplete="current-password"
        />
      </Field>

      <Button
        id="login-submit"
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-lg border border-emerald-300/40 bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-slate-950 shadow-lg shadow-cyan-950/40 hover:from-emerald-400 hover:to-cyan-400"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            Sign In
            <LogIn className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

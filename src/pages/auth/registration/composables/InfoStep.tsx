import type { FormEvent, ReactNode } from 'react';
import { UserPlus, Loader2, Mail, User, Lock, type LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { RegisterFormData } from '../types/registration.types';

type InfoStepProps = {
  formData: RegisterFormData;
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

export default function InfoStep({ formData, loading, onInputChange, onSubmit }: InfoStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Secure operator access
        </p>
        <h2 className="text-2xl font-semibold text-white">Create Account</h2>
        <p className="text-sm text-slate-400">Set up your Mission Control operator profile.</p>
      </div>

      <Field icon={User} label="Full Name" required>
        <Input
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          className={inputClassName}
          disabled={loading}
        />
      </Field>

      <Field icon={Mail} label="Email Address" required>
        <Input
          type="email"
          placeholder="operator@missioncontrol.space"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className={inputClassName}
          disabled={loading}
        />
      </Field>

      <Field icon={Lock} label="Password" required>
        <Input
          type="password"
          placeholder="Enter a strong password"
          value={formData.password}
          onChange={(e) => onInputChange('password', e.target.value)}
          className={inputClassName}
          disabled={loading}
        />
      </Field>

      <Field icon={Lock} label="Confirm Password" required>
        <Input
          type="password"
          placeholder="Re-enter password"
          value={formData.password_confirmation}
          onChange={(e) => onInputChange('password_confirmation', e.target.value)}
          className={inputClassName}
          disabled={loading}
        />
      </Field>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-lg border border-emerald-300/40 bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-slate-950 shadow-lg shadow-cyan-950/40 hover:from-emerald-400 hover:to-cyan-400"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Continue
            <UserPlus className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

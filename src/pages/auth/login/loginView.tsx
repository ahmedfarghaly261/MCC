import { useState, type FormEvent } from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import LoginForm from './composables/LoginForm';
import ErrorAlert from './composables/ErrorAlert';

import RegistrationLayout from '@/components/layout/RegistrationLayout';
import { loginUser } from './services/login.service';
import type { LoginFormData } from './types/login.types';

const INITIAL_FORM: LoginFormData = {
  email: '',
  password: '',
};

export default function LoginView() {
  const [formData, setFormData] = useState<LoginFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      await loginUser({ email: formData.email, password: formData.password });
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        'Login failed. Please check your credentials and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationLayout>
      <div className="w-full max-w-lg">
        <div className="mb-7 text-center">
          <div className="mb-4 inline-flex rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4 shadow-[0_0_42px_rgba(16,185,129,0.18)]">
            <Shield
              className="h-12 w-12 text-emerald-300"
              style={{ filter: 'drop-shadow(0 0 12px rgb(16 185 129 / 0.6))' }}
            />
          </div>
          <h1 className="mb-2 text-3xl font-semibold text-white">Mission Control</h1>
          <p className="text-sm text-slate-400">Operator authentication portal</p>
        </div>

        <div className="space-y-6 rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl sm:p-8">
          {error && <ErrorAlert message={error} />}

          <LoginForm
            formData={formData}
            loading={loading}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />

          <div className="border-t border-slate-700/60 pt-5">
            <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-950/40 px-3 py-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-emerald-300" />
              <span>Protected by WebAuthn Standard</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <button
              id="go-to-register"
              onClick={() => navigate('/register')}
              className="font-medium text-cyan-300 transition-colors hover:text-cyan-200"
            >
              Register here
            </button>
          </p>
        </div>

        <div className="mt-8 text-center text-xs text-slate-600">
          <p>(c) 2026 Mission Control Center System</p>
          <p className="mt-1">Secure Satellite Command &amp; Control Platform</p>
        </div>
      </div>
    </RegistrationLayout>
  );
}

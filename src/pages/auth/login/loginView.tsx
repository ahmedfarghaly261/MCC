import { useCallback, useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import LoginForm from './composables/LoginForm';
import ErrorAlert from './composables/ErrorAlert';

import RegistrationLayout from '@/components/layout/RegistrationLayout';
import MissionBootTransition from '@/components/shared/MissionBootTransition';
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
  const [isEnteringBoot, setIsEnteringBoot] = useState(false);
  const [showBootTransition, setShowBootTransition] = useState(false);
  const navigate = useNavigate();

  const completeBootTransition = useCallback(() => {
    navigate('/dashboard', {
      state: { bootComplete: true },
    });
  }, [navigate]);

  useEffect(() => {
    if (isEnteringBoot || showBootTransition) {
      return;
    }

    if (sessionStorage.getItem('mcc_auth_token') || sessionStorage.getItem('mcc_is_authenticated')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isEnteringBoot, navigate, showBootTransition]);

  useEffect(() => {
    if (!isEnteringBoot) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setShowBootTransition(true);
    }, 1800);

    return () => window.clearTimeout(timerId);
  }, [isEnteringBoot]);

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
      setIsEnteringBoot(true);
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
      {showBootTransition && (
        <MissionBootTransition
          onComplete={completeBootTransition}
        />
      )}

      {isEnteringBoot && !showBootTransition && <BootEntryPortal />}

      <motion.div
        className="w-full max-w-lg"
        animate={
          isEnteringBoot
            ? {
                opacity: 0,
                scale: 0.72,
                y: -34,
                filter: 'blur(12px)',
              }
            : {
                opacity: 1,
                scale: 1,
                y: 0,
                filter: 'blur(0px)',
              }
        }
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
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
              onClick={() => navigate('/auth/Registration')}
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
      </motion.div>
    </RegistrationLayout>
  );
}

function BootEntryPortal() {
  return (
    <motion.div
      className="fixed inset-0 z-[9998] overflow-hidden bg-[#020617]/88 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.42 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.24),transparent_24%),radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_38%),linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.95))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.07)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />

      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border border-cyan-300/30 shadow-[0_0_40px_rgba(34,211,238,0.16)]"
            initial={{ scale: 0.35, opacity: 0 }}
            animate={{
              scale: [0.35, 1.15 + ring * 0.18],
              opacity: [0, 0.78, 0],
              rotate: ring % 2 === 0 ? 180 : -180,
            }}
            transition={{
              duration: 1.65,
              delay: ring * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}

        <motion.div
          className="absolute inset-16 rounded-full bg-cyan-200/20 blur-2xl"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.45], opacity: [0, 0.9, 0.15] }}
          transition={{ duration: 1.65, ease: 'easeOut' }}
        />

        <motion.div
          className="absolute inset-24 rounded-full border border-emerald-300/60 bg-slate-950/60 shadow-[0_0_70px_rgba(34,211,238,0.48)]"
          initial={{ scale: 0.35, opacity: 0 }}
          animate={{ scale: [0.35, 1.08, 0.82], opacity: [0, 1, 0.65] }}
          transition={{ duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <motion.div
        className="absolute inset-x-0 top-1/2 mx-auto w-[min(84vw,520px)] -translate-y-1/2 text-center"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: [0, 1, 0], y: [32, 0, -18] }}
        transition={{ duration: 1.65, ease: 'easeInOut' }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.34em] text-cyan-200">
          Entering Mission Space
        </p>
        <p className="mt-3 text-2xl font-bold uppercase tracking-[0.12em] text-white">
          Launching Boot Sequence
        </p>
      </motion.div>
    </motion.div>
  );
}

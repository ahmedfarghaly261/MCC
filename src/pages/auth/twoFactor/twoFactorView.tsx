import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Loader2, Shield, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import ConfirmPasswordForm from './composables/ConfirmPasswordForm';
import TwoFactorSetupCard from './composables/TwoFactorSetupCard';
import TwoFactorConfirmForm from './composables/TwoFactorConfirmForm';

import {
  confirmPassword,
  confirmTwoFactor,
  enableTwoFactor,
  fetchTwoFactorSetupData,
  getPasswordConfirmedStatus,
} from './services/twoFactor.service';
import type { TwoFactorSetupData, TwoFactorStep } from './types/twoFactor.types';

type TwoFactorLocationState = {
  registrationPassword?: string;
};

export default function TwoFactorView() {
  const [step, setStep] = useState<TwoFactorStep>('idle');
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const registrationPassword = (location.state as TwoFactorLocationState | null)?.registrationPassword;

  const handleEnable = async () => {
    setLoading(true);
    setPasswordError(null);

    try {
      const { confirmed } = await getPasswordConfirmedStatus();

      if (!confirmed) {
        if (!registrationPassword) {
          setStep('confirmPassword');
          return;
        }

        navigate(location.pathname, { replace: true, state: null });
        try {
          await confirmPasswordAndEnable(registrationPassword);
        } catch {
          setPasswordError(null);
          setStep('confirmPassword');
        }
        return;
      }

      await enableAndFetchSetup();
    } catch (error) {
      if (isPasswordConfirmationRequired(error)) {
        setPasswordError(extractMessage(error, 'Password confirmation required.'));
        setStep('confirmPassword');
        return;
      }

      toast.error(extractMessage(error, 'Failed to enable 2FA.'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPassword = async (password: string) => {
    setLoading(true);
    setPasswordError(null);

    try {
      await confirmPasswordAndEnable(password);
    } catch (error) {
      setPasswordError(extractPasswordMessage(error));
    } finally {
      setLoading(false);
    }
  };

  async function confirmPasswordAndEnable(password: string): Promise<void> {
    await confirmPassword({ password });

    const { confirmed } = await getPasswordConfirmedStatus();
    if (!confirmed) {
      throw new Error('Password confirmation required.');
    }

    await enableAndFetchSetup();
  }

  async function enableAndFetchSetup(): Promise<void> {
    await enableTwoFactor();
    const data = await fetchTwoFactorSetupData();
    setSetupData(data);
    setStep('setup');
  }

  const handleConfirmTotp = async (code: string) => {
    setLoading(true);
    setConfirmError(null);

    try {
      await confirmTwoFactor({ code });
      setStep('enabled');
      toast.success('Two-Factor Authentication enabled successfully!');
    } catch (error) {
      setConfirmError(extractMessage(error, 'Invalid code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  function extractMessage(error: unknown, fallback: string): string {
    return isAxiosError(error)
      ? error.response?.data?.message ?? fallback
      : error instanceof Error
        ? error.message
        : fallback;
  }

  function extractPasswordMessage(error: unknown): string {
    return isAxiosError(error)
      ? error.response?.data?.errors?.password?.[0]
        ?? error.response?.data?.message
        ?? 'Incorrect password. Please try again.'
      : error instanceof Error
        ? error.message
        : 'An unexpected error occurred.';
  }

  function isPasswordConfirmationRequired(error: unknown): boolean {
    return isAxiosError(error)
      && error.response?.data?.message === 'Password confirmation required.';
  }

  return (
    <div className="flex min-h-screen justify-center bg-background px-6 py-8 text-white">
      <div className="w-full max-w-3xl">
        <div className="mx-auto mb-8 flex max-w-xl items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_28px_rgba(16,185,129,0.14)]">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Two-Factor Authentication</h1>
            <p className="text-sm text-slate-400">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-xl space-y-6">
          {step === 'idle' && (
            <div className="space-y-5 rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-400/10">
                  <Shield className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">2FA is not yet enabled</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    Two-factor authentication adds an extra layer of security by requiring a
                    verification code from your authenticator app each time you sign in.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => void handleEnable()}
                disabled={loading}
                className="h-12 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 hover:from-emerald-400 hover:to-cyan-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'confirmPassword' && (
            <ConfirmPasswordForm
              loading={loading}
              error={passwordError}
              onSubmit={(password) => void handleConfirmPassword(password)}
            />
          )}

          {step === 'setup' && setupData && (
            <div className="-mx-0 space-y-5 sm:-mx-10 lg:-mx-20">
              <TwoFactorSetupCard data={setupData} />
              <Button
                onClick={() => setStep('confirm')}
                className="h-12 w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold text-white shadow-lg shadow-blue-950/30 hover:from-blue-400 hover:to-cyan-400"
              >
                I've saved my codes - Continue
              </Button>
            </div>
          )}

          {step === 'confirm' && (
            <TwoFactorConfirmForm
              loading={loading}
              error={confirmError}
              onSubmit={(code) => void handleConfirmTotp(code)}
            />
          )}

          {step === 'enabled' && (
            <div className="flex items-start gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 shadow-2xl shadow-emerald-950/20">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-400/15">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-base font-semibold text-emerald-200">
                  Two-Factor Authentication is enabled
                </p>
                <p className="mt-1 text-sm leading-relaxed text-emerald-100/70">
                  Your account is now protected. You'll be asked for a verification code
                  each time you sign in.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

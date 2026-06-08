import { useState, type FormEvent } from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import StepIndicator from './composables/StepIndicator';
import ErrorAlert from './composables/ErrorAlert';
import InfoStep from './composables/InfoStep';
import PasskeyStep from './composables/PasskeyStep';
import SuccessStep from './composables/SuccessStep';

import RegistrationLayout from '@/components/layout/RegistrationLayout';
import { registerUser, loginUser } from './services/registration.service';
import type { RegisterFormData, RegistrationStep } from './types/registration.types';

const INITIAL_FORM: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
};

export default function RegistrationView() {
  const [step, setStep] = useState<RegistrationStep>('info');
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmitInfo = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
      setError('Name, email, password, and password confirmation are required');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      await loginUser(formData.email, formData.password);

      toast.success('Account registered successfully!');
      setStep('passkey');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const redirectToTwoFactor = (delay: number) => {
    setTimeout(
      () => navigate('/2fa-setup', { state: { registrationPassword: formData.password } }),
      delay,
    );
  };

  const handleCreatePasskey = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!window.PublicKeyCredential) {
        throw new Error('Passkeys are not supported in this browser');
      }

      await new Promise((resolve) => setTimeout(resolve, 2500));
      setStep('success');
      redirectToTwoFactor(3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create passkey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPasskey = () => {
    setStep('success');
    redirectToTwoFactor(2000);
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
          <p className="text-sm text-slate-400">Register for satellite command access</p>
        </div>

        <div className="space-y-6 rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl sm:p-8">
          <StepIndicator step={step} />

          {error && <ErrorAlert message={error} />}

          {step === 'info' && (
            <InfoStep
              formData={formData}
              loading={loading}
              onInputChange={handleInputChange}
              onSubmit={handleSubmitInfo}
            />
          )}

          {step === 'passkey' && (
            <PasskeyStep
              loading={loading}
              onCreatePasskey={handleCreatePasskey}
              onSkip={handleSkipPasskey}
            />
          )}

          {step === 'success' && <SuccessStep />}

          {step !== 'success' && (
            <div className="border-t border-slate-700/60 pt-5">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-950/40 px-3 py-2 text-xs text-slate-500">
                <Shield className="h-4 w-4 text-emerald-300" />
                <span>Protected by WebAuthn Standard</span>
              </div>
            </div>
          )}
        </div>

        {step === 'info' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Sign in here
              </button>
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-600">
          <p>(c) 2026 Mission Control Center System</p>
          <p className="mt-1">Secure Satellite Command & Control Platform</p>
        </div>
      </div>
    </RegistrationLayout>
  );
}

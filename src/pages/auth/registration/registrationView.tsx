import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import StepIndicator from './composables/StepIndicator';
import ErrorAlert from './composables/ErrorAlert';
import InfoStep from './composables/InfoStep';
import PasskeyStep from './composables/PasskeyStep';
import SuccessStep from './composables/SuccessStep';

import { registerUser } from './services/registration.service';
import type { RegisterFormData, RegistrationStep } from './types/registration.types';

const INITIAL_FORM: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  organization: '',
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

  const handleSubmitInfo = async (e: React.FormEvent) => {
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

  const handleCreatePasskey = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!window.PublicKeyCredential) {
        throw new Error('Passkeys are not supported in this browser');
      }

      // Simulate passkey creation flow
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setStep('success');
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create passkey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPasskey = () => {
    setStep('success');
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 mb-4">
            <Shield
              className="w-12 h-12 text-emerald-400"
              style={{ filter: 'drop-shadow(0 0 12px rgb(16 185 129 / 0.6))' }}
            />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Mission Control</h1>
          <p className="text-gray-400">Register for satellite command access</p>
        </div>

        {/* Registration Card */}
        <div className="bg-[#1F2937] border border-gray-700/50 rounded-lg p-8 space-y-6">
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

          {/* Security Badge */}
          {step !== 'success' && (
            <div className="pt-6 border-t border-gray-700/50">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Protected by WebAuthn Standard</span>
              </div>
            </div>
          )}
        </div>

        {/* Login Link */}
        {step === 'info' && (
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-600">
          <p>© 2026 Mission Control Center System</p>
          <p className="mt-1">Secure Satellite Command & Control Platform</p>
        </div>
      </div>
    </div>
  );
}

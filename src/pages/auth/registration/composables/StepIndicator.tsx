import { CheckCircle2 } from 'lucide-react';
import type { RegistrationStep } from '../types/registration.types';

type StepIndicatorProps = {
  step: RegistrationStep;
};

type StepConfig = {
  key: RegistrationStep | string;
  label: string;
  number: string;
};

const STEPS: StepConfig[] = [
  { key: 'info', label: 'Info', number: '1' },
  { key: 'passkey', label: 'Passkey', number: '2' },
  { key: 'success', label: 'Done', number: '3' },
];

const ORDER: RegistrationStep[] = ['info', 'passkey', 'success'];

function getStepState(stepKey: string, currentStep: RegistrationStep) {
  const stepIndex = ORDER.indexOf(stepKey as RegistrationStep);
  const currentIndex = ORDER.indexOf(currentStep);

  if (stepIndex < currentIndex) return 'done';
  if (stepIndex === currentIndex) return 'active';
  return 'idle';
}

export default function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {STEPS.map((s, i) => {
        const state = getStepState(s.key, step);
        return (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <div className="flex-1 h-px bg-gray-700/50 mx-3 w-10" />}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state === 'active'
                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                  : state === 'done'
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-gray-700/50 border border-gray-700/50 text-gray-500'
              }`}
            >
              {state === 'done' ? <CheckCircle2 className="w-4 h-4" /> : s.number}
            </div>
            <span
              className={`text-sm ${
                state === 'active'
                  ? 'text-blue-400'
                  : state === 'done'
                  ? 'text-green-400'
                  : 'text-gray-500'
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

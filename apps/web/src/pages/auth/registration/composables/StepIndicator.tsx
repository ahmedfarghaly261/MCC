import { CheckCircle2 } from 'lucide-react';
import type { RegistrationStep } from '../types/registration.types';

type StepIndicatorProps = {
  step: RegistrationStep;
};

type StepConfig = {
  key: RegistrationStep;
  label: string;
  number: string;
};

const STEPS: StepConfig[] = [
  { key: 'info', label: 'Info', number: '1' },
  { key: 'passkey', label: 'Passkey', number: '2' },
  { key: 'success', label: 'Done', number: '3' },
];

const ORDER: RegistrationStep[] = ['info', 'passkey', 'success'];

function getStepState(stepKey: RegistrationStep, currentStep: RegistrationStep) {
  const stepIndex = ORDER.indexOf(stepKey);
  const currentIndex = ORDER.indexOf(currentStep);

  if (stepIndex < currentIndex) return 'done';
  if (stepIndex === currentIndex) return 'active';
  return 'idle';
}

export default function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3">
      <div className="grid grid-cols-3 gap-2">
        {STEPS.map((stepConfig) => {
          const state = getStepState(stepConfig.key, step);
          const isActive = state === 'active';
          const isDone = state === 'done';

          return (
            <div
              key={stepConfig.key}
              className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'border border-cyan-400/40 bg-cyan-400/10 text-cyan-200'
                  : isDone
                    ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                    : 'border border-slate-800 bg-slate-900/60 text-slate-500'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  isActive
                    ? 'bg-cyan-400 text-slate-950'
                    : isDone
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : stepConfig.number}
              </span>
              <span>{stepConfig.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

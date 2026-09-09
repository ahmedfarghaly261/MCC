import { AlertCircle } from 'lucide-react';

type ErrorAlertProps = {
  message: string;
};

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-400/35 bg-red-500/10 p-4 shadow-lg shadow-red-950/20">
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
      <p className="text-sm text-red-200">{message}</p>
    </div>
  );
}

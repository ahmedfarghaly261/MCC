import { CheckCircle2, Loader2 } from 'lucide-react';

export default function SuccessStep() {
  return (
    <div className="space-y-6 text-center py-8">
      <div className="inline-flex p-4 bg-green-500/10 rounded-2xl border border-green-500/30 mb-4">
        <CheckCircle2
          className="w-16 h-16 text-green-400"
          style={{ filter: 'drop-shadow(0 0 12px rgb(16 185 129 / 0.6))' }}
        />
      </div>

      <div>
        <h2 className="text-white text-2xl mb-2">Account Created!</h2>
        <p className="text-gray-400 text-sm">Welcome to Mission Control Center</p>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <p className="text-green-400 text-sm">
          Your account has been successfully created with passkey authentication.
          Redirecting to dashboard...
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        <span className="text-gray-400 text-sm">Redirecting...</span>
      </div>
    </div>
  );
}

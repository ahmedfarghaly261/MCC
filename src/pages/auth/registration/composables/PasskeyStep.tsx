import { Fingerprint, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PasskeyStepProps = {
  loading: boolean;
  onCreatePasskey: () => void;
  onSkip: () => void;
};

export default function PasskeyStep({ loading, onCreatePasskey, onSkip }: PasskeyStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex p-4 bg-blue-500/10 rounded-2xl border border-blue-500/30 mb-4">
          <Fingerprint
            className="w-16 h-16 text-blue-400"
            style={{ filter: 'drop-shadow(0 0 12px rgb(59 130 246 / 0.6))' }}
          />
        </div>
        <h2 className="text-white text-2xl mb-2">Secure Your Account</h2>
        <p className="text-gray-400 text-sm">Create a passkey for passwordless authentication</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 text-sm font-medium mb-3">Why use a passkey?</h3>
        <ul className="space-y-2 text-xs text-gray-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>More secure than passwords - resistant to phishing</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Faster login with fingerprint, face, or security key</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Works across all your devices automatically</span>
          </li>
        </ul>
      </div>

      <Button
        onClick={onCreatePasskey}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/50 text-white h-14"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating Passkey...
          </>
        ) : (
          <>
            <Fingerprint className="w-5 h-5 mr-2" />
            Create Passkey
          </>
        )}
      </Button>

      <button
        onClick={onSkip}
        disabled={loading}
        className="w-full text-gray-400 hover:text-gray-300 text-sm transition-colors"
      >
        Skip for now
      </button>
    </div>
  );
}

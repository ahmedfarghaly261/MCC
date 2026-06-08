import { Copy, Key, QrCode, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { TwoFactorSetupData } from '../types/twoFactor.types';

interface TwoFactorSetupCardProps {
  data: TwoFactorSetupData;
}

function copyToClipboard(text: string, label: string) {
  void navigator.clipboard.writeText(text).then(() => {
    toast.success(`${label} copied to clipboard`);
  });
}

export default function TwoFactorSetupCard({ data }: TwoFactorSetupCardProps) {
  return (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="rounded-xl border border-slate-700 bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
            <QrCode className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Scan with your authenticator app</p>
            <p className="text-xs text-muted-foreground">
              Google Authenticator, Authy, or any TOTP app
            </p>
          </div>
        </div>
        <div
          className="flex justify-center rounded-lg bg-white p-4"
          /* SVG is generated server-side by Laravel Fortify — safe to render */
          dangerouslySetInnerHTML={{ __html: data.qrSvg }}
        />
      </div>

      {/* Manual Secret Key */}
      <div className="rounded-xl border border-slate-700 bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Key className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Manual setup key</p>
              <p className="text-xs text-muted-foreground">Enter this in your app if QR doesn't work</p>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(data.secretKey, 'Secret key')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
        </div>
        <code className="block w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3 text-center font-mono text-sm tracking-widest text-emerald-400 select-all">
          {data.secretKey}
        </code>
      </div>

      {/* Recovery Codes */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Recovery codes</p>
            <p className="text-xs text-amber-400/80">
              Save these somewhere safe — each can only be used once
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(data.recoveryCodes.join('\n'), 'Recovery codes')}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <Copy className="h-3 w-3" />
            Copy all
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {data.recoveryCodes.map((code) => (
            <li
              key={code}
              className="rounded-md bg-slate-900 border border-slate-800 px-3 py-2 font-mono text-xs text-slate-300 text-center tracking-wider"
            >
              {code}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

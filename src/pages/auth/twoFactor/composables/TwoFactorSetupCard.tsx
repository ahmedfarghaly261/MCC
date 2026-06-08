import { Copy, Key, QrCode, ShieldCheck, Smartphone } from 'lucide-react';
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
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-400/10">
            <QrCode className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Scan authenticator QR code</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              Use Google Authenticator, Authy, Microsoft Authenticator, or any TOTP app.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,14rem)_1fr]">
          <div className="rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/15 via-slate-950 to-blue-500/10 p-3">
            <div
              className="flex min-h-56 items-center justify-center rounded-xl bg-white p-4 [&_svg]:h-48 [&_svg]:w-48"
              dangerouslySetInnerHTML={{ __html: data.qrSvg }}
            />
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-slate-700/70 bg-slate-950/50 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-400/10">
                <Smartphone className="h-4 w-4 text-cyan-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Recommended flow</p>
                <p className="text-xs text-slate-500">Scan first, save recovery codes second.</p>
              </div>
            </div>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-400/15 text-xs text-blue-200">1</span>
                Scan the QR code with your authenticator app.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs text-cyan-200">2</span>
                Store the recovery codes in a secure location.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-xs text-emerald-200">3</span>
                Continue and confirm the current 6-digit code.
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-xl shadow-blue-950/20">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-300/25 bg-purple-400/10">
              <Key className="h-4 w-4 text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Manual setup key</p>
              <p className="text-xs text-slate-500">Use this if scanning is unavailable.</p>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(data.secretKey, 'Secret key')}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-purple-300/40 hover:text-white"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
        <code className="block rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-center font-mono text-sm tracking-widest text-emerald-300 shadow-inner shadow-black/30 select-all">
          {data.secretKey}
        </code>
      </div>

      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 shadow-xl shadow-amber-950/10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-400/10">
              <ShieldCheck className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Recovery codes</p>
              <p className="text-xs text-amber-100/70">Save these now. Each code can be used once.</p>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(data.recoveryCodes.join('\n'), 'Recovery codes')}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-300/20"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy all
          </button>
        </div>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.recoveryCodes.map((code) => (
            <li
              key={code}
              className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-center font-mono text-xs tracking-wider text-slate-300 shadow-inner shadow-black/20"
            >
              {code}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

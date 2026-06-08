import { UserPlus, Loader2, Mail, User, Shield, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { RegisterFormData } from '../types/registration.types';

type InfoStepProps = {
  formData: RegisterFormData;
  loading: boolean;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function InfoStep({ formData, loading, onInputChange, onSubmit }: InfoStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-white text-2xl mb-2">Create Account</h2>
        <p className="text-gray-400 text-sm">Enter your details to get started</p>
      </div>

      <div>
        <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          Full Name <span className="text-red-400">*</span>
        </label>
        <Input
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          className="bg-[#0B1120] border-gray-600 text-white h-12"
          disabled={loading}
        />
      </div>

      <div>
        <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          Email Address <span className="text-red-400">*</span>
        </label>
        <Input
          type="email"
          placeholder="operator@missioncontrol.space"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className="bg-[#0B1120] border-gray-600 text-white h-12"
          disabled={loading}
        />
      </div>

      <div>
        <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          Password <span className="text-red-400">*</span>
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => onInputChange('password', e.target.value)}
          className="bg-[#0B1120] border-gray-600 text-white h-12"
          disabled={loading}
        />
      </div>

      <div>
        <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          Confirm Password <span className="text-red-400">*</span>
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          value={formData.password_confirmation}
          onChange={(e) => onInputChange('password_confirmation', e.target.value)}
          className="bg-[#0B1120] border-gray-600 text-white h-12"
          disabled={loading}
        />
      </div>

      <div>
        <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          Organization (Optional)
        </label>
        <Input
          type="text"
          placeholder="Mission Control Center"
          value={formData.organization}
          onChange={(e) => onInputChange('organization', e.target.value)}
          className="bg-[#0B1120] border-gray-600 text-white h-12"
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/50 text-white h-12"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Continue
            <UserPlus className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}

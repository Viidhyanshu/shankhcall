import React from 'react';
import { Users, Shield } from 'lucide-react';

export type SelectedRole = 'citizen' | 'official';

interface SignUpRoleStepProps {
  onSelectRole: (role: SelectedRole) => void;
}

export default function SignUpRoleStep({ onSelectRole }: SignUpRoleStepProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--title-text)] font-sans">Select Your Role</h1>
        <p className="text-[var(--sub-text)] text-xs">Choose the capacity in which you will utilize the platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2">
        {/* Citizen Card */}
        <div
          onClick={() => onSelectRole('citizen')}
          className="glass-panel p-4 border border-[var(--input-border)] hover:border-emerald-500/30 bg-[var(--card-inactive-bg)] rounded-xl cursor-pointer flex items-center gap-4 group transition-all"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-500/5 group-hover:bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Users size={20} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm text-[var(--title-text)] group-hover:text-emerald-400 transition-colors">Citizen</div>
            <p className="text-[11px] text-[var(--sub-text)] leading-normal mt-0.5">Submit disaster reports and view regional hazard maps.</p>
          </div>
        </div>

        {/* Official Card */}
        <div
          onClick={() => onSelectRole('official')}
          className="glass-panel p-4 border border-[var(--input-border)] hover:border-cyan-500/30 bg-[var(--card-inactive-bg)] rounded-xl cursor-pointer flex items-center gap-4 group transition-all"
        >
          <div className="h-10 w-10 rounded-lg bg-cyan-500/5 group-hover:bg-cyan-500/10 border border-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Shield size={18} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm text-[var(--title-text)] group-hover:text-cyan-400 transition-colors">Official</div>
            <p className="text-[11px] text-[var(--sub-text)] leading-normal mt-0.5">Validate reports, assign verification chips, and dispatch warnings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

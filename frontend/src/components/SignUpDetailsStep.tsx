import React from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { SelectedRole } from './SignUpRoleStep';

interface SignUpDetailsStepProps {
  selectedRole: SelectedRole;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  robotChecked: boolean;
  setRobotChecked: React.Dispatch<React.SetStateAction<boolean>>;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export default function SignUpDetailsStep({
  selectedRole,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  robotChecked,
  setRobotChecked,
  onBack,
  onSubmit,
  loading,
}: SignUpDetailsStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-full bg-[var(--color-glass-bg)] hover:bg-[var(--color-glass-hover-bg)] text-[var(--body-text)] hover:text-[var(--title-text)] border border-[var(--input-border)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-[var(--title-text)] font-sans">Account Details</h1>
          <p className="text-[10px] text-[var(--sub-text)]">
            Selected Role: <span className="text-sky-400 uppercase font-semibold">{selectedRole}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-sky-400 rounded-xl p-3 text-[var(--input-text)] outline-none transition-all placeholder-[var(--input-placeholder)] text-sm"
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-sky-400 rounded-xl p-3 text-[var(--input-text)] outline-none transition-all placeholder-[var(--input-placeholder)] text-sm"
          required
        />

        <input
          type="tel"
          placeholder="Phone Number (Optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-sky-400 rounded-xl p-3 text-[var(--input-text)] outline-none transition-all placeholder-[var(--input-placeholder)] text-sm"
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password (Min. 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-sky-400 rounded-xl p-3 pr-11 text-[var(--input-text)] outline-none transition-all placeholder-[var(--input-placeholder)] text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Robot verification widget */}
      <div className="flex items-center gap-3 p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl">
        <button
          type="button"
          onClick={() => setRobotChecked((prev) => !prev)}
          className={`h-5 w-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
            robotChecked
              ? 'bg-emerald-500 border-emerald-400 text-white'
              : 'border-[var(--input-border)] bg-[var(--input-bg)] hover:border-sky-500/40'
          }`}
        >
          {robotChecked && <Check size={14} />}
        </button>
        <span className="text-xs text-[var(--body-text)]">Confirm you are not a robot (Mock Captcha)</span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-450 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Continue'}
        {!loading && <ArrowRight size={16} />}
      </button>
    </form>
  );
}

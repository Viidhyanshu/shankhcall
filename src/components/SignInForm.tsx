import React from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

interface SignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export default function SignInForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onSubmit,
  loading,
}: SignInFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--title-text)] font-sans">Sign In</h1>
        <p className="text-[var(--sub-text)] text-xs">Enter your email and password to log in.</p>
      </div>

      <div className="space-y-4 pt-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-sky-400 rounded-xl p-3.5 text-[var(--input-text)] outline-none transition-all placeholder-[var(--input-placeholder)] text-sm"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-sky-400 rounded-xl p-3.5 pr-11 text-[var(--input-text)] outline-none transition-all placeholder-[var(--input-placeholder)] text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <a href="#" className="forget-password-link transition-colors font-medium">
          Forget Your Password?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-450 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? 'Signing In...' : 'Sign In'}
        {!loading && <ArrowRight size={16} />}
      </button>
    </form>
  );
}

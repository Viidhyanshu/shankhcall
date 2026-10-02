import React from 'react';
import { ArrowLeft, Mail, ArrowRight, Check } from 'lucide-react';

interface SignUpVerificationStepProps {
  email: string;
  onBack: () => void;
  onVerify: () => void;
  onResend: () => void;
  loading: boolean;
}

export default function SignUpVerificationStep({
  email,
  onBack,
  onVerify,
  onResend,
  loading,
}: SignUpVerificationStepProps) {
  return (
    <div className="space-y-5 animate-fade-in text-center flex flex-col items-center">
      <div className="w-full flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-full bg-[var(--color-glass-bg)] hover:bg-[var(--color-glass-hover-bg)] text-[var(--body-text)] hover:text-[var(--title-text)] border border-[var(--input-border)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="space-y-0.5 text-left">
          <h1 className="text-xl font-bold text-[var(--title-text)] font-sans">Verify Your Email</h1>
          <p className="text-[10px] text-[var(--sub-text)] font-sans">
            A verification link is required to activate your profile.
          </p>
        </div>
      </div>

      {/* Mail icon and Info */}
      <div className="py-6 flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
          <Mail size={32} />
        </div>
        <div className="space-y-2 max-w-sm">
          <p className="text-sm text-[var(--title-text)] font-medium font-sans">
            Verification link sent to:
          </p>
          <p className="text-sm font-mono otp-email-box font-bold px-3 py-1.5 rounded-lg border select-all">
            {email}
          </p>
          <p className="text-xs text-[var(--body-text)] leading-relaxed font-sans pt-1">
            Please open your Gmail, look for the verification email sent by Firebase, and click the link inside it.
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full space-y-3 pt-2">
        {/* Open Gmail Button */}
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl bg-[var(--color-glass-bg)] hover:bg-[var(--color-glass-hover-bg)] border border-[var(--input-border)] hover:border-cyan-500/30 text-[var(--input-text)] font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          Open Gmail
          <ArrowRight size={16} className="text-cyan-400" />
        </a>

        {/* Verify Completion Button */}
        <button
          type="button"
          onClick={onVerify}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? 'Verifying status...' : 'I have verified my email'}
          {!loading && <Check size={16} />}
        </button>

        {/* Resend Button */}
        <button
          type="button"
          onClick={onResend}
          disabled={loading}
          className="text-xs text-[var(--sub-text)] hover:text-cyan-400 font-semibold transition-colors pt-1 cursor-pointer"
        >
          Didn't get the email? Resend verification link
        </button>
      </div>
    </div>
  );
}

import React from 'react';

interface AuthBannerProps {
  isSignUp: boolean;
  onToggleMode: (signUpMode: boolean) => void;
}

export default function AuthBanner({ isSignUp, onToggleMode }: AuthBannerProps) {
  return (
    <div
      className={`w-full md:w-5/12 bg-[var(--login-banner-bg)] p-8 flex flex-col justify-center items-center text-center relative border border-[var(--login-banner-border)] rounded-2xl login-toggle-panel ${
        isSignUp ? 'login-toggle-panel-active' : ''
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.06)_0%,transparent_70%)] rounded-2xl" />

      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold tracking-wider text-[var(--login-banner-title)] font-sans mb-4 uppercase">
          शंखcall
        </h2>
        <p className="text-[var(--login-banner-text)] text-sm leading-relaxed max-w-[280px] mb-8 font-light">
          {isSignUp
            ? 'Register with your personal details to access real-time citizen disaster reporting boards.'
            : 'Enter your credentials to manage active hazards and monitor unified social feeds.'}
        </p>

        <button
          onClick={() => onToggleMode(!isSignUp)}
          className="px-6 py-2.5 rounded-full border login-toggle-btn font-medium text-xs tracking-wider uppercase transition-all shadow-lg glow-btn cursor-pointer"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}

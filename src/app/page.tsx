'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpAction, signInAction } from '@/app/actions';

import ThemeToggle from '@/components/ThemeToggle';
import AuthBackground from '@/components/AuthBackground';
import AuthBrand from '@/components/AuthBrand';
import AuthBanner from '@/components/AuthBanner';
import SignInForm from '@/components/SignInForm';
import SignUpRoleStep, { SelectedRole } from '@/components/SignUpRoleStep';
import SignUpDetailsStep from '@/components/SignUpDetailsStep';

export type SignUpStep = 'role' | 'details';
export type { SelectedRole };

export default function LoginPage() {
  const router = useRouter();

  // Mode: true = SignUp, false = SignIn
  const [isSignUp, setIsSignUp] = useState(false);

  // SignUp Multi-Step
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('role');
  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [robotChecked, setRobotChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Errors & Loading states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset states
  const resetForms = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRobotChecked(false);
    setSignUpStep('role');
    setSelectedRole(null);
    setError('');
  };

  // Toggle Forms
  const handleToggleMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    resetForms();
  };

  // Continue from Role selection
  const handleRoleSelect = (role: SelectedRole) => {
    setSelectedRole(role);
    setSignUpStep('details');
  };

  // Details Submission -> Create user account in Neon PostgreSQL
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedRole) {
      setError('Please select a role.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (!robotChecked) {
      setError('Please confirm you are not a robot.');
      setLoading(false);
      return;
    }

    try {
      const result = await signUpAction({
        name,
        email,
        phone,
        role: selectedRole,
        password,
      });

      if (!result.success) {
        setError(result.error || 'Failed to create account.');
        return;
      }

      router.push('/select');
    } catch (err: any) {
      console.error('Error during registration:', err);
      setError('An error occurred during account creation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login Execution via Neon PostgreSQL
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signInAction({
        email,
        password,
      });

      if (!result.success) {
        setError(result.error || 'Invalid email or password.');
        return;
      }

      router.push('/select');
    } catch (err: any) {
      console.error('Error logging in:', err);
      setError('An error occurred. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[var(--background)] text-[var(--foreground)] font-sans px-4">
      {/* Background decorations: gradient, glowing orbs, floating leaves, wave footer */}
      <AuthBackground />

      {/* Brand Watermark Overlay */}
      <AuthBrand />

      {/* Theme Toggle Overlay */}
      <div className="absolute top-8 right-8 z-20">
        <ThemeToggle />
      </div>

      {/* Main card panel */}
      <div className="relative z-10 w-full max-w-[900px] min-h-[550px] md:h-[600px] rounded-3xl glass-panel bg-[var(--login-card-bg)] border border-[var(--login-card-border)] flex flex-col md:flex-row overflow-hidden shadow-2xl p-2">
        {/* Toggle Panel Left/Right Banner */}
        <AuthBanner isSignUp={isSignUp} onToggleMode={handleToggleMode} />

        {/* Form Container */}
        <div className={`w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative login-form-container ${isSignUp ? 'login-form-container-active' : ''}`}>
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/25 text-red-400 rounded-lg text-xs mb-4">
              {error}
            </div>
          )}

          {/* SIGN IN VIEW */}
          {!isSignUp && (
            <SignInForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onSubmit={handleLoginSubmit}
              loading={loading}
            />
          )}

          {/* SIGN UP VIEW (Multi-Step wizard) */}
          {isSignUp && (
            <div className="space-y-4">
              {/* Step 1: Role Selection */}
              {signUpStep === 'role' && (
                <SignUpRoleStep onSelectRole={handleRoleSelect} />
              )}

              {/* Step 2: Detail Inputs */}
              {signUpStep === 'details' && selectedRole && (
                <SignUpDetailsStep
                  selectedRole={selectedRole}
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  phone={phone}
                  setPhone={setPhone}
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  robotChecked={robotChecked}
                  setRobotChecked={setRobotChecked}
                  onBack={() => setSignUpStep('role')}
                  onSubmit={handleDetailsSubmit}
                  loading={loading}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

import ThemeToggle from '@/components/ThemeToggle';
import AuthBackground from '@/components/AuthBackground';
import AuthBrand from '@/components/AuthBrand';
import AuthBanner from '@/components/AuthBanner';
import SignInForm from '@/components/SignInForm';
import SignUpRoleStep, { SelectedRole } from '@/components/SignUpRoleStep';
import SignUpDetailsStep from '@/components/SignUpDetailsStep';
import SignUpVerificationStep from '@/components/SignUpVerificationStep';

export type SignUpStep = 'role' | 'details' | 'otp';
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

  // Details Submission -> Create Firebase Auth user & Send Real Verification Email
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
      // Create user in Firebase Auth immediately
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send real verification link to their Gmail
      await sendEmailVerification(user);

      // Advance to check email step
      setSignUpStep('otp');
    } catch (err: any) {
      console.error('Error during registration start:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password is too weak.');
      } else {
        setError('An error occurred during account creation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend the verification email link
  const handleResendVerification = async () => {
    setError('');
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        alert('Verification email resent successfully!');
      } catch (err: any) {
        console.error('Error resending verification email:', err);
        setError('Could not resend verification email. Please try again shortly.');
      }
    } else {
      setError('No active signup session found. Please fill out details again.');
    }
  };

  // Final completion: checks if the user verified the email, then saves to Firestore
  const handleSignUpExecute = async () => {
    setError('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('No active session found. Please try signing up again.');
        setLoading(false);
        return;
      }

      // Reload profile to refresh emailVerified state
      await user.reload();

      if (!user.emailVerified) {
        setError('Your email is not verified yet. Please open your Gmail, click the verification link, and then click "I have verified".');
        setLoading(false);
        return;
      }

      try {
        // Save User fields inside Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          phone: phone || '',
          role: selectedRole,
          createdAt: new Date()
        });
      } catch (dbErr) {
        console.error('Error saving user data to Firestore:', dbErr);
      }

      alert('Account verified and created successfully! Please sign in.');
      handleToggleMode(false); // Switch back to Sign In
    } catch (err: any) {
      console.error('Error completing account verification:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login Execution
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in successfully:', userCredential.user.uid);
      
      alert('Sign in successful!');
      router.push('/select');
    } catch (err: any) {
      console.error('Error logging in', err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred. Please check your credentials and try again.');
      }
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

              {/* Step 3: Real Email Link Verification */}
              {signUpStep === 'otp' && (
                <SignUpVerificationStep
                  email={email}
                  onBack={() => setSignUpStep('details')}
                  onVerify={handleSignUpExecute}
                  onResend={handleResendVerification}
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

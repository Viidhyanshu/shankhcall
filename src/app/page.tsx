'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Eye, EyeOff, Shield, Users, BarChart3, ArrowLeft, ArrowRight, Check, Activity, Smartphone, Mail } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

type SignUpStep = 'role' | 'details' | 'otp';
type SelectedRole = 'citizen' | 'official';

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

  // OTP Verification Simulation State
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState<string | null>(null);
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

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
    setEmailOtp('');
    setPhoneOtp('');
    setGeneratedEmailOtp(null);
    setGeneratedPhoneOtp(null);
    setIsEmailVerified(false);
    setIsPhoneVerified(false);
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
      
      // Store current user session variables if needed (e.g. role in localStorage)
      // Note: We can fetch user role from firestore if needed, but let's redirect directly to select
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
      {/* Linear gradient background — forest green (left) to ocean blue (right) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0d2e20] via-[#111d2e] to-[#0c2440]">
        {/* Glowing Green Orb (left) */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-radial from-emerald-500/25 to-transparent blur-[80px] opacity-80 animate-orb-float" />
        <div className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px] rounded-full bg-radial from-emerald-400/15 to-transparent blur-[60px] opacity-70 animate-orb-float [animation-delay:6s]" />
        {/* Glowing Ocean Blue Orb (right) */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-radial from-sky-500/25 to-transparent blur-[80px] opacity-80 animate-orb-float [animation-delay:3s]" />
        <div className="absolute top-[15%] right-[15%] w-[400px] h-[400px] rounded-full bg-radial from-blue-400/15 to-transparent blur-[60px] opacity-70 animate-orb-float [animation-delay:8s]" />
      </div>

      {/* Floating Leaves — scattered across entire background */}
      {[
        { top: '8%',  left: '10%', size: 28, delay: '0s',   dur: '12s', rotate: 25 },
        { top: '22%', left: '55%', size: 22, delay: '2s',   dur: '15s', rotate: -15 },
        { top: '48%', left: '25%', size: 32, delay: '4s',   dur: '18s', rotate: 40 },
        { top: '60%', left: '70%', size: 20, delay: '1s',   dur: '14s', rotate: -30 },
        { top: '78%', left: '15%', size: 26, delay: '3s',   dur: '16s', rotate: 10 },
        { top: '35%', left: '82%', size: 18, delay: '5s',   dur: '13s', rotate: -45 },
        { top: '12%', left: '40%', size: 24, delay: '6s',   dur: '17s', rotate: 55 },
        { top: '68%', left: '48%', size: 30, delay: '2.5s', dur: '11s', rotate: -20 },
        { top: '5%',  left: '75%', size: 20, delay: '1.5s', dur: '14s', rotate: 35 },
        { top: '42%', left: '5%',  size: 26, delay: '3.5s', dur: '15s', rotate: -10 },
        { top: '85%', left: '60%', size: 22, delay: '4.5s', dur: '12s', rotate: 60 },
        { top: '30%', left: '92%', size: 18, delay: '0.5s', dur: '16s', rotate: -55 },
        { top: '55%', left: '38%', size: 24, delay: '7s',   dur: '13s', rotate: 15 },
        { top: '18%', left: '88%', size: 28, delay: '2s',   dur: '11s', rotate: -40 },
        { top: '72%', left: '85%', size: 20, delay: '6s',   dur: '17s', rotate: 30 },
      ].map((leaf, i) => (
        <svg
          key={`leaf-${i}`}
          className="absolute z-[1] text-emerald-500/[0.06] animate-orb-float pointer-events-none"
          style={{
            top: leaf.top,
            left: leaf.left,
            width: leaf.size,
            height: leaf.size,
            animationDelay: leaf.delay,
            animationDuration: leaf.dur,
            transform: `rotate(${leaf.rotate}deg)`,
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" />
        </svg>
      ))}

      {/* Footer Waves & Droplets — full-width bottom */}
      <div className="absolute bottom-0 left-0 w-full z-[1] pointer-events-none">
        <svg className="w-full h-[120px] md:h-[160px]" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path className="animate-[wave_8s_ease-in-out_infinite]" fill="rgba(14,165,233,0.05)" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,186.7C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          <path className="animate-[wave_10s_ease-in-out_infinite_1s]" fill="rgba(14,165,233,0.04)" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,208L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          <path className="animate-[wave_12s_ease-in-out_infinite_2s]" fill="rgba(56,189,248,0.03)" d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,234.7C672,256,768,288,864,277.3C960,267,1056,213,1152,192C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
        {/* Floating water droplets across footer area */}
        {[
          { bottom: '30px',  left: '8%',  size: 5 , delay: '0s',   dur: '8s'  },
          { bottom: '60px',  left: '22%', size: 4 , delay: '1.5s', dur: '10s' },
          { bottom: '45px',  left: '38%', size: 6 , delay: '3s',   dur: '9s'  },
          { bottom: '70px',  left: '52%', size: 3 , delay: '2s',   dur: '11s' },
          { bottom: '35px',  left: '65%', size: 5 , delay: '4s',   dur: '7s'  },
          { bottom: '55px',  left: '78%', size: 4 , delay: '1s',   dur: '12s' },
          { bottom: '80px',  left: '90%', size: 6 , delay: '5s',   dur: '9s'  },
        ].map((drop, i) => (
          <div
            key={`drop-${i}`}
            className="absolute rounded-full bg-sky-400/[0.08] animate-orb-float"
            style={{
              bottom: drop.bottom,
              left: drop.left,
              width: drop.size,
              height: drop.size,
              animationDelay: drop.delay,
              animationDuration: drop.dur,
            }}
          />
        ))}
      </div>

      {/* Brand Watermark Overlay */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10 select-none">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/20">
          <i className="fa-solid fa-cloud-showers-water text-white text-base"></i>
        </div>
        <span className="text-xl font-bold tracking-widest bg-gradient-to-r from-white via-cyan-400 to-white bg-clip-text text-transparent uppercase font-sans">
          शंखcall
        </span>
      </div>

      {/* Theme Toggle Overlay */}
      <div className="absolute top-8 right-8 z-20">
        <ThemeToggle />
      </div>

      {/* Main card panel */}
      <div className="relative z-10 w-full max-w-[900px] min-h-[550px] rounded-3xl glass-panel bg-slate-950/60 border border-sky-500/10 flex flex-col md:flex-row overflow-hidden shadow-2xl p-2">
        
        {/* Toggle Panel Left/Right Banner */}
        <div className={`w-full md:w-5/12 bg-gradient-to-br from-[#0c1328] to-[#060913] p-8 flex flex-col justify-center items-center text-center relative border border-slate-900 rounded-2xl ${isSignUp ? 'md:order-2' : ''} transition-all duration-500`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.06)_0%,transparent_70%)]" />
          
          <h2 className="text-3xl font-extrabold tracking-wider text-slate-100 font-sans mb-4 uppercase">
            {isSignUp ? 'शंखcall' : 'शंखcall'}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mb-8 font-light">
            {isSignUp
              ? 'Register with your personal details to access real-time citizen disaster reporting boards.'
              : 'Enter your credentials to manage active hazards and monitor unified social feeds.'}
          </p>

          <button
            onClick={() => handleToggleMode(!isSignUp)}
            className="px-6 py-2.5 rounded-full border border-sky-400/30 hover:border-sky-400 hover:bg-sky-400/10 text-sky-400 hover:text-sky-300 font-medium text-xs tracking-wider uppercase transition-all shadow-lg glow-btn cursor-pointer"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        {/* Form Container */}
        <div className={`w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative ${isSignUp ? 'md:order-1' : ''} transition-all duration-500`}>
          
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/25 text-red-400 rounded-lg text-xs mb-4">
              {error}
            </div>
          )}

          {/* SIGN IN VIEW */}
          {!isSignUp && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-100 font-sans">Sign In</h1>
                <p className="text-slate-500 text-xs">Enter your email and password to log in.</p>
              </div>

              <div className="space-y-4 pt-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-900 focus:border-sky-400 rounded-xl p-3.5 text-slate-200 outline-none transition-all placeholder-slate-600 text-sm"
                  required
                />
                
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-900 focus:border-sky-400 rounded-xl p-3.5 pr-11 text-slate-200 outline-none transition-all placeholder-slate-600 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <a href="#" className="text-sky-400 hover:text-sky-350 transition-colors font-medium">
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
          )}

          {/* SIGN UP VIEW (Multi-Step wizard) */}
          {isSignUp && (
            <div className="space-y-4">
              
              {/* Step 1: Role Selection */}
              {signUpStep === 'role' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-100 font-sans">Select Your Role</h1>
                    <p className="text-slate-500 text-xs">Choose the capacity in which you will utilize the platform.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    
                    {/* Citizen Card */}
                    <div 
                      onClick={() => handleRoleSelect('citizen')}
                      className="glass-panel p-4 border border-slate-900 hover:border-emerald-500/30 bg-slate-950/20 rounded-xl cursor-pointer flex items-center gap-4 group transition-all"
                    >
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/5 group-hover:bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Users size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">Citizen</div>
                        <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Submit disaster reports and view regional hazard maps.</p>
                      </div>
                    </div>

                    {/* Official Card */}
                    <div 
                      onClick={() => handleRoleSelect('official')}
                      className="glass-panel p-4 border border-slate-900 hover:border-cyan-500/30 bg-slate-950/20 rounded-xl cursor-pointer flex items-center gap-4 group transition-all"
                    >
                      <div className="h-10 w-10 rounded-lg bg-cyan-500/5 group-hover:bg-cyan-500/10 border border-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <Shield size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-slate-200 group-hover:text-cyan-400 transition-colors">Official</div>
                        <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Validate reports, assign verification chips, and dispatch warnings.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Detail Inputs */}
              {signUpStep === 'details' && (
                <form onSubmit={handleDetailsSubmit} className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSignUpStep('role')}
                      className="p-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div className="space-y-0.5">
                      <h1 className="text-xl font-bold text-slate-100 font-sans">Account Details</h1>
                      <p className="text-[10px] text-slate-500">Selected Role: <span className="text-sky-400 uppercase font-semibold">{selectedRole}</span></p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-900 focus:border-sky-400 rounded-xl p-3 text-slate-200 outline-none transition-all placeholder-slate-600 text-sm"
                      required
                    />

                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-900 focus:border-sky-400 rounded-xl p-3 text-slate-200 outline-none transition-all placeholder-slate-600 text-sm"
                      required
                    />

                    <input
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-900 focus:border-sky-400 rounded-xl p-3 text-slate-200 outline-none transition-all placeholder-slate-600 text-sm"
                    />

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password (Min. 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-900 focus:border-sky-400 rounded-xl p-3 pr-11 text-slate-200 outline-none transition-all placeholder-slate-600 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Robot verification widget */}
                  <div className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setRobotChecked(!robotChecked)}
                      className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${
                        robotChecked 
                          ? 'bg-emerald-500 border-emerald-400 text-white' 
                          : 'border-slate-800 bg-slate-950 hover:border-sky-500/40'
                      }`}
                    >
                      {robotChecked && <Check size={14} />}
                    </button>
                    <span className="text-xs text-slate-400">Confirm you are not a robot (Mock Captcha)</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-450 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* Step 3: Real Email Link Verification */}
              {signUpStep === 'otp' && (
                <div className="space-y-5 animate-fade-in text-center flex flex-col items-center">
                  <div className="w-full flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSignUpStep('details')}
                      className="p-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div className="space-y-0.5 text-left">
                      <h1 className="text-xl font-bold text-slate-100 font-sans">Verify Your Email</h1>
                      <p className="text-[10px] text-slate-500 font-sans">A verification link is required to activate your profile.</p>
                    </div>
                  </div>

                  {/* Mail icon and Info */}
                  <div className="py-6 flex flex-col items-center justify-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
                      <Mail size={32} />
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <p className="text-sm text-slate-200 font-medium font-sans">
                        Verification link sent to:
                      </p>
                      <p className="text-sm font-mono text-cyan-300 font-bold bg-cyan-950/20 px-3 py-1.5 rounded-lg border border-cyan-500/10 select-all">
                        {email}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans pt-1">
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
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/30 text-slate-200 font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Open Gmail
                      <ArrowRight size={16} className="text-cyan-400" />
                    </a>

                    {/* Verify Completion Button */}
                    <button
                      type="button"
                      onClick={handleSignUpExecute}
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? 'Verifying status...' : 'I have verified my email'}
                      {!loading && <Check size={16} />}
                    </button>

                    {/* Resend Button */}
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={loading}
                      className="text-xs text-slate-500 hover:text-cyan-400 font-semibold transition-colors pt-1 cursor-pointer"
                    >
                      Didn't get the email? Resend verification link
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

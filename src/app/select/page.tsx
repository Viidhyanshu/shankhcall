'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Activity } from 'lucide-react';
import { auth } from '@/lib/firebase';
import ThemeToggle from '@/components/ThemeToggle';
import { signOut } from 'firebase/auth';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export default function DisasterSelector() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const mouseCoords = useRef({ x: 0, y: 0 });

  const [activeCard, setActiveCard] = useState<'forest' | 'ocean' | null>(null);

  // Sign out helper
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (e) {
      console.warn('Sign out error', e);
    }
  };

  // Canvas particle physics animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn particles if activeCard is set
      if (activeCard) {
        const color = activeCard === 'forest' ? 'rgba(52, 211, 153, ' : 'rgba(0, 194, 255, ';
        for (let i = 0; i < 2; i++) {
          particles.current.push({
            x: mouseCoords.current.x + (Math.random() - 0.5) * 80,
            y: mouseCoords.current.y + (Math.random() - 0.5) * 80,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 2 - 1, // Float upward
            alpha: 1,
            size: Math.random() * 3 + 1,
            color
          });
        }
      }

      // Update and draw particles
      particles.current = particles.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.shadowColor = p.color + '0.8)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        return p.alpha > 0;
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [activeCard]);

  // Track mouse coordinates on movement
  const handleMouseMove = (e: React.MouseEvent) => {
    mouseCoords.current = { x: e.clientX, y: e.clientY };
  };

  // Navigations with small delays
  const navigateTo = (path: string) => {
    setTimeout(() => {
      router.push(path);
    }, 400);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col justify-center items-center overflow-hidden px-4 select-none"
    >
      {/* Dynamic Canvas Particles Overlay */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Split background layout — no dividing line */}
      <div className="absolute inset-0 z-0 flex flex-col md:flex-row">
        {/* Left Side: Forest (Emerald Theme) */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden bg-gradient-to-br from-[#041e15]/40 via-[#060913] to-[#060913]">
          {/* Emerald animated grid */}
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-move [transform:rotateX(60deg)_translateZ(-100px)] origin-center" />
          {/* Glowing Green Orb */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-radial from-emerald-500/10 to-transparent blur-[80px] opacity-75 animate-orb-float" />
        </div>

        {/* Right Side: Ocean (Blue Theme) */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden bg-gradient-to-bl from-[#021f35]/40 via-[#060913] to-[#060913]">
          {/* Blue animated grid */}
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(14,165,233,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-move [transform:rotateX(60deg)_translateZ(-100px)] origin-center" />
          {/* Glowing Ocean Blue Orb */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-radial from-sky-500/10 to-transparent blur-[80px] opacity-75 animate-orb-float [animation-delay:3s]" />
        </div>
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

      {/* Watermark Navbar */}
      <header className="absolute top-8 left-8 md:left-12 z-20 flex items-center gap-3 select-none">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/20">
          <i className="fa-solid fa-cloud-showers-water text-white text-base"></i>
        </div>
        <span className="text-xl font-bold tracking-widest bg-gradient-to-r from-white via-cyan-400 to-white bg-clip-text text-transparent uppercase font-sans">
          शंखcall
        </span>
      </header>

      {/* Theme and Logout Top Right Container */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
        <ThemeToggle />
        <button
          onClick={handleSignOut}
          className="p-2.5 rounded-full bg-slate-950/40 border border-slate-900 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-300 flex items-center justify-center cursor-pointer"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Main Section */}
      <main className="relative z-10 text-center max-w-4xl space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-light tracking-[0.25em] text-white uppercase text-center bg-gradient-to-r from-white via-cyan-400 to-white bg-clip-text text-transparent animate-pulse font-sans">
            SELECT DISASTER
          </h1>
          <p className="text-slate-400 text-xs md:text-sm tracking-wider uppercase font-light max-w-md mx-auto leading-relaxed">
            Choose environmental monitoring board to observe real-time logs and social metrics.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          
          {/* Forest Card */}
          <div
            onMouseEnter={() => setActiveCard('forest')}
            onMouseLeave={() => setActiveCard(null)}
            onClick={() => navigateTo('/disaster/forest')}
            className={`w-[260px] h-[260px] rounded-2xl glass-panel relative flex flex-col justify-center items-center gap-5 cursor-pointer select-none transition-all duration-500 overflow-hidden border ${
              activeCard === 'forest' 
                ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/30 -translate-y-4 scale-105' 
                : 'border-slate-800/80 bg-slate-950/40'
            }`}
          >
            <div className={`h-20 w-20 rounded-full border flex items-center justify-center transition-all duration-500 ${
              activeCard === 'forest'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 rotate-y-180 scale-110 shadow-lg shadow-emerald-500/30'
                : 'border-slate-900 bg-slate-950/80 text-emerald-400'
            }`}>
              <svg className="h-10 w-10 stroke-current stroke-[1.5]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L8 8H10L7 14H9L6 22H18L15 14H17L14 8H16L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={`text-base tracking-[0.2em] font-semibold uppercase font-sans transition-all ${
              activeCard === 'forest' ? 'text-emerald-400' : 'text-slate-300'
            }`}>
              Forest
            </span>
          </div>

          {/* Ocean Card */}
          <div
            onMouseEnter={() => setActiveCard('ocean')}
            onMouseLeave={() => setActiveCard(null)}
            onClick={() => navigateTo('/disaster/ocean')}
            className={`w-[260px] h-[260px] rounded-2xl glass-panel relative flex flex-col justify-center items-center gap-5 cursor-pointer select-none transition-all duration-500 overflow-hidden border ${
              activeCard === 'ocean' 
                ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 -translate-y-4 scale-105' 
                : 'border-slate-800/80 bg-slate-950/40'
            }`}
          >
            <div className={`h-20 w-20 rounded-full border flex items-center justify-center transition-all duration-500 ${
              activeCard === 'ocean'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 rotate-y-180 scale-110 shadow-lg shadow-cyan-500/30'
                : 'border-slate-900 bg-slate-950/80 text-cyan-400'
            }`}>
              <svg className="h-10 w-10 stroke-current stroke-[1.5]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C2 12 4 9 8 9C12 9 10 12 14 12C18 12 20 9 20 9" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17C2 17 4 14 8 14C12 14 10 17 14 17C18 17 20 14 20 14" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="5" r="2"/>
              </svg>
            </div>
            <span className={`text-base tracking-[0.2em] font-semibold uppercase font-sans transition-all ${
              activeCard === 'ocean' ? 'text-cyan-400' : 'text-slate-300'
            }`}>
              Ocean
            </span>
          </div>

        </div>
      </main>
    </div>
  );
}

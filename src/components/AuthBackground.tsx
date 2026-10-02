import React from 'react';

const FLOATING_LEAVES = [
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
];

const WATER_DROPLETS = [
  { bottom: '30px',  left: '8%',  size: 5 , delay: '0s',   dur: '8s'  },
  { bottom: '60px',  left: '22%', size: 4 , delay: '1.5s', dur: '10s' },
  { bottom: '45px',  left: '38%', size: 6 , delay: '3s',   dur: '9s'  },
  { bottom: '70px',  left: '52%', size: 3 , delay: '2s',   dur: '11s' },
  { bottom: '35px',  left: '65%', size: 5 , delay: '4s',   dur: '7s'  },
  { bottom: '55px',  left: '78%', size: 4 , delay: '1s',   dur: '12s' },
  { bottom: '80px',  left: '90%', size: 6 , delay: '5s',   dur: '9s'  },
];

export default function AuthBackground() {
  return (
    <>
      {/* Linear gradient background — forest green (left) to ocean blue (right) */}
      <div className="absolute inset-0 z-0 main-bg-gradient">
        {/* Glowing Green Orb (left) */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full glow-orb-green-1 blur-[80px] opacity-80 animate-orb-float" />
        <div className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px] rounded-full glow-orb-green-2 blur-[60px] opacity-70 animate-orb-float [animation-delay:6s]" />
        {/* Glowing Ocean Blue Orb (right) */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full glow-orb-blue-1 blur-[80px] opacity-80 animate-orb-float [animation-delay:3s]" />
        <div className="absolute top-[15%] right-[15%] w-[400px] h-[400px] rounded-full glow-orb-blue-2 blur-[60px] opacity-70 animate-orb-float [animation-delay:8s]" />
      </div>

      {/* Floating Leaves — scattered across entire background */}
      {FLOATING_LEAVES.map((leaf, i) => (
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
        {WATER_DROPLETS.map((drop, i) => (
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
    </>
  );
}

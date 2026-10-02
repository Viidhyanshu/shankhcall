import React from 'react';

export default function AuthBrand() {
  return (
    <div className="absolute top-8 left-8 flex items-center gap-3 z-10 select-none">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/20">
        <i className="fa-solid fa-cloud-showers-water text-white text-base"></i>
      </div>
      <span className="text-xl font-bold tracking-widest brand-text-gradient uppercase font-sans">
        शंखcall
      </span>
    </div>
  );
}

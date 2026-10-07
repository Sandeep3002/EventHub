import React from 'react';

export default function Loading({ label = 'Loading EventHub...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin mb-4" />
      <span className="text-sm font-bold text-slate-300 tracking-wider uppercase">{label}</span>
    </div>
  );
}

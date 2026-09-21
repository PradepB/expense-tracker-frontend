import React from 'react';

export default function Footer({ darkMode }) {
  return (
    <footer className={`border-t py-4 px-6 text-center text-xs text-slate-400 transition-colors ${
      darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      Personal Finance & Cash Flow Planner (2026–2027) • React + Node.js + MongoDB Ready Architecture
    </footer>
  );
}

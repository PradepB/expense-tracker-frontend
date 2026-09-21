import React, { useState } from 'react';
import { TrendingUp, Calendar, Plus, Sun, Moon, Menu, X } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { SALARY_MONTHLY } from '../../utils/constants';

const formatINR = (val) => {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

export default function Navbar({ darkMode, setDarkMode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { selectedMonth, setSelectedMonth, logout, setIsAddModalOpen, budget, user } = useFinance();
  const currentSalary = budget?.monthlySalary || user?.monthlySalary || SALARY_MONTHLY;

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
      darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base sm:text-xl tracking-tight leading-tight">
              FinanceFlow <span className="hidden sm:inline-block text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">2026–2027 Full Stack</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Interactive Dashboard & Cash Flow Architecture • Monthly Inflow: <b>{formatINR(currentSalary)}</b>
          </p>
        </div>
      </div>

      <div className={`${
        isMobileMenuOpen
          ? 'absolute top-full left-0 right-0 border-b p-4 flex flex-col items-start gap-4 shadow-xl z-50'
          : 'hidden'
      } md:flex md:static md:w-auto md:border-none md:p-0 md:flex-row md:items-center md:gap-3 md:shadow-none ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      } md:bg-transparent`}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm text-xs w-full md:w-auto">
          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setIsMobileMenuOpen(false);
            }}
            className="bg-transparent font-semibold outline-none cursor-pointer text-slate-800 dark:text-slate-200 w-full"
          />
        </div>

        <button
          onClick={() => {
            setIsAddModalOpen(true);
            setIsMobileMenuOpen(false);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all w-full justify-center md:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>

        <button
          onClick={() => {
            setDarkMode(!darkMode);
            setIsMobileMenuOpen(false);
          }}
          className={`p-2 rounded-xl border transition-all w-full flex items-center justify-center gap-2 md:w-auto ${
            darkMode
              ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="md:hidden text-xs font-semibold text-slate-700 dark:text-slate-300">
            Toggle {darkMode ? 'Light' : 'Dark'} Mode
          </span>
        </button>

        <button 
          onClick={() => {
             logout();
             setIsMobileMenuOpen(false);
          }} 
          className="text-xs text-rose-500 font-semibold px-2 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg w-full md:w-auto text-left md:text-center mt-2 md:mt-0"
        >
          Logout
        </button>
      </div>

      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm"
      >
        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
    </header>
  );
}

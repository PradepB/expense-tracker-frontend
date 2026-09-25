import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, FileText, Target, Car, Landmark, TrendingUp } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { SALARY_MONTHLY } from '../../utils/constants';

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function Sidebar({ darkMode }) {
  const { selectedMonth, summary, budget, user } = useFinance();
  
  const currentSalary = budget?.monthlySalary || user?.monthlySalary || SALARY_MONTHLY;
  
  const tabs = [
    { id: '/dashboard', label: 'Interactive Dashboard', icon: Activity },
    { id: '/expenses', label: 'Monthly Expenses & Log', icon: FileText },
    { id: '/budget', label: 'Goal Milestones', icon: Target },
    { id: '/simulator', label: 'Car Loan Simulator', icon: Car },
    { id: '/accounts', label: 'Multi-Account Topology', icon: Landmark },
    { id: '/stocks', label: 'Stocks & IPOs', icon: TrendingUp }
  ];

  const totalActualLiving = summary.Living || 0;
  const totalActualInvestments = summary.Investments || 0;
  const totalActualSavings = summary.Savings || 0;
  
  const savingsRate = currentSalary > 0 ? ((totalActualInvestments + totalActualSavings) / currentSalary) * 100 : 0;

  return (
    <aside className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-4 shrink-0 transition-colors flex flex-col justify-between ${
      darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div>
        <nav className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.id}
                to={tab.id}
                className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    window.location.pathname === tab.id ? 'bg-emerald-800 text-white' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Sidebar Mini Widget */}
        <div className="hidden md:block mt-8 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-semibold">
            <span>{selectedMonth.toUpperCase()} SAVINGS</span>
            <span className="text-emerald-500 font-bold">{savingsRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
            <div style={{ width: `${(totalActualLiving / currentSalary) * 100}%` }} className="bg-amber-500" title="Living Spends" />
            <div style={{ width: `${(totalActualInvestments / currentSalary) * 100}%` }} className="bg-blue-500" title="SIPs" />
            <div style={{ width: `${(totalActualSavings / currentSalary) * 100}%` }} className="bg-emerald-500" title="Reserves" />
          </div>
          <div className="text-[11px] text-slate-500 space-y-1 pt-1">
            <div className="flex justify-between">
              <span>Living Exp:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatINR(totalActualLiving)}</span>
            </div>
            <div className="flex justify-between">
              <span>SIPs & Gold:</span>
              <span className="font-semibold text-blue-600">{formatINR(totalActualInvestments)}</span>
            </div>
            <div className="flex justify-between">
              <span>Reserves Stash:</span>
              <span className="font-semibold text-emerald-600">{formatINR(totalActualSavings)}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

import React from 'react';
import { Landmark, ShieldCheck, Car, TrendingUp } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { SALARY_MONTHLY, DEFAULT_BUDGET_CATEGORIES } from '../utils/constants';

const formatINR = (val) => {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

export default function AccountsPage() {
  const { budget, user, goals, loading } = useFinance();

  const currentSalary = budget?.monthlySalary || user?.monthlySalary || SALARY_MONTHLY;
  
  const currentCategories = budget?.allocations?.length > 0 
    ? budget.allocations.map(a => ({ ...a, id: a.itemId, planned: a.plannedAmount })) 
    : DEFAULT_BUDGET_CATEGORIES;

  const day2Outflow = currentCategories
    .filter(c => c.category !== 'Living' && c.account !== 'HDFC')
    .reduce((sum, c) => sum + c.planned, 0);
  const livingRetained = currentSalary - day2Outflow;

  const sbiGoal = goals?.find(g => g.name === 'Emergency Fund');
  
  const carGoal = goals?.find(g => g.name === 'Car Down Payment');
  const insuranceGoal = goals?.find(g => g.name === 'Insurance Reserve');
  const kvbMonthlyDebit = (carGoal?.monthlyRate || 0) + (insuranceGoal?.monthlyRate || 0);

  const dematItems = currentCategories.filter(c => c.account === 'Demat');
  const goldItem = dematItems.find(c => c.name.toLowerCase().includes('gold'));
  const goldReserve = goldItem ? goldItem.planned : 0;
  const sipItems = dematItems.filter(c => !c.name.toLowerCase().includes('gold'));
  const sipsTotal = sipItems.reduce((sum, c) => sum + c.planned, 0);

  if (loading) return <div className="p-4 text-slate-500">Loading accounts...</div>;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Multi-Account Isolation Strategy</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Strict separation to prevent living spend leakage into goal savings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 w-fit mb-3">
            <Landmark className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base">HDFC Bank A/c</h3>
          <p className="text-xs text-slate-400 mt-0.5">Primary Salary & Discretionary</p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between"><span>Day 1 Inflow:</span> <b>{formatINR(currentSalary)}</b></div>
            <div className="flex justify-between"><span>Day 2 Outflow:</span> <b className="text-rose-500">-{formatINR(day2Outflow)}</b></div>
            <div className="flex justify-between"><span>Living Retained:</span> <b>{formatINR(livingRetained)}</b></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 w-fit mb-3">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base">SBI Savings A/c</h3>
          <p className="text-xs text-slate-400 mt-0.5">Emergency Sinking Reserve</p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between"><span>Current Pool:</span> <b>{formatINR(sbiGoal?.current || 0)}</b></div>
            <div className="flex justify-between"><span>Standing Order:</span> <b className="text-emerald-600">+{formatINR(sbiGoal?.monthlyRate || 0)}/mo</b></div>
            <div className="flex justify-between"><span>Target:</span> <b>{formatINR(sbiGoal?.target || 0)}</b></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 w-fit mb-3">
            <Car className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base">KVB Bank A/c</h3>
          <p className="text-xs text-slate-400 mt-0.5">Car & Insurance Reserves</p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between"><span>Car Pool:</span> <b>{formatINR(carGoal?.current || 0)}</b></div>
            <div className="flex justify-between"><span>Insurance Pool:</span> <b>{formatINR(insuranceGoal?.current || 0)}</b></div>
            <div className="flex justify-between"><span>Monthly Debit:</span> <b className="text-emerald-600">+{formatINR(kvbMonthlyDebit)}/mo</b></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 w-fit mb-3">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base">Demat / Equity</h3>
          <p className="text-xs text-slate-400 mt-0.5">SIPs, Gold & Compounding</p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between"><span>{sipItems.length} Active SIPs:</span> <b>{formatINR(sipsTotal)}/mo</b></div>
            <div className="flex justify-between"><span>Gold Reserve:</span> <b>{formatINR(goldReserve)}/mo</b></div>
            <div className="flex justify-between"><span>Horizon:</span> <b className="text-purple-600">5-10+ Yrs</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}

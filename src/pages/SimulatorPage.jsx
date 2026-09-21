import React, { useState, useMemo } from 'react';

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function SimulatorPage() {
  const [carPrice, setCarPrice] = useState(1000000);
  const [downPayment, setDownPayment] = useState(250000);
  const [loanInterestRate, setLoanInterestRate] = useState(8.5);

  const carLoanPrincipal = Math.max(0, carPrice - downPayment);
  
  const calculateEMI = (principal, annualRate, tenureMonths) => {
    if (principal <= 0) return 0;
    const r = annualRate / 12 / 100;
    const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
    return Math.round(emi);
  };
  
  const emi36 = useMemo(() => calculateEMI(carLoanPrincipal, loanInterestRate, 36), [carLoanPrincipal, loanInterestRate]);
  const emi60 = useMemo(() => calculateEMI(carLoanPrincipal, loanInterestRate, 60), [carLoanPrincipal, loanInterestRate]);
  const totalInterest36 = (emi36 * 36) - carLoanPrincipal;
  const totalInterest60 = (emi60 * 60) - carLoanPrincipal;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Car Loan EMI Simulator</h2>
        <p className="text-sm text-slate-500">Compare loan tenures against cash flow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <label className="text-xs font-semibold text-slate-500 block mb-1">On-Road Car Price</label>
          <div className="text-lg font-bold mb-2">{formatINR(carPrice)}</div>
          <input type="range" min="600000" max="1800000" step="25000" value={carPrice} onChange={(e) => setCarPrice(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
        </div>
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <label className="text-xs font-semibold text-slate-500 block mb-1">Down Payment (KVB Pool)</label>
          <div className="text-lg font-bold mb-2 text-emerald-600">{formatINR(downPayment)}</div>
          <input type="range" min="100000" max={carPrice} step="25000" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" />
        </div>
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <label className="text-xs font-semibold text-slate-500 block mb-1">Interest Rate (% p.a.)</label>
          <div className="text-lg font-bold mb-2 text-indigo-600">{loanInterestRate}%</div>
          <input type="range" min="7.5" max="12.0" step="0.25" value={loanInterestRate} onChange={(e) => setLoanInterestRate(Number(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">3-Year Tenure (36 Months)</span>
          <div className="text-3xl font-extrabold mt-2">{formatINR(emi36)} <span className="text-xs font-normal text-slate-400">/ mo</span></div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex justify-between"><span>Total Interest:</span> <b>{formatINR(totalInterest36)}</b></div>
            <div className="flex justify-between"><span>Total Repayment:</span> <b>{formatINR(carLoanPrincipal + totalInterest36)}</b></div>
          </div>
        </div>
        <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">5-Year Tenure (60 Months - Recommended)</span>
          <div className="text-3xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400">{formatINR(emi60)} <span className="text-xs font-normal text-slate-400">/ mo</span></div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex justify-between"><span>Total Interest:</span> <b>{formatINR(totalInterest60)}</b></div>
            <div className="flex justify-between"><span>Total Repayment:</span> <b>{formatINR(carLoanPrincipal + totalInterest60)}</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}

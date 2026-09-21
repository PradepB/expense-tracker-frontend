import React, { useState } from 'react';
import { Car, Calculator, CheckCircle2 } from 'lucide-react';

export default function CarSimulator() {
  const [carPrice, setCarPrice] = useState(1000000);
  const [downPayment, setDownPayment] = useState(250000);
  const [rate, setRate] = useState(8.5);

  const loanAmount = Math.max(0, carPrice - downPayment);

  const calculateEMI = (principal, annualRate, tenureMonths) => {
    if (principal <= 0) return 0;
    const monthlyRate = annualRate / 12 / 100;
    return Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );
  };

  const emi3Year = calculateEMI(loanAmount, rate, 36);
  const emi5Year = calculateEMI(loanAmount, rate, 60);

  const totalPay3Year = emi3Year * 36;
  const interest3Year = totalPay3Year - loanAmount;

  const totalPay5Year = emi5Year * 60;
  const interest5Year = totalPay5Year - loanAmount;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
            <Car size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Car Loan & EMI Affordability Calculator</h2>
            <p className="text-xs text-slate-400">Dec 2026 Target Purchase Simulation (₹10 Lakh Benchmark)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <div className="flex justify-between text-xs mb-1.5 text-slate-400">
            <span>Car On-Road Price</span>
            <span className="text-white font-bold">₹{(carPrice / 100000).toFixed(1)} Lakh</span>
          </div>
          <input
            type="range"
            min="600000"
            max="1800000"
            step="50000"
            value={carPrice}
            onChange={(e) => setCarPrice(Number(e.target.value))}
            className="w-full accent-sky-400 bg-slate-800"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 text-slate-400">
            <span>Down Payment (KVB Car Fund)</span>
            <span className="text-white font-bold">₹{(downPayment / 100000).toFixed(2)} Lakh</span>
          </div>
          <input
            type="range"
            min="100000"
            max="500000"
            step="25000"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full accent-emerald-400 bg-slate-800"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 text-slate-400">
            <span>Bank Interest Rate</span>
            <span className="text-white font-bold">{rate}% p.a.</span>
          </div>
          <input
            type="range"
            min="7.5"
            max="11.5"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-purple-400 bg-slate-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">3-Year Loan (36 Months)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">Lower Total Interest</span>
          </div>
          <p className="text-2xl font-black text-white">₹{emi3Year.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400"> /mo</span></p>
          <div className="mt-3 text-xs space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Loan Amount:</span>
              <span className="text-slate-200">₹{loanAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Interest Load:</span>
              <span className="text-slate-200">₹{interest3Year.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-sky-500/30 p-4 rounded-xl bg-sky-950/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase text-sky-400">5-Year Loan (60 Months)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold">Recommended for Cash Flow</span>
          </div>
          <p className="text-2xl font-black text-sky-300">₹{emi5Year.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400"> /mo</span></p>
          <div className="mt-3 text-xs space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Loan Amount:</span>
              <span className="text-slate-200">₹{loanAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Interest Load:</span>
              <span className="text-slate-200">₹{interest5Year.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

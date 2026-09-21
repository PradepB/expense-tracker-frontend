import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { Pencil, Check } from 'lucide-react';

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function BudgetPage() {
  const { goals, loading, editGoal } = useFinance();
  const [editingGoal, setEditingGoal] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Milestones & Goal Tracking</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calculated against your monthly salary allocations and designated bank accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? <div>Loading goals...</div> : goals.map(goal => {
          const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div key={goal._id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {goal.bank}
                  </span>
                  <h3 className="font-bold text-lg mt-1 text-slate-900 dark:text-white">{goal.name}</h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                  {percent}% Reached
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span>Current Balance:</span>
                    {editingGoal?.id === goal._id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          className="w-20 text-right font-bold bg-slate-100 dark:bg-slate-800 rounded px-1 outline-none text-slate-800 dark:text-slate-100"
                          value={editingGoal.amount}
                          onChange={(e) => setEditingGoal({ ...editingGoal, amount: Number(e.target.value) })}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            editGoal(goal._id, { current: editingGoal.amount });
                            setEditingGoal(null);
                          }}
                          className="p-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-900"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <b className="text-slate-800 dark:text-slate-200">{formatINR(goal.current)}</b>
                        <button
                          onClick={() => setEditingGoal({ id: goal._id, amount: goal.current })}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          title="Edit Current Balance"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="font-bold">Target: {formatINR(goal.target)}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${goal.color}`} style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">Monthly Contribution: <b>{formatINR(goal.monthlyRate)}/mo</b></span>
                <span className="text-slate-400">Target Date: {goal.targetDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Filter, Trash2, Plus } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function ExpensesPage() {
  const { expenses, selectedMonth, removeExpense, loading, setIsAddModalOpen, budget } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const visibleExpenses = expenses.filter(item => {
    const matchSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const getSubcategoryName = (exp) => {
    if (exp.budgetItemId && budget?.allocations) {
      const match = budget.allocations.find(a => a.itemId === exp.budgetItemId);
      if (match) return match.name;
    }
    if (exp.title?.toLowerCase().startsWith('food')) return 'Food & Groceries';
    return 'Uncategorized';
  };

  const visibleExpensesTotal = visibleExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expense Records</h2>
          <p className="text-sm text-slate-500">Log for {selectedMonth}</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all">
          <Plus className="h-4 w-4" /> Add Transaction
        </button>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-sm outline-none dark:bg-slate-800 dark:border-slate-700" />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="text-sm rounded-lg border px-2.5 py-1.5 outline-none dark:bg-slate-800 dark:border-slate-700">
          <option value="All">All Categories</option>
          <option value="Living">Living Expenses</option>
          <option value="Investments">Investments</option>
          <option value="Savings">Savings</option>
        </select>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs">
            <tr>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? <tr><td colSpan={4} className="py-8 text-center text-slate-400">Loading...</td></tr> : 
             visibleExpenses.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-slate-400">No expenses found</td></tr> :
             visibleExpenses.map(exp => (
              <tr key={exp._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-medium">{exp.title}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      exp.category === 'Living'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : exp.category === 'Investments'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {exp.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                      {getSubcategoryName(exp)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold">{formatINR(exp.amount)}</td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => removeExpense(exp._id)} className="text-rose-600 p-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <td colSpan={2} className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 text-right">Total:</td>
              <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">{formatINR(visibleExpensesTotal)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

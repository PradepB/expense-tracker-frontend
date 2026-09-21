import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { DEFAULT_BUDGET_CATEGORIES } from '../../utils/constants';

export default function ExpenseFormModal({ darkMode }) {
  const { selectedMonth, addExpense, setIsAddModalOpen, showToast, addModalPrefill, setAddModalPrefill } = useFinance();
  
  const [newTx, setNewTx] = useState({
    title: '',
    amount: '',
    category: addModalPrefill?.category || 'Living',
    budgetItemId: addModalPrefill?.budgetItemId || 'food_personal',
    account: addModalPrefill?.account || 'HDFC',
    notes: ''
  });

  const handleClose = () => {
    setIsAddModalOpen(false);
    if (setAddModalPrefill) setAddModalPrefill(null);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newTx.title || !newTx.amount || Number(newTx.amount) <= 0) {
      alert('Please enter valid description and amount.');
      return;
    }

    await addExpense(newTx);
    
    handleClose();
    showToast(`Added "${newTx.title}" of ₹${newTx.amount} to ${selectedMonth}`);
    
    setNewTx({
      title: '',
      amount: '',
      category: 'Living',
      budgetItemId: 'food_personal',
      account: 'HDFC',
      notes: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base">Add New Expense / Outflow</h3>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleAddExpense} className="mt-4 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">Expense Title / Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Fuel Refill, Groceries, Amazon purchase"
              value={newTx.title}
              onChange={(e) => setNewTx({ ...newTx, title: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 2500"
                value={newTx.amount}
                onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border outline-none font-bold ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">Category</label>
              <select
                value={newTx.category}
                onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="Living">Living Expenses</option>
                <option value="Investments">Investments / SIP</option>
                <option value="Savings">Goal Savings</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">Linked Budget Target</label>
              <select
                value={newTx.budgetItemId}
                onChange={(e) => setNewTx({ ...newTx, budgetItemId: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border outline-none text-xs ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="">None / Ad-hoc</option>
                {DEFAULT_BUDGET_CATEGORIES.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">Source Account</label>
              <select
                value={newTx.account}
                onChange={(e) => setNewTx({ ...newTx, account: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="HDFC">HDFC Bank</option>
                <option value="SBI">SBI Bank</option>
                <option value="KVB">KVB Bank</option>
                <option value="Demat">Demat Account</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">Notes / Tags (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Swiggy order, Petrol at Shell"
              value={newTx.notes}
              onChange={(e) => setNewTx({ ...newTx, notes: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/30"
            >
              Save Outflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

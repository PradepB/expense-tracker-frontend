import React, { useMemo, useState } from 'react';
import { Wallet, CreditCard, TrendingUp, Sparkles, ShieldCheck, Car, Plus, Pencil, Check } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { DEFAULT_BUDGET_CATEGORIES, SALARY_MONTHLY } from '../utils/constants';

const formatINR = (val) => {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

export default function DashboardPage() {
  const { summary, selectedMonth, loading, expenses, setIsAddModalOpen, setAddModalPrefill, budget, updateBudgetDetails, user, goals } = useFinance();
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [tempSalary, setTempSalary] = useState(0);
  
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', category: 'Living', planned: '', account: 'HDFC' });
  const [editingCategory, setEditingCategory] = useState(null);

  const currentCategories = budget?.allocations?.length > 0 
    ? budget.allocations.map(a => ({ ...a, id: a.itemId, planned: a.plannedAmount })) 
    : DEFAULT_BUDGET_CATEGORIES;

  const getExpenseBudgetItemId = (exp) => {
    if (exp.budgetItemId && currentCategories.some(c => c.id === exp.budgetItemId)) {
      return exp.budgetItemId;
    }
    if (exp.title?.toLowerCase().startsWith('food')) {
      const foodCategory = currentCategories.find(c => c.name === 'Food & Groceries');
      if (foodCategory) return foodCategory.id;
    }
    return null;
  };

  // Aggregate actuals mapped by budget category
  const actualsMap = useMemo(() => {
    const map = {};
    currentCategories.forEach(item => { map[item.id] = 0; });
    expenses.filter(e => e.monthYear === selectedMonth).forEach(exp => {
      const targetId = getExpenseBudgetItemId(exp);
      if (targetId && map[targetId] !== undefined) {
        map[targetId] += Number(exp.amount);
      }
    });
    return map;
  }, [expenses, selectedMonth, currentCategories]);

  const handleAddCategory = () => {
    if (!newCat.name || !newCat.planned) return;
    const newItem = {
      itemId: newCat.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      name: newCat.name,
      category: newCat.category,
      plannedAmount: Number(newCat.planned),
      account: newCat.account
    };
    const updatedAllocations = [
      ...currentCategories.map(c => ({
        itemId: c.id,
        name: c.name,
        category: c.category,
        plannedAmount: c.planned,
        account: c.account
      })), 
      newItem
    ];
    updateBudgetDetails({ allocations: updatedAllocations });
    setIsAddCatOpen(false);
    setNewCat({ name: '', category: 'Living', planned: '', account: 'HDFC' });
  };

  if (loading) return <div>Loading dashboard...</div>;

  const currentSalary = budget?.monthlySalary || user?.monthlySalary || SALARY_MONTHLY;

  const totalActualLiving = (summary.Living || 0) + (summary.Discretionary || 0); // Include discretionary in living for dashboard
  const totalActualInvestments = summary.Investments || 0;
  const totalActualSavings = summary.Savings || 0;
  const totalActualEmergency = summary.Emergency || 0;
  
  const totalActualOutflow = totalActualLiving + totalActualInvestments + totalActualSavings + totalActualEmergency;
  const currentDiscretionaryRemaining = currentSalary - totalActualOutflow;

  const totalPlannedLiving = currentCategories
    .filter(i => i.category === 'Living')
    .reduce((s, i) => s + i.planned, 0);

  const totalPlannedAll = currentCategories.reduce((s, i) => s + i.planned, 0);
  
  const totalActualAll = expenses.filter(e => e.monthYear === selectedMonth).reduce((s, e) => s + Number(e.amount), 0);
  const mappedTotal = currentCategories.reduce((s, i) => s + (actualsMap[i.id] || 0), 0);
  const unmappedTotal = totalActualAll - mappedTotal;
  
  const unmappedExpenses = expenses
    .filter(e => e.monthYear === selectedMonth)
    .filter(e => !getExpenseBudgetItemId(e));
    
  const unmappedTooltipText = unmappedExpenses
    .map(e => `${e.title} (${e.category}): ${formatINR(e.amount)}`)
    .join('\n') || 'No unmapped expenses';

  const totalVarianceAll = totalPlannedAll - totalActualAll;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Interactive Financial Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live tracking for <b>{selectedMonth}</b> with instant budget recalculation and live variance checks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Log New Expense</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Stat Cards */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">MONTHLY INFLOW</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          {isEditingSalary ? (
            <div className="mt-2 flex items-center gap-2">
              <input 
                type="number" 
                className="w-full text-2xl font-bold bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 outline-none text-slate-800 dark:text-slate-100"
                value={tempSalary}
                onChange={(e) => setTempSalary(Number(e.target.value))}
                autoFocus
              />
              <button 
                onClick={() => {
                  updateBudgetDetails({ monthlySalary: tempSalary });
                  setIsEditingSalary(false);
                }}
                className="p-1.5 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-900"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <div className="text-2xl font-bold">{formatINR(currentSalary)}</div>
              <button 
                onClick={() => {
                  setTempSalary(currentSalary);
                  setIsEditingSalary(true);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Edit this month's inflow"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">100% Fixed</span> (Credited on 1st/2nd)
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">LIVING EXPENSES</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{formatINR(totalActualLiving)}</div>
          <div className="text-xs text-slate-500 mt-1 space-y-1">
            <div className="flex items-center justify-between">
              <span>Planned: {formatINR(totalPlannedLiving)}</span>
              <span className={totalActualLiving <= totalPlannedLiving ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                {totalActualLiving <= totalPlannedLiving ? 'Within Plan' : 'Over Limit'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-amber-500">{((totalActualLiving / currentSalary) * 100).toFixed(1)}%</span> of monthly salary
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">SIPs & INVESTMENTS</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{formatINR(totalActualInvestments)}</div>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-blue-500">{((totalActualInvestments / currentSalary) * 100).toFixed(1)}%</span> of monthly salary
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">SAVINGS</span>
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{formatINR(totalActualSavings)}</div>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-teal-500">{((totalActualSavings / currentSalary) * 100).toFixed(1)}%</span> of monthly salary
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${
          currentDiscretionaryRemaining >= 0
            ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300'
            : 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">NET UNSPENT SURPLUS</span>
            <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800">
              <Sparkles className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{formatINR(currentDiscretionaryRemaining)}</div>
          <p className="text-xs mt-1 opacity-80">
            {currentDiscretionaryRemaining >= 0 ? 'Liquid safety cash in HDFC' : 'Overspent take-home!'}
          </p>
        </div>
      </div>

      {/* Budget vs Actual Category Matrix */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base">Monthly Budget vs Actual Progress ({selectedMonth})</h3>
            <p className="text-xs text-slate-500">Live comparison across all obligations and SIP channels (Unmapped expenses will affect TOTAL Actual)</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Living</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Investments</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Savings</span>
            <button 
              onClick={() => setIsAddCatOpen(!isAddCatOpen)}
              className="ml-2 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded transition-colors"
            >
              <Plus className="h-3 w-3" /> Add Category
            </button>
          </div>
        </div>

        {isAddCatOpen && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 mt-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category Name</label>
              <input type="text" placeholder="e.g. Gym Membership" className="w-full text-sm p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Type</label>
              <select className="w-full text-sm p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none" value={newCat.category} onChange={e => setNewCat({...newCat, category: e.target.value})}>
                <option value="Living">Living</option>
                <option value="Investments">Investments</option>
                <option value="Savings">Savings</option>
              </select>
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Planned ₹</label>
              <input type="number" placeholder="0" className="w-full text-sm p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none" value={newCat.planned} onChange={e => setNewCat({...newCat, planned: e.target.value})} />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Account</label>
              <select className="w-full text-sm p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none" value={newCat.account} onChange={e => setNewCat({...newCat, account: e.target.value})}>
                <option value="HDFC">HDFC</option>
                <option value="SBI">SBI</option>
                <option value="KVB">KVB</option>
                <option value="Demat">Demat</option>
              </select>
            </div>
            <button onClick={handleAddCategory} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-semibold text-sm transition-colors w-full sm:w-auto">
              Save
            </button>
          </div>
        )}

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2 text-xs sm:text-sm">
          {currentCategories.map(item => {
            const actual = actualsMap[item.id] || 0;
            const variance = item.planned - actual;
            const isOver = actual > item.planned && item.planned > 0;

            return (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="sm:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${
                      item.category === 'Living' ? 'bg-amber-500' : item.category === 'Investments' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                      {item.account}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-2/3">
                  <div className="text-right flex items-center justify-end gap-2">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Planned</span>
                      {editingCategory?.id === item.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <input 
                            type="number" 
                            className="w-20 text-right font-medium bg-slate-100 dark:bg-slate-800 rounded px-1 outline-none text-slate-800 dark:text-slate-100"
                            value={editingCategory.amount}
                            onChange={(e) => setEditingCategory({...editingCategory, amount: Number(e.target.value)})}
                            autoFocus
                          />
                          <button 
                            onClick={() => {
                              const updatedAllocations = currentCategories.map(c => 
                                c.id === item.id ? { ...c, planned: editingCategory.amount } : c
                              ).map(c => ({
                                itemId: c.id,
                                name: c.name,
                                category: c.category,
                                plannedAmount: c.planned,
                                account: c.account
                              }));
                              updateBudgetDetails({ allocations: updatedAllocations });
                              setEditingCategory(null);
                            }}
                            className="p-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-900"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 justify-end">
                          <span className="font-medium">{formatINR(item.planned)}</span>
                          <button 
                            onClick={() => setEditingCategory({ id: item.id, amount: item.planned })}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Edit Planned Amount"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex items-center justify-end gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Actual Logged</span>
                      <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                        {formatINR(actual)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setAddModalPrefill({ category: item.category, budgetItemId: item.id, account: item.account });
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                      title="Quick Add to Category"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="w-24 text-right">
                    <span className="text-[11px] text-slate-400 block">Variance</span>
                    <span className={`font-semibold text-xs ${
                      variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {variance >= 0 ? `+${formatINR(variance)}` : `-${formatINR(Math.abs(variance))}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Unmapped / Others Row */}
          {unmappedTotal > 0 && (
            <div 
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg px-2 mt-1 relative group cursor-help"
              title={unmappedTooltipText}
            >
              <div className="sm:w-1/3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Others (Unmapped)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                    Any
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-2/3">
                <div className="text-right flex items-center justify-end gap-2">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Planned</span>
                    <span className="font-medium text-slate-400">{formatINR(0)}</span>
                  </div>
                </div>

                <div className="text-right flex items-center justify-end gap-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Actual Logged</span>
                    <span className="font-bold text-rose-600">
                      {formatINR(unmappedTotal)}
                    </span>
                  </div>
                  <div className="w-[28px]"></div> {/* Match spacing */}
                </div>

                <div className="w-24 text-right">
                  <span className="text-[11px] text-slate-400 block">Variance</span>
                  <span className="font-semibold text-xs text-rose-600">
                    -{formatINR(unmappedTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Totals Row */}
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-2 mt-2 border-t-2 border-slate-200 dark:border-slate-700">
            <div className="sm:w-1/3">
              <span className="font-bold text-slate-800 dark:text-slate-200">TOTAL</span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-2/3">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Planned</span>
                <span className="font-bold">{formatINR(totalPlannedAll)}</span>
              </div>
              <div className="text-right flex items-center justify-end gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 block">Actual Logged</span>
                  <span className={`font-bold ${totalActualAll > totalPlannedAll ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                    {formatINR(totalActualAll)}
                  </span>
                </div>
                <div className="w-[28px]"></div> {/* Match spacing of the quick add button */}
              </div>
              <div className="w-24 text-right">
                <span className="text-[11px] text-slate-400 block">Variance</span>
                <span className={`font-bold text-xs ${totalVarianceAll >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {totalVarianceAll >= 0 ? `+${formatINR(totalVarianceAll)}` : `-${formatINR(Math.abs(totalVarianceAll))}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Goal Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emergency Fund */}
        {(() => {
          const eGoal = goals?.find(g => g.name === 'Emergency Fund');
          if (!eGoal) return null;
          const ePercent = Math.min(100, (eGoal.current / eGoal.target) * 100);
          return (
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> {eGoal.bank}
                </span>
                <span className="text-xs font-bold text-amber-600">
                  {formatINR(eGoal.current)} / {formatINR(eGoal.target)}
                </span>
              </div>
              <div className="w-full bg-amber-200 dark:bg-amber-950 h-2.5 rounded-full overflow-hidden mt-2">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${ePercent}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Milestone 1 (₹1,00,000) target: Dec 2026. Zero withdrawal rule active.
              </p>
            </div>
          );
        })()}

        {/* Car Down Payment */}
        {(() => {
          const cGoal = goals?.find(g => g.name === 'Car Down Payment');
          if (!cGoal) return null;
          const cPercent = Math.min(100, (cGoal.current / cGoal.target) * 100);
          return (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <Car className="h-4 w-4" /> {cGoal.bank}
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {formatINR(cGoal.current)} / {formatINR(cGoal.target)}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-950 h-2.5 rounded-full overflow-hidden mt-2">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${cPercent}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Target: ₹2.5 Lakhs by Dec 2026 for zero-stress vehicle acquisition.
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

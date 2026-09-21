import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budget, setBudget] = useState(null);
  const [summary, setSummary] = useState({ Living: 0, Investments: 0, Savings: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });

  // Global UI State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalPrefill, setAddModalPrefill] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.data);
      localStorage.setItem('userInfo', JSON.stringify(res.data.data));
      return true;
    } catch (err) {
      console.error('Login error', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [expRes, goalRes, budgetRes] = await Promise.all([
        api.get(`/expenses?month=${selectedMonth}`).catch(() => ({ data: { data: [], summary: { Living: 0, Investments: 0, Savings: 0, total: 0 } } })),
        api.get('/goals').catch(() => ({ data: { data: [] } })),
        api.get(`/budget?month=${selectedMonth}`).catch(() => ({ data: { data: null } }))
      ]);
      setExpenses(expRes.data.data || []);
      setSummary(expRes.data.summary || { Living: 0, Investments: 0, Savings: 0, total: 0 });
      setGoals(goalRes.data.data || []);
      setBudget(budgetRes.data.data || null);
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, user]);

  const addExpense = async (payload) => {
    await api.post('/expenses', { ...payload, monthYear: selectedMonth });
    await loadData();
  };

  const removeExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    await loadData();
  };

  const editGoal = async (id, updated) => {
    await api.put(`/goals/${id}`, updated);
    await loadData();
  };

  const updateBudgetDetails = async (payload) => {
    try {
      await api.post('/budget', { monthYear: selectedMonth, ...payload });
      await loadData();
    } catch (err) {
      console.error('Error updating budget:', err);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        expenses,
        goals,
        budget,
        summary,
        loading,
        user,
        isAddModalOpen,
        setIsAddModalOpen,
        addModalPrefill,
        setAddModalPrefill,
        toastMessage,
        showToast,
        login,
        logout,
        addExpense,
        removeExpense,
        editGoal,
        updateBudgetDetails,
        loadData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

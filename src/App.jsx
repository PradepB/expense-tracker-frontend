import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import BudgetPage from './pages/BudgetPage';
import SimulatorPage from './pages/SimulatorPage';
import AccountsPage from './pages/AccountsPage';
import StocksPage from './pages/StocksPage';
import LoginPage from './pages/LoginPage';
import ExpenseFormModal from './components/expenses/ExpenseFormModal';
import { useFinance } from './hooks/useFinance';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const { user, toastMessage, isAddModalOpen } = useFinance();

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="h-4 w-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar darkMode={darkMode} />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/stocks" element={<StocksPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>

        {isAddModalOpen && <ExpenseFormModal darkMode={darkMode} />}

        <Footer darkMode={darkMode} />
      </div>
    </Router>
  );
}

import React, { useState, useEffect } from 'react';
import { LineChart, List, Plus, Briefcase, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import TransactionFormModal from '../components/stocks/TransactionFormModal';
import IPOFormModal from '../components/stocks/IPOFormModal';
import { useFinance } from '../hooks/useFinance';

export default function StocksPage() {
  const { selectedMonth } = useFinance();
  const [activeTab, setActiveTab] = useState('holdings'); // holdings, transactions, ipos
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isIPOModalOpen, setIsIPOModalOpen] = useState(false);
  const [ipoToEdit, setIpoToEdit] = useState(null);

  const openIPOModal = (ipo = null) => {
    setIpoToEdit(ipo);
    setIsIPOModalOpen(true);
  };

  useEffect(() => {
    if (activeTab === 'holdings') {
      fetchHoldings();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'ipos') {
      fetchIPOs();
    }
  }, [activeTab, selectedMonth]);

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/stocks/holdings');
      setHoldings(data);
    } catch (error) {
      console.error('Failed to fetch holdings', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/stocks/transactions?month=${selectedMonth}`);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIPOs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/stocks/ipos?month=${selectedMonth}`);
      setIpos(data);
    } catch (error) {
      console.error('Failed to fetch IPOs', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (activeTab === 'holdings') fetchHoldings();
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'ipos') fetchIPOs();
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      try {
        await api.delete(`/stocks/transactions/${id}`);
        refreshData();
      } catch (error) {
        console.error('Failed to delete transaction', error);
      }
    }
  };

  const handleDeleteIPO = async (id) => {
    if (window.confirm('Are you sure you want to delete this IPO application?')) {
      try {
        await api.delete(`/stocks/ipos/${id}`);
        refreshData();
      } catch (error) {
        console.error('Failed to delete IPO', error);
      }
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            Stocks & IPOs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your equity portfolio, trades, and IPO allocations</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsTxModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Trade
          </button>
          <button 
            onClick={() => openIPOModal(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add IPO
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('holdings')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'holdings' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Briefcase className="h-4 w-4" /> Holdings
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'transactions' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <List className="h-4 w-4" /> Transactions
        </button>
        <button
          onClick={() => setActiveTab('ipos')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'ipos' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <LineChart className="h-4 w-4" /> IPO Applications
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : activeTab === 'holdings' ? (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Current Portfolio Holdings</h2>
            {holdings.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <p>No holdings found. Add a transaction to see your portfolio.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-medium">Ticker</th>
                      <th className="pb-3 font-medium text-right">Quantity</th>
                      <th className="pb-3 font-medium text-right">Avg Cost</th>
                      <th className="pb-3 font-medium text-right">Total Invested</th>
                      <th className="pb-3 font-medium text-right">Realized P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {holdings.map((h) => (
                      <tr key={h.ticker} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{h.ticker}</td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300">{h.quantity}</td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(h.averageCost)}</td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(h.totalInvested)}</td>
                        <td className={`py-3 text-right font-medium ${h.realizedPL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {h.realizedPL > 0 ? '+' : ''}{formatCurrency(h.realizedPL)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'transactions' ? (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Trade History</h2>
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <p>No transactions found. Add a trade to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Ticker</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium text-right">Quantity</th>
                      <th className="pb-3 font-medium text-right">Price</th>
                      <th className="pb-3 font-medium text-right">Total Amount</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 text-slate-600 dark:text-slate-300">{formatDate(t.transactionDate)}</td>
                        <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{t.ticker}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.type === 'buy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                            {t.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300">{t.quantity}</td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(t.pricePerUnit)}</td>
                        <td className="py-3 text-right font-medium text-slate-900 dark:text-slate-100">{formatCurrency(t.totalAmount)}</td>
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => handleDeleteTransaction(t._id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            title="Delete Trade"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">IPO Applications</h2>
            {ipos.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <p>No IPO applications found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">IPO Name</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Invested</th>
                      <th className="pb-3 font-medium text-right">Allotted</th>
                      <th className="pb-3 font-medium text-right">Held</th>
                      <th className="pb-3 font-medium text-right">Sold</th>
                      <th className="pb-3 font-medium text-right">Sold Date</th>
                      <th className="pb-3 font-medium text-right">Sold Amt</th>
                      <th className="pb-3 font-medium text-right">P/L</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ipos.map((ipo) => {
                      const qtyHeld = (ipo.allocatedShares || 0) - (ipo.quantitySold || 0);
                      const totalSold = (ipo.quantitySold || 0) * (ipo.soldPricePerShare || 0);
                      const plDiff = totalSold > 0 ? totalSold - (ipo.amountInvested || 0) : null;
                      
                      return (
                      <tr key={ipo._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 text-slate-600 dark:text-slate-300">{formatDate(ipo.dateApplied)}</td>
                        <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                          {ipo.ipoName}
                          <div className="text-xs text-slate-500 font-normal">{ipo.ticker}</div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            ipo.status === 'allotted' || ipo.status === 'listed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                            ipo.status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          }`}>
                            {ipo.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right font-medium text-slate-900 dark:text-slate-100">{formatCurrency(ipo.amountInvested)}</td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300">{ipo.allocatedShares || '-'}</td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300">{qtyHeld > 0 ? qtyHeld : '-'}</td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300">{ipo.quantitySold || '-'}</td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300">{ipo.dateSold ? formatDate(ipo.dateSold) : '-'}</td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300">{totalSold > 0 ? formatCurrency(totalSold) : '-'}</td>
                        <td className={`py-3 text-right font-medium ${plDiff > 0 ? 'text-emerald-500' : plDiff < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                          {plDiff !== null ? (plDiff > 0 ? '+' : '') + formatCurrency(plDiff) : '-'}
                        </td>
                        <td className="py-3 text-right flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openIPOModal(ipo)}
                            className="text-slate-400 hover:text-blue-500 transition-colors p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit IPO Details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteIPO(ipo._id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            title="Delete IPO"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <TransactionFormModal 
        isOpen={isTxModalOpen} 
        onClose={() => setIsTxModalOpen(false)} 
        onSaved={refreshData}
      />
      <IPOFormModal 
        isOpen={isIPOModalOpen} 
        onClose={() => setIsIPOModalOpen(false)} 
        onSaved={refreshData}
        ipoToEdit={ipoToEdit}
      />
    </div>
  );
}

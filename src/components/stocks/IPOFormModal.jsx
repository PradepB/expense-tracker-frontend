import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../../services/api';

const initialState = {
  ipoName: '',
  ticker: '',
  dateApplied: new Date().toISOString().split('T')[0],
  amountInvested: '',
  allocatedShares: '',
  pricePerShare: '',
  quantitySold: '',
  soldPricePerShare: '',
  dateSold: '',
  status: 'applied',
  notes: '',
};

export default function IPOFormModal({ isOpen, onClose, onSaved, ipoToEdit }) {
  const [formData, setFormData] = useState({ ...initialState });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (ipoToEdit) {
        setFormData({
          ipoName: ipoToEdit.ipoName || '',
          ticker: ipoToEdit.ticker || '',
          dateApplied: ipoToEdit.dateApplied ? new Date(ipoToEdit.dateApplied).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          amountInvested: ipoToEdit.amountInvested || '',
          allocatedShares: ipoToEdit.allocatedShares || '',
          pricePerShare: ipoToEdit.pricePerShare || '',
          quantitySold: ipoToEdit.quantitySold || '',
          soldPricePerShare: ipoToEdit.soldPricePerShare || '',
          dateSold: ipoToEdit.dateSold ? new Date(ipoToEdit.dateSold).toISOString().split('T')[0] : '',
          status: ipoToEdit.status || 'applied',
          notes: ipoToEdit.notes || '',
        });
      } else {
        setFormData({ ...initialState });
      }
    }
  }, [isOpen, ipoToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'ticker' ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amountInvested: Number(formData.amountInvested),
        allocatedShares: formData.allocatedShares ? Number(formData.allocatedShares) : 0,
        pricePerShare: formData.pricePerShare ? Number(formData.pricePerShare) : 0,
        quantitySold: formData.quantitySold ? Number(formData.quantitySold) : 0,
        soldPricePerShare: formData.soldPricePerShare ? Number(formData.soldPricePerShare) : 0,
        dateSold: formData.dateSold || undefined,
      };
      
      // Compute realized profit/loss
      if (payload.quantitySold > 0 && payload.soldPricePerShare > 0) {
        payload.realizedProfitLoss = (payload.soldPricePerShare - payload.pricePerShare) * payload.quantitySold;
      }

      if (ipoToEdit) {
        await api.put(`/stocks/ipos/${ipoToEdit._id}`, payload);
      } else {
        await api.post('/stocks/ipos', payload);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save IPO application:', error);
      alert('Failed to save IPO application. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{ipoToEdit ? 'Edit' : 'Add'} IPO Application</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">IPO Company Name</label>
            <input
              required
              type="text"
              name="ipoName"
              value={formData.ipoName}
              onChange={handleChange}
              placeholder="Tech Startup Inc"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ticker Symbol</label>
              <input
                required
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                placeholder="e.g. TSI"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="applied">Applied</option>
                <option value="allotted">Allotted</option>
                <option value="rejected">Rejected</option>
                <option value="listed">Listed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date Applied</label>
              <input
                required
                type="date"
                name="dateApplied"
                value={formData.dateApplied}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount Invested</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                name="amountInvested"
                value={formData.amountInvested}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-4 border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Allotment & Selling Details</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Allocated Shares</label>
                  <input
                    type="number"
                    name="allocatedShares"
                    value={formData.allocatedShares}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Price Per Share</label>
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerShare"
                    value={formData.pricePerShare}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Quantity Sold</label>
                  <input
                    type="number"
                    name="quantitySold"
                    value={formData.quantitySold}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Sold Price Per Share</label>
                  <input
                    type="number"
                    step="0.01"
                    name="soldPricePerShare"
                    value={formData.soldPricePerShare}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Date Sold</label>
                  <input
                    type="date"
                    name="dateSold"
                    value={formData.dateSold}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="E.g., Applied from retail quota"
              rows={2}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : <><Save className="h-4 w-4" /> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

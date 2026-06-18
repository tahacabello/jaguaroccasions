import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Check, X, AlertCircle, RefreshCw, Download, 
  DollarSign, Calendar, ArrowUpRight, ArrowDownLeft, FileText
} from 'lucide-react';
import { addPayment, deletePayment } from '@/lib/supabase';

interface PaymentTrackerProps {
  payments: any[];
  onRefresh: () => void;
}

export default function PaymentTracker({ payments, onRefresh }: PaymentTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Transaction Form State
  const [newPay, setNewPay] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    movement_type: 'cash', // cash, transfer, refund
    notes: '',
    payment_status: 'completed'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const movementTypes: Record<string, string> = {
    'cash': 'نقدي 💵',
    'transfer': 'تحويل بنكي 🏦',
    'partial': 'دفع جزئي 🧾',
    'deposit': 'عربون 🔑',
    'final_payment': 'استكمال سداد 💰',
    'refund': 'استرجاع مبلغ 🔄'
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPay.amount <= 0) {
      setErrorMsg("الرجاء إدخال مبلغ صحيح.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Invert amount if refund
      const finalAmount = newPay.movement_type === 'refund' ? -Math.abs(newPay.amount) : Math.abs(newPay.amount);
      const payload = {
        ...newPay,
        amount: finalAmount
      };

      const res = await addPayment(payload);
      if (!res.success) throw new Error(res.error || "فشل تسجيل المعاملة");

      setSuccessMsg("تم تسجيل المعاملة المالية بنجاح!");
      setTimeout(() => {
        setIsModalOpen(false);
        setNewPay({
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          movement_type: 'cash',
          notes: '',
          payment_status: 'completed'
        });
        onRefresh();
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ المعاملة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المعاملة المالية؟")) {
      const success = await deletePayment(id);
      if (success) {
        onRefresh();
      } else {
        alert("فشل حذف المعاملة.");
      }
    }
  };

  const exportPayments = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["التاريخ", "المبلغ (د.ل)", "نوع الحركة", "ملاحظات الحركة", "الحالة"].join(",") + "\n"
      + payments.map(p => [
          `"${p.date}"`, 
          `"${p.amount}"`, 
          `"${movementTypes[p.movement_type] || p.movement_type}"`, 
          `"${p.notes || ''}"`, 
          `"${p.payment_status}"`
        ].join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `مدفوعات_جاغوار_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.movement_type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate Net Total
  const netTotal = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign size={20} className="text-amber-500" />
            تعقب المدفوعات والخزينة
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">كشف بكافة الحركات المالية المستلمة والمستردة.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportPayments}
            className="bg-zinc-900 hover:bg-zinc-800 text-gray-300 border border-zinc-800 hover:border-zinc-700 py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all"
          >
            <Download size={14} />
            تصدير CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-premium py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs"
          >
            <Plus size={14} />
            تسجيل حركة مالية
          </button>
        </div>
      </div>

      {/* Net Box */}
      <div className="p-4 glass rounded-xl flex justify-between items-center border border-zinc-800 bg-zinc-950/20">
        <div>
          <span className="text-[11px] text-gray-400 block font-semibold">إجمالي رصيد الخزينة الحالي (الصافي)</span>
          <span className="text-2xl font-black text-white mt-1 block">{netTotal.toLocaleString()} د.ل</span>
        </div>
        <div className={`p-3 rounded-lg ${netTotal >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {netTotal >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute right-3 top-2.5 text-gray-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="ابحث بملاحظات أو تفاصيل الحركة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg py-2 pr-10 pl-4 text-xs text-white transition-all"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg py-2 px-4 text-xs text-white transition-all md:w-48"
        >
          <option value="all">جميع الحركات</option>
          {Object.entries(movementTypes).map(([key, val]) => (
            <option key={key} value={key}>{val}</option>
          ))}
        </select>
      </div>

      {/* Payments list */}
      <div className="glass rounded-xl overflow-hidden border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-gray-400 uppercase font-bold">
              <tr>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4">القيمة المالية</th>
                <th className="py-3.5 px-4">نوع الحركة</th>
                <th className="py-3.5 px-4">تفاصيل الحركة والملاحظات</th>
                <th className="py-3.5 px-4 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-gray-300">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    <AlertCircle size={32} className="mx-auto mb-2 text-zinc-700" />
                    لا توجد حركات مالية مسجلة حالياً.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-300">
                      {p.date}
                    </td>
                    <td className={`py-4 px-4 font-bold text-sm ${Number(p.amount) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {Number(p.amount) >= 0 ? `+${p.amount}` : p.amount} د.ل
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-zinc-900 border border-zinc-800 text-amber-500/95 font-bold px-2.5 py-0.5 rounded">
                        {movementTypes[p.movement_type] || p.movement_type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 max-w-sm truncate" title={p.notes}>
                      {p.notes || 'لا يوجد ملاحظات تسجيل'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="bg-zinc-900 hover:bg-rose-950/40 text-rose-500 border border-zinc-800 rounded p-1.5 transition-all"
                          title="حذف الحركة"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Manual Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-premium rounded-xl max-w-md w-full border border-zinc-800">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">تسجيل حركة مالية يدوية بالخزينة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-xs flex items-center gap-2">
                  <Check size={16} />
                  {successMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold">المبلغ المطلوب (د.ل) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPay.amount}
                  onChange={(e) => setNewPay(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">تاريخ الحركة *</label>
                  <input
                    type="date"
                    required
                    value={newPay.date}
                    onChange={(e) => setNewPay(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">نوع الحركة *</label>
                  <select
                    value={newPay.movement_type}
                    onChange={(e) => setNewPay(prev => ({ ...prev, movement_type: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white font-bold"
                  >
                    <option value="cash">نقدي 💵</option>
                    <option value="transfer">تحويل بنكي 🏦</option>
                    <option value="refund">استرجاع مبلغ (سالب) 🔄</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold">ملاحظات وبيان المعاملة *</label>
                <textarea
                  required
                  value={newPay.notes}
                  onChange={(e) => setNewPay(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  placeholder="مثال: شراء كيس تغليف، تحويل فوري من زبون..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 py-2.5 px-4 rounded-lg text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-premium py-2.5 px-5 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'تسجيل المعاملة بالخزينة'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

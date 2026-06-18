import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash, X, Check, AlertCircle, RefreshCw, 
  Users, UserCheck, Phone, Download, FileText
} from 'lucide-react';
import { addCustomer, updateCustomer, deleteCustomer } from '@/lib/supabase';

interface CustomerManagerProps {
  customers: any[];
  onRefresh: () => void;
}

export default function CustomerManager({ customers, onRefresh }: CustomerManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    id_type: 'بطاقة شخصية',
    id_name: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const idTypes = [
    'بطاقة شخصية', 'رخصة قيادة', 'جواز سفر', 'كتيب عائلة', 'إثبات آخر'
  ];

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name || '',
        phone: editingCustomer.phone || '',
        whatsapp: editingCustomer.whatsapp || '',
        address: editingCustomer.address || '',
        id_type: editingCustomer.id_type || 'بطاقة شخصية',
        id_name: editingCustomer.id_name || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        whatsapp: '',
        address: '',
        id_type: 'بطاقة شخصية',
        id_name: '',
      });
    }
  }, [editingCustomer, isModalOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingCustomer) {
        const success = await updateCustomer(editingCustomer.id, formData);
        if (!success) throw new Error("فشل تحديث بيانات العميل في قاعدة البيانات");
        setSuccessMsg("تم تحديث بيانات العميل بنجاح!");
      } else {
        const res = await addCustomer(formData);
        if (!res.success) throw new Error(res.error || "فشل إضافة العميل الجديد");
        setSuccessMsg("تم تسجيل العميل الجديد بنجاح!");
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setEditingCustomer(null);
        onRefresh();
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟ سيؤدي ذلك لحذف السجلات المرتبطة به إن وجدت.")) {
      const success = await deleteCustomer(id);
      if (success) {
        onRefresh();
      } else {
        alert("فشل حذف العميل.");
      }
    }
  };

  const exportCustomers = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["الاسم", "رقم الهاتف", "الواتساب", "العنوان", "نوع الهوية", "الاسم على الهوية"].join(",") + "\n"
      + customers.map(c => [
          `"${c.name}"`, 
          `"${c.phone || ''}"`, 
          `"${c.whatsapp || ''}"`, 
          `"${c.address || ''}"`, 
          `"${c.id_type || ''}"`, 
          `"${c.id_name || ''}"`
        ].join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `عملاء_جاغوار_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.whatsapp && c.whatsapp.includes(searchTerm))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-amber-500" />
            إدارة العملاء والزبائن
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">سجل العملاء وإثباتات الهوية وعناوين التوصيل.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportCustomers}
            className="bg-zinc-900 hover:bg-zinc-800 text-gray-300 border border-zinc-800 hover:border-zinc-700 py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all"
          >
            <Download size={14} />
            تصدير CSV
          </button>
          <button 
            onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
            className="btn-premium py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs"
          >
            <Plus size={14} />
            إضافة عميل جديد
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute right-3 top-2.5 text-gray-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="ابحث باسم العميل، رقم الهاتف، أو الواتساب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg py-2 pr-10 pl-4 text-xs text-white transition-all"
        />
      </div>

      {/* Customers Table / Cards */}
      <div className="glass rounded-xl overflow-hidden border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-gray-400 uppercase font-bold">
              <tr>
                <th className="py-3.5 px-4">اسم العميل</th>
                <th className="py-3.5 px-4">رقم الهاتف / واتساب</th>
                <th className="py-3.5 px-4">العنوان</th>
                <th className="py-3.5 px-4">نوع الهوية والاسم المدون</th>
                <th className="py-3.5 px-4 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-gray-300">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    <AlertCircle size={32} className="mx-auto mb-2 text-zinc-700" />
                    لم يتم العثور على أي عملاء مسجلين.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                        {c.name.slice(0, 2)}
                      </div>
                      {c.name}
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      {c.phone && <div className="text-gray-300">{c.phone}</div>}
                      {c.whatsapp && (
                        <a 
                          href={`https://wa.me/${c.whatsapp}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Phone size={10} />
                          واتساب: {c.whatsapp}
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-400 max-w-xs truncate" title={c.address}>
                      {c.address || 'لا يوجد عنوان (استلام من المحل)'}
                    </td>
                    <td className="py-4 px-4">
                      {c.id_type ? (
                        <div className="space-y-0.5">
                          <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-amber-500 px-2 py-0.5 rounded font-bold">{c.id_type}</span>
                          <div className="text-[11px] text-gray-400 mt-1 font-bold">{c.id_name || 'مطابق لاسم العميل'}</div>
                        </div>
                      ) : (
                        <span className="text-gray-600">غير محدد</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setEditingCustomer(c); setIsModalOpen(true); }}
                          className="bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-zinc-800 rounded p-1.5 transition-all"
                          title="تعديل العميل"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="bg-zinc-900 hover:bg-rose-950/40 text-rose-500 border border-zinc-800 rounded p-1.5 transition-all"
                          title="حذف العميل"
                        >
                          <Trash size={12} />
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

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-premium rounded-xl max-w-md w-full border border-zinc-800">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">
                {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
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
                <label className="text-xs text-gray-300 font-bold">اسم العميل بالكامل *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  placeholder="مثال: أحمد عبد الله الورفلي"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">رقم الهاتف *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white text-left"
                    placeholder="091XXXXXXX"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">رقم الواتساب</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white text-left"
                    placeholder="21891XXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold">عنوان التوصيل (مطلوب عند طلب التوصيل)</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  placeholder="المدينة، الشارع، أو علامة مميزة..."
                />
              </div>

              <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-3">
                <h4 className="text-[11px] font-bold text-amber-500">إثبات هوية العميل (للإيجار والحجوزات)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">نوع إثبات الهوية</label>
                    <select
                      name="id_type"
                      value={formData.id_type}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2 text-xs text-white font-bold"
                    >
                      {idTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">الاسم المدون على الهوية</label>
                    <input
                      type="text"
                      name="id_name"
                      value={formData.id_name}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2 text-xs text-white"
                      placeholder="إن كان مختلفاً عن الاسم الأول"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 py-2 px-4 rounded-lg text-xs font-semibold border border-zinc-800 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-premium py-2 px-5 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ وبيانات العميل'
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

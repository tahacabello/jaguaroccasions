import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Check, X, AlertCircle, RefreshCw, Printer, Download,
  ShoppingBag, DollarSign, FileText, Trash
} from 'lucide-react';
import { addOrder, deleteOrder, addCustomer } from '@/lib/supabase';

interface SalesManagerProps {
  orders: any[];
  products: any[];
  customers: any[];
  onRefresh: () => void;
  openNewSaleFlag: boolean;
  setOpenNewSaleFlag: (flag: boolean) => void;
}

export default function SalesManager({
  orders,
  products,
  customers,
  onRefresh,
  openNewSaleFlag,
  setOpenNewSaleFlag
}: SalesManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Sale Form State
  const [newSale, setNewSale] = useState({
    customer_id: '',
    total_amount: 0,
    payment_status: 'paid',
    notes: '',
  });

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Guest customer states
  const [isGuestCustomer, setIsGuestCustomer] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestWhatsapp, setGuestWhatsapp] = useState('');

  useEffect(() => {
    if (openNewSaleFlag) {
      setIsModalOpen(true);
      setOpenNewSaleFlag(false);
    }
  }, [openNewSaleFlag]);

  const handleProductSelect = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    if (selectedProducts.some(p => p.id === prodId)) {
      const filtered = selectedProducts.filter(p => p.id !== prodId);
      setSelectedProducts(filtered);
      recalcTotal(filtered);
    } else {
      const updated = [...selectedProducts, { ...prod, quantity: 1, custom_price: prod.price_sale || 0 }];
      setSelectedProducts(updated);
      recalcTotal(updated);
    }
  };

  const handleProductQtyChange = (prodId: string, qty: number) => {
    const updated = selectedProducts.map(p => {
      if (p.id === prodId) return { ...p, quantity: Math.max(1, qty) };
      return p;
    });
    setSelectedProducts(updated);
    recalcTotal(updated);
  };

  const handleProductPriceChange = (prodId: string, price: number) => {
    const updated = selectedProducts.map(p => {
      if (p.id === prodId) return { ...p, custom_price: Math.max(0, price) };
      return p;
    });
    setSelectedProducts(updated);
    recalcTotal(updated);
  };

  const recalcTotal = (prods: any[]) => {
    const total = prods.reduce((sum, p) => sum + (Number(p.custom_price) * Number(p.quantity)), 0);
    setNewSale(prev => ({
      ...prev,
      total_amount: total
    }));
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isGuestCustomer && !newSale.customer_id) {
      setErrorMsg("الرجاء اختيار العميل.");
      return;
    }
    if (isGuestCustomer && !guestName.trim()) {
      setErrorMsg("الرجاء إدخال اسم العميل.");
      return;
    }
    if (selectedProducts.length === 0) {
      setErrorMsg("الرجاء اختيار منتج واحد على الأقل.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalCustomerId = newSale.customer_id;

      if (isGuestCustomer) {
        const custRes = await addCustomer({
          name: guestName.trim(),
          phone: guestPhone.trim() || null,
          whatsapp: guestWhatsapp.trim() || null
        });
        if (!custRes.success) throw new Error(custRes.error || "فشل تسجيل العميل الجديد.");
        finalCustomerId = custRes.data.id;
      }

      const payload = {
        ...newSale,
        customer_id: finalCustomerId,
        status: 'completed'
      };

      const itemsPayload = selectedProducts.map(p => ({
        product_id: p.id,
        quantity: p.quantity,
        price: p.custom_price
      }));

      const res = await addOrder(payload, itemsPayload);
      if (!res.success) throw new Error(res.error || "فشل تسجيل الفاتورة");

      setSuccessMsg("تم تسجيل فاتورة البيع المباشر بنجاح!");
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedProducts([]);
        setNewSale({
          customer_id: '',
          total_amount: 0,
          payment_status: 'paid',
          notes: '',
        });
        setIsGuestCustomer(false);
        setGuestName('');
        setGuestPhone('');
        setGuestWhatsapp('');
        onRefresh();
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ الفاتورة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟ (لن يؤثر ذلك على مخزون المنتجات التلقائي)")) {
      const success = await deleteOrder(id);
      if (success) {
        onRefresh();
      } else {
        alert("فشل حذف الفاتورة.");
      }
    }
  };

  const printInvoice = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const custName = order.customers?.name || 'عميل';
      const custPhone = order.customers?.phone || '';
      const itemsHtml = order.items?.map((item: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.products?.name || 'منتج'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${item.price} د.ل</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
        <head>
          <title>فاتورة مبيعات - جاغوار</title>
          <style>
            body { font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #c9a84c; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 20px; color: #b08d33; }
            .info-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .info-table td { padding: 5px; font-size: 13px; }
            .items-table th { background-color: #f5f5f5; padding: 8px; text-align: right; border-bottom: 2px solid #ddd; font-size: 13px; }
            .footer { text-align: center; font-size: 11px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h1>جاغوار للمناسبات</h1>
            <div style="font-size: 12px; margin-top: 5px;">فاتورة مبيعات نقدية</div>
          </div>
          
          <table class="info-table">
            <tr>
              <td><strong>رقم الفاتورة:</strong> ${order.order_number}</td>
              <td><strong>التاريخ:</strong> ${new Date(order.created_at).toLocaleDateString('ar-LY')}</td>
            </tr>
            <tr>
              <td><strong>الزبون:</strong> ${custName}</td>
              <td><strong>الهاتف:</strong> ${custPhone}</td>
            </tr>
          </table>

          <h3 style="font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 20px;">المنتجات المباعة</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th style="text-align: center;">الكمية</th>
                <th style="text-align: left;">القيمة</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="float: left; width: 200px; margin-top: 10px;">
            <table style="width: 100%; font-size: 14px; font-weight: bold;">
              <tr>
                <td>الإجمالي المدفوع:</td>
                <td style="text-align: left; color: green;">${order.total_amount} د.ل</td>
              </tr>
            </table>
          </div>
          <div style="clear: both;"></div>

          <div class="footer">
            <p>شكراً لشرائكم من جاغوار للمناسبات</p>
            <p style="font-size: 9px;">طرابلس، ليبيا</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const exportSales = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["رقم الفاتورة", "العميل", "الهاتف", "التاريخ", "الإجمالي المدفوع", "الملاحظات"].join(",") + "\n"
      + orders.map(o => [
          `"${o.order_number}"`, 
          `"${o.customers?.name || ''}"`, 
          `"${o.customers?.phone || ''}"`, 
          `"${new Date(o.created_at).toLocaleDateString('ar-LY')}"`, 
          `"${o.total_amount}"`, 
          `"${o.notes || ''}"`
        ].join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `مبيعات_جاغوار_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => {
    const custName = o.customers?.name || '';
    const custPhone = o.customers?.phone || '';
    return (
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custPhone.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-amber-500" />
            سجل المبيعات المباشرة
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">تسجيل وتأكيد المبيعات النقدية للعملاء وإصدار الفواتير.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportSales}
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
            بيع مباشر جديد
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <span className="absolute right-3 top-2.5 text-gray-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="ابحث برقم الفاتورة، اسم العميل، أو الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg py-2 pr-10 pl-4 text-xs text-white transition-all"
        />
      </div>

      {/* Sales list */}
      <div className="glass rounded-xl overflow-hidden border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-gray-400 uppercase font-bold">
              <tr>
                <th className="py-3.5 px-4">رقم الفاتورة</th>
                <th className="py-3.5 px-4">الزبون</th>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4">إجمالي القيمة</th>
                <th className="py-3.5 px-4">ملاحظات</th>
                <th className="py-3.5 px-4 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-gray-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-500">
                    <AlertCircle size={32} className="mx-auto mb-2 text-zinc-700" />
                    لا توجد فواتير مبيعات مسجلة.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const custName = order.customers?.name || 'غير معروف';
                  const custPhone = order.customers?.phone || '';
                  
                  return (
                    <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {order.order_number}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-zinc-200">{custName}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{custPhone}</div>
                      </td>
                      <td className="py-4 px-4">
                        {new Date(order.created_at).toLocaleDateString('ar-LY')}
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-400">
                        {order.total_amount} د.ل
                      </td>
                      <td className="py-4 px-4 text-gray-400 max-w-xs truncate" title={order.notes}>
                        {order.notes || 'لا يوجد ملاحظات'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => printInvoice(order)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white border border-zinc-800 rounded p-1.5 transition-all"
                            title="طباعة الفاتورة"
                          >
                            <Printer size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="bg-zinc-900 hover:bg-rose-950/40 text-rose-500 border border-zinc-800 rounded p-1.5 transition-all"
                            title="حذف الفاتورة"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Direct Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-premium rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">تسجيل عملية بيع مباشر جديدة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSale} className="p-6 space-y-6">
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

              {/* Customer selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-gray-300 font-bold">العميل *</label>
                  <label className="flex items-center gap-1.5 text-xs text-amber-500 font-bold cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={isGuestCustomer}
                      onChange={(e) => setIsGuestCustomer(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-800 text-amber-500 focus:ring-amber-500"
                    />
                    إدخال عميل يدوي (غير مسجل)
                  </label>
                </div>

                {!isGuestCustomer ? (
                  <select
                    value={newSale.customer_id}
                    onChange={(e) => setNewSale(prev => ({ ...prev, customer_id: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white font-bold"
                  >
                    <option value="">-- اختر عميلاً --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone || 'بدون هاتف'})</option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-950/60 rounded-lg border border-zinc-900">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">اسم العميل *</label>
                      <input 
                        type="text"
                        required={isGuestCustomer}
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded p-2 text-xs text-white"
                        placeholder="مثال: أحمد محمد"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">رقم الهاتف</label>
                      <input 
                        type="text"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded p-2 text-xs text-white"
                        placeholder="مثال: 0912345678"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block font-bold">رقم الواتساب (اختياري)</label>
                      <input 
                        type="text"
                        value={guestWhatsapp}
                        onChange={(e) => setGuestWhatsapp(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded p-2 text-xs text-white"
                        placeholder="مثال: 0912345678"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Products selection list */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold block">اختيار المنتجات المباعة *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-zinc-950 rounded-lg border border-zinc-900">
                  {products.filter(p => p.status === 'available' && p.quantity > 0).map(prod => {
                    const isSelected = selectedProducts.some(p => p.id === prod.id);
                    return (
                      <div 
                        key={prod.id} 
                        onClick={() => handleProductSelect(prod.id)}
                        className={`p-2.5 rounded border text-xs cursor-pointer flex justify-between items-center transition-all ${
                          isSelected ? 'border-amber-500 bg-amber-500/5 text-white font-bold' : 'border-zinc-800 hover:border-zinc-700 text-gray-400'
                        }`}
                      >
                        <div>
                          <div>{prod.name}</div>
                          <div className="text-[10px] text-zinc-500 font-normal">كود: {prod.code} | متاح: {prod.quantity}</div>
                        </div>
                        <span className="text-emerald-400 font-bold">{prod.price_sale} د.ل</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected items edit */}
              {selectedProducts.length > 0 && (
                <div className="space-y-3 p-4 bg-zinc-900/40 rounded-lg border border-zinc-800">
                  <h4 className="text-xs font-bold text-white">المنتجات المختارة والكميات</h4>
                  <div className="space-y-3">
                    {selectedProducts.map(p => (
                      <div key={p.id} className="flex justify-between items-center gap-4 border-b border-zinc-900 pb-2 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-gray-200">{p.name}</span>
                          <div className="text-[10px] text-gray-500">السعر الافتراضي: {p.price_sale} د.ل</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">الكمية:</span>
                            <input
                              type="number"
                              min="1"
                              max={p.quantity}
                              value={p.quantity}
                              onChange={(e) => handleProductQtyChange(p.id, Number(e.target.value))}
                              className="w-12 bg-zinc-955 border border-zinc-800 rounded p-1 text-xs text-center text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">سعر البيع:</span>
                            <input
                              type="number"
                              min="0"
                              value={p.custom_price}
                              onChange={(e) => handleProductPriceChange(p.id, Number(e.target.value))}
                              className="w-16 bg-zinc-955 border border-zinc-800 rounded p-1 text-xs text-center text-white font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">إجمالي قيمة الفاتورة (د.ل)</label>
                  <input
                    type="number"
                    readOnly
                    value={newSale.total_amount}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:outline-none rounded-lg p-2.5 text-xs text-emerald-400 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">ملاحظات البيع</label>
                  <input
                    type="text"
                    value={newSale.notes}
                    onChange={(e) => setNewSale(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    placeholder="ملاحظات العميل والتغليف..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 py-2.5 px-5 rounded-lg text-xs font-semibold border border-zinc-800 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-premium py-2.5 px-6 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'تأكيد البيع وحسم المخزون'
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

import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Check, X, AlertCircle, RefreshCw, Printer, Download,
  Calendar, FileText, DollarSign, ShoppingBag, Truck, Info, Award
} from 'lucide-react';
import { addReservation, updateReservation, deleteReservation, addPayment, addCustomer } from '@/lib/supabase';

interface ReservationManagerProps {
  reservations: any[];
  products: any[];
  customers: any[];
  onRefresh: () => void;
  openNewReservationFlag: boolean;
  setOpenNewReservationFlag: (flag: boolean) => void;
}

export default function ReservationManager({
  reservations,
  products,
  customers,
  onRefresh,
  openNewReservationFlag,
  setOpenNewReservationFlag
}: ReservationManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<any>(null);
  
  // New Reservation Form State
  const [newRes, setNewRes] = useState({
    customer_id: '',
    start_date: new Date().toISOString().split('T')[0],
    pickup_date: '',
    return_date: '',
    total_amount: 0,
    deposit: 0,
    notes: '',
    delivery_method: 'store_pickup',
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
  
  // Payment recording state
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (openNewReservationFlag) {
      setIsModalOpen(true);
      setOpenNewReservationFlag(false);
    }
  }, [openNewReservationFlag]);

  const handleProductSelect = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    if (selectedProducts.some(p => p.id === prodId)) {
      // Remove
      const filtered = selectedProducts.filter(p => p.id !== prodId);
      setSelectedProducts(filtered);
      recalcTotal(filtered);
    } else {
      // Add
      const updated = [...selectedProducts, { ...prod, quantity: 1, custom_price: prod.price_rent || 0 }];
      setSelectedProducts(updated);
      recalcTotal(updated);
    }
  };

  const handleProductQtyChange = (prodId: string, qty: number) => {
    const updated = selectedProducts.map(p => {
      if (p.id === prodId) {
        return { ...p, quantity: Math.max(1, qty) };
      }
      return p;
    });
    setSelectedProducts(updated);
    recalcTotal(updated);
  };

  const handleProductPriceChange = (prodId: string, price: number) => {
    const updated = selectedProducts.map(p => {
      if (p.id === prodId) {
        return { ...p, custom_price: Math.max(0, price) };
      }
      return p;
    });
    setSelectedProducts(updated);
    recalcTotal(updated);
  };

  const recalcTotal = (prods: any[]) => {
    const total = prods.reduce((sum, p) => sum + (Number(p.custom_price) * Number(p.quantity)), 0);
    setNewRes(prev => ({
      ...prev,
      total_amount: total
    }));
  };

  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isGuestCustomer && !newRes.customer_id) {
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
    if (!newRes.pickup_date || !newRes.return_date) {
      setErrorMsg("الرجاء تحديد تاريخ الاستلام وتاريخ الإرجاع.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalCustomerId = newRes.customer_id;

      if (isGuestCustomer) {
        const custRes = await addCustomer({
          name: guestName.trim(),
          phone: guestPhone.trim() || null,
          whatsapp: guestWhatsapp.trim() || null
        });
        if (!custRes.success) throw new Error(custRes.error || "فشل تسجيل العميل الجديد.");
        finalCustomerId = custRes.data.id;
      }

      const remaining = Number(newRes.total_amount) - Number(newRes.deposit);
      const paymentStatus = remaining <= 0 ? 'paid' : (Number(newRes.deposit) > 0 ? 'partial' : 'unpaid');

      const payload = {
        ...newRes,
        customer_id: finalCustomerId,
        remaining,
        payment_status: paymentStatus,
        status: 'active'
      };

      const itemsPayload = selectedProducts.map(p => ({
        product_id: p.id,
        quantity: p.quantity,
        price: p.custom_price
      }));

      const res = await addReservation(payload, itemsPayload);
      if (!res.success) throw new Error(res.error || "فشل تسجيل الحجز");

      setSuccessMsg("تم تسجيل الحجز بنجاح!");
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedProducts([]);
        setNewRes({
          customer_id: '',
          start_date: new Date().toISOString().split('T')[0],
          pickup_date: '',
          return_date: '',
          total_amount: 0,
          deposit: 0,
          notes: '',
          delivery_method: 'store_pickup',
        });
        setIsGuestCustomer(false);
        setGuestName('');
        setGuestPhone('');
        setGuestWhatsapp('');
        onRefresh();
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ الحجز.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (confirm(`هل أنت متأكد من تغيير حالة الحجز إلى: ${status === 'completed' ? 'مكتمل' : 'ملغي'}؟`)) {
      const remaining = status === 'completed' ? 0 : undefined;
      const payment_status = status === 'completed' ? 'paid' : undefined;

      const success = await updateReservation(id, { 
        status,
        remaining,
        payment_status
      });

      if (success) {
        // If completed or cancelled, release product status
        const reservation = reservations.find(r => r.id === id);
        if (reservation && reservation.items) {
          for (const item of reservation.items) {
            await updateReservation(id, { status }); // Ensure DB sync
            // Set products back to available
            await updateReservation(item.product_id, { status: 'available' });
          }
        }
        onRefresh();
      } else {
        alert("فشل تحديث حالة الحجز.");
      }
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes) return;
    if (paymentAmount <= 0) {
      alert("الرجاء إدخال مبلغ صحيح.");
      return;
    }

    setIsPaying(true);

    try {
      const resNum = selectedRes.reservation_number;
      // Record payment
      const payRes = await addPayment({
        amount: paymentAmount,
        date: new Date().toISOString().split('T')[0],
        movement_type: 'final_payment',
        linked_operation_type: 'reservation',
        linked_operation_id: selectedRes.id,
        notes: paymentNotes || `استكمال دفع الحجز رقم ${resNum}`,
        payment_status: 'completed'
      });

      if (!payRes.success) throw new Error(payRes.error || "فشل تسجيل الدفعة");

      // Update reservation remaining
      const newRemaining = Math.max(0, Number(selectedRes.remaining) - paymentAmount);
      const newDeposit = Number(selectedRes.deposit) + paymentAmount;
      const newPaymentStatus = newRemaining <= 0 ? 'paid' : 'partial';

      const success = await updateReservation(selectedRes.id, {
        remaining: newRemaining,
        deposit: newDeposit,
        payment_status: newPaymentStatus
      });

      if (!success) throw new Error("فشل تحديث الحجز");

      alert("تم تسجيل الدفعة وتحديث الحجز بنجاح!");
      setSelectedRes(null);
      setPaymentAmount(0);
      setPaymentNotes('');
      onRefresh();

    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء معالجة الدفعة.");
    } finally {
      setIsPaying(false);
    }
  };

  const printReceipt = (res: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const custName = res.customers?.name || 'عميل';
      const custPhone = res.customers?.phone || '';
      const itemsHtml = res.items?.map((item: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.products?.name || 'منتج'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${item.price} د.ل</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
        <head>
          <title>وصل حجز - جاغوار للمناسبات</title>
          <style>
            body { font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 20px; color: #b38728; }
            .info-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .info-table td { padding: 5px; font-size: 13px; }
            .items-table th { background-color: #f5f5f5; padding: 8px; text-align: right; border-bottom: 2px solid #ddd; font-size: 13px; }
            .totals { font-size: 13px; font-weight: bold; text-align: left; }
            .footer { text-align: center; font-size: 11px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h1>جاغوار للمناسبات</h1>
            <div style="font-size: 12px; margin-top: 5px;">وصل تأكيد حجز تخرج</div>
          </div>
          
          <table class="info-table">
            <tr>
              <td><strong>رقم الحجز:</strong> ${res.reservation_number}</td>
              <td><strong>تاريخ التسجيل:</strong> ${new Date(res.created_at).toLocaleDateString('ar-LY')}</td>
            </tr>
            <tr>
              <td><strong>الزبون:</strong> ${custName}</td>
              <td><strong>الهاتف:</strong> ${custPhone}</td>
            </tr>
            <tr>
              <td><strong>تاريخ الاستلام:</strong> ${res.pickup_date}</td>
              <td><strong>تاريخ الإرجاع:</strong> ${res.return_date}</td>
            </tr>
            <tr>
              <td><strong>طريقة الاستلام:</strong> ${res.delivery_method === 'store_pickup' ? 'استلام من المحل' : 'توصيل للعنوان'}</td>
              <td><strong>حالة الدفع:</strong> ${res.payment_status === 'paid' ? 'خالص بالكامل' : 'عربون جزئي'}</td>
            </tr>
          </table>

          <h3 style="font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 20px;">المنتجات المحجوزة</h3>
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
            <table style="width: 100%; font-size: 13px;">
              <tr>
                <td>الإجمالي:</td>
                <td style="text-align: left;">${res.total_amount} د.ل</td>
              </tr>
              <tr>
                <td style="color: green;">المدفوع:</td>
                <td style="text-align: left; color: green;">${res.deposit} د.ل</td>
              </tr>
              <tr style="font-weight: bold; border-top: 1px solid #000;">
                <td style="color: red;">المتبقي:</td>
                <td style="text-align: left; color: red;">${res.remaining} د.ل</td>
              </tr>
            </table>
          </div>
          <div style="clear: both;"></div>

          <div className="footer">
            <p>جاغوار للمناسبات - شكراً لثقتكم بنا</p>
            <p style="font-size: 9px;">طرابلس، ليبيا</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const exportReservations = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["رقم الحجز", "العميل", "الهاتف", "تاريخ الاستلام", "تاريخ الإرجاع", "المبلغ الإجمالي", "العربون", "المتبقي", "حالة الدفع", "حالة الحجز"].join(",") + "\n"
      + reservations.map(r => [
          `"${r.reservation_number}"`, 
          `"${r.customers?.name || ''}"`, 
          `"${r.customers?.phone || ''}"`, 
          `"${r.pickup_date}"`, 
          `"${r.return_date}"`, 
          `"${r.total_amount}"`, 
          `"${r.deposit}"`, 
          `"${r.remaining}"`, 
          `"${r.payment_status}"`, 
          `"${r.status}"`
        ].join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `حجوزات_جاغوار_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter reservations
  const filteredReservations = reservations.filter(r => {
    const custName = r.customers?.name || '';
    const custPhone = r.customers?.phone || '';
    const matchesSearch = 
      r.reservation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custPhone.includes(searchTerm);
      
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-amber-500" />
            إدارة سجل الحجوزات
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">متابعة حجوزات التخرج وتأكيد الدفع والتسليمات.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportReservations}
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
            حجز جديد
          </button>
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
            placeholder="ابحث برقم الحجز، اسم العميل، أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg py-2 pr-10 pl-4 text-xs text-white transition-all"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg py-2 px-4 text-xs text-white transition-all md:w-48"
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشط / ساري</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      {/* Reservations Table */}
      <div className="glass rounded-xl overflow-hidden border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-gray-400 uppercase font-bold">
              <tr>
                <th className="py-3.5 px-4">رقم الحجز</th>
                <th className="py-3.5 px-4">الزبون</th>
                <th className="py-3.5 px-4">التاريخ (استلام ➔ إرجاع)</th>
                <th className="py-3.5 px-4">القيمة المالية</th>
                <th className="py-3.5 px-4">حالة الحجز والدفع</th>
                <th className="py-3.5 px-4 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-gray-300">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-500">
                    <AlertCircle size={32} className="mx-auto mb-2 text-zinc-700" />
                    لا توجد حجوزات مسجلة حالياً.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const custName = res.customers?.name || 'غير معروف';
                  const custPhone = res.customers?.phone || '';
                  
                  return (
                    <tr key={res.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {res.reservation_number}
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {res.delivery_method === 'delivery' ? '🚚 توصيل للعميل' : '🏪 استلام من المحل'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-zinc-200">{custName}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{custPhone}</div>
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="text-amber-500 font-medium">استلام: {res.pickup_date}</div>
                        <div className="text-blue-400 font-medium">إرجاع: {res.return_date}</div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div>الإجمالي: {res.total_amount} د.ل</div>
                        <div className="text-emerald-500">المدفوع: {res.deposit} د.ل</div>
                        {Number(res.remaining) > 0 && <div className="text-rose-500">المتبقي: {res.remaining} د.ل</div>}
                      </td>
                      <td className="py-4 px-4 space-y-2">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            res.status === 'active' ? 'badge-available' :
                            res.status === 'completed' ? 'badge-completed' : 'badge-cancelled'
                          }`}>
                            {res.status === 'active' && 'نشط'}
                            {res.status === 'completed' && 'مكتمل'}
                            {res.status === 'cancelled' && 'ملغي'}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            res.payment_status === 'paid' ? 'badge-completed' :
                            res.payment_status === 'partial' ? 'badge-reserved' : 'badge-unavailable'
                          }`}>
                            {res.payment_status === 'paid' && 'خالص'}
                            {res.payment_status === 'partial' && 'مدفوع جزئياً'}
                            {res.payment_status === 'unpaid' && 'غير مدفوع'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {res.status === 'active' && (
                            <>
                              {Number(res.remaining) > 0 && (
                                <button 
                                  onClick={() => { setSelectedRes(res); setPaymentAmount(res.remaining); }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2.5 py-1 text-[10px] font-bold transition-all"
                                  title="دفع المتبقي"
                                >
                                  دفع المتبقي
                                </button>
                              )}
                              <button 
                                onClick={() => handleUpdateStatus(res.id, 'completed')}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2.5 py-1 text-[10px] font-bold transition-all"
                                title="إغلاق وإرجاع"
                              >
                                إرجاع وإتمام
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(res.id, 'cancelled')}
                                className="bg-zinc-800 hover:bg-rose-950/40 text-rose-500 border border-zinc-700 rounded p-1"
                                title="إلغاء الحجز"
                              >
                                <X size={12} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => printReceipt(res)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white border border-zinc-800 rounded p-1.5"
                            title="طباعة الوصل"
                          >
                            <Printer size={12} />
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

      {/* New Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-premium rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">تسجيل حجز جديد (تأجير للمناسبة)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveReservation} className="p-6 space-y-6">
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

              {/* Customer Selection */}
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
                    value={newRes.customer_id}
                    onChange={(e) => setNewRes(prev => ({ ...prev, customer_id: e.target.value }))}
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

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">تاريخ الاستلام المتوقع *</label>
                  <input
                    type="date"
                    required
                    value={newRes.pickup_date}
                    onChange={(e) => setNewRes(prev => ({ ...prev, pickup_date: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">تاريخ الإرجاع المتوقع *</label>
                  <input
                    type="date"
                    required
                    value={newRes.return_date}
                    onChange={(e) => setNewRes(prev => ({ ...prev, return_date: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Product Selection List */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold block">اختيار المنتجات المراد حجزها *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-zinc-950 rounded-lg border border-zinc-900">
                  {products.filter(p => p.status === 'available').map(prod => {
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
                          <div className="text-[10px] text-zinc-500 font-normal">كود: {prod.code}</div>
                        </div>
                        <span className="text-amber-500 font-bold">{prod.price_rent} د.ل</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Products Quantities & custom prices */}
              {selectedProducts.length > 0 && (
                <div className="space-y-3 p-4 bg-zinc-900/40 rounded-lg border border-zinc-800">
                  <h4 className="text-xs font-bold text-white">المنتجات المختارة وتعديل الأسعار</h4>
                  <div className="space-y-3">
                    {selectedProducts.map(p => (
                      <div key={p.id} className="flex justify-between items-center gap-4 border-b border-zinc-900 pb-2 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-gray-200">{p.name}</span>
                          <div className="text-[10px] text-gray-500">التصنيف: {p.category}</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">الكمية:</span>
                            <input
                              type="number"
                              min="1"
                              value={p.quantity}
                              onChange={(e) => handleProductQtyChange(p.id, Number(e.target.value))}
                              className="w-12 bg-zinc-950 border border-zinc-800 rounded p-1 text-xs text-center text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">السعر:</span>
                            <input
                              type="number"
                              min="0"
                              value={p.custom_price}
                              onChange={(e) => handleProductPriceChange(p.id, Number(e.target.value))}
                              className="w-16 bg-zinc-950 border border-zinc-800 rounded p-1 text-xs text-center text-white font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financials Setup */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">إجمالي قيمة الحجز (د.ل)</label>
                  <input
                    type="number"
                    readOnly
                    value={newRes.total_amount}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:outline-none rounded-lg p-2.5 text-xs text-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">العربون المدفوع حالياً (د.ل)</label>
                  <input
                    type="number"
                    min="0"
                    max={newRes.total_amount}
                    value={newRes.deposit}
                    onChange={(e) => setNewRes(prev => ({ ...prev, deposit: Number(e.target.value) }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">المبلغ المتبقي للتحصيل</label>
                  <input
                    type="number"
                    readOnly
                    value={newRes.total_amount - newRes.deposit}
                    className="w-full bg-zinc-955 border border-zinc-800 focus:outline-none rounded-lg p-2.5 text-xs text-rose-500 font-bold"
                  />
                </div>
              </div>

              {/* Delivery method & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">طريقة تسليم الطلب</label>
                  <select
                    value={newRes.delivery_method}
                    onChange={(e) => setNewRes(prev => ({ ...prev, delivery_method: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="store_pickup">استلام من المحل</option>
                    <option value="delivery">توصيل للعنوان (تأكد من عنوان العميل)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">ملاحظات الحجز</label>
                  <input
                    type="text"
                    value={newRes.notes}
                    onChange={(e) => setNewRes(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    placeholder="ملاحظات القياس، التطريز، تعديلات الاسم..."
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
                    'تأكيد الحجز وتسجيل الدفعة'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      {selectedRes && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-premium rounded-xl max-w-sm w-full border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-xs sm:text-sm">تسجيل دفعة للحجز: {selectedRes.reservation_number}</h3>
              <button onClick={() => setSelectedRes(null)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">المبلغ المطلوب سداده (المتبقي: {selectedRes.remaining} د.ل)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedRes.remaining}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-emerald-400 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">ملاحظات الدفع</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  placeholder="مثال: استلام نقدي من الزبون"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedRes(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 py-2 px-4 rounded-lg text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  {isPaying ? <RefreshCw size={12} className="animate-spin" /> : <DollarSign size={12} />}
                  تسجيل الدفع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

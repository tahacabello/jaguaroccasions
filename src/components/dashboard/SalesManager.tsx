import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Check, X, AlertCircle, RefreshCw, Printer, Download,
  ShoppingBag, DollarSign, FileText, Trash, Edit, Calendar, Info
} from 'lucide-react';
import { addOrder, deleteOrder, addCustomer, addProduct, supabase } from '@/lib/supabase';

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
    deposit: 0,
    remaining: 0,
    payment_status: 'paid', // paid, partial, unpaid
    notes: '',
    sale_type: 'immediate', // immediate (فوري), preorder (حجز مسبق)
    event_date: '',
    pickup_date: '',
    is_preliminary: false, // أول ما تجهز
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

  // Editing and Success Screen states
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [savedOrderData, setSavedOrderData] = useState<any>(null);

  useEffect(() => {
    if (openNewSaleFlag) {
      setIsModalOpen(true);
      setOpenNewSaleFlag(false);
    }
  }, [openNewSaleFlag, setOpenNewSaleFlag]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    setSavedOrderData(null);
    setSelectedProducts([]);
    setSuccessMsg('');
    setErrorMsg('');
    setNewSale({
      customer_id: '',
      total_amount: 0,
      deposit: 0,
      remaining: 0,
      payment_status: 'paid',
      notes: '',
      sale_type: 'immediate',
      event_date: '',
      pickup_date: '',
      is_preliminary: false,
    });
    setIsGuestCustomer(false);
    setGuestName('');
    setGuestPhone('');
    setGuestWhatsapp('');
    setOpenNewSaleFlag(false);
  };

  const handleEditClick = (order: any) => {
    setEditingOrder(order);
    const isPreorder = !!(order.event_date || order.pickup_date || order.is_preliminary);
    setNewSale({
      customer_id: order.customer_id || '',
      total_amount: order.total_amount || 0,
      deposit: order.deposit || 0,
      remaining: order.remaining || 0,
      payment_status: order.payment_status || 'paid',
      notes: order.customer_notes || order.notes || '',
      sale_type: isPreorder ? 'preorder' : 'immediate',
      event_date: order.event_date || '',
      pickup_date: order.pickup_date || '',
      is_preliminary: !!order.is_preliminary,
    });
    
    // Load products
    const mapped = (order.items || []).map((item: any) => ({
      id: item.product_id,
      name: item.products?.name || item.product_name || "منتج مخصص",
      price_sale: item.price || item.price_at_purchase || 0,
      custom_price: item.price || item.price_at_purchase || 0,
      quantity: item.quantity || 1,
      category: item.products?.category || "أخرى"
    }));
    setSelectedProducts(mapped);
    setIsGuestCustomer(false); 
    setIsModalOpen(true);
  };

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

  const recalcTotal = (prods: any[], depositVal = newSale.deposit) => {
    const total = prods.reduce((sum, p) => sum + (Number(p.custom_price) * Number(p.quantity)), 0);
    const depositAmt = Number(depositVal || 0);
    const rem = Math.max(0, total - depositAmt);
    const payStatus = rem <= 0 ? 'paid' : (depositAmt > 0 ? 'partial' : 'unpaid');
    setNewSale(prev => ({
      ...prev,
      total_amount: total,
      deposit: depositAmt,
      remaining: rem,
      payment_status: payStatus
    }));
  };

  const handleAddCustomProduct = () => {
    const customId = `custom-${Date.now()}`;
    const newCustomItem = {
      id: customId,
      name: 'شال تخرج مطرز ثنائي مخصص',
      category: 'أخرى',
      price_rent: 0,
      price_sale: 0,
      quantity: 1,
      custom_price: 0,
      is_custom: true
    };
    const updated = [...selectedProducts, newCustomItem];
    setSelectedProducts(updated);
    recalcTotal(updated);
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

      // Check and add custom products first
      const savedProducts = [];
      for (const p of selectedProducts) {
        if (p.is_custom) {
          const prodRes = await addProduct({
            name: p.name.trim() || "منتج مخصص",
            category: "أخرى",
            price_rent: p.custom_price,
            price_sale: p.custom_price,
            quantity: p.quantity,
            status: 'available'
          });
          if (!prodRes.success) throw new Error(prodRes.error || `فشل إضافة المنتج المخصص: ${p.name}`);
          savedProducts.push({
            id: prodRes.data.id,
            quantity: p.quantity,
            custom_price: p.custom_price,
            name: p.name
          });
        } else {
          savedProducts.push(p);
        }
      }

      const isPreorder = newSale.sale_type === 'preorder';
      const remainingAmt = Number(newSale.total_amount) - Number(newSale.deposit);
      const payStatus = remainingAmt <= 0 ? 'paid' : (Number(newSale.deposit) > 0 ? 'partial' : 'unpaid');

      const payload = {
        customer_id: finalCustomerId,
        total_amount: Number(newSale.total_amount || 0),
        deposit: Number(newSale.deposit || 0),
        remaining: remainingAmt,
        payment_status: payStatus,
        status: editingOrder ? editingOrder.status : (isPreorder ? 'new_order' : 'completed'),
        customer_notes: newSale.notes || null,
        event_date: isPreorder ? (newSale.is_preliminary ? null : newSale.event_date || null) : null,
        pickup_date: isPreorder ? (newSale.is_preliminary ? null : newSale.pickup_date || null) : null,
        is_preliminary: isPreorder ? newSale.is_preliminary : false
      };

      if (editingOrder) {
        // 1. Revert stock of old products
        if (editingOrder.items) {
          for (const oldItem of editingOrder.items) {
            if (oldItem.product_id) {
              const { data: pData } = await supabase.from('products').select('quantity').eq('id', oldItem.product_id).single();
              const currentQ = pData?.quantity || 0;
              await supabase.from('products').update({
                quantity: currentQ + oldItem.quantity,
                status: 'available'
              }).eq('id', oldItem.product_id);
            }
          }
        }

        // 2. Update order row
        const { error: orderErr } = await supabase.from('orders').update(payload).eq('id', editingOrder.id);
        if (orderErr) throw orderErr;

        // 3. Delete old items
        const { error: delErr } = await supabase.from('order_items').delete().eq('order_id', editingOrder.id);
        if (delErr) throw delErr;

        // 4. Insert new items
        const itemsPayload = savedProducts.map(p => ({
          order_id: editingOrder.id,
          product_id: p.id,
          quantity: p.quantity,
          price: p.custom_price,
          product_name: p.name || "منتج مخصص"
        }));
        const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
        if (itemsErr) throw itemsErr;

        // 5. Decrement stock for new products
        for (const newItem of savedProducts) {
          const { data: pData } = await supabase.from('products').select('quantity').eq('id', newItem.id).single();
          const currentQ = pData?.quantity || 1;
          const newQ = Math.max(0, currentQ - newItem.quantity);
          await supabase.from('products').update({
            quantity: newQ,
            status: newQ === 0 ? 'sold' : 'available'
          }).eq('id', newItem.id);
        }

        setSavedOrderData({
          ...payload,
          id: editingOrder.id,
          order_number: editingOrder.tracking_number || editingOrder.order_number,
          tracking_number: editingOrder.tracking_number || editingOrder.order_number,
          items: savedProducts.map(it => ({
            ...it,
            products: products.find(p => p.id === it.id) || { name: it.name || "منتج مخصص" }
          })),
          customers: isGuestCustomer ? { name: guestName, phone: guestPhone } : customers.find(c => c.id === finalCustomerId)
        });

        setSuccessMsg("تم تحديث الفاتورة والمخزون بنجاح!");
      } else {
        const itemsPayload = savedProducts.map(p => ({
          product_id: p.id,
          quantity: p.quantity,
          price: p.custom_price,
          product_name: p.name || "منتج مخصص"
        }));
        const res = await addOrder(payload, itemsPayload);
        if (!res.success) throw new Error(res.error || "فشل تسجيل الفاتورة");

        setSavedOrderData({
          ...payload,
          id: res.data.id,
          order_number: res.data.tracking_number || res.data.order_number,
          tracking_number: res.data.tracking_number || res.data.order_number,
          items: savedProducts.map(it => ({
            ...it,
            products: products.find(p => p.id === it.id) || { name: it.name || "منتج مخصص" }
          })),
          customers: isGuestCustomer ? { name: guestName, phone: guestPhone } : customers.find(c => c.id === finalCustomerId)
        });

        setSuccessMsg("تم تسجيل فاتورة البيع وحسم المخزون بنجاح!");
      }

      onRefresh();
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
      const itemsHtml = (order.items || []).map((item: any) => 
        '<tr>' +
        '  <td style="padding: 8px; border-bottom: 1px solid #ddd;">' + (item.products?.name || item.product_name || 'منتج مخصص') + '</td>' +
        '  <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">' + item.quantity + '</td>' +
        '  <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">' + (item.price || item.price_at_purchase || 0) + ' د.ل</td>' +
        '</tr>'
      ).join('');

      let dateHtml = '';
      if (order.event_date || order.pickup_date) {
        dateHtml = '<tr><td><strong>تاريخ التسليم:</strong></td><td>' + (order.pickup_date || order.event_date) + '</td></tr>';
      } else if (order.is_preliminary) {
        dateHtml = '<tr><td><strong>تاريخ التسليم:</strong></td><td>عند الجاهزية (أول ما تجهز)</td></tr>';
      }

      printWindow.document.write(
        '<html>' +
        '<head>' +
        '  <title>فاتورة مبيعات - جاغوار للمناسبات</title>' +
        '  <style>' +
        '    body { font-family: \'Cairo\', sans-serif; direction: rtl; text-align: right; padding: 20px; color: #333; }' +
        '    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #c9a84c; padding-bottom: 10px; }' +
        '    .header h1 { margin: 0; font-size: 20px; color: #b08d33; }' +
        '    .info-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }' +
        '    .info-table td { padding: 5px; font-size: 13px; }' +
        '    .items-table th { background-color: #f5f5f5; padding: 8px; text-align: right; border-bottom: 2px solid #ddd; font-size: 13px; }' +
        '    .footer { text-align: center; font-size: 11px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }' +
        '  </style>' +
        '</head>' +
        '<body onload="window.print(); window.close();">' +
        '  <div class="header">' +
        '    <h1>جاغوار للمناسبات</h1>' +
        '    <div style="font-size: 12px; margin-top: 5px;">فاتورة مبيعات وحجوزات</div>' +
        '  </div>' +
        '  ' +
        '  <table class="info-table">' +
        '    <tr>' +
        '      <td><strong>رقم الفاتورة:</strong> ' + (order.tracking_number || order.order_number || '') + '</td>' +
        '      <td><strong>التاريخ:</strong> ' + new Date(order.created_at || Date.now()).toLocaleDateString('ar-LY') + '</td>' +
        '    </tr>' +
        '    <tr>' +
        '      <td><strong>الزبون:</strong> ' + custName + '</td>' +
        '      <td><strong>الهاتف:</strong> ' + custPhone + '</td>' +
        '    </tr>' +
        '    ' + dateHtml +
        '  </table>' +
        '  <h3 style="font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 20px;">المنتجات</h3>' +
        '  <table class="items-table">' +
        '    <thead>' +
        '      <tr>' +
        '        <th>المنتج</th>' +
        '        <th style="text-align: center;">الكمية</th>' +
        '        <th style="text-align: left;">القيمة</th>' +
        '      </tr>' +
        '    </thead>' +
        '    <tbody>' +
        '      ' + itemsHtml +
        '    </tbody>' +
        '  </table>' +
        '  <div style="float: left; width: 250px; margin-top: 10px;">' +
        '    <table style="width: 100%; font-size: 13px;">' +
        '      <tr>' +
        '        <td>الإجمالي:</td>' +
        '        <td style="text-align: left; font-weight: bold;">' + order.total_amount + ' د.ل</td>' +
        '      </tr>' +
        '      <tr>' +
        '        <td>المدفوع (العربون):</td>' +
        '        <td style="text-align: left; font-weight: bold; color: green;">' + (order.deposit || 0) + ' د.ل</td>' +
        '      </tr>' +
        '      <tr>' +
        '        <td>المتبقي:</td>' +
        '        <td style="text-align: left; font-weight: bold; color: red;">' + (order.remaining || 0) + ' د.ل</td>' +
        '      </tr>' +
        '    </table>' +
        '  </div>' +
        '  <div style="clear: both;"></div>' +
        '  <div class="footer">' +
        '    <p>شكراً لشرائكم من جاغوار للمناسبات</p>' +
        '    <p style="font-size: 9px;">طرابلس، ليبيا</p>' +
        '  </div>' +
        '</body>' +
        '</html>'
      );
      printWindow.document.close();
    }
  };

  const exportSales = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["رقم الفاتورة", "العميل", "الهاتف", "التاريخ", "الإجمالي المدفوع", "المتبقي", "الملاحظات"].join(",") + "\n"
      + orders.map(o => [
          `"${o.tracking_number || o.order_number || ''}"`, 
          `"${o.customers?.name || ''}"`, 
          `"${o.customers?.phone || ''}"`, 
          `"${new Date(o.created_at).toLocaleDateString('ar-LY')}"`, 
          `"${o.total_amount}"`, 
          `"${o.remaining || 0}"`, 
          `"${o.customer_notes || o.notes || ''}"`
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
    const orderNum = o.tracking_number || o.order_number || '';
    return (
      orderNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custPhone.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-amber-500" />
            سجل المبيعات المباشرة والحجوزات
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">تسجيل وتأكيد المبيعات النقدية والحجوزات المسبقة وإصدار الفواتير الفورية.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportSales}
            className="bg-zinc-900 hover:bg-zinc-800 text-gray-300 border border-zinc-800 hover:border-zinc-700 py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download size={14} />
            تصدير CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-premium py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Plus size={14} />
            عملية بيع / حجز جديدة
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
          className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg py-2 pr-10 pl-4 text-xs text-white transition-all text-right"
        />
      </div>

      {/* Sales list */}
      <div className="glass rounded-xl overflow-hidden border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-gray-400 uppercase font-bold">
              <tr>
                <th className="py-3.5 px-4 text-right">رقم الفاتورة</th>
                <th className="py-3.5 px-4 text-right">الزبون</th>
                <th className="py-3.5 px-4 text-right">نوع البيع</th>
                <th className="py-3.5 px-4 text-right">تاريخ التسليم</th>
                <th className="py-3.5 px-4 text-right">المالية (د.ل)</th>
                <th className="py-3.5 px-4 text-right">الملاحظات</th>
                <th className="py-3.5 px-4 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-gray-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    <AlertCircle size={32} className="mx-auto mb-2 text-zinc-700" />
                    لا توجد عمليات مبيعات أو حجوزات مسجلة.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const custName = order.customers?.name || 'غير معروف';
                  const custPhone = order.customers?.phone || '';
                  const isPreorder = !!(order.event_date || order.pickup_date || order.is_preliminary);
                  const remAmt = Number(order.remaining || 0);
                  const depAmt = Number(order.deposit || 0);
                  const orderNum = order.tracking_number || order.order_number;
                  
                  return (
                    <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-white text-right">
                        {orderNum}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-bold text-zinc-200">{custName}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{custPhone}</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isPreorder ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/10">حجز مسبق</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium text-[10px]">بيع فوري</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-medium">
                        {order.is_preliminary ? (
                          <span className="text-amber-500 font-bold">عند الجاهزية ⏳</span>
                        ) : (
                          order.pickup_date || order.event_date || '-'
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-bold">
                        <div className="text-white">الإجمالي: {order.total_amount} د.ل</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5 font-semibold">
                          <span className="text-emerald-400">مدفوع: {depAmt}</span>
                          {remAmt > 0 && <span className="text-rose-500">متبقي: {remAmt}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-400 max-w-xs truncate" title={order.customer_notes || order.notes}>
                        {order.customer_notes || order.notes || 'لا يوجد ملاحظات'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => printInvoice(order)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white border border-zinc-800 rounded p-1.5 transition-all cursor-pointer"
                            title="طباعة الفاتورة"
                          >
                            <Printer size={12} />
                          </button>
                          <button 
                            onClick={() => handleEditClick(order)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-zinc-800 rounded p-1.5 transition-all cursor-pointer"
                            title="تعديل الفاتورة"
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="bg-zinc-900 hover:bg-rose-950/40 text-rose-500 border border-zinc-800 rounded p-1.5 transition-all cursor-pointer"
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

      {/* New / Edit Direct Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" dir="rtl">
          <div className="glass-premium rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800 text-right">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">
                {savedOrderData ? "تم تسجيل العملية" : (editingOrder ? "تعديل فاتورة البيع / الحجز" : "تسجيل عملية بيع / hجز مسبق")}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {savedOrderData ? (
              <div className="p-6 space-y-6 text-center">
                {/* Gold glowing animated Check */}
                <div className="flex justify-center py-4">
                  <div className="w-20 h-20 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-pulse">
                    <span className="absolute inset-0 rounded-full bg-amber-500/5 animate-ping" />
                    <Check className="w-12 h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-black text-white">{successMsg}</h4>
                  <p className="text-xs text-amber-500 font-bold tracking-widest">
                    رقم الفاتورة: {savedOrderData.tracking_number || savedOrderData.order_number}
                  </p>
                </div>

                {/* Information Breakdown */}
                <div className="glass p-5 rounded-xl border border-zinc-850 space-y-3 text-right text-xs bg-zinc-950/40">
                  <div className="flex items-center gap-2 text-gray-300 font-semibold border-b border-zinc-900 pb-2">
                    <span className="text-amber-500">👤 الزبون:</span>
                    <span>{savedOrderData.customers?.name || "غير معروف"}</span>
                    {savedOrderData.customers?.phone && (
                      <span className="text-gray-500 font-normal">({savedOrderData.customers.phone})</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300 font-semibold border-b border-zinc-900 pb-2">
                    <span className="text-amber-500">📋 نوع البيع:</span>
                    <span>{savedOrderData.is_preliminary || savedOrderData.event_date || savedOrderData.pickup_date ? 'حجز مسبق (تفصيل وتطريز)' : 'بيع مباشر فوري'}</span>
                  </div>

                  {(savedOrderData.event_date || savedOrderData.pickup_date || savedOrderData.is_preliminary) && (
                    <div className="flex items-center gap-2 text-gray-300 font-semibold border-b border-zinc-900 pb-2">
                      <span className="text-amber-500">📅 موعد التسليم:</span>
                      <span>{savedOrderData.is_preliminary ? 'عند الجاهزية (أول ما تجهز) ⏳' : (savedOrderData.pickup_date || savedOrderData.event_date)}</span>
                    </div>
                  )}
                  
                  {/* Items List */}
                  <div className="pt-2">
                    <span className="text-[10px] text-gray-400 font-bold block mb-1.5">المنتجات:</span>
                    <div className="space-y-1 bg-black/10 p-2.5 rounded-lg border border-zinc-900">
                      {savedOrderData.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-gray-400 font-normal text-[11px]">
                          <span>• {item.products?.name || item.name || "منتج مخصص"} × {item.quantity}</span>
                          <span className="text-amber-500 font-bold">{item.price || item.custom_price} د.ل</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial info */}
                  <div className="border-t border-zinc-900 pt-3 flex justify-between items-center text-xs font-bold gap-3 flex-wrap">
                    <div className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      المدفوع (العربون): {savedOrderData.deposit || 0} د.ل
                    </div>
                    {Number(savedOrderData.remaining) > 0 && (
                      <div className="text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                        المتبقي: {savedOrderData.remaining || 0} د.ل
                      </div>
                    )}
                    <div className="text-white bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg font-black text-amber-500">
                      الإجمالي: {savedOrderData.total_amount} د.ل
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-[10px] text-gray-400 leading-relaxed text-right font-medium">
                  تم تسجيل الفاتورة بنجاح وتحديث كميات المخزون. يمكنك الآن طباعة الفاتورة للزبون أو إغلاق المودال.
                </div>

                {/* Operations */}
                <div className="flex gap-2 justify-end border-t border-zinc-800 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 py-2.5 px-6 rounded-lg text-xs font-semibold border border-zinc-800 transition-all cursor-pointer"
                  >
                    إغلاق النافذة
                  </button>
                  <button
                    type="button"
                    onClick={() => printInvoice(savedOrderData)}
                    className="btn-premium py-2.5 px-6 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} />
                    طباعة الفاتورة الفورية
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
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

                {/* Sale Type (فوري أو حجز) & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold block">نوع البيع *</label>
                    <select
                      value={newSale.sale_type}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewSale(prev => ({
                          ...prev,
                          sale_type: val,
                          event_date: val === 'immediate' ? '' : prev.event_date,
                          pickup_date: val === 'immediate' ? '' : prev.pickup_date,
                          is_preliminary: val === 'immediate' ? false : prev.is_preliminary
                        }));
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white font-bold"
                    >
                      <option value="immediate">بيع فوري (القطع جاهزة بالمحل)</option>
                      <option value="preorder">بيع بحجز مسبق (طلب تفصيل وتطريز)</option>
                    </select>
                  </div>

                  {newSale.sale_type === 'preorder' && (
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-bold block flex justify-between items-center">
                        <span>موعد التسليم المتوقع *</span>
                        <label className="flex items-center gap-1 text-[10px] text-amber-500 font-bold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={newSale.is_preliminary}
                            onChange={(e) => setNewSale(prev => ({ ...prev, is_preliminary: e.target.checked }))}
                            className="w-3 h-3 rounded bg-zinc-900 border-zinc-800 text-amber-500 focus:ring-amber-500"
                          />
                          غير محدد (أول ما تجهز)
                        </label>
                      </label>
                      
                      {!newSale.is_preliminary ? (
                        <input
                          type="date"
                          required={newSale.sale_type === 'preorder' && !newSale.is_preliminary}
                          value={newSale.pickup_date || newSale.event_date}
                          onChange={(e) => {
                            const dateVal = e.target.value;
                            setNewSale(prev => ({ ...prev, pickup_date: dateVal, event_date: dateVal }));
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      ) : (
                        <div className="p-2.5 bg-zinc-950 text-gray-400 border border-zinc-900 rounded-lg text-[10px] font-bold">
                          ⏳ سيتم تجهيز الطلب والتسليم فور الانتهاء من العمل (بدون موعد تسليم محدد).
                        </div>
                      )}
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
                  <button
                    type="button"
                    onClick={handleAddCustomProduct}
                    className="w-full py-2 border border-dashed border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 rounded-lg text-xs text-amber-500 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    إضافة منتج مخصص (شال تخرج تطريز ثنائي، بروش، إلخ)
                  </button>
                </div>

                {/* Selected items edit */}
                {selectedProducts.length > 0 && (
                  <div className="space-y-3 p-4 bg-zinc-900/40 rounded-lg border border-zinc-800">
                    <h4 className="text-xs font-bold text-white">المنتجات المختارة والكميات</h4>
                    <div className="space-y-3">
                      {selectedProducts.map(p => (
                        <div key={p.id} className="flex justify-between items-center gap-4 border-b border-zinc-900 pb-2 last:border-0 last:pb-0">
                          <div className="flex-1 space-y-1">
                            {p.is_custom ? (
                              <input 
                                type="text"
                                value={p.name}
                                onChange={(e) => {
                                  const updated = selectedProducts.map(item => item.id === p.id ? { ...item, name: e.target.value } : item);
                                  setSelectedProducts(updated);
                                }}
                                className="bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded px-2 py-1 text-xs text-white w-full max-w-[200px]"
                                placeholder="اسم المنتج المخصص..."
                              />
                            ) : (
                              <span className="text-xs font-semibold text-gray-200">{p.name}</span>
                            )}
                            <div className="text-[10px] text-gray-500">السعر الافتراضي: {p.price_sale} د.ل</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-400">الكمية:</span>
                              <input
                                type="number"
                                min="1"
                                max={p.is_custom ? undefined : p.quantity + (editingOrder?.items?.find((oIt: any) => oIt.product_id === p.id)?.quantity || 0)}
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
                            {(p.is_custom || editingOrder) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = selectedProducts.filter(item => item.id !== p.id);
                                  setSelectedProducts(filtered);
                                  recalcTotal(filtered);
                                }}
                                className="text-rose-500 hover:text-rose-400 p-1.5 bg-zinc-950 border border-zinc-800 rounded hover:border-rose-500/20 transition-all cursor-pointer"
                                title="إزالة"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totals & Notes & Deposit */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold">إجمالي قيمة الفاتورة (د.ل)</label>
                    <input
                      type="number"
                      readOnly
                      value={newSale.total_amount}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:outline-none rounded-lg p-2.5 text-xs text-amber-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold">العربون المدفوع (د.ل)</label>
                    <input
                      type="number"
                      min="0"
                      max={newSale.total_amount}
                      value={newSale.deposit}
                      onChange={(e) => {
                        const dep = Number(e.target.value || 0);
                        recalcTotal(selectedProducts, dep);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-emerald-400 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold">المتبقي المطلوب سداده (د.ل)</label>
                    <input
                      type="number"
                      readOnly
                      value={newSale.remaining}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:outline-none rounded-lg p-2.5 text-xs text-rose-500 font-bold"
                    />
                  </div>
                </div>

                {/* Payment status badge & notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold block">حالة السداد للمبيعات</label>
                    <div className="pt-1">
                      {newSale.payment_status === 'paid' && (
                        <span className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-black border border-emerald-500/20 block text-center">
                          ✨ مدفوع بالكامل (نقدًا)
                        </span>
                      )}
                      {newSale.payment_status === 'partial' && (
                        <span className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-black border border-amber-500/20 block text-center animate-pulse">
                          ⏳ تم دفع جزء من الحساب (عربون)
                        </span>
                      )}
                      {newSale.payment_status === 'unpaid' && (
                        <span className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-black border border-rose-500/20 block text-center">
                          ❌ لم يتم السداد (غير مدفوع)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold">ملاحظات التطريز والتفصيل</label>
                    <input
                      type="text"
                      value={newSale.notes}
                      onChange={(e) => setNewSale(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                      placeholder="مثال: تطريز الاسم بالخيط الذهبي، مقاس مخصص..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end border-t border-zinc-800 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 py-2.5 px-5 rounded-lg text-xs font-semibold border border-zinc-800 transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-premium py-2.5 px-6 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      editingOrder ? 'حفظ التعديلات وتحديث الفاتورة' : 'تأكيد العملية وحسم المخزون'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

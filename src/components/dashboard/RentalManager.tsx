import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Check, X, AlertCircle, RefreshCw, Printer, Download,
  Calendar, DollarSign, Clock, CheckCircle, Edit
} from 'lucide-react';
import { supabase, addRental, updateRental, deleteRental, addPayment, addCustomer, addProduct } from '@/lib/supabase';

interface RentalManagerProps {
  rentals: any[];
  products: any[];
  customers: any[];
  onRefresh: () => void;
  openNewRentalFlag: boolean;
  setOpenNewRentalFlag: (flag: boolean) => void;
}

export default function RentalManager({
  rentals,
  products,
  customers,
  onRefresh,
  openNewRentalFlag,
  setOpenNewRentalFlag
}: RentalManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);

  // New Rental Form State
  const [newRent, setNewRent] = useState({
    customer_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    expected_return_date: '',
    rental_value: 0,
    deposit: 0,
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

  // Editing and Success Screen states
  const [editingRent, setEditingRent] = useState<any>(null);
  const [savedRentData, setSavedRentData] = useState<any>(null);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRent(null);
    setSavedRentData(null);
    setSelectedProducts([]);
    setSuccessMsg('');
    setErrorMsg('');
    setNewRent({
      customer_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      expected_return_date: '',
      rental_value: 0,
      deposit: 0,
      notes: '',
    });
    setIsGuestCustomer(false);
    setGuestName('');
    setGuestPhone('');
    setGuestWhatsapp('');
    setOpenNewRentalFlag(false);
  };

  const handleEditClick = (rent: any) => {
    setEditingRent(rent);
    setNewRent({
      customer_id: rent.customer_id || '',
      start_date: rent.start_date || new Date().toISOString().split('T')[0],
      end_date: rent.end_date || '',
      expected_return_date: rent.expected_return_date || '',
      rental_value: rent.rental_value || 0,
      deposit: rent.deposit || 0,
      notes: rent.notes || '',
    });
    
    // Load products with customizations
    const mapped = (rent.items || []).map((item: any) => ({
      id: item.product_id,
      name: item.products?.name || "منتج مخصص",
      price_rent: item.price,
      custom_price: item.price,
      quantity: item.quantity,
      category: item.products?.category || "أخرى",
      pickup_date: item.pickup_date || '',
      return_date: item.return_date || '',
      is_preliminary: item.is_preliminary || false,
      customization_type: item.customization_type || 'none',
      layer_type: item.layer_type || 'none',
      color_sash: item.color_sash || '',
      color_text: item.color_text || '',
      custom_text: item.custom_text || ''
    }));
    setSelectedProducts(mapped);
    setIsGuestCustomer(false); 
    setIsModalOpen(true);
  };

  const printReceipt = (rent: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const custName = rent.customers?.name || 'عميل';
      const custPhone = rent.customers?.phone || '';
      let itemsHtml = '';
      if (rent.items) {
        for (const item of rent.items) {
          const prodName = item.products?.name || item.name || 'منتج مخصص';
          const price = item.price || item.custom_price || 0;
          
          let customizationDetails = '';
          if (item.custom_text || item.customization_type || item.pickup_date || item.is_preliminary) {
            customizationDetails = '<div style="font-size: 10px; color: #555; margin-top: 4px; border-top: 1px dashed #eee; padding-top: 3px;">';
            if (item.customization_type && item.customization_type !== 'none') {
              customizationDetails += 'التخصيص: ' + (item.customization_type === 'embroidery' ? 'تطريز' : 'طباعة');
            }
            if (item.layer_type && item.layer_type !== 'none') {
              customizationDetails += ' | الطبقة: ' + (item.layer_type === 'double' ? 'ثنائي' : 'ثلاثي');
            }
            if (item.color_sash) {
              customizationDetails += ' | لون القماش: ' + item.color_sash;
            }
            if (item.color_text) {
              customizationDetails += ' | خيط/طباعة: ' + item.color_text;
            }
            if (item.custom_text) {
              customizationDetails += ' | الاسم: <strong>' + item.custom_text + '</strong>';
            }
            if (item.pickup_date || item.is_preliminary) {
              customizationDetails += ' | استلام: <strong>' + (item.is_preliminary ? 'أول ما يجهز' : item.pickup_date) + '</strong>';
            }
            if (item.return_date) {
              customizationDetails += ' | إرجاع: <strong>' + item.return_date + '</strong>';
            }
            customizationDetails += '</div>';
          }

          itemsHtml += '<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">' +
                       '<div>' + prodName + '</div>' + customizationDetails + '</td>' +
                       '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">' + item.quantity + '</td>' +
                       '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">' + price + ' د.ل</td></tr>';
        }
      }

      printWindow.document.write(
        '<html><head><title>عقد إيجار - جاغوار للمناسبات</title>' +
        '<style>body { font-family: "Cairo", sans-serif; direction: rtl; text-align: right; padding: 20px; color: #333; }' +
        '.header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }' +
        '.header h1 { margin: 0; font-size: 20px; color: #b38728; }' +
        '.info-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }' +
        '.info-table td { padding: 5px; font-size: 13px; }' +
        '.items-table th { background-color: #f5f5f5; padding: 8px; text-align: right; border-bottom: 2px solid #ddd; font-size: 13px; }' +
        '.totals { font-size: 13px; font-weight: bold; text-align: left; }' +
        '.footer { text-align: center; font-size: 11px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }</style></head>' +
        '<body onload="window.print(); window.close();"><div class="header"><h1>جاغوار للمناسبات</h1><div style="font-size: 12px; margin-top: 5px;">عقد تأجير واستلام ملابس المناسبة</div></div>' +
        '<table class="info-table"><tr><td><strong>رقم العقد:</strong> ' + rent.operation_number + '</td><td><strong>تاريخ التسجيل:</strong> ' + new Date(rent.created_at || Date.now()).toLocaleDateString('ar-LY') + '</td></tr>' +
        '<tr><td><strong>الزبون:</strong> ' + custName + '</td><td><strong>الهاتف:</strong> ' + custPhone + '</td></tr>' +
        '<tr><td><strong>تاريخ الاستلام الفعلي:</strong> ' + rent.start_date + '</td><td><strong>تاريخ الإرجاع المتوقع:</strong> ' + rent.expected_return_date + '</td></tr></table>' +
        '<h3 style="font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">القطع المستلمة</h3>' +
        '<table class="items-table"><thead><tr><th>اسم المنتج</th><th style="text-align: center;">الكمية</th><th style="text-align: left;">القيمة</th></tr></thead><tbody>' +
        itemsHtml +
        '</tbody></table><div class="totals"><p>قيمة الإيجار الإجمالية: ' + (rent.rental_value || rent.total_amount || 0) + ' د.ل</p>' +
        '<p style="color: green;">المستحصل (عربون/مدفوع): ' + rent.deposit + ' د.ل</p>' +
        '<p style="color: red;">المتبقي قيد التحصيل: ' + rent.remaining + ' د.ل</p></div>' +
        '<div class="footer"><p>شكراً لتعاملكم معنا. يرجى الحفاظ على القطع وإرجاعها في الموعد المحدد تجنباً لغرامات التأخير.</p>' +
        '<p>جاغوار للمناسبات © 2026</p></div></body></html>'
      );
      printWindow.document.close();
    }
  };

  // Return Operation form state
  const [returnRentalObj, setReturnRentalObj] = useState<any>(null);
  const [actualReturnDate, setActualReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [delayFine, setDelayFine] = useState(0);
  const [returnStatus, setReturnStatus] = useState('returned_clean');
  const [returnNotes, setReturnNotes] = useState('');
  const [isReturning, setIsReturning] = useState(false);

  // Payment recording state
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (openNewRentalFlag) {
      setIsModalOpen(true);
      setOpenNewRentalFlag(false);
    }
  }, [openNewRentalFlag]);

  // Auto-calculate expected return date (usually start_date + 2 days)
  useEffect(() => {
    if (newRent.start_date) {
      const start = new Date(newRent.start_date);
      start.setDate(start.getDate() + 2); // default 2 days rental
      setNewRent(prev => ({
        ...prev,
        end_date: start.toISOString().split('T')[0],
        expected_return_date: start.toISOString().split('T')[0]
      }));
    }
  }, [newRent.start_date]);

  // Recalc delay fine when returnRentalObj or actualReturnDate changes
  useEffect(() => {
    if (returnRentalObj && actualReturnDate) {
      const expected = new Date(returnRentalObj.expected_return_date);
      const actual = new Date(actualReturnDate);
      expected.setHours(0,0,0,0);
      actual.setHours(0,0,0,0);

      if (actual > expected) {
        const diffTime = Math.abs(actual.getTime() - expected.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Calculate late fine (e.g. 15 د.ل per day of delay)
        setDelayFine(diffDays * 15);
      } else {
        setDelayFine(0);
      }
    }
  }, [returnRentalObj, actualReturnDate]);

  const handleProductSelect = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    if (selectedProducts.some(p => p.id === prodId)) {
      const filtered = selectedProducts.filter(p => p.id !== prodId);
      setSelectedProducts(filtered);
      recalcTotal(filtered);
    } else {
      const updated = [...selectedProducts, { 
        ...prod, 
        quantity: 1, 
        custom_price: prod.price_rent || 0,
        pickup_date: '',
        return_date: '',
        is_preliminary: false,
        customization_type: 'none',
        layer_type: 'none',
        color_sash: '',
        color_text: '',
        custom_text: ''
      }];
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
    setNewRent(prev => ({
      ...prev,
      rental_value: total
    }));
  };

  const handleAddCustomProduct = () => {
    const customId = `custom-${Date.now()}`;
    const newCustomItem = {
      id: customId,
      name: 'منتج مخصص جديد',
      category: 'أخرى',
      price_rent: 0,
      price_sale: 0,
      quantity: 1,
      custom_price: 0,
      is_custom: true,
      pickup_date: '',
      return_date: '',
      is_preliminary: false,
      customization_type: 'none',
      layer_type: 'none',
      color_sash: '',
      color_text: '',
      custom_text: ''
    };
    const updated = [...selectedProducts, newCustomItem];
    setSelectedProducts(updated);
    recalcTotal(updated);
  };

  const handleSaveRental = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isGuestCustomer && !newRent.customer_id) {
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
    if (!newRent.expected_return_date) {
      setErrorMsg("الرجاء تحديد تاريخ الإرجاع المتوقع.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalCustomerId = newRent.customer_id;

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
            status: 'rented' // instantly rented status
          });
          if (!prodRes.success) throw new Error(prodRes.error || `فشل إضافة المنتج المخصص: ${p.name}`);
          savedProducts.push({
            id: prodRes.data.id,
            name: p.name,
            quantity: p.quantity,
            custom_price: p.custom_price
          });
        } else {
          savedProducts.push(p);
        }
      }

      const remaining = Number(newRent.rental_value) - Number(newRent.deposit);
      const payload = {
        ...newRent,
        customer_id: finalCustomerId,
        remaining,
        status: editingRent ? editingRent.status : 'rented',
        return_status: editingRent ? editingRent.return_status : 'not_returned',
        actual_delivery_date: editingRent ? editingRent.actual_delivery_date : newRent.start_date
      };

      if (editingRent) {
        // 1. Revert old products to 'available'
        if (editingRent.items) {
          for (const oldItem of editingRent.items) {
            await supabase.from('products').update({ status: 'available' }).eq('id', oldItem.product_id);
          }
        }

        // 2. Update rentals record
        const { error: rentErr } = await supabase.from('rentals').update(payload).eq('id', editingRent.id);
        if (rentErr) throw rentErr;

        // 3. Delete old items
        const { error: delErr } = await supabase.from('rental_items').delete().eq('rental_id', editingRent.id);
        if (delErr) throw delErr;

        // 4. Insert new items
        const itemsPayload = savedProducts.map(p => ({
          rental_id: editingRent.id,
          product_id: p.id,
          quantity: p.quantity,
          price: p.custom_price,
          pickup_date: p.pickup_date || null,
          return_date: p.return_date || null,
          is_preliminary: p.is_preliminary || false,
          customization_type: p.customization_type || null,
          layer_type: p.layer_type || null,
          color_sash: p.color_sash || null,
          color_text: p.color_text || null,
          custom_text: p.custom_text || null
        }));
        const { error: itemsErr } = await supabase.from('rental_items').insert(itemsPayload);
        if (itemsErr) throw itemsErr;

        // 5. Update new products status to 'rented'
        for (const newItem of savedProducts) {
          await supabase.from('products').update({ status: 'rented' }).eq('id', newItem.id);
        }

        setSavedRentData({
          ...payload,
          id: editingRent.id,
          operation_number: editingRent.operation_number,
          items: savedProducts.map(it => ({
            ...it,
            products: products.find(p => p.id === it.id) || { name: it.name || "منتج مخصص" }
          })),
          customers: isGuestCustomer ? { name: guestName, phone: guestPhone } : customers.find(c => c.id === finalCustomerId)
        });

        setSuccessMsg("تم تحديث عقد الإيجار بنجاح!");
      } else {
        const itemsPayload = savedProducts.map(p => ({
          product_id: p.id,
          quantity: p.quantity,
          price: p.custom_price,
          pickup_date: p.pickup_date || null,
          return_date: p.return_date || null,
          is_preliminary: p.is_preliminary || false,
          customization_type: p.customization_type || null,
          layer_type: p.layer_type || null,
          color_sash: p.color_sash || null,
          color_text: p.color_text || null,
          custom_text: p.custom_text || null
        }));
        const res = await addRental(payload, itemsPayload);
        if (!res.success) throw new Error(res.error || "فشل تسجيل عقد الإيجار");

        setSavedRentData({
          ...payload,
          id: res.data.id,
          operation_number: res.data.operation_number,
          items: savedProducts.map(it => ({
            ...it,
            products: products.find(p => p.id === it.id) || { name: it.name || "منتج مخصص" }
          })),
          customers: isGuestCustomer ? { name: guestName, phone: guestPhone } : customers.find(c => c.id === finalCustomerId)
        });

        setSuccessMsg("تم تسجيل الإيجار بنجاح وتأكيد تسليم القطع!");
      }

      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ الإيجار.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnRentalObj) return;

    setIsReturning(true);

    try {
      const updates = {
        actual_return_date: actualReturnDate,
        delay_fine: delayFine,
        status: 'returned',
        return_status: returnStatus,
        notes: returnNotes ? `${returnRentalObj.notes || ''} | إرجاع: ${returnNotes}` : returnRentalObj.notes
      };

      const success = await updateRental(returnRentalObj.id, updates);
      if (!success) throw new Error("فشل تحديث سجل الإرجاع");

      // Register fine payment if fine > 0
      if (delayFine > 0) {
        await addPayment({
          amount: delayFine,
          date: actualReturnDate,
          movement_type: 'final_payment',
          linked_operation_type: 'rental',
          linked_operation_id: returnRentalObj.id,
          notes: `غرامة تأخير إرجاع الإيجار رقم ${returnRentalObj.operation_number}`,
          payment_status: 'completed'
        });
      }

      // Restore products status back to 'available'
      if (returnRentalObj.items) {
        for (const item of returnRentalObj.items) {
          // Check product status back to available
          await updateRental(item.product_id, { status: 'available' });
        }
      }

      alert("تم تسجيل عملية الإرجاع وتحرير حالة المنتجات بنجاح!");
      setReturnRentalObj(null);
      setReturnNotes('');
      onRefresh();

    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء معالجة الإرجاع.");
    } finally {
      setIsReturning(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental) return;
    if (paymentAmount <= 0) {
      alert("الرجاء إدخال قيمة صحيحة.");
      return;
    }

    setIsPaying(true);

    try {
      const rentNum = selectedRental.operation_number;
      const payRes = await addPayment({
        amount: paymentAmount,
        date: new Date().toISOString().split('T')[0],
        movement_type: 'final_payment',
        linked_operation_type: 'rental',
        linked_operation_id: selectedRental.id,
        notes: `استكمال سداد الإيجار رقم ${rentNum}`,
        payment_status: 'completed'
      });

      if (!payRes.success) throw new Error(payRes.error || "فشل تسجيل الدفعة");

      const newRemaining = Math.max(0, Number(selectedRental.remaining) - paymentAmount);
      const newDeposit = Number(selectedRental.deposit) + paymentAmount;

      const success = await updateRental(selectedRental.id, {
        remaining: newRemaining,
        deposit: newDeposit
      });

      if (!success) throw new Error("فشل تحديث سجل الإيجار");

      alert("تم استكمال الدفع بنجاح!");
      setSelectedRental(null);
      setPaymentAmount(0);
      onRefresh();

    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء معالجة الدفعة.");
    } finally {
      setIsPaying(false);
    }
  };

  const exportRentals = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["رقم العملية", "العميل", "الهاتف", "تاريخ البداية", "الإرجاع المتوقع", "الإرجاع الفعلي", "قيمة الإيجار", "العربون", "المتبقي", "غرامة التأخير", "الحالة"].join(",") + "\n"
      + rentals.map(r => [
          `"${r.operation_number}"`, 
          `"${r.customers?.name || ''}"`, 
          `"${r.customers?.phone || ''}"`, 
          `"${r.start_date}"`, 
          `"${r.expected_return_date}"`, 
          `"${r.actual_return_date || ''}"`, 
          `"${r.rental_value}"`, 
          `"${r.deposit}"`, 
          `"${r.remaining}"`, 
          `"${r.delay_fine}"`, 
          `"${r.status}"`
        ].join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `إيجارات_جاغوار_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter rentals
  const filteredRentals = rentals.filter(r => {
    const custName = r.customers?.name || '';
    const custPhone = r.customers?.phone || '';
    const matchesSearch = 
      r.operation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            <Clock size={20} className="text-amber-500" />
            إدارة عقود الإيجار والتسليم
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">تسجيل الإيجارات الفورية، احتساب الغرامات وحالة إرجاع القطع.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportRentals}
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
            إيجار فوري جديد
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
            placeholder="ابحث برقم الإيجار، اسم العميل، أو الهاتف..."
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
          <option value="rented">تحت الإيجار (نشط)</option>
          <option value="returned">تم الإرجاع</option>
          <option value="late">متأخر</option>
        </select>
      </div>

      {/* Rentals list */}
      <div className="glass rounded-xl overflow-hidden border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-gray-400 uppercase font-bold">
              <tr>
                <th className="py-3.5 px-4">رقم العملية</th>
                <th className="py-3.5 px-4">العميل</th>
                <th className="py-3.5 px-4">التاريخ (تسليم ➔ إرجاع متوقع)</th>
                <th className="py-3.5 px-4 font-bold text-white">الماليات والغرامات</th>
                <th className="py-3.5 px-4">حالة الإرجاع وسجل التلف</th>
                <th className="py-3.5 px-4 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-gray-300">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-500">
                    <AlertCircle size={32} className="mx-auto mb-2 text-zinc-700" />
                    لا توجد إيجارات نشطة حالياً.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((rent) => {
                  const custName = rent.customers?.name || 'غير معروف';
                  const custPhone = rent.customers?.phone || '';
                  
                  return (
                    <tr key={rent.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {rent.operation_number}
                        <div className="text-[9px] text-zinc-500 mt-0.5">مسجل: {new Date(rent.created_at).toLocaleDateString('ar-LY')}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-zinc-200">{custName}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{custPhone}</div>
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="text-emerald-400">تسليم فعلي: {rent.actual_delivery_date || rent.start_date}</div>
                        <div className="text-amber-500">استحقاق إرجاع: {rent.expected_return_date}</div>
                        {rent.actual_return_date && <div className="text-blue-400">إرجاع فعلي: {rent.actual_return_date}</div>}
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div>قيمة الإيجار: {rent.rental_value} د.ل</div>
                        <div className="text-emerald-500">المدفوع: {rent.deposit} د.ل</div>
                        {Number(rent.remaining) > 0 && <div className="text-rose-500">المتبقي: {rent.remaining} د.ل</div>}
                        {Number(rent.delay_fine) > 0 && <div className="text-rose-500 font-bold">غرامة التأخير: {rent.delay_fine} د.ل ⚠️</div>}
                      </td>
                      <td className="py-4 px-4 space-y-2">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            rent.status === 'rented' ? 'badge-reserved' :
                            rent.status === 'returned' ? 'badge-completed' : 'badge-unavailable'
                          }`}>
                            {rent.status === 'rented' && 'قيد التأجير'}
                            {rent.status === 'returned' && 'تم الإرجاع'}
                            {rent.status === 'late' && 'متأخر ⚠️'}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            rent.return_status === 'returned_clean' ? 'badge-completed' :
                            rent.return_status === 'returned_damaged' ? 'badge-unavailable' : 'badge-reserved'
                          }`}>
                            {rent.return_status === 'returned_clean' && 'نظيف وسليم'}
                            {rent.return_status === 'returned_damaged' && 'تالف / متضرر'}
                            {rent.return_status === 'not_returned' && 'لم يرجع بعد'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {rent.status === 'rented' && (
                            <>
                              <button 
                                onClick={() => setReturnRentalObj(rent)}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2.5 py-1 text-[10px] font-bold transition-all"
                                title="إرجاع القطعة"
                              >
                                إرجاع القطع
                              </button>
                              {Number(rent.remaining) > 0 && (
                                <button 
                                  onClick={() => { setSelectedRental(rent); setPaymentAmount(rent.remaining); }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2.5 py-1 text-[10px] font-bold transition-all"
                                  title="دفع المتبقي"
                                >
                                  دفع المتبقي
                                </button>
                              )}
                            </>
                          )}
                          <span className="text-zinc-600 text-[10px]">{rent.status === 'returned' && 'مكتمل'}</span>
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

      {/* New Rental Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-premium rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">
                {savedRentData ? "تم تسجيل العقد بنجاح" : (editingRent ? "تعديل عقد الإيجار" : "تسجيل عقد إيجار فوري جديد")}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {savedRentData ? (
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
                    رقم العقد: {savedRentData.operation_number}
                  </p>
                </div>

                {/* Information Breakdown */}
                <div className="glass p-5 rounded-xl border border-zinc-855 space-y-3 text-right text-xs bg-zinc-950/40">
                  <div className="flex items-center gap-2 text-gray-300 font-semibold border-b border-zinc-900 pb-2">
                    <span className="text-amber-500">👤 الزبون:</span>
                    <span>{savedRentData.customers?.name || "غير معروف"}</span>
                    {savedRentData.customers?.phone && (
                      <span className="text-gray-500 font-normal">({savedRentData.customers.phone})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 font-semibold border-b border-zinc-900 pb-2">
                    <span className="text-amber-500">📅 الموعد:</span>
                    <span>استلام: {savedRentData.start_date} ➔ إرجاع متوقع: {savedRentData.expected_return_date}</span>
                  </div>
                  
                  {/* Items List */}
                  <div className="pt-2">
                    <span className="text-[10px] text-gray-400 font-bold block mb-1.5">المنتجات المستلمة:</span>
                    <div className="space-y-1 bg-black/10 p-2.5 rounded-lg border border-zinc-900">
                      {savedRentData.items?.map((item: any, idx: number) => (
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
                      المدفوع: {savedRentData.deposit} د.ل
                    </div>
                    {Number(savedRentData.remaining) > 0 && (
                      <div className="text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                        المتبقي: {savedRentData.remaining} د.ل
                      </div>
                    )}
                    <div className="text-white bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg font-black text-amber-500">
                      الإجمالي: {savedRentData.rental_value || savedRentData.total_amount} د.ل
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-[10px] text-gray-400 leading-relaxed text-right font-medium">
                  تم تسجيل عقد الإيجار وتسليم الملابس للعميل بنجاح وتحديث المخزن.
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
                    onClick={() => printReceipt(savedRentData)}
                    className="btn-premium py-2.5 px-6 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} />
                    طباعة العقد الفوري
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveRental} className="p-6 space-y-6">
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
                    value={newRent.customer_id}
                    onChange={(e) => setNewRent(prev => ({ ...prev, customer_id: e.target.value }))}
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
                  <label className="text-xs text-gray-300 font-bold">تاريخ البداية (التسليم الفوري) *</label>
                  <input
                    type="date"
                    required
                    value={newRent.start_date}
                    onChange={(e) => setNewRent(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">تاريخ الإرجاع المتوقع *</label>
                  <input
                    type="date"
                    required
                    value={newRent.expected_return_date}
                    onChange={(e) => setNewRent(prev => ({ ...prev, expected_return_date: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Products Selection List */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold block">اختيار المنتجات للإيجار *</label>
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
                <button
                  type="button"
                  onClick={handleAddCustomProduct}
                  className="w-full py-2 border border-dashed border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 rounded-lg text-xs text-amber-500 font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus size={14} />
                  إضافة منتج مخصص غير مدرج في القائمة
                </button>
              </div>

              {/* Selected items quantities & custom prices */}
              {selectedProducts.length > 0 && (
                <div className="space-y-3 p-4 bg-zinc-900/40 rounded-lg border border-zinc-800">
                  <h4 className="text-xs font-bold text-white">المنتجات المختارة وتعديل قيم الإيجار</h4>
                  <div className="space-y-3 font-sans">
                    {selectedProducts.map(p => (
                      <div key={p.id} className="border-b border-zinc-800 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0 space-y-2">
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex-1 space-y-1">
                            {p.is_custom ? (
                              <input 
                                type="text"
                                value={p.name}
                                onChange={(e) => {
                                  const updated = selectedProducts.map(item => item.id === p.id ? { ...item, name: e.target.value } : item);
                                  setSelectedProducts(updated);
                                }}
                                className="bg-zinc-955 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded px-2 py-1 text-xs text-white w-full max-w-[200px]"
                                placeholder="اسم المنتج المخصص..."
                              />
                            ) : (
                              <span className="text-xs font-semibold text-gray-200">{p.name}</span>
                            )}
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
                              <span className="text-[10px] text-gray-400">القيمة:</span>
                              <input
                                type="number"
                                min="0"
                                value={p.custom_price}
                                onChange={(e) => handleProductPriceChange(p.id, Number(e.target.value))}
                                className="w-16 bg-zinc-950 border border-zinc-800 rounded p-1 text-xs text-center text-white font-bold"
                              />
                            </div>
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
                          </div>
                        </div>

                        {/* Customization Details Sub-panel */}
                        <div className="w-full mt-2 p-3 bg-zinc-950/80 rounded border border-zinc-900 space-y-3 text-right">
                          <div className="text-[10px] font-bold text-amber-500 border-b border-zinc-900 pb-1.5 flex justify-between items-center">
                            <span>⚙️ خيارات التخصيص وجدولة القطعة:</span>
                            <label className="flex items-center gap-1 cursor-pointer select-none text-gray-400">
                              <input
                                type="checkbox"
                                checked={p.is_preliminary}
                                onChange={(e) => {
                                  const updated = selectedProducts.map(item => 
                                    item.id === p.id ? { ...item, is_preliminary: e.target.checked, pickup_date: e.target.checked ? '' : item.pickup_date, return_date: e.target.checked ? '' : item.return_date } : item
                                  );
                                  setSelectedProducts(updated);
                                }}
                                className="w-3 h-3 rounded bg-zinc-900 border-zinc-850 text-amber-500 focus:ring-0"
                              />
                              أول ما يجهز
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {/* Customization Type */}
                            <div>
                              <label className="text-[9px] text-gray-500 block font-bold">التخصيص</label>
                              <select
                                value={p.customization_type || 'none'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = selectedProducts.map(item => 
                                    item.id === p.id ? { ...item, customization_type: val } : item
                                  );
                                  setSelectedProducts(updated);
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] text-white"
                              >
                                <option value="none">بدون</option>
                                <option value="embroidery">تطريز</option>
                                <option value="print">طباعة</option>
                              </select>
                            </div>

                            {/* Layer Type */}
                            <div>
                              <label className="text-[9px] text-gray-500 block font-bold">الطبقة</label>
                              <select
                                value={p.layer_type || 'none'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  // Update price automatically if changed
                                  let newPrice = p.custom_price;
                                  if (val === 'triple' && p.layer_type !== 'triple') {
                                    newPrice = Number(p.custom_price) + 15;
                                  } else if (val !== 'triple' && p.layer_type === 'triple') {
                                    newPrice = Math.max(0, Number(p.custom_price) - 15);
                                  }
                                  const updated = selectedProducts.map(item => 
                                    item.id === p.id ? { ...item, layer_type: val, custom_price: newPrice } : item
                                  );
                                  setSelectedProducts(updated);
                                  recalcTotal(updated);
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] text-white"
                              >
                                <option value="none">بدون</option>
                                <option value="double">ثنائي</option>
                                <option value="triple">ثلاثي (+15)</option>
                              </select>
                            </div>

                            {/* Sash Color */}
                            <div>
                              <label className="text-[9px] text-gray-500 block font-bold">لون الشال</label>
                              <input 
                                type="text"
                                value={p.color_sash || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  let newPrice = p.custom_price;
                                  if (val !== 'أسود' && p.color_sash === 'أسود') {
                                    newPrice = Number(p.custom_price) + 10;
                                  } else if (val === 'أسود' && p.color_sash !== 'أسود') {
                                    newPrice = Math.max(0, Number(p.custom_price) - 10);
                                  }
                                  const updated = selectedProducts.map(item => 
                                    item.id === p.id ? { ...item, color_sash: val, custom_price: newPrice } : item
                                  );
                                  setSelectedProducts(updated);
                                  recalcTotal(updated);
                                }}
                                placeholder="أسود، أبيض..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] text-white"
                              />
                            </div>

                            {/* Text/Thread Color */}
                            <div>
                              <label className="text-[9px] text-gray-500 block font-bold">لون الكتابة</label>
                              <input 
                                type="text"
                                value={p.color_text || ''}
                                onChange={(e) => {
                                  const updated = selectedProducts.map(item => 
                                    item.id === p.id ? { ...item, color_text: e.target.value } : item
                                  );
                                  setSelectedProducts(updated);
                                }}
                                placeholder="ذهبي، فضي..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Custom Text / Name */}
                            <div>
                              <label className="text-[9px] text-gray-500 block font-bold">الاسم المطلوب كتابته</label>
                              <input 
                                type="text"
                                value={p.custom_text || ''}
                                onChange={(e) => {
                                  const updated = selectedProducts.map(item => 
                                    item.id === p.id ? { ...item, custom_text: e.target.value } : item
                                  );
                                  setSelectedProducts(updated);
                                }}
                                placeholder="الاسم المراد تطريزه/طباعته..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] text-white"
                              />
                            </div>

                            {/* Pickup and Return date */}
                            {!p.is_preliminary && (
                              <div className="grid grid-cols-2 gap-1">
                                <div>
                                  <label className="text-[9px] text-gray-500 block font-bold">تاريخ الاستلام الفردي</label>
                                  <input 
                                    type="date"
                                    value={p.pickup_date || ''}
                                    onChange={(e) => {
                                      const updated = selectedProducts.map(item => 
                                        item.id === p.id ? { ...item, pickup_date: e.target.value } : item
                                      );
                                      setSelectedProducts(updated);
                                    }}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] text-white font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-gray-500 block font-bold">تاريخ الإرجاع الفردي</label>
                                  <input 
                                    type="date"
                                    value={p.return_date || ''}
                                    onChange={(e) => {
                                      const updated = selectedProducts.map(item => 
                                        item.id === p.id ? { ...item, return_date: e.target.value } : item
                                      );
                                      setSelectedProducts(updated);
                                    }}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] text-white font-bold"
                                  />
                                </div>
                              </div>
                            )}
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
                  <label className="text-xs text-gray-300 font-bold">قيمة الإيجار الكلية (د.ل)</label>
                  <input
                    type="number"
                    readOnly
                    value={newRent.rental_value}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:outline-none rounded-lg p-2.5 text-xs text-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">العربون المدفوع (د.ل)</label>
                  <input
                    type="number"
                    min="0"
                    max={newRent.rental_value}
                    value={newRent.deposit}
                    onChange={(e) => setNewRent(prev => ({ ...prev, deposit: Number(e.target.value) }))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">المتبقي للدفع</label>
                  <input
                    type="number"
                    readOnly
                    value={newRent.rental_value - newRent.deposit}
                    className="w-full bg-zinc-955 border border-zinc-800 focus:outline-none rounded-lg p-2.5 text-xs text-rose-500 font-bold"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold">ملاحظات الإيجار</label>
                <input
                  type="text"
                  value={newRent.notes}
                  onChange={(e) => setNewRent(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  placeholder="ملاحظات القياس، شروط الاسترجاع..."
                />
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
                    editingRent ? 'حفظ التعديلات' : 'تأكيد الإيجار والتسليم الفوري'
                  )}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Return Rental Modal */}
      {returnRentalObj && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-premium rounded-xl max-w-md w-full border border-zinc-800">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">تسجيل عملية إرجاع: {returnRentalObj.operation_number}</h3>
              <button onClick={() => setReturnRentalObj(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReturnRentalSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold">تاريخ الإرجاع الفعلي *</label>
                <input
                  type="date"
                  required
                  value={actualReturnDate}
                  onChange={(e) => setActualReturnDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold">حالة إرجاع القطع *</label>
                <select
                  value={returnStatus}
                  onChange={(e) => setReturnStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white font-bold"
                >
                  <option value="returned_clean">نظيفة وسليمة بالكامل</option>
                  <option value="returned_damaged">تالفة وبها عيوب (تتطلب غرامة تعويض)</option>
                  <option value="returned_dirty">تحتاج غسيل فقط</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-3 rounded-lg border border-zinc-900">
                <div>
                  <div className="text-[10px] text-gray-400">تاريخ الاستحقاق:</div>
                  <div className="text-xs font-bold text-white mt-0.5">{returnRentalObj.expected_return_date}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">غرامة التأخير المحتسبة:</div>
                  <div className="text-xs font-bold text-rose-500 mt-0.5">{delayFine} د.ل</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold">ملاحظات الإرجاع / تفاصيل التلف إن وجد</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  placeholder="مثال: إرجاع سليم مع تأخر يوم واحد"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setReturnRentalObj(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 py-2 px-4 rounded-lg text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isReturning}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  {isReturning ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                  تأكيد إرجاع القطع والتحصيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      {selectedRental && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-premium rounded-xl max-w-sm w-full border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-xs sm:text-sm">تسجيل دفعة إيجار: {selectedRental.operation_number}</h3>
              <button onClick={() => setSelectedRental(null)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">المبلغ المطلوب سداده (المتبقي: {selectedRental.remaining} د.ل)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedRental.remaining}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-emerald-400 font-bold"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedRental(null)}
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
                  تسجيل الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

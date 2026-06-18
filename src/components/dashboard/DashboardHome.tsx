import React, { useState, useEffect } from 'react';
import { 
  Calendar, ShoppingBag, Truck, ArrowLeftRight, AlertCircle, CheckCircle, 
  DollarSign, TrendingUp, Plus, Bell, Clock, RefreshCw, FileText, ClipboardList
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DashboardHomeProps {
  setActiveTab: (tab: string) => void;
  onNewReservation: () => void;
  onNewRental: () => void;
  onNewSale: () => void;
  products: any[];
  customers: any[];
  reservations: any[];
  rentals: any[];
  orders: any[];
  payments: any[];
}

export default function DashboardHome({
  setActiveTab,
  onNewReservation,
  onNewRental,
  onNewSale,
  products,
  customers,
  reservations,
  rentals,
  orders,
  payments
}: DashboardHomeProps) {
  const [stats, setStats] = useState({
    todayReservations: 0,
    activeRentals: 0,
    todayDeliveries: 0,
    todayReturns: 0,
    delayedCount: 0,
    availableProducts: 0,
    reservedProducts: 0,
    rentedProducts: 0,
  });

  const [financials, setFinancials] = useState({
    totalSales: 0,
    totalRentals: 0,
    totalDeposits: 0,
    totalRemaining: 0,
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    calculateStats();
    calculateFinancials();
    loadNotifications();
  }, [products, customers, reservations, rentals, orders, payments]);

  useEffect(() => {
    generateCalendarEvents();
  }, [reservations, rentals]);

  // Load inside-app alerts
  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setNotifications(data);
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    }
  };

  const calculateStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Today's reservations (starting today)
    const todayRes = reservations.filter(r => r.start_date === todayStr).length;

    // Active rentals (status 'rented' and actual delivery date not null, not returned)
    const activeRent = rentals.filter(r => r.status === 'rented').length;

    // Today's deliveries (expected pickup/delivery today)
    const resDeliveries = reservations.filter(r => r.pickup_date === todayStr && r.status === 'active').length;
    const rentDeliveries = rentals.filter(r => r.start_date === todayStr && r.status === 'rented' && !r.actual_delivery_date).length;
    const todayDeliv = resDeliveries + rentDeliveries;

    // Today's returns expected
    const resReturns = reservations.filter(r => r.return_date === todayStr && r.status === 'active').length;
    const rentReturns = rentals.filter(r => r.expected_return_date === todayStr && r.status === 'rented').length;
    const todayRet = resReturns + rentReturns;

    // Delayed operations (rentals late, reservations overdue return)
    const lateRentals = rentals.filter(r => {
      const expDate = new Date(r.expected_return_date);
      const today = new Date();
      today.setHours(0,0,0,0);
      return r.status === 'rented' && expDate < today;
    }).length;
    
    const lateRes = reservations.filter(r => {
      const retDate = new Date(r.return_date);
      const today = new Date();
      today.setHours(0,0,0,0);
      return r.status === 'active' && retDate < today;
    }).length;

    const delayed = lateRentals + lateRes;

    // Product stock states
    const availProds = products.filter(p => p.status === 'available').length;
    const resProds = products.filter(p => p.status === 'reserved').length;
    const rentedProds = products.filter(p => p.status === 'rented').length;

    setStats({
      todayReservations: todayRes,
      activeRentals: activeRent,
      todayDeliveries: todayDeliv,
      todayReturns: todayRet,
      delayedCount: delayed,
      availableProducts: availProds,
      reservedProducts: resProds,
      rentedProducts: rentedProds,
    });
  };

  const calculateFinancials = () => {
    let salesTotal = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    let rentalsTotal = rentals.reduce((sum, r) => sum + Number(r.rental_value || 0), 0);
    let reservationsTotal = reservations.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

    // Sum all received payments
    let depositsTotal = payments.reduce((sum, p) => {
      if (p.movement_type === 'deposit' || p.movement_type === 'cabal' || p.movement_type === 'partial') {
        return sum + Number(p.amount || 0);
      }
      return sum;
    }, 0);

    // Calculate remaining unpaid balances across active reservations & rentals
    let remainingRentals = rentals.reduce((sum, r) => sum + Number(r.remaining || 0), 0);
    let remainingReservations = reservations.reduce((sum, r) => sum + Number(r.remaining || 0), 0);
    let totalRem = remainingRentals + remainingReservations;

    setFinancials({
      totalSales: salesTotal + reservationsTotal, // Gross value of operations
      totalRentals: rentalsTotal,
      totalDeposits: depositsTotal,
      totalRemaining: totalRem,
    });
  };

  const generateCalendarEvents = () => {
    const events: any[] = [];
    
    // Reservations events
    reservations.forEach(res => {
      const custName = res.customers?.name || 'عميل';
      events.push({
        date: res.pickup_date,
        title: `حجز: استلام ${custName}`,
        type: 'pickup',
        color: 'border-amber-500 bg-amber-500/10 text-amber-500'
      });
      events.push({
        date: res.return_date,
        title: `حجز: إرجاع ${custName}`,
        type: 'return',
        color: 'border-blue-500 bg-blue-500/10 text-blue-500'
      });
    });

    // Rentals events
    rentals.forEach(rent => {
      const custName = rent.customers?.name || 'عميل';
      events.push({
        date: rent.start_date,
        title: `إيجار: تسليم ${custName}`,
        type: 'delivery',
        color: 'border-green-500 bg-green-500/10 text-green-500'
      });
      events.push({
        date: rent.expected_return_date,
        title: `إيجار: استحقاق إرجاع ${custName}`,
        type: 'return-due',
        color: 'border-red-500 bg-red-500/10 text-red-500'
      });
    });

    setCalendarEvents(events);
  };

  // Simple Month Calendar Logic
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass-premium rounded-xl gap-4">
        <div>
          <h1 className="text-2xl font-bold gold-text-shimmer">لوحة تحكم «جاغوار»</h1>
          <p className="text-gray-400 text-sm mt-1">مرحباً بك في مركز الإدارة الموحد للمتجر.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={onNewReservation}
            className="flex-1 md:flex-none btn-premium py-2 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            حجز جديد
          </button>
          <button 
            onClick={onNewRental}
            className="flex-1 md:flex-none bg-zinc-800 hover:bg-zinc-700 text-amber-500 border border-amber-500/30 hover:border-amber-500 transition-all py-2 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            إيجار جديد
          </button>
          <button 
            onClick={onNewSale}
            className="flex-1 md:flex-none bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-all py-2 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            بيع مباشر
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 glass rounded-xl flex items-center gap-4 border-r-4 border-amber-500">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.todayReservations}</div>
            <div className="text-xs text-gray-400">حجوزات اليوم</div>
          </div>
        </div>

        <div className="p-4 glass rounded-xl flex items-center gap-4 border-r-4 border-blue-500">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
            <RefreshCw size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.activeRentals}</div>
            <div className="text-xs text-gray-400">إيجارات نشطة</div>
          </div>
        </div>

        <div className="p-4 glass rounded-xl flex items-center gap-4 border-r-4 border-green-500">
          <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
            <Truck size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.todayDeliveries}</div>
            <div className="text-xs text-gray-400">تسليمات اليوم</div>
          </div>
        </div>

        <div className="p-4 glass rounded-xl flex items-center gap-4 border-r-4 border-red-500">
          <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
            <ArrowLeftRight size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.todayReturns}</div>
            <div className="text-xs text-gray-400 font-medium">إرجاعات اليوم</div>
          </div>
        </div>
      </div>

      {/* Financials & Stock Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Summary */}
        <div className="lg:col-span-2 p-6 glass rounded-xl space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h2 className="font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-amber-500" size={18} />
              الملخص المالي للمعاملات
            </h2>
            <span className="text-xs text-amber-500/80 font-bold bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/20">تحديث فوري</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
              <span className="text-xs text-gray-400">حجم المبيعات والحجوزات</span>
              <div className="text-lg font-bold text-white mt-1">{financials.totalSales.toLocaleString()} د.ل</div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
              <span className="text-xs text-gray-400">إجمالي الإيجارات</span>
              <div className="text-lg font-bold text-white mt-1">{financials.totalRentals.toLocaleString()} د.ل</div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
              <span className="text-xs text-gray-400">العربين والمستحصلات</span>
              <div className="text-lg font-bold text-emerald-500 mt-1">{financials.totalDeposits.toLocaleString()} د.ل</div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
              <span className="text-xs text-gray-400">المتبقي غير المدفوع</span>
              <div className="text-lg font-bold text-red-500 mt-1">{financials.totalRemaining.toLocaleString()} د.ل</div>
            </div>
          </div>

          {/* Quick Stats list */}
          <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4 text-center">
            <div>
              <span className="text-[11px] text-gray-500">المنتجات المتوفرة</span>
              <div className="text-base font-semibold text-emerald-400 mt-0.5">{stats.availableProducts}</div>
            </div>
            <div>
              <span className="text-[11px] text-gray-500">المنتجات المحجوزة</span>
              <div className="text-base font-semibold text-amber-400 mt-0.5">{stats.reservedProducts}</div>
            </div>
            <div>
              <span className="text-[11px] text-gray-500">المنتجات المؤجرة</span>
              <div className="text-base font-semibold text-blue-400 mt-0.5">{stats.rentedProducts}</div>
            </div>
          </div>
        </div>

        {/* Delay Warnings Card */}
        <div className="p-6 glass rounded-xl flex flex-col justify-between border-l-4 border-rose-600 bg-rose-950/5">
          <div>
            <div className="flex justify-between items-start">
              <h2 className="font-bold text-white flex items-center gap-2">
                <AlertCircle className="text-rose-500" size={18} />
                تأخيرات ومستحقات معلقة
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-2">يرصد النظام المعاملات التي تجاوزت تواريخ الإرجاع أو التسليم دون إغلاقها.</p>
            
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center p-2.5 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <span className="text-xs text-gray-300">عمليات إيجار أو حجز متأخرة</span>
                <span className="text-sm font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full">{stats.delayedCount}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <span className="text-xs text-gray-300">مبالغ متبقية قيد التحصيل</span>
                <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">{financials.totalRemaining.toLocaleString()} د.ل</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('rentals')}
            className="w-full mt-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-2 rounded-lg text-xs font-semibold border border-rose-500/20 transition-all"
          >
            استعراض المتأخرات
          </button>
        </div>
      </div>

      {/* Calendar & Notifications Today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Calendar Panel */}
        <div className="lg:col-span-2 p-6 glass rounded-xl">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Calendar className="text-amber-500" size={18} />
              تقويم العمليات والمواعيد
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-zinc-800 rounded text-gray-400 hover:text-white">&lt;</button>
              <span className="text-xs font-bold text-white px-2">{monthNames[currentMonth]} {currentYear}</span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-zinc-800 rounded text-gray-400 hover:text-white">&gt;</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
            <div>أحد</div>
            <div>إثنين</div>
            <div>ثلاثاء</div>
            <div>أربعاء</div>
            <div>خميس</div>
            <div>جمعة</div>
            <div>سبت</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Blank days before start of month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-10 bg-transparent"></div>
            ))}
            
            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              // Find events on this day
              const dayEvents = calendarEvents.filter(ev => ev.date === dateString);
              const isToday = new Date().toISOString().split('T')[0] === dateString;

              return (
                <div 
                  key={`day-${day}`} 
                  className={`h-12 border border-zinc-800 p-1 flex flex-col justify-between rounded relative overflow-hidden group cursor-pointer transition-all ${
                    isToday ? 'bg-amber-500/5 border-amber-500/50' : 'bg-zinc-900/20 hover:bg-zinc-900/60'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isToday ? 'text-amber-500' : 'text-gray-400'}`}>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 justify-center mt-1">
                      {dayEvents.slice(0, 3).map((ev, idx) => (
                        <span 
                          key={idx} 
                          title={ev.title}
                          className={`w-2 h-2 rounded-full ${
                            ev.type === 'pickup' || ev.type === 'delivery' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {/* Tooltip detail on hover */}
                  {dayEvents.length > 0 && (
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-black border border-zinc-800 text-[9px] p-2 rounded shadow-xl z-10 w-32 pointer-events-none">
                      {dayEvents.map((ev, idx) => (
                        <div key={idx} className="truncate text-gray-300 border-b border-zinc-900 last:border-0 pb-1 mt-1 font-bold">
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Notifications Sidebar */}
        <div className="p-6 glass rounded-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Bell className="text-amber-500" size={18} />
              إشعارات وتنبيهات اليوم
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  <CheckCircle size={32} className="mx-auto mb-2 text-zinc-700" />
                  لا توجد تنبيهات نشطة حالياً
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-lg border text-xs relative ${
                      notif.is_read ? 'bg-zinc-900/30 border-zinc-800 text-gray-400' : 'bg-amber-500/5 border-amber-500/20 text-white font-medium'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1.5">
                      <span className="font-semibold">{notif.title}</span>
                      <span className="text-[9px] text-gray-500 shrink-0">
                        {new Date(notif.created_at).toLocaleDateString('ar-LY', { month: 'numeric', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px] mt-1 line-clamp-2">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <button 
            onClick={async () => {
              // Mark all read helper
              try {
                await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
                loadNotifications();
              } catch (err) {
                console.warn(err);
              }
            }}
            className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white py-2 rounded-lg text-xs font-medium border border-zinc-800 transition-all flex items-center justify-center gap-1.5"
          >
            تحديد الكل كمقروء
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, ShieldAlert, LogOut, Settings, Bell, Calendar, Tags, Users, 
  Clock, DollarSign, ClipboardList, ShoppingBag, LayoutDashboard, Check, 
  Menu, X, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import { 
  supabase, getSettings, getProducts, getCustomers, 
  getReservations, getRentals, getOrders, getPayments, getActivityLogs, addNotification
} from '@/lib/supabase';

// Sub-components
import DashboardHome from '@/components/dashboard/DashboardHome';
import ProductManager from '@/components/dashboard/ProductManager';
import CustomerManager from '@/components/dashboard/CustomerManager';
import ReservationManager from '@/components/dashboard/ReservationManager';
import RentalManager from '@/components/dashboard/RentalManager';
import SalesManager from '@/components/dashboard/SalesManager';
import PaymentTracker from '@/components/dashboard/PaymentTracker';
import ActivityLogger from '@/components/dashboard/ActivityLogger';
import SettingsPanel from '@/components/dashboard/SettingsPanel';

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Flags to open modals directly from home quick actions
  const [openNewReservation, setOpenNewReservation] = useState(false);
  const [openNewRental, setOpenNewRental] = useState(false);
  const [openNewSale, setOpenNewSale] = useState(false);

  // Database States
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if auth session exists
    const localAuth = localStorage.getItem('jaguar_authenticated');
    if (localAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    loadConfig();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadConfig = async () => {
    try {
      const sett = await getSettings();
      setSettings(sett);
    } catch (err) {
      console.warn("Failed to load settings configuration:", err);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const sett = await getSettings();
      setSettings(sett);

      const prods = await getProducts();
      setProducts(prods);

      const custs = await getCustomers();
      setCustomers(custs);

      const resv = await getReservations();
      setReservations(resv);

      const rent = await getRentals();
      setRentals(rent);

      const ords = await getOrders();
      setOrders(ords);

      const pays = await getPayments();
      setPayments(pays);

      const auditLogs = await getActivityLogs();
      setLogs(auditLogs);

      // Trigger automatic smart alerts checks
      checkSmartAlerts(resv, rent, sett);

    } catch (err) {
      console.error("Error loading application data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Automated notification generator based on dates & remaining amounts
  const checkSmartAlerts = async (resList: any[], rentList: any[], settingsMap: Record<string, string>) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString().split('T')[0];

    try {
      // Overdue returns for rentals
      for (const rent of rentList) {
        if (rent.status === 'rented') {
          const expReturn = new Date(rent.expected_return_date);
          expReturn.setHours(0,0,0,0);

          if (expReturn < today) {
            // Check if alert already exists to prevent duplicate spam
            const title = `تأخر إرجاع الإيجار رقم ${rent.operation_number}`;
            const { data } = await supabase
              .from('notifications')
              .select('id')
              .eq('title', title)
              .limit(1);

            if (!data || data.length === 0) {
              await addNotification({
                type: 'late_return',
                title,
                message: `العميل ${rent.customers?.name || 'غير معروف'} متأخر في إرجاع القطع. تاريخ الاستحقاق كان ${rent.expected_return_date}.`,
                linked_operation_type: 'rental',
                linked_operation_id: rent.id
              });
            }
          }
        }
      }

      // Overdue returns for reservations
      for (const res of resList) {
        if (res.status === 'active') {
          const expReturn = new Date(res.return_date);
          expReturn.setHours(0,0,0,0);

          if (expReturn < today) {
            const title = `تأخر إرجاع حجز رقم ${res.reservation_number}`;
            const { data } = await supabase
              .from('notifications')
              .select('id')
              .eq('title', title)
              .limit(1);

            if (!data || data.length === 0) {
              await addNotification({
                type: 'late_return',
                title,
                message: `العميل ${res.customers?.name || 'غير معروف'} متأخر في إرجاع القطع المحجوزة. تاريخ الإرجاع كان ${res.return_date}.`,
                linked_operation_type: 'reservation',
                linked_operation_id: res.id
              });
            }
          }
        }
      }

      // Unpaid remaining balance alert
      for (const res of resList) {
        if (res.status === 'active' && Number(res.remaining) > 0) {
          const pickupDate = new Date(res.pickup_date);
          pickupDate.setHours(0,0,0,0);

          // Alert 1 day before pickup if remaining balance exists
          const diffTime = pickupDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 2 && diffDays >= 0) {
            const title = `مبلغ متبقي معلق للحجز ${res.reservation_number}`;
            const { data } = await supabase
              .from('notifications')
              .select('id')
              .eq('title', title)
              .limit(1);

            if (!data || data.length === 0) {
              await addNotification({
                type: 'unpaid_balance',
                title,
                message: `العميل ${res.customers?.name || ''} لديه متبقي قدره ${res.remaining} د.ل لحساب حجز التخرج المستحق قريباً.`,
                linked_operation_type: 'reservation',
                linked_operation_id: res.id
              });
            }
          }
        }
      }

    } catch (err) {
      console.warn("Failed checking automated alerts:", err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Fetch the correct PIN from settings or fallback to 9922
    const correctPin = settings.admin_pin || '9922';

    if (pinInput === correctPin) {
      setIsAuthenticated(true);
      localStorage.setItem('jaguar_authenticated', 'true');
      setPinInput('');
    } else {
      setErrorMsg('رمز الدخول غير صحيح، يرجى المحاولة مرة أخرى.');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('jaguar_authenticated');
    setActiveTab('home');
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: 'home', label: 'الرئيسية والإحصائيات', icon: LayoutDashboard },
    { id: 'products', label: 'إدارة المنتجات', icon: Tags },
    { id: 'customers', label: 'إدارة العملاء', icon: Users },
    { id: 'reservations', label: 'سجل الحجوزات', icon: Calendar },
    { id: 'rentals', label: 'عقود الإيجار', icon: Clock },
    { id: 'sales', label: 'المبيعات المباشرة', icon: ShoppingBag },
    { id: 'payments', label: 'الخزينة والمدفوعات', icon: DollarSign },
    { id: 'logs', label: 'سجل العمليات والرقابة', icon: ClipboardList },
    { id: 'settings', label: 'إعدادات النظام', icon: Settings },
  ];

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <RefreshCw className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  // 1. Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract Gold Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#b08d33]/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-md w-full glass-premium rounded-2xl p-8 border border-zinc-800/80 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-amber-500/10 rounded-full text-amber-500 border border-amber-500/20 mb-1">
              <Sparkles size={28} />
            </div>
            <h1 className="text-2xl font-black gold-text-shimmer uppercase tracking-wider">جاغوار للمناسبات</h1>
            <p className="text-zinc-400 text-xs font-semibold">منظومة الإدارة والمستودع الداخلية المغلقة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs flex items-center gap-2 font-semibold justify-center">
                <ShieldAlert size={16} />
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 font-bold block">أدخل رمز PIN للدخول للمنظومة</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  maxLength={6}
                  placeholder="••••"
                  className="w-full bg-zinc-955 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-xl py-3 px-4 text-center text-lg tracking-[8px] text-white font-bold transition-all"
                  autoFocus
                />
                <span className="absolute left-3.5 top-3.5 text-zinc-600">
                  <Key size={18} />
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-premium py-3 rounded-xl text-xs font-bold transition-all mt-2"
            >
              تسجيل الدخول للمنظومة
            </button>
          </form>

          <div className="text-center border-t border-zinc-900 pt-4">
            <span className="text-[10px] text-zinc-600 font-medium block">
              جميع الحقوق محفوظة لجاغوار © 2026
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Main Controller & Sidebar Dashboard
  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-zinc-950 border-l border-zinc-900 flex-col justify-between hidden lg:flex shrink-0">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-900">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
              <Sparkles size={18} />
            </div>
            <span className="font-black text-white text-base tracking-wider">{settings.store_name || 'جاغوار للمناسبات'}</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-500 border-r-2 border-amber-500' 
                      : 'text-gray-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-900">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-950/20 hover:text-rose-400 transition-all"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden flex justify-start">
          <div className="w-64 bg-zinc-950 p-6 flex flex-col justify-between h-full border-l border-zinc-900">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                <span className="font-black text-white text-sm">{settings.store_name || 'جاغوار'}</span>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-amber-500/10 text-amber-500 border-r-2 border-amber-500' 
                          : 'text-gray-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-950/20 transition-all border-t border-zinc-900 pt-4"
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Mobile and desktop info */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950/40 px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-bold text-white text-xs sm:text-sm">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={loadAllData}
              disabled={isLoading}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-gray-400 hover:text-white transition-all disabled:opacity-50"
              title="تحديث البيانات"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <div className="h-4 w-[1px] bg-zinc-800" />
            
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gray-400 font-bold hidden sm:inline">خادم Supabase: متصل</span>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {isLoading && products.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-amber-500" size={24} />
              <span className="text-xs text-gray-500">جاري تحميل البيانات من السحابة...</span>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <DashboardHome 
                  setActiveTab={setActiveTab}
                  onNewReservation={() => { setActiveTab('reservations'); setOpenNewReservation(true); }}
                  onNewRental={() => { setActiveTab('rentals'); setOpenNewRental(true); }}
                  onNewSale={() => { setActiveTab('sales'); setOpenNewSale(true); }}
                  products={products}
                  customers={customers}
                  reservations={reservations}
                  rentals={rentals}
                  orders={orders}
                  payments={payments}
                />
              )}
              {activeTab === 'products' && (
                <ProductManager products={products} onRefresh={loadAllData} />
              )}
              {activeTab === 'customers' && (
                <CustomerManager customers={customers} onRefresh={loadAllData} />
              )}
              {activeTab === 'reservations' && (
                <ReservationManager 
                  reservations={reservations} 
                  products={products} 
                  customers={customers} 
                  onRefresh={loadAllData} 
                  openNewReservationFlag={openNewReservation}
                  setOpenNewReservationFlag={setOpenNewReservation}
                />
              )}
              {activeTab === 'rentals' && (
                <RentalManager 
                  rentals={rentals} 
                  products={products} 
                  customers={customers} 
                  onRefresh={loadAllData} 
                  openNewRentalFlag={openNewRental}
                  setOpenNewRentalFlag={setOpenNewRental}
                />
              )}
              {activeTab === 'sales' && (
                <SalesManager 
                  orders={orders} 
                  products={products} 
                  customers={customers} 
                  onRefresh={loadAllData} 
                  openNewSaleFlag={openNewSale}
                  setOpenNewSaleFlag={setOpenNewSale}
                />
              )}
              {activeTab === 'payments' && (
                <PaymentTracker payments={payments} onRefresh={loadAllData} />
              )}
              {activeTab === 'logs' && (
                <ActivityLogger logs={logs} onRefresh={loadAllData} />
              )}
              {activeTab === 'settings' && (
                <SettingsPanel 
                  settings={settings} 
                  onRefresh={loadAllData} 
                  products={products}
                  customers={customers}
                  reservations={reservations}
                  rentals={rentals}
                  orders={orders}
                  payments={payments}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Key, ShieldCheck, Download, Upload, Clipboard, Check,
  Palette, Printer, Bell, Info, Database, AlertTriangle
} from 'lucide-react';
import { supabase, updateSetting } from '@/lib/supabase';

interface SettingsPanelProps {
  settings: Record<string, string>;
  onRefresh: () => void;
  // Raw lists to support backup/restore
  products: any[];
  customers: any[];
  reservations: any[];
  rentals: any[];
  orders: any[];
  payments: any[];
}

export default function SettingsPanel({
  settings,
  onRefresh,
  products,
  customers,
  reservations,
  rentals,
  orders,
  payments
}: SettingsPanelProps) {
  const [storeName, setStoreName] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [themePrimary, setThemePrimary] = useState('#d4af37');
  const [printHeader, setPrintHeader] = useState('');
  const [printFooter, setPrintFooter] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  // Backup / restore
  const [isImporting, setIsImporting] = useState(false);
  const [importLogs, setImportLogs] = useState<string[]>([]);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name || 'جاغوار للمناسبات');
      setAdminPin(settings.admin_pin || '9922');
      setThemePrimary(settings.theme_primary || '#d4af37');
      setPrintHeader(settings.print_header || 'جاغوار للمناسبات - طرابلس');
      setPrintFooter(settings.print_footer || 'شكراً لتعاملكم معنا');
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');

    try {
      await updateSetting('store_name', storeName);
      await updateSetting('admin_pin', adminPin);
      await updateSetting('theme_primary', themePrimary);
      await updateSetting('print_header', printHeader);
      await updateSetting('print_footer', printFooter);

      setSuccessMsg("تم حفظ الإعدادات بنجاح!");
      onRefresh();

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ الإعدادات.");
    } finally {
      setIsSaving(false);
    }
  };

  const runBackup = () => {
    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      products,
      customers,
      reservations,
      rentals,
      orders,
      payments,
      settings
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `نسخة_احتياطية_جاغوار_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!confirm("تحذير: سيتم دمج البيانات المستوردة مع قاعدة البيانات الحالية. هل ترغب بالاستمرار؟")) return;

      setIsImporting(true);
      setImportLogs(["جاري قراءة ملف النسخة الاحتياطية..."]);

      try {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            
            if (!data.products || !data.customers) {
              throw new Error("تنسيق ملف النسخة الاحتياطية غير صحيح.");
            }

            setImportLogs(prev => [...prev, "بدء استيراد العملاء..."]);
            // Customers
            for (const item of data.customers) {
              await supabase.from('customers').upsert(item);
            }
            
            setImportLogs(prev => [...prev, "بدء استيراد المنتجات..."]);
            // Products
            for (const item of data.products) {
              await supabase.from('products').upsert(item);
            }

            setImportLogs(prev => [...prev, "بدء استيراد الحجوزات..."]);
            // Reservations
            if (data.reservations) {
              for (const item of data.reservations) {
                // Remove joined customers & items keys before inserting
                const { customers, items, ...rest } = item;
                await supabase.from('reservations').upsert(rest);
              }
            }

            setImportLogs(prev => [...prev, "بدء استيراد الإيجارات..."]);
            // Rentals
            if (data.rentals) {
              for (const item of data.rentals) {
                const { customers, items, ...rest } = item;
                await supabase.from('rentals').upsert(rest);
              }
            }

            setImportLogs(prev => [...prev, "بدء استيراد المدفوعات والعمليات..."]);
            // Payments
            if (data.payments) {
              for (const item of data.payments) {
                await supabase.from('payments').upsert(item);
              }
            }

            setImportLogs(prev => [...prev, "تم استيراد كافة البيانات ودمجها بنجاح!"]);
            onRefresh();

          } catch (err: any) {
            setImportLogs(prev => [...prev, `خطأ: ${err.message || String(err)}`]);
          } finally {
            setIsImporting(false);
          }
        };
        fileReader.readAsText(file);
      } catch (err: any) {
        setImportLogs(prev => [...prev, `خطأ: ${err.message || String(err)}`]);
        setIsImporting(false);
      }
    }
  };

  const sqlCode = `-- انشئ الجداول والصلاحيات في Supabase بالضغط على الزر أدناه
create table if not exists public.settings (
    key text primary key,
    value text,
    updated_at timestamptz default now()
);

create table if not exists public.customers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    whatsapp text,
    phone text,
    address text,
    id_type text,
    id_name text,
    created_at timestamptz default now()
);

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    image text,
    code text unique not null,
    barcode text unique not null,
    category text not null,
    size text,
    colors text,
    notes text,
    quantity integer default 1,
    status text default 'available',
    price_sale numeric(12, 2) default 0,
    price_rent numeric(12, 2) default 0,
    item_mode text default 'both',
    is_edged boolean default false,
    layer_type text,
    fabric_type text,
    color_sash text,
    color_print text,
    color_embroidery text,
    created_at timestamptz default now()
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="pb-3 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings size={20} className="text-amber-500" />
          إعدادات النظام والنسخ الاحتياطي
        </h2>
        <p className="text-xs text-gray-400 mt-1 font-medium">التحكم في المتجر، الرمز السري، والنسخ الاحتياطي.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Settings Form */}
        <div className="lg:col-span-2 glass rounded-xl p-6 space-y-6">
          <div className="border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Palette className="text-amber-500" size={16} />
            <h3 className="font-bold text-white text-xs sm:text-sm">إعدادات الهوية والمظهر العام</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-xs flex items-center gap-2">
                <Check size={16} />
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold">اسم المتجر / العلامة التجارية</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold flex items-center gap-1">
                  <Key size={12} className="text-amber-500" />
                  رمز PIN للدخول *
                </label>
                <input
                  type="text"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  maxLength={6}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white text-left font-bold"
                />
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-4 space-y-4">
              <div className="border-b border-zinc-800 pb-3 flex items-center gap-2">
                <Printer className="text-amber-500" size={16} />
                <h3 className="font-bold text-white text-[11px] sm:text-xs">إعدادات طباعة الفواتير والإيصالات</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">ترويسة الطباعة (الهيدر)</label>
                  <input
                    type="text"
                    value={printHeader}
                    onChange={(e) => setPrintHeader(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold">تذييل الطباعة (الفوتير)</label>
                  <input
                    type="text"
                    value={printFooter}
                    onChange={(e) => setPrintFooter(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-900">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-premium py-2 px-6 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Save size={14} />
                حفظ الإعدادات
              </button>
            </div>
          </form>
        </div>

        {/* Database backup & Setup helper */}
        <div className="space-y-6">
          {/* Backup & Restore */}
          <div className="glass rounded-xl p-6 space-y-4 border-l-4 border-amber-500">
            <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
              <Database size={16} className="text-amber-500" />
              النسخ الاحتياطي للبيانات
            </h3>
            <p className="text-xs text-gray-400">حفظ نسخة احتياطية آمنة من جميع المنتجات والعملاء والحجوزات على جهازك.</p>
            
            <div className="space-y-2.5">
              <button 
                onClick={runBackup}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-amber-500/20 hover:border-amber-500 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Download size={14} />
                تحميل نسخة JSON احتياطية
              </button>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleImportBackup}
                  disabled={isImporting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button 
                  type="button"
                  className="w-full bg-zinc-900/40 hover:bg-zinc-900 text-gray-400 border border-zinc-800 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={14} />
                  استيراد ودمج نسخة احتياطية
                </button>
              </div>
            </div>

            {importLogs.length > 0 && (
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-900 text-[10px] font-mono text-zinc-500 max-h-24 overflow-y-auto space-y-0.5">
                {importLogs.map((log, idx) => (
                  <div key={idx} className={log.startsWith('خطأ') ? 'text-red-500' : 'text-gray-400'}>{log}</div>
                ))}
              </div>
            )}
          </div>

          {/* Database Setup Copy Code */}
          <div className="glass rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-500" />
              سكريبت إعداد الجداول
            </h3>
            <p className="text-[11px] text-gray-400">إذا لم تكن جداول النظام منشأة بعد في حساب Supabase الخاص بك، انسخ سكريبت SQL التالي والصقه في SQL Editor بالمنصة.</p>
            <button 
              onClick={copySql}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-gray-300 py-2 rounded-lg text-xs font-semibold border border-zinc-800 transition-all flex items-center justify-center gap-1.5"
            >
              {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Clipboard size={14} />}
              {copiedSql ? 'تم نسخ الكود!' : 'نسخ الكود البرمجي'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

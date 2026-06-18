import React, { useState } from 'react';
import { 
  Search, AlertCircle, RefreshCw, ClipboardList, Clock, Info, CheckCircle
} from 'lucide-react';

interface ActivityLoggerProps {
  logs: any[];
  onRefresh: () => void;
}

export default function ActivityLogger({ logs, onRefresh }: ActivityLoggerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const actionTypes: Record<string, { label: string; color: string }> = {
    'add': { label: 'إضافة جديد ➕', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    'edit': { label: 'تعديل 📝', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    'delete': { label: 'حذف ❌', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' }
  };

  const tableLabels: Record<string, string> = {
    'products': 'المنتجات 📦',
    'customers': 'العملاء 👥',
    'reservations': 'الحجوزات 📅',
    'rentals': 'الإيجارات 🔑',
    'orders': 'البيوعات 💰',
    'payments': 'المدفوعات 💵',
    'deliveries': 'التسليمات 🚚',
    'returns': 'الإرجاعات 🔄'
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const tableLabel = tableLabels[log.table_name] || log.table_name;
    const actionLabel = actionTypes[log.action_type]?.label || log.action_type;
    const detailsStr = JSON.stringify(log.details || {}).toLowerCase();
    
    return (
      tableLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actionLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detailsStr.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList size={20} className="text-amber-500" />
            سجل العمليات والرقابة (Activity Log)
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">سجل الحركات والأحداث التي تمت على قاعدة البيانات للرقابة والأمان.</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-zinc-900 hover:bg-zinc-800 text-gray-300 border border-zinc-800 hover:border-zinc-700 py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          تحديث السجل
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <span className="absolute right-3 top-2.5 text-gray-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="ابحث بالجدول، بنوع الحركة، أو تفاصيل التغييرات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg py-2 pr-10 pl-4 text-xs text-white transition-all"
        />
      </div>

      {/* Logs timeline list */}
      <div className="glass rounded-xl overflow-hidden border border-zinc-800 p-6 space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs">
            <AlertCircle size={32} className="mx-auto mb-2 text-zinc-700" />
            لا توجد أي سجلات نشطة حالياً.
          </div>
        ) : (
          <div className="relative border-r border-zinc-800 mr-4 space-y-6">
            {filteredLogs.map((log) => {
              const action = actionTypes[log.action_type] || { label: log.action_type, color: 'text-gray-400' };
              const timeStr = new Date(log.created_at).toLocaleString('ar-LY', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                year: 'numeric', month: 'numeric', day: 'numeric'
              });

              return (
                <div key={log.id} className="relative pr-6">
                  {/* Timeline indicator node */}
                  <span className="absolute right-[-6px] top-1.5 w-3 h-3 rounded-full bg-zinc-950 border-2 border-amber-500 z-10" />

                  {/* Log Card */}
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 space-y-2 hover:border-zinc-700 transition-all">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${action.color}`}>
                          {action.label}
                        </span>
                        <span className="text-xs font-bold text-white">
                          على جدول {tableLabels[log.table_name] || log.table_name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                        <Clock size={12} />
                        {timeStr}
                      </div>
                    </div>

                    {/* Details details */}
                    <div className="text-[11px] text-gray-400 font-medium">
                      المسؤول: <span className="text-zinc-300 font-bold">{log.action_by}</span>
                    </div>

                    {log.details && (
                      <div className="bg-zinc-950 p-2.5 rounded border border-zinc-900 text-[10px] font-mono text-zinc-400 overflow-x-auto">
                        <span className="text-[9px] text-amber-500/80 font-bold block mb-1">البيانات المعدلة:</span>
                        {Object.entries(log.details).map(([key, val]) => {
                          if (val === null || val === undefined) return null;
                          return (
                            <div key={key} className="truncate">
                              <span className="text-gray-500 font-semibold">{key}:</span> {String(val)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

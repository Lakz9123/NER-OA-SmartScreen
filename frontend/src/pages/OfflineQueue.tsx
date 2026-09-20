import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, WifiOff, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { syncOutbox } from '../services/syncService';

export default function OfflineQueue() {
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success'>('idle');

  const queue = useLiveQuery(() => db.outbox.toArray()) || [];

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    
    try {
      const result = await syncOutbox();
      if (result.success) {
        setSyncStatus('success');
      } else {
        alert(result.message);
        setSyncStatus('idle');
      }
    } catch (e: any) {
      alert("Network error. Try again later.");
      setSyncStatus('idle');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <button onClick={() => navigate('/dashboard')} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Offline Queue</h1>
          </div>
          <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">Local Storage</span>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        
        {/* Status Hero */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 mb-8 text-center animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="inline-flex items-center justify-center p-5 bg-amber-50 text-amber-600 rounded-full mb-6 relative z-10 shadow-inner border border-amber-100">
            <Database className="h-10 w-10" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-3 relative z-10">
            {queue.length} Pending Records
          </h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto relative z-10">
            Records captured while offline are stored securely on this device. Sync them when you have internet access.
          </p>

          <button
            onClick={handleSync}
            disabled={queue.length === 0 || isSyncing}
            className="mt-8 flex w-full max-w-xs mx-auto items-center justify-center rounded-2xl bg-slate-900 py-4 px-4 text-base font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-teal-700 hover:shadow-teal-700/30 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative z-10"
          >
            {isSyncing ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : syncStatus === 'success' ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2 text-emerald-400" />
                Synced Successfully
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                Sync Now
              </>
            )}
          </button>
        </div>

        {/* Queue List */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-2">
            Queued Items
          </h3>
          
          {queue.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 animate-fade-in">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">All records are synced.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {queue.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-center hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-bold text-slate-900">{item.type}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                        PENDING
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

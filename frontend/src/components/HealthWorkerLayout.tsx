import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Settings, Database, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMe } from '../api/client';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function HealthWorkerLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getMe().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 pr-2">
            <div className="shrink-0 bg-gradient-to-tr from-teal-600 to-emerald-400 text-white h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md">
              HW
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold text-slate-800 leading-tight truncate">{user ? user.username : '...'}</span>
              <span className="hidden sm:block text-xs text-slate-500 font-medium truncate">{user?.facility || t('field_worker', 'Field Worker')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <LanguageSwitcher />
            <div className="hidden sm:flex items-center space-x-2">
              <span className="flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${navigator.onLine ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${navigator.onLine ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="hidden sm:inline text-xs font-bold text-slate-600 uppercase tracking-widest">{navigator.onLine ? t('online', 'Online') : t('offline', 'Offline')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 py-2 flex justify-around sm:px-6 lg:px-8 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        <button 
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center p-2 rounded-xl transition-colors ${location.pathname === '/dashboard' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
          <Home className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-bold">{t('nav_home', 'Home')}</span>
        </button>
        <button 
          onClick={() => navigate('/patients')}
          className={`flex flex-col items-center p-2 rounded-xl transition-colors ${location.pathname.startsWith('/patient') ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
          <Users className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-bold">{t('nav_patients', t('patients'))}</span>
        </button>
        <button 
          onClick={() => navigate('/register-patient')}
          className="flex flex-col items-center p-3 -mt-6 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-full shadow-lg shadow-teal-500/30 hover:-translate-y-1 transition-transform"
        >
          <Activity className="h-7 w-7" />
        </button>
        <button 
          onClick={() => navigate('/offline-queue')}
          className={`flex flex-col items-center p-2 rounded-xl transition-colors ${location.pathname === '/offline-queue' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
          <Database className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-bold">{t('nav_queue', 'Queue')}</span>
        </button>
        <button 
          onClick={() => navigate('/settings')}
          className={`flex flex-col items-center p-2 rounded-xl transition-colors ${location.pathname === '/settings' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
          <Settings className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-bold">{t('nav_settings', t('settings'))}</span>
        </button>
      </nav>
    </div>
  );
}

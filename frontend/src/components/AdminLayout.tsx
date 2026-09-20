import { Outlet, useLocation, Link } from 'react-router-dom';
import { Activity, LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMe } from '../api/client';
import { logout } from '../utils/auth';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getMe().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0 shadow-2xl z-20">
        <div className="h-16 flex items-center px-6 bg-slate-950/50">
          <Activity className="h-6 w-6 text-teal-400 mr-3" />
          <span className="font-black text-lg tracking-tight">NER-OA <span className="text-teal-400">Admin</span></span>
        </div>
        
        <div className="p-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{t('main_menu', 'Main Menu')}</div>
          <nav className="space-y-2">
            <Link 
              to="/admin/dashboard" 
              className={`flex items-center px-4 py-3 rounded-xl transition-all ${location.pathname === '/admin/dashboard' ? 'bg-teal-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'}`}
            >
              <LayoutDashboard className="h-5 w-5 mr-3" /> {t('dashboard', 'Dashboard')}
            </Link>
            <Link 
              to="/admin/users" 
              className={`flex items-center px-4 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin/users') ? 'bg-teal-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'}`}
            >
              <Users className="h-5 w-5 mr-3" /> {t('users', 'Users')}
            </Link>
            <Link 
              to="/admin/audit-logs" 
              className={`flex items-center px-4 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin/audit-logs') ? 'bg-teal-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'}`}
            >
              <FileText className="h-5 w-5 mr-3" /> {t('audit_logs', 'Audit Logs')}
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 bg-slate-950/30 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white shadow-lg">
              A
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">{user ? user.username : '...'}</p>
              <p className="text-xs text-teal-400 font-medium">{t('administrator', 'Administrator')}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-colors text-sm font-bold"
          >
            <LogOut className="h-4 w-4 mr-2" /> {t('sign_out', 'Sign Out')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white h-16 flex items-center justify-between px-4 shadow-md z-20 shrink-0">
           <div className="flex items-center">
            <Activity className="h-6 w-6 text-teal-400 mr-2" />
            <span className="font-black">NER-OA Admin</span>
           </div>
           <button onClick={() => logout()} className="text-rose-400 p-2 rounded-lg hover:bg-slate-800">
             <LogOut className="h-5 w-5" />
           </button>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

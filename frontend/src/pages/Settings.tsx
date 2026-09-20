import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Shield, Database, Bell, LogOut, ChevronRight, Terminal } from 'lucide-react';
import { logout } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [devMode, setDevMode] = useState(localStorage.getItem('devMode') === 'true');

  const toggleDevMode = () => {
    const newState = !devMode;
    setDevMode(newState);
    localStorage.setItem('devMode', String(newState));
  };

  return (
    <div className="flex flex-col font-sans">
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-center space-x-6 animate-fade-in-up">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center font-bold text-2xl shadow-lg border-4 border-white">
            HW
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">hw_asha</h2>
            <p className="text-sm font-medium text-slate-500">{t('community_health_worker', 'Community Health Worker')}</p>
            <span className="inline-block mt-2 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-200">
              {t('active_session', 'Active Session')}
            </span>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          
          <div className="animate-fade-in-up-delay-1">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">{t('preferences', 'Preferences')}</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-slate-400 mr-4 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900">{t('language', 'Language')}</span>
                </div>
                <div className="flex items-center">
                  <LanguageSwitcher />
                </div>
              </div>
              
              <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-slate-400 mr-4 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900">{t('notifications', 'Notifications')}</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>

          <div className="animate-fade-in-up-delay-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">{t('system', 'System')}</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <button onClick={() => navigate('/offline-queue')} className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-slate-400 mr-4 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900">{t('offline_storage', 'Offline Storage')}</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mr-2">{t('pending_count', '2 Pending')}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-slate-400 mr-4 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900">{t('privacy_policy', 'Privacy Policy')}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              
              <button onClick={toggleDevMode} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center">
                  <Terminal className="h-5 w-5 text-slate-400 mr-4 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900">{t('developer_mode', 'Developer Mode')}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${devMode ? 'bg-teal-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${devMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              </button>
            </div>
          </div>

        </div>

        <div className="pt-6 animate-fade-in-up-delay-2">
          <button 
            onClick={() => {
              logout();
            }}
            className="w-full flex items-center justify-center p-5 rounded-2xl bg-white border-2 border-rose-100 text-rose-600 font-bold hover:bg-rose-50 hover:border-rose-200 transition-colors group shadow-sm"
          >
            <LogOut className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            {t('sign_out', 'Sign Out')}
          </button>
          
          <div className="text-center mt-8">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">{t('version_info', 'Version 2.0.0 (SIH Build)')}</p>
          </div>
        </div>

      </main>
    </div>
  );
}

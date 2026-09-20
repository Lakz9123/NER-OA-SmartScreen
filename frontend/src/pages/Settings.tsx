import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, Shield, Database, Bell, LogOut, ChevronRight, Terminal } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const [devMode, setDevMode] = useState(localStorage.getItem('devMode') === 'true');

  const toggleDevMode = () => {
    const newState = !devMode;
    setDevMode(newState);
    localStorage.setItem('devMode', String(newState));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <button onClick={() => navigate('/dashboard')} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">App Settings</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-center space-x-6 animate-fade-in-up">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center font-bold text-2xl shadow-lg border-4 border-white">
            HW
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">hw_asha</h2>
            <p className="text-sm font-medium text-slate-500">Community Health Worker</p>
            <span className="inline-block mt-2 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-200">
              Active Session
            </span>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          
          <div className="animate-fade-in-up-delay-1">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Preferences</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-slate-400 mr-4 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900">Language</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <span className="text-sm font-medium mr-2">English (Assamese soon)</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-slate-400 mr-4 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900">Notifications</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>

          <div className="animate-fade-in-up-delay-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">System</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <button onClick={() => navigate('/offline-queue')} className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-slate-400 mr-4 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900">Offline Storage</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mr-2">2 Pending</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-slate-400 mr-4 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900">Privacy Policy</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              
              <button onClick={toggleDevMode} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center">
                  <Terminal className="h-5 w-5 text-slate-400 mr-4 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900">Developer Mode</span>
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
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="w-full flex items-center justify-center p-5 rounded-2xl bg-white border-2 border-rose-100 text-rose-600 font-bold hover:bg-rose-50 hover:border-rose-200 transition-colors group shadow-sm"
          >
            <LogOut className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
          
          <div className="text-center mt-8">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Version 2.0.0 (SIH Build)</p>
          </div>
        </div>

      </main>
    </div>
  );
}

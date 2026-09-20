import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Settings, Activity, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { getMe } from '../api/client';
import { logout } from '../utils/auth';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getMe().then(setUser).catch(() => {
      logout();
    });
  }, [navigate]);

  const userStr = localStorage.getItem('user');
  const loggedInUser = userStr ? JSON.parse(userStr) : null;
  const userScreenings = useLiveQuery(() => db.screenings.filter(s => !s.owner_id || s.owner_id === loggedInUser?.id).toArray()) || [];
  const pendingCount = useLiveQuery(() => db.outbox.filter(o => !o.owner_id || o.owner_id === loggedInUser?.id).count()) || 0;
  const highRiskCount = userScreenings.filter(s => s.risk_level === 'High').length;

  return (
    <div className="font-sans">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Hero Section with Glassmorphism */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900"></div>
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                Welcome back, {user ? (user.full_name || user.username) : '...'}!
              </h1>
              <p className="text-teal-100 text-lg max-w-lg leading-relaxed">
                You have <strong className="text-white">{pendingCount}</strong> screenings pending upload. Continue making an impact in your community today.
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/register-patient')}
              className="mt-6 md:mt-0 group inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-base font-bold text-teal-700 shadow-lg hover:shadow-xl hover:scale-105 hover:bg-teal-50 transition-all duration-300"
            >
              <UserPlus className="h-5 w-5 mr-3 text-teal-600" />
              New Screening
              <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="bg-blue-50 p-3 rounded-xl">
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Screenings</p>
              <p className="text-2xl font-bold text-slate-800">{userScreenings.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="bg-amber-50 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Sync</p>
              <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
            <div className="bg-rose-50 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">High Risk</p>
              <p className="text-2xl font-bold text-slate-800">{highRiskCount}</p>
            </div>
          </div>
        </div>

        {/* Primary Navigation Cards */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            
            <div
              onClick={() => navigate('/register-patient')}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-teal-300 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <UserPlus className="h-24 w-24 text-teal-600" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 inline-flex rounded-2xl bg-teal-50 p-4 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                  <UserPlus className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Register Patient</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Enroll a new patient and begin the AI screening flow.</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/patients')}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="h-24 w-24 text-blue-600" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 inline-flex rounded-2xl bg-blue-50 p-4 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                  <Users className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Patient List</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">View all registered patients and digital reports.</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/settings')}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Settings className="h-24 w-24 text-slate-600" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 inline-flex rounded-2xl bg-slate-100 p-4 text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-colors duration-300 shadow-inner">
                  <Settings className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Settings</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Manage your profile, language, and sync status.</p>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Plus, UserCircle, Activity } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export default function PatientList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const patients = useLiveQuery(() => db.patients.toArray()) || [];
  const isLoading = false;

  const filtered = patients.filter(p => 
    p.village_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
          <button onClick={() => navigate('/dashboard')} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Patient Directory</h1>
          </div>
          <button 
            onClick={() => navigate('/register-patient')}
            className="flex items-center space-x-1 text-white font-bold text-sm bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Patient</span>
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        
        {/* Search Bar */}
        <div className="relative mb-8 animate-fade-in-up">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            className="block w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-teal-600 shadow-sm transition-all font-medium"
            placeholder="Search patients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading Skeletons
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 flex items-center space-x-4 animate-pulse">
                <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((patient, index) => (
              <div 
                key={patient.id} 
                className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 flex items-center hover:bg-slate-50 transition-colors cursor-pointer group animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate('/dashboard')}
              >
                <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-0.5">
                    <span className="font-bold text-slate-900 truncate">Village: {patient.village_code}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600">
                      {patient.age_band}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 font-medium flex items-center">
                    <span className="capitalize">{patient.sex}</span>
                    <span className="mx-2">•</span>
                    <span className="truncate">ID: {patient.id.substring(0, 8)}...</span>
                  </div>
                </div>
                <div className="ml-4">
                  <button className="h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center group-hover:border-teal-500 group-hover:text-teal-600 group-hover:bg-teal-50 transition-all shadow-sm hover:shadow">
                    <Activity className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
              <UserCircle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="font-medium">No patients found.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

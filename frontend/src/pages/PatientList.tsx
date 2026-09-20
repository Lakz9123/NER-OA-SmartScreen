import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Plus, UserCircle, Activity } from 'lucide-react';

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from API. We'll use mock data for the UI upgrade demo.
    setTimeout(() => {
      setPatients([
        { id: '1', first_name: 'Lakshmi', last_name: 'Devi', village_town: 'Guwahati', gender: 'female', age: 62 },
        { id: '2', first_name: 'Ramesh', last_name: 'Kumar', village_town: 'Tezpur', gender: 'male', age: 58 },
        { id: '3', first_name: 'Sunita', last_name: 'Boruah', village_town: 'Jorhat', gender: 'female', age: 55 },
      ]);
      setIsLoading(false);
    }, 600);
  }, []);

  const filtered = patients.filter(p => 
    p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.last_name.toLowerCase().includes(searchTerm.toLowerCase())
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
                style={{ animation: `fade-in-up 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                className="group bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-teal-200 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-teal-100 to-emerald-50 text-teal-600 flex items-center justify-center font-bold text-lg border border-teal-200/50 group-hover:scale-110 transition-transform">
                    {patient.first_name[0]}{patient.last_name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                      {patient.age} yrs • {patient.gender} • {patient.village_town}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="hidden sm:flex items-center text-teal-600 text-sm font-bold bg-teal-50 px-3 py-1.5 rounded-lg group-hover:bg-teal-100 transition-colors">
                    <Activity className="h-4 w-4 mr-1.5" /> Start Screening
                  </button>
                  <ChevronLeft className="h-5 w-5 text-slate-300 rotate-180 group-hover:text-teal-500 transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 animate-fade-in">
              <UserCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No patients found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your search term.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

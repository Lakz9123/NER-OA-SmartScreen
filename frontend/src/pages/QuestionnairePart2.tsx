import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';

const activities = [
  { id: 'stairs', label: 'Going down or up stairs' },
  { id: 'rising', label: 'Rising from sitting' },
  { id: 'walking', label: 'Walking on flat surfaces' },
  { id: 'squatting', label: 'Squatting or bending' },
];

const difficulties = [
  { value: 0, label: 'None', color: 'emerald' },
  { value: 1, label: 'Mild', color: 'blue' },
  { value: 2, label: 'Moderate', color: 'amber' },
  { value: 3, label: 'Severe', color: 'rose' },
];

export default function QuestionnairePart2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId, answers: prevAnswers } = location.state || { patientId: 'demo', answers: {} };

  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleSelect = (activityId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [activityId]: value }));
  };

  const handleNext = () => {
    navigate('/questionnaire/part3', { 
      state: { 
        patientId, 
        answers: { ...prevAnswers, mobility: answers } 
      } 
    });
  };

  const isFormComplete = activities.every(a => answers[a.id] !== undefined);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Functional Mobility</h1>
          </div>
          <div className="text-xs font-bold tracking-widest text-teal-600 uppercase">Step 2 of 3</div>
        </div>
        <div className="w-full bg-slate-100 h-1.5">
          <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-1.5 w-2/3 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-4 bg-teal-50 text-teal-600 rounded-full mb-4">
            <Activity className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">WOMAC Assessment</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Rate the degree of difficulty the patient experienced with the following activities in the past 48 hours.
          </p>
        </div>

        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg ${answers[activity.id] !== undefined ? 'border-teal-200 shadow-teal-100/50' : ''}`}
              style={{ animation: `fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s forwards`, opacity: 0, transform: 'translateY(20px)' }}
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6">{activity.label}</h3>
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                {difficulties.map((diff) => {
                  const isSelected = answers[activity.id] === diff.value;
                  // Dynamic color classes based on difficulty
                  const colorClasses = {
                    emerald: isSelected ? 'bg-emerald-500 text-white shadow-emerald-500/40 border-emerald-500' : 'hover:border-emerald-300 hover:bg-emerald-50 text-slate-500',
                    blue: isSelected ? 'bg-blue-500 text-white shadow-blue-500/40 border-blue-500' : 'hover:border-blue-300 hover:bg-blue-50 text-slate-500',
                    amber: isSelected ? 'bg-amber-500 text-white shadow-amber-500/40 border-amber-500' : 'hover:border-amber-300 hover:bg-amber-50 text-slate-500',
                    rose: isSelected ? 'bg-rose-500 text-white shadow-rose-500/40 border-rose-500' : 'hover:border-rose-300 hover:bg-rose-50 text-slate-500',
                  }[diff.color];

                  return (
                    <button
                      key={diff.value}
                      onClick={() => handleSelect(activity.id, diff.value)}
                      className={`flex-1 py-4 px-2 rounded-2xl text-sm font-bold border-2 transition-all duration-200 transform ${
                        isSelected ? `shadow-lg scale-105 ${colorClasses}` : `bg-slate-50 border-slate-100 ${colorClasses}`
                      }`}
                    >
                      {diff.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-end animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={handleNext}
            disabled={!isFormComplete}
            className="flex items-center justify-center rounded-2xl bg-slate-900 py-4 px-8 text-base font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-teal-700 hover:shadow-teal-700/30 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group w-full sm:w-auto"
          >
            Continue to Step 3
            <ChevronRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  );
}

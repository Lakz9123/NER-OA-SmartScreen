import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Activity, Flame, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function QuestionnairePart1() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId } = location.state || { patientId: 'demo-patient' };

  const [painLevel, setPainLevel] = useState<number>(5);
  const [stiffnessDuration, setStiffnessDuration] = useState<string>('');
  const [affectedKnee, setAffectedKnee] = useState<string>('');

  const handleNext = () => {
    if (stiffnessDuration && affectedKnee) {
      navigate('/questionnaire/part2', { 
        state: { 
          patientId, 
          answers: { painLevel, stiffnessDuration, affectedKnee } 
        } 
      });
    }
  };

  const isFormComplete = stiffnessDuration !== '' && affectedKnee !== '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{t('pain_and_stiffness', 'Pain & Stiffness')}</h1>
          </div>
          <div className="text-xs font-bold tracking-widest text-teal-600 uppercase">{t('step_1_of_3', 'Step 1 of 3')}</div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-1.5 w-1/3 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Pain Scale */}
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Flame className="h-32 w-32 text-rose-600" />
            </div>
            
            <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center relative z-10">
              <div className="bg-rose-50 p-2 rounded-xl mr-3 text-rose-500">
                <Activity className="h-5 w-5" />
              </div>
              {t('knee_pain_level', 'Knee Pain Level')}
            </h2>
            <p className="text-sm font-medium text-slate-500 mb-10 relative z-10">{t('knee_pain_desc', 'Rate the average knee pain during daily activities.')}</p>
            
            <div className="px-4 relative z-10">
              <div className="relative h-16 flex items-center justify-center mb-4">
                <span className={`text-6xl font-black tracking-tighter transition-colors duration-300 ${
                  painLevel < 4 ? 'text-emerald-500' : painLevel < 7 ? 'text-amber-500' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                }`}>
                  {painLevel}
                </span>
              </div>
              <input 
                type="range" 
                min="0" max="10" 
                value={painLevel} 
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full appearance-none cursor-pointer accent-white drop-shadow-md hover:drop-shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-slate-200"
              />
              <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>{t('pain_none', '0 - None')}</span>
                <span>{t('pain_severe', '10 - Severe')}</span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Morning Stiffness */}
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden animate-fade-in-up-delay-1">
              <h2 className="text-lg font-black text-slate-900 mb-2 flex items-center">
                <div className="bg-amber-50 p-2 rounded-xl mr-3 text-amber-500">
                  <Clock className="h-5 w-5" />
                </div>
                {t('morning_stiffness', 'Morning Stiffness')}
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-6">{t('morning_stiffness_desc', 'Duration after waking up.')}</p>
              
              <div className="grid gap-3">
                {[
                  { id: '<30', label: t('stiffness_less_30', 'Less than 30 mins') },
                  { id: '>30', label: t('stiffness_more_30', '30 mins or more') }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStiffnessDuration(opt.id)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 font-bold ${
                      stiffnessDuration === opt.id 
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-[0_0_15px_rgba(20,184,166,0.2)] scale-105' 
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Affected Knee */}
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden animate-fade-in-up-delay-2">
              <h2 className="text-lg font-black text-slate-900 mb-2 flex items-center">
                <div className="bg-blue-50 p-2 rounded-xl mr-3 text-blue-500">
                  <Activity className="h-5 w-5" />
                </div>
                {t('affected_knee', 'Affected Knee')}
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-6">{t('affected_knee_desc', 'Which knee is experiencing symptoms?')}</p>
              
              <div className="grid gap-3">
                {[
                  { id: 'Left', label: t('knee_left', 'Left') },
                  { id: 'Right', label: t('knee_right', 'Right') },
                  { id: 'Both', label: t('knee_both', 'Both') }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAffectedKnee(opt.id)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 font-bold ${
                      affectedKnee === opt.id 
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-[0_0_15px_rgba(20,184,166,0.2)] scale-105' 
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 flex justify-end animate-fade-in-up-delay-2">
          <button
            onClick={handleNext}
            disabled={!isFormComplete}
            className="flex items-center justify-center rounded-2xl bg-slate-900 py-4 px-8 text-base font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-teal-700 hover:shadow-teal-700/30 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group w-full sm:w-auto"
          >
            {t('continue_to_step', 'Continue to Step {{step}}', { step: 2 })}
            <ChevronRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  );
}

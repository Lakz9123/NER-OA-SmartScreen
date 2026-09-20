import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Camera, Activity, Ruler, Weight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function QuestionnairePart3() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId, answers: prevAnswers } = location.state || { patientId: 'demo', answers: {} };

  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [hadTrauma, setHadTrauma] = useState<boolean>(false);
  const [hadSurgery, setHadSurgery] = useState<boolean>(false);

  const bmiInfo = useMemo(() => {
    if (!heightCm || !weightKg) return null;
    const h = parseFloat(heightCm) / 100;
    const w = parseFloat(weightKg);
    if (h <= 0 || w <= 0) return null;
    
    const bmi = w / (h * h);
    let category = '';
    let colorClass = '';
    let gaugePercent = 0;
    
    if (bmi < 18.5) {
      category = t('bmi_underweight', 'Underweight'); colorClass = 'text-blue-500 bg-blue-50 shadow-blue-500/20';
      gaugePercent = (bmi / 40) * 100;
    } else if (bmi < 25) {
      category = t('bmi_normal', 'Normal'); colorClass = 'text-emerald-500 bg-emerald-50 shadow-emerald-500/20';
      gaugePercent = (bmi / 40) * 100;
    } else if (bmi < 30) {
      category = t('bmi_overweight', 'Overweight'); colorClass = 'text-amber-500 bg-amber-50 shadow-amber-500/20';
      gaugePercent = (bmi / 40) * 100;
    } else {
      category = t('bmi_obese', 'Obese'); colorClass = 'text-rose-500 bg-rose-50 shadow-rose-500/20';
      gaugePercent = Math.min((bmi / 40) * 100, 100);
    }
    
    return { value: bmi.toFixed(1), category, colorClass, gaugePercent };
  }, [heightCm, weightKg]);

  const handleNext = () => {
    navigate('/capture/setup', { 
      state: { 
        patientId, 
        answers: { 
          ...prevAnswers, 
          history: {
            bmi: bmiInfo?.value,
            hadTrauma,
            hadSurgery
          }
        } 
      } 
    });
  };

  const isFormComplete = heightCm !== '' && weightKg !== '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{t('medical_history', 'Medical History')}</h1>
          </div>
          <div className="text-xs font-bold tracking-widest text-teal-600 uppercase">{t('step_3_of_3', 'Step 3 of 3')}</div>
        </div>
        <div className="w-full bg-slate-100 h-1.5">
          <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-1.5 w-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        
        {/* BMI Calculator */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 mb-8 animate-fade-in-up">
          <h2 className="text-xl font-black text-slate-900 mb-8">{t('vitals_and_bmi', 'Vitals & BMI')}</h2>
          
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 ml-1">{t('height_cm', 'Height (cm)')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors group-focus-within:text-teal-600 text-slate-400">
                    <Ruler className="h-5 w-5" />
                  </div>
                  <input
                    type="number" placeholder="e.g. 165"
                    className="block w-full rounded-2xl border-0 bg-slate-50 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all font-medium text-lg"
                    value={heightCm} onChange={(e) => setHeightCm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 ml-1">{t('weight_kg', 'Weight (kg)')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors group-focus-within:text-teal-600 text-slate-400">
                    <Weight className="h-5 w-5" />
                  </div>
                  <input
                    type="number" placeholder="e.g. 70"
                    className="block w-full rounded-2xl border-0 bg-slate-50 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all font-medium text-lg"
                    value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic BMI Gauge */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 h-full relative overflow-hidden">
              {!bmiInfo ? (
                <div className="text-center text-slate-400">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-sm">{t('enter_vitals_calc', 'Enter vitals to calculate')}</p>
                </div>
              ) : (
                <div className="text-center z-10 animate-fade-in">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">{t('calculated_bmi', 'Calculated BMI')}</p>
                  <p className={`text-6xl font-black tracking-tighter mb-2 ${bmiInfo.colorClass.split(' ')[0]}`}>
                    {bmiInfo.value}
                  </p>
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${bmiInfo.colorClass}`}>
                    {bmiInfo.category}
                  </span>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-200">
                {bmiInfo && (
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${
                      bmiInfo.category === t('bmi_underweight', 'Underweight') ? 'bg-blue-500' :
                      bmiInfo.category === t('bmi_normal', 'Normal') ? 'bg-emerald-500' :
                      bmiInfo.category === t('bmi_overweight', 'Overweight') ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${bmiInfo.gaugePercent}%` }}
                  ></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 animate-fade-in-up-delay-1">
          <h2 className="text-xl font-black text-slate-900 mb-6">{t('addl_risk_factors', 'Additional Risk Factors')}</h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-5 border-2 rounded-2xl border-slate-100 bg-slate-50 hover:bg-white hover:border-teal-200 transition-all cursor-pointer group has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50/30">
              <span className="text-slate-800 font-bold group-hover:text-teal-700 transition-colors">{t('prev_injury', 'Previous knee injury / trauma')}</span>
              <div className="relative inline-flex items-center">
                <input type="checkbox" className="sr-only peer" checked={hadTrauma} onChange={(e) => setHadTrauma(e.target.checked)} />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500 shadow-inner"></div>
              </div>
            </label>
            
            <label className="flex items-center justify-between p-5 border-2 rounded-2xl border-slate-100 bg-slate-50 hover:bg-white hover:border-teal-200 transition-all cursor-pointer group has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50/30">
              <span className="text-slate-800 font-bold group-hover:text-teal-700 transition-colors">{t('prev_surgery', 'Previous knee surgery')}</span>
              <div className="relative inline-flex items-center">
                <input type="checkbox" className="sr-only peer" checked={hadSurgery} onChange={(e) => setHadSurgery(e.target.checked)} />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500 shadow-inner"></div>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-12 flex justify-end animate-fade-in-up-delay-2">
          <button
            onClick={handleNext}
            disabled={!isFormComplete}
            className="flex items-center justify-center rounded-2xl bg-teal-600 py-4 px-8 text-base font-bold text-white shadow-xl shadow-teal-600/30 hover:bg-teal-500 hover:scale-105 hover:shadow-teal-500/40 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto group"
          >
            <Camera className="h-5 w-5 mr-3 group-hover:animate-pulse" />
            {t('launch_ai_capture', 'Launch AI Capture')}
          </button>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, ChevronRight, FileText, Activity, HeartPulse } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RiskAnalysis() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;
  
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (result) {
      setData(result);
    } else {
      navigate('/dashboard');
    }
  }, [result, navigate]);

  const riskLevel = data?.risk_level || t('moderate');
  
  // Theme based on risk level
  type RiskLevel = 'Low' | 'Moderate' | 'High';
  const theme: Record<RiskLevel | string, any> = {
    Low: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', gradient: 'from-emerald-400 to-teal-500' },
    Moderate: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', gradient: 'from-amber-400 to-orange-500' },
    High: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', gradient: 'from-red-500 to-rose-600' }
  };
  const currentTheme = theme[riskLevel] || { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', gradient: 'from-slate-400 to-slate-500' };

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-center px-4">
          <h1 className="text-xl font-bold text-slate-900">{t('screening_results', 'Screening Results')}</h1>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 space-y-6">
        
        {/* Mandatory Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-900 leading-relaxed font-medium">
            <strong>{t('synthetic_warning', 'Screening aid, not a diagnosis.')}</strong> {t('clinical_evaluation', 'This tool provides a preliminary risk indication. Clinical evaluation by a medical professional is recommended for all Moderate and High risk results.')}
          </p>
        </div>

        {/* Main Risk Banner */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden text-center p-10 relative">
          <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r hover:opacity-90 transition-opacity duration-300 ${currentTheme.gradient}`}></div>
          
          <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">{t('preliminary_risk_indication', 'Preliminary Risk Indication')}</h2>
          
          <div className="relative inline-flex items-center justify-center w-48 h-48 rounded-full mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke={riskLevel === t('low') ? '#10B981' : riskLevel === t('moderate') ? '#F59E0B' : '#EF4444'} 
                strokeWidth="8" strokeLinecap="round" strokeDasharray="283" 
                strokeDashoffset={riskLevel === t('low') ? 200 : riskLevel === t('moderate') ? 141 : 40} 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold ${currentTheme.color}`}>{t(riskLevel.toLowerCase())}</span>
              <span className="text-sm font-medium text-slate-500 mt-1">{t('risk_label', 'Risk')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-bold">{t('preliminary_risk_level', 'Preliminary Risk Level')}</span>
            <div className="flex items-center text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-sm font-bold">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {t(data.risk_level?.toLowerCase() || 'unknown')}
            </div>
          </div>
          
          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl font-black text-slate-800 tracking-tighter">
              {data.risk_score ? (data.risk_score * 100).toFixed(0) : '0'}%
            </span>
            <span className="text-slate-400 font-medium mb-1">{t('model_confidence', 'model confidence')}</span>
          </div>
          
          <p className="text-slate-600 font-medium text-sm">
            {t('model_version', 'Model version')}: {data.model_version || 'unknown'}
          </p>

          <p className="text-slate-600 max-w-md mx-auto mt-4">
            {t('risk_analysis_desc_prefix', 'Based on the questionnaire responses and kinematic gait analysis, the patient exhibits patterns consistent with a ')}
            <strong className={currentTheme.color}>{String(t(riskLevel.toLowerCase(), riskLevel))}</strong>
            {t('risk_analysis_desc_suffix', ' risk of osteoarthritis.')}
          </p>
        </div>

        {/* Detailed Breakdown Link */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{t('questionnaire_metrics', 'Questionnaire Metrics')}</h3>
            </div>
            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-500 mb-1">
                  <span>{t('pain_score', 'Pain Score')}</span>
                  <span>{data.pain_score || 0}/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-rose-400 h-2 rounded-full" style={{ width: `${(data.pain_score || 0) * 10}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-500 mb-1">
                  <span>{t('function_score', 'Function Score')}</span>
                  <span>{data.function_score || 0}/12</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${((data.function_score || 0) / 12) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                <HeartPulse className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{t('symptom_score', 'Symptom Score')}</h3>
            </div>
            <p className="text-sm text-slate-500 ml-11 mt-4">{t('high_womac_report', 'High WOMAC physical function difficulty reported.')}</p>
          </div>
        </div>

        {data.explainability_data?.top_factors && Object.keys(data.explainability_data.top_factors).length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{t('risk_contributing_factors', 'Risk Contributing Factors')}</h3>
            <div className="space-y-3">
              {Object.entries(data.explainability_data.top_factors)
                .sort(([, a], [, b]) => Math.abs(Number(b)) - Math.abs(Number(a)))
                .map(([factor, weight]) => {
                  const numWeight = Number(weight);
                  const isPositive = numWeight > 0;
                  const label = factor.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <div key={factor} className="flex flex-col">
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>{label}</span>
                        <span className={isPositive ? 'text-rose-500' : 'text-emerald-500'}>
                          {isPositive ? '+' : ''}{numWeight.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 flex overflow-hidden">
                        {isPositive ? (
                          <>
                            <div className="w-1/2 bg-transparent"></div>
                            <div className="bg-rose-400 h-full" style={{ width: `${Math.min(Math.abs(numWeight) * 100, 50)}%` }}></div>
                          </>
                        ) : (
                          <>
                            <div className="bg-emerald-400 h-full ml-auto" style={{ width: `${Math.min(Math.abs(numWeight) * 100, 50)}%` }}></div>
                            <div className="w-1/2 bg-transparent"></div>
                          </>
                        )}
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-6 space-y-3">
          <button
            onClick={() => navigate('/report', { state: { result: data } })}
            className="w-full flex items-center justify-between rounded-xl bg-white border-2 border-primary py-4 px-6 text-base font-semibold text-primary shadow-sm hover:bg-teal-50 transition-colors"
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-3" />
              {t('view_full_report', 'View Full Digital Report')}
            </div>
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center rounded-xl bg-slate-900 py-4 px-6 text-base font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            {t('return_dashboard', 'Return to Dashboard')}
          </button>
        </div>

      </main>
    </div>
  );
}

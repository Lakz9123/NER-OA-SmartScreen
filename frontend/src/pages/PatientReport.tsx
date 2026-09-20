import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Printer, Download, Stethoscope, AlertTriangle, Activity, User, Calendar, MapPin, Phone, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
export default function PatientReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state || { result: null };
  const { t, i18n } = useTranslation();

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-500 mb-4">No report data available.</p>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-slate-900 text-white rounded-xl">Go Home</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const { risk_level, risk_score, pain_score, stiffness_score, function_score, knee_angle_left, knee_angle_right, knee_rom_left, knee_rom_right, cadence } = result;
  
  const isHighRisk = risk_level === 'High';
  const riskColor = isHighRisk ? 'text-rose-600 bg-rose-50 border-rose-200' : risk_level === 'Moderate' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200';
  
  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'as' : 'en');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans print:bg-white">
      
      {/* Top action bar - hidden when printing */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 print:hidden shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors">
            <ChevronLeft className="h-5 w-5 mr-1" />
            {t('return_dashboard')}
          </button>
          <div className="flex space-x-3">
            <button onClick={toggleLang} className="flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              <Globe className="h-4 w-4 mr-2" /> {i18n.language === 'en' ? 'Assamese' : 'English'}
            </button>
            <button onClick={handlePrint} className="flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              <Download className="h-4 w-4 mr-2" /> {t('download_pdf')}
            </button>
            <button onClick={handlePrint} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm">
              <Printer className="h-4 w-4 mr-2" /> Print Report
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 print:py-0 print:px-0">
        
        {/* The Report Document */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 sm:p-12 print:shadow-none print:border-none print:rounded-none animate-fade-in-up">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-tr from-teal-600 to-emerald-400 p-3 rounded-2xl shadow-md print:shadow-none">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">NER-OA SmartScreen</h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('report_title')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-sm font-medium text-slate-500">ID: {result.screening_id || result.id || 'N/A'}</p>
            </div>
          </div>

          {/* Patient Info Grid */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase flex items-center mb-1"><User className="h-3 w-3 mr-1"/> Patient Name</p>
              <p className="font-semibold text-slate-900">Demo Patient</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase flex items-center mb-1"><Calendar className="h-3 w-3 mr-1"/> Age / Sex</p>
              <p className="font-semibold text-slate-900">55 / F</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase flex items-center mb-1"><MapPin className="h-3 w-3 mr-1"/> Location</p>
              <p className="font-semibold text-slate-900">Guwahati, AS</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase flex items-center mb-1"><Phone className="h-3 w-3 mr-1"/> Contact</p>
              <p className="font-semibold text-slate-900">+91 9876543210</p>
            </div>
          </div>

          {/* Core Finding */}
          <div className={`rounded-2xl p-6 border-2 mb-10 flex items-start space-x-4 ${riskColor}`}>
            <AlertTriangle className="h-8 w-8 shrink-0" />
            <div>
              <h2 className="text-lg font-black tracking-tight mb-1">
                {t('preliminary_risk')}: <span className="uppercase">{t(risk_level?.toLowerCase() || 'low')}</span>
              </h2>
              <p className="font-medium text-sm leading-relaxed">{isHighRisk ? t('clinical_evaluation') : ''}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-10">
            {/* Left Column - Kinematics */}
            <div>
              <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-teal-600" />
                AI Gait Kinematics
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-600">{t('cadence')}</span>
                  <span className="font-bold text-slate-900">{cadence || 'N/A'} steps/min</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-600">{t('rom')}</span>
                  <span className="font-bold text-slate-900">{knee_rom_left}° / {knee_rom_right}°</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-600">{t('knee_angle')}</span>
                  <span className="font-bold text-slate-900">{knee_angle_left}° / {knee_angle_right}°</span>
                </li>
                <li className="flex justify-between items-center py-2 bg-slate-50 p-2 rounded-lg mt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('confidence')}</span>
                  <span className="font-bold text-teal-600">{Math.round((risk_score || 0) * 100)}%</span>
                </li>
              </ul>
            </div>

            {/* Right Column - Clinical */}
            <div>
              <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center">
                <Stethoscope className="h-4 w-4 mr-2 text-teal-600" />
                Clinical Questionnaire
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-600">{t('pain_score')} (0-10)</span>
                  <span className={`font-bold ${pain_score >= 7 ? 'text-rose-600' : 'text-slate-900'}`}>{pain_score}/10</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-600">{t('function_score')}</span>
                  <span className="font-bold text-slate-900">{function_score}/12</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-600">{t('stiffness_score')}</span>
                  <span className="font-bold text-slate-900">{stiffness_score}/2</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">Important Disclaimer</p>
            <p className="text-xs text-rose-500 max-w-2xl mx-auto leading-relaxed">
              {t('synthetic_warning')} {t('clinical_evaluation')}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

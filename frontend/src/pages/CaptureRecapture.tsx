import { useNavigate, useLocation } from 'react-router-dom';
import { AlertOctagon, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CaptureRecapture() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { patientId, answers, reason } = location.state || { 
    patientId: 'demo', 
    answers: {},
    reason: 'Poor capture quality.' 
  };

  const handleRetake = () => {
    navigate('/capture/tracking', { state: { patientId, answers } });
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-300">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <button onClick={handleCancel} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <X className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">{t('capture_failed', t('capture_failed'))}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-xl px-4 py-12 flex flex-col items-center justify-center text-center">
        
        <div className="inline-flex items-center justify-center p-6 bg-rose-900/30 border border-rose-500/30 text-rose-500 rounded-full mb-6 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
          <AlertOctagon className="h-12 w-12" strokeWidth={2} />
        </div>
        
        <h2 className="text-3xl font-black text-white mb-4">{t('poor_video_quality', t('poor_video_quality'))}</h2>
        
        <p className="text-slate-400 font-medium text-lg mb-8 max-w-sm">
          {t('capture_failed_reason_intro', t('capture_failed_reason_intro'))}
        </p>

        <div className="bg-rose-950/40 border border-rose-900/50 p-6 rounded-2xl w-full max-w-sm mb-10">
          <p className="text-rose-400 font-bold text-lg">{reason}</p>
        </div>

        <button
          onClick={handleRetake}
          className="flex w-full max-w-sm items-center justify-center rounded-2xl bg-teal-600 py-5 px-4 text-base font-bold text-white shadow-[0_0_20px_rgba(13,148,136,0.3)] hover:bg-teal-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] focus:outline-none transition-all duration-300"
        >
          <RefreshCw className="h-5 w-5 mr-3" />
          {t('retake_video', t('retake_video'))}
        </button>

      </main>
    </div>
  );
}

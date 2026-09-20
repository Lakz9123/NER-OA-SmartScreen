import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Camera, Smartphone, Move, ArrowRight, ScanLine } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

export default function CaptureSetup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId, answers } = location.state || { patientId: 'demo', answers: {} };

  const [hasPermissions, setHasPermissions] = useState(false);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately, we just needed to trigger the permission prompt
      stream.getTracks().forEach(track => track.stop());
      setHasPermissions(true);
    } catch {
      alert(t('camera_permission_required', 'Camera permission is required for the screening.'));
    }
  };

  const handleStart = () => {
    if (hasPermissions) {
      navigate('/capture/tracking', { state: { patientId, answers } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-300">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">{t('ai_camera_setup', 'AI Camera Setup')}</h1>
          </div>
          <div className="flex items-center space-x-2 bg-teal-900/30 px-3 py-1.5 rounded-full border border-teal-500/20">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
            <span className="text-xs font-bold tracking-widest text-teal-400 uppercase">{t('system_ready', 'System Ready')}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 flex flex-col">
        
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-teal-500 blur-2xl opacity-20 rounded-full"></div>
            <div className="relative bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-2xl">
              <ScanLine className="h-12 w-12 text-teal-400 animate-pulse-glow" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-3">{t('prepare_for_capture', 'Prepare for Capture')}</h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">
            {t('prepare_for_capture_desc', "Our edge AI will analyze the patient's gait in real-time. Ensure optimal conditions for accuracy.")}
          </p>
        </div>

        <div className="space-y-4 mb-10 animate-fade-in-up-delay-1">
          
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-start space-x-4 hover:border-slate-700 transition-colors">
            <div className="bg-slate-800 p-3 rounded-xl text-teal-400 mt-1 shadow-inner">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{t('setup_step1_title', '1. Set Up Phone')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                <Trans i18nKey="setup_step1_desc">
                  Put the phone on a stand at <strong>hip height</strong>. Point the camera at the side of the walking path.
                </Trans>
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-start space-x-4 hover:border-slate-700 transition-colors">
            <div className="bg-slate-800 p-3 rounded-xl text-emerald-400 mt-1 shadow-inner">
              <Move className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{t('setup_step2_title', '2. Keep Distance')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                <Trans i18nKey="setup_step2_desc">
                  The phone must be <strong>2.5 to 3 meters</strong> away from the patient.
                </Trans>
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-start space-x-4 hover:border-slate-700 transition-colors">
            <div className="bg-slate-800 p-3 rounded-xl text-amber-400 mt-1 shadow-inner">
              <ArrowRight className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{t('setup_step3_title', '3. Walk Left to Right')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                <Trans i18nKey="setup_step3_desc">
                  The patient must walk <strong>across the screen</strong> (left to right), not towards the camera. Recording takes 10 seconds.
                </Trans>
              </p>
            </div>
          </div>

        </div>

        <div className="mt-auto space-y-4 animate-fade-in-up-delay-2">
          {!hasPermissions ? (
            <button
              onClick={requestPermissions}
              className="flex w-full items-center justify-center rounded-2xl bg-slate-800 py-4 px-4 text-base font-bold text-white border border-slate-700 hover:bg-slate-700 focus:outline-none transition-all duration-300"
            >
              <Camera className="h-5 w-5 mr-3 text-slate-400" />
              {t('grant_camera_permission', 'Grant Camera Permission')}
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex w-full items-center justify-center rounded-2xl bg-teal-600 py-5 px-4 text-base font-bold text-white shadow-[0_0_20px_rgba(13,148,136,0.4)] hover:bg-teal-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] focus:outline-none transition-all duration-300 group overflow-hidden relative"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[laser-scan_1.5s_ease-in-out_infinite]"></div>
              <span className="relative z-10 flex items-center">
                {t('init_edge_engine', 'Initialize Edge Engine')}
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

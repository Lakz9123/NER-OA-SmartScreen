import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Activity, Cpu, UploadCloud, RefreshCw, Check } from 'lucide-react';
import { analyzeRisk } from '../risk/riskModel';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

export default function CaptureReview() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { patientId, answers, telemetryData } = location.state || { 
    patientId: 'demo', 
    answers: {},
    telemetryData: { gait_speed: 1.2, step_length: 0.65, knee_flexion_angle: 45 } 
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRetake = () => {
    navigate('/capture/tracking', { state: { patientId, answers } });
  };

  const handleProcess = async () => {
    setIsSubmitting(true);
    setError('');
    const pain_score = answers.painLevel || 0;
    const stiffness_score = answers.stiffnessDuration === '>30' ? 2 : 1;
    const function_score = Object.values(answers.mobility || {}).reduce((a: any, b: any) => a + b, 0) as number;

    const payload = {
      patient_id: patientId,
      pain_score,
      stiffness_score,
      function_score,
      knee_angle_left: telemetryData.knee_angle_left, 
      knee_angle_right: telemetryData.knee_angle_right,
      knee_rom_left: telemetryData.knee_rom_left,
      knee_rom_right: telemetryData.knee_rom_right,
      symmetry_index: telemetryData.symmetry_index,
      cadence: telemetryData.cadence,
      step_time: telemetryData.step_time,
    };

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const owner_id = user?.id;

      const localRisk = await analyzeRisk(payload);
      
      const screeningId = uuidv4();
      const now = new Date().toISOString();

      const localResult = {
        ...payload,
        id: screeningId,
        risk_level: localRisk.risk_level,
        risk_score: localRisk.risk_score,
        model_version: localRisk.model_version,
        explainability_data: localRisk.explainability_data,
        sync_status: 'pending' as const,
        created_at: now,
        owner_id
      };

      await db.screenings.add(localResult);

      await db.outbox.add({
        id: uuidv4(),
        type: 'ScreeningSync',
        payload: localResult,
        status: 'pending',
        created_at: now,
        owner_id
      });

      navigate('/analysis', { state: { result: localResult } });
    } catch (err: any) {
      setError(t('risk_compute_error', t('risk_compute_error')) + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-300">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <button onClick={handleRetake} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <X className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">{t('telemetry_review', t('telemetry_review'))}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-teal-500" />
            <span className="text-xs font-bold tracking-widest text-teal-400 uppercase">{t('edge_computed', t('edge_computed'))}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 flex flex-col">
        
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-5 bg-teal-900/40 border border-teal-500/30 text-teal-400 rounded-full mb-4 shadow-[0_0_30px_rgba(20,184,166,0.15)]">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{t('capture_successful', t('capture_successful'))}</h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">
            {t('capture_successful_desc', t('capture_successful_desc'))}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-950/50 border border-rose-900 p-4 rounded-2xl flex items-start animate-fade-in">
            <div className="h-2 w-2 rounded-full bg-rose-500 mt-2 mr-3 animate-pulse"></div>
            <p className="text-sm font-medium text-rose-300">
              {error} <br/> <span className="text-rose-400/70 text-xs">{t('simulating_local_risk', t('simulating_local_risk'))}</span>
            </p>
          </div>
        )}

        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 mb-auto animate-fade-in-up-delay-1 shadow-xl">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-teal-500" /> {t('indicative_measurements', t('indicative_measurements'))}
          </h3>
          
          <div className="space-y-4 font-mono">
            
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-sm">{t('gait_speed', t('gait_speed'))}</span>
              <div className="flex items-center">
                <span className="text-white text-xl font-bold">{telemetryData.gait_speed}</span>
                <span className="text-slate-500 text-xs ml-2">m/s</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-sm">{t('step_length', t('step_length'))}</span>
              <div className="flex items-center">
                <span className="text-white text-xl font-bold">{telemetryData.step_length}</span>
                <span className="text-slate-500 text-xs ml-2">m</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-sm">{t('knee_flexion_angle', t('knee_flexion_angle'))}</span>
              <div className="flex items-center">
                <span className="text-white text-xl font-bold">{telemetryData.knee_flexion_angle}°</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-sm">{t('capture_quality', t('capture_quality'))}</span>
              <div className="flex items-center">
                <span className={`text-xl font-bold ${telemetryData.quality_score >= 80 ? 'text-teal-400' : telemetryData.quality_score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {telemetryData.quality_score || 100}
                </span>
                <span className="text-slate-500 text-xs ml-2">/ 100</span>
              </div>
            </div>

          </div>

          <div className="mt-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              <span className="text-amber-500 font-bold">{t('note_label', t('note_label'))} </span>{t('capture_review_note', t('capture_review_note'))}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4 animate-fade-in-up-delay-2">
          <button
            onClick={handleProcess}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-teal-600 py-5 px-4 text-base font-bold text-white shadow-[0_0_20px_rgba(13,148,136,0.3)] hover:bg-teal-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] focus:outline-none transition-all duration-300 disabled:opacity-70 group"
          >
            {isSubmitting ? (
              <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <UploadCloud className="h-5 w-5 mr-3 group-hover:animate-bounce" />
                {t('analyze_risk_profile', t('analyze_risk_profile'))}
              </>
            )}
          </button>
          
          <button
            onClick={handleRetake}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-slate-900 py-4 px-4 text-sm font-bold text-slate-300 border border-slate-800 hover:bg-slate-800 focus:outline-none transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 opacity-70" />
            {t('discard_retake', t('discard_retake'))}
          </button>
        </div>

      </main>
    </div>
  );
}

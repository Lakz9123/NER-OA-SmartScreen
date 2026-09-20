import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ShieldAlert, CheckCircle, Volume2, Fingerprint } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Consent() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { patientId } = location.state || { patientId: 'demo-patient' };

  const [hasAgreed, setHasAgreed] = useState(false);
  const [signature, setSignature] = useState('');

  const handleProceed = () => {
    if (hasAgreed && signature.trim()) {
      navigate('/questionnaire/part1', { state: { patientId } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{t('consent_privacy', 'Consent & Privacy')}</h1>
          </div>
          <button className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-bold text-sm bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
            <Volume2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('audio_guide', 'Audio Guide')}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in-up">
          
          <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center space-x-5 bg-gradient-to-r from-teal-50 to-white">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-teal-600">
              <ShieldAlert className="h-8 w-8" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('informed_consent', 'Informed Consent')}</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">{t('consent_read_aloud', 'Please read this section aloud to the patient.')}</p>
            </div>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-sm font-medium leading-relaxed">
                <p className="mb-4">
                  <strong className="text-slate-900 font-bold block mb-1">{t('consent_purpose_title', '1. Purpose')}</strong>
                  {t('consent_purpose_body', 'This tool uses a questionnaire and smartphone camera to assess preliminary risk for osteoarthritis (OA).')}
                </p>
                <p className="mb-4">
                  <strong className="text-slate-900 font-bold block mb-1">{t('consent_not_diag_title', '2. Not a Diagnosis')}</strong>
                  {t('consent_not_diag_body1', 'This is a ')} <em className="text-teal-700 bg-teal-50 px-1 rounded">{t('screening_aid_only', 'screening aid only')}</em>{t('consent_not_diag_body2', '. A high risk result indicates clinical evaluation is recommended, not that you definitely have OA.')}
                </p>
                <p className="mb-4">
                  <strong className="text-slate-900 font-bold block mb-1">{t('consent_privacy_title', '3. Data Privacy (HIPAA Ready)')}</strong>
                  {t('consent_privacy_body1', 'Video captured during the movement analysis is processed entirely on this device and is ')} <strong className="text-rose-500">{t('never_word', 'never')}</strong>{t('consent_privacy_body2', ' saved or uploaded. Only numerical movement features are transmitted.')}
                </p>
                <p>
                  <strong className="text-slate-900 font-bold block mb-1">{t('consent_voluntary_title', '4. Voluntary')}</strong>
                  {t('consent_voluntary_body', 'You may stop the screening at any time without penalty.')}
                </p>
              </div>
            </div>

            <div className="space-y-6 animate-fade-in-up-delay-1">
              <label className="group flex items-start space-x-4 p-5 rounded-2xl transition-all cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50/50 has-[:checked]:shadow-md">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-600 transition-colors"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                />
                <span className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {t('consent_checkbox_label', 'The patient has verbally agreed to these terms, understands the privacy policy, and wishes to proceed with the screening.')}
                </span>
              </label>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  {t('digital_signature', 'Digital Signature Confirmation')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors group-focus-within:text-teal-600 text-slate-400">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    placeholder={t('signature_placeholder', "Type patient's full name to sign")}
                    className="block w-full rounded-2xl border-0 bg-slate-50 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all font-medium sm:text-sm"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 mt-8 border-t border-slate-100 animate-fade-in-up-delay-2">
              <button
                onClick={handleProceed}
                disabled={!hasAgreed || !signature.trim()}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-900 py-4 px-4 text-base font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-teal-700 hover:shadow-teal-700/30 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                <CheckCircle className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                {t('agree_start_screening', 'Agree & Start Screening')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

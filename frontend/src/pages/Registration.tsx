import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, User, MapPin, Briefcase } from 'lucide-react';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

export default function Registration() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age_band: '50-59',
    sex: 'female',
    village_code: '',
    occupation_type: 'agriculture',
    consent_flag: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const owner_id = user?.id;

      const patientId = uuidv4();
      const now = new Date().toISOString();
      const patientData = {
        id: patientId,
        age_band: formData.age_band,
        sex: formData.sex,
        village_code: formData.village_code,
        occupation_type: formData.occupation_type,
        consent_flag: true,
        sync_status: 'pending' as const,
        created_at: now,
        owner_id
      };

      await db.patients.add(patientData);
      
      await db.outbox.add({
        id: uuidv4(),
        type: 'PatientSync',
        payload: patientData,
        status: 'pending',
        created_at: now,
        owner_id
      });
      
      navigate('/consent', { state: { patientId } });
    } catch (err: any) {
      setError("Failed to save patient locally: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <button onClick={() => navigate('/dashboard')} className="mr-4 p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{t('register_patient', 'Register Patient')}</h1>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in-up">
          
          <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <h2 className="text-2xl font-black mb-2 relative z-10">{t('patient_enrollment', 'Patient Enrollment')}</h2>
            <p className="text-teal-50 font-medium relative z-10">{t('patient_enrollment_desc', 'Enter anonymous demographic details to start a new screening session.')}</p>
          </div>

          {error && (
            <div className="mx-8 mt-8 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl">
              <p className="text-sm font-semibold text-rose-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            
            <div className="animate-fade-in-up-delay-1">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                <User className="h-4 w-4 mr-2" /> {t('demographics', 'Demographics')}
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 ml-1">{t('age_band', 'Age Band')}</label>
                  <select
                    name="age_band" required
                    className="block w-full rounded-2xl border-0 bg-slate-50 py-4 px-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all font-medium appearance-none"
                    value={formData.age_band} onChange={handleChange}
                  >
                    <option value="30-39">30 - 39 {t('years', 'years')}</option>
                    <option value="40-49">40 - 49 {t('years', 'years')}</option>
                    <option value="50-59">50 - 59 {t('years', 'years')}</option>
                    <option value="60-69">60 - 69 {t('years', 'years')}</option>
                    <option value="70+">70+ {t('years', 'years')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 ml-1">{t('sex', 'Sex')}</label>
                  <select
                    name="sex" required
                    className="block w-full rounded-2xl border-0 bg-slate-50 py-4 px-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all font-medium appearance-none"
                    value={formData.sex} onChange={handleChange}
                  >
                    <option value="female">{t('female', 'Female')}</option>
                    <option value="male">{t('male', 'Male')}</option>
                    <option value="other">{t('other', 'Other')}</option>
                  </select>
                </div>

              </div>
            </div>

            <div className="animate-fade-in-up-delay-2">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                <MapPin className="h-4 w-4 mr-2" /> {t('location_occupation', 'Location & Occupation')}
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 ml-1">{t('village_code', 'Village/Location Code')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <input
                      type="text" name="village_code" required
                      className="block w-full rounded-2xl border-0 bg-slate-50 py-4 pl-11 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all font-medium"
                      placeholder={t('village_code_placeholder', 'e.g. VIL-001')}
                      value={formData.village_code} onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 ml-1">{t('primary_occupation', 'Primary Occupation')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <select
                      name="occupation_type" required
                      className="block w-full rounded-2xl border-0 bg-slate-50 py-4 pl-11 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all font-medium appearance-none"
                      value={formData.occupation_type} onChange={handleChange}
                    >
                      <option value="agriculture">{t('occ_agriculture', 'Agriculture / Farming')}</option>
                      <option value="manual_labor">{t('occ_manual_labor', 'Manual Labor')}</option>
                      <option value="sedentary">{t('occ_sedentary', 'Sedentary / Office')}</option>
                      <option value="household">{t('occ_household', 'Household Work')}</option>
                      <option value="other">{t('other', 'Other')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Action Bar */}
            <div className="pt-6 mt-8 border-t border-slate-100 animate-fade-in-up-delay-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-900 py-4 px-4 text-base font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-teal-700 hover:shadow-teal-700/30 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                <Save className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                {isLoading ? t('processing', 'Processing...') : t('save_proceed_consent', 'Save & Proceed to Consent')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

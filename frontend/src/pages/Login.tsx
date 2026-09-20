import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, User, Lock, AlertCircle, Fingerprint, ShieldCheck } from 'lucide-react';
import { login } from '../api/client';
import { getRole, homePathFor } from '../utils/roles';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { access_token } = await login(username, password);
      localStorage.setItem('token', access_token);
      // We can fetch /users/me
      const { getMe } = await import('../api/client');
      const user = await getMe();
      const role = getRole(user);
      
      if (!role) {
        throw new Error(t('error_missing_role', 'Unknown or missing role. Please contact administrator.'));
      }
      
      navigate(homePathFor(role));
    } catch (err: any) {
      setError(err.message || t('error_incorrect_credentials', 'Incorrect username or password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Column - Graphic/Abstract */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-teal-900 via-slate-900 to-black items-center justify-center">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-teal-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-emerald-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        </div>
        
        {/* Value Proposition overlay */}
        <div className="relative z-10 max-w-lg px-12 text-white opacity-0 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
            <Activity className="h-12 w-12 text-teal-400" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            {t('ai_powered', 'AI-Powered')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
              {t('early_screening', 'Early Screening')}
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed font-medium">
            {t('login_description', 'Empowering community health workers in North Eastern India with computer vision and clinical gait analysis to detect Osteoarthritis risks early.')}
          </p>
          <div className="mt-12 flex space-x-6">
            <div className="flex items-center text-teal-300 text-sm font-semibold tracking-wide uppercase">
              <ShieldCheck className="h-5 w-5 mr-2" /> {t('hipaa_ready', 'HIPAA Ready')}
            </div>
            <div className="flex items-center text-teal-300 text-sm font-semibold tracking-wide uppercase">
              <Fingerprint className="h-5 w-5 mr-2" /> {t('edge_processing', 'Edge Processing')}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 bg-slate-50 relative">
        <div className="absolute top-6 right-8 z-10">
          <LanguageSwitcher />
        </div>
        
        <div className="w-full max-w-md m-auto opacity-0 animate-fade-in-up-delay-1">
          
          <div className="lg:hidden flex items-center space-x-3 mb-10">
            <div className="bg-gradient-to-tr from-teal-600 to-emerald-400 p-3 rounded-2xl shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('ner_oa', 'NER-OA')}</h2>
              <p className="text-xs font-bold tracking-widest text-teal-600 uppercase">{t('smartscreen', 'SmartScreen')}</p>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('welcome_back', 'Welcome Back')}</h2>
            <p className="text-slate-500 font-medium">{t('sign_in_prompt', 'Sign in to your health worker dashboard.')}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start animate-fade-in">
                <AlertCircle className="h-5 w-5 text-rose-500 mr-3 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 ml-1">
                  {t('username', 'Username')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors group-focus-within:text-teal-600 text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full rounded-2xl border-0 bg-slate-50 py-4 pl-11 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all font-medium sm:text-sm"
                    placeholder={t('enter_username', 'Enter your username')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-sm font-semibold text-slate-700">
                    {t('password', 'Password')}
                  </label>
                  <a href="#" className="text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors">
                    {t('forgot_password', 'Forgot password?')}
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors group-focus-within:text-teal-600 text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full rounded-2xl border-0 bg-slate-50 py-4 pl-11 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all font-medium sm:text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center rounded-2xl bg-slate-900 py-4 px-4 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-teal-700 hover:shadow-teal-700/30 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  t('sign_in', 'Sign In')
                )}
              </button>
            </form>
          </div>
          
          <p className="mt-8 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
            {t('copyright', 'NER-OA SmartScreen © 2024')}
          </p>
        </div>
      </div>
    </div>
  );
}

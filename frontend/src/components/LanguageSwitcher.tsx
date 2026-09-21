import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', isDraft: false },
  { code: 'hi', label: 'हिन्दी', isDraft: true },
  { code: 'as', label: 'অসমীয়া', isDraft: true },
  { code: 'mni', label: 'ꯃꯤꯇꯩ ꯃꯌꯦꯛ', isDraft: true }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const currentLangObj = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="flex flex-col items-end">
      <div className="relative flex items-center space-x-2 z-50 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-slate-200">
        <Globe className="h-4 w-4 text-slate-500" />
        <select
          value={i18n.language}
          onChange={handleLanguageChange}
          className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer focus:ring-0 appearance-none pr-6 py-1"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 flex items-center text-slate-500">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {currentLangObj.isDraft && (
        <span className="text-[10px] text-amber-600 mt-1 mr-1 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          Draft translation
        </span>
      )}
    </div>
  );
}

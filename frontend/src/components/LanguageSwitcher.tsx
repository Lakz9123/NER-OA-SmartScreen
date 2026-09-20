import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

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

  const currentLang = LANGUAGES.find(l => l.code === i18n.language);

  return (
    <div className="relative flex items-center space-x-2">
      <Globe className="h-4 w-4 text-slate-500" />
      <select
        value={i18n.language}
        onChange={handleLanguageChange}
        className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-0 appearance-none pr-4"
        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
      {/* Down arrow icon */}
      <div className="pointer-events-none absolute right-0 flex items-center text-slate-500">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {currentLang?.isDraft && (
        <span className="absolute -top-3 -right-2 text-[8px] font-bold bg-amber-100 text-amber-700 px-1 py-0.5 rounded shadow-sm whitespace-nowrap">
          Draft
        </span>
      )}
    </div>
  );
}

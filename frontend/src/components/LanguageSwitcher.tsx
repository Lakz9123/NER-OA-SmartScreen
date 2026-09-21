import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', isDraft: false },
  { code: 'hi', label: 'हिन्दी', isDraft: false },
  { code: 'as', label: 'অসমীয়া', isDraft: false },
  { code: 'mni-Mtei', label: 'ꯃꯤꯇꯩ ꯃꯌꯦꯛ', isDraft: false }
];

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Read the googtrans cookie to find the current language
    const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
    if (match) {
      const parts = match[2].split('/');
      if (parts.length === 3) {
        setCurrentLang(parts[2]);
        return;
      }
    }
    setCurrentLang('en');
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    
    if (lang === 'en') {
      // Clear the cookie to revert to English
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    } else {
      // Set the translation cookie
      document.cookie = `googtrans=/en/${lang}; path=/;`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname};`;
    }
    
    // Reload to apply the Google Translate script
    window.location.reload();
  };

  return (
    <div className="relative flex items-center space-x-2 z-50 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-slate-200">
      <Globe className="h-4 w-4 text-slate-500" />
      <select
        value={currentLang}
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
  );
}

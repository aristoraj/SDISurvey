import { useState } from 'react';
import { languages, t } from './translations';
import LanguageSelect from './components/LanguageSelect';
import Introduction from './components/Introduction';
import SurveyLayout from './components/SurveyLayout';
import ThankYou from './components/ThankYou';
import './App.css';

export default function App() {
  const [lang, setLang] = useState(null);
  const [step, setStep] = useState('language'); // 'language' | 'intro' | 'survey' | 'done'
  const [formData, setFormData] = useState({});

  const langConfig = languages.find(l => l.code === lang) || {};
  const tr = lang ? t[lang] : t['en'];

  function handleLanguageSelect(code) {
    setLang(code);
    setStep('intro');
  }

  function handleStartSurvey() {
    setStep('survey');
  }

  function handleSubmit(data) {
    setFormData(data);
    setStep('done');
  }

  const dir = langConfig.dir || 'ltr';

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {step === 'language' && (
        <LanguageSelect onSelect={handleLanguageSelect} />
      )}
      {step === 'intro' && (
        <Introduction tr={tr} lang={lang} onStart={handleStartSurvey} />
      )}
      {step === 'survey' && (
        <SurveyLayout tr={tr} lang={lang} dir={dir} onSubmit={handleSubmit} />
      )}
      {step === 'done' && (
        <ThankYou tr={tr} lang={lang} />
      )}
    </div>
  );
}

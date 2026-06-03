import { useState, useEffect } from 'react';
import { languages, t } from './translations';
import LanguageSelect from './components/LanguageSelect';
import Introduction from './components/Introduction';
import SurveyLayout from './components/SurveyLayout';
import ThankYou from './components/ThankYou';
import { useZohoUser } from './hooks/useZohoUser';
import './App.css';

export default function App() {
  const [lang, setLang]       = useState(null);
  const [step, setStep]       = useState('language');
  const [formData, setFormData] = useState({});

  // useZohoUser polls up to 10s for the SDK then gets loginUser from getInitParams()
  const { email: zohoEmail, loading: zohoLoading, error: zohoError } = useZohoUser();

  // Detect widget mode: ZOHO object exists on window (set by widgetsdk-min.js)
  const isWidget = typeof window.ZOHO !== 'undefined' && !!window.ZOHO?.CREATOR;

  const langConfig = languages.find(l => l.code === lang) || {};
  const tr  = lang ? t[lang] : t['en'];
  const dir = langConfig.dir || 'ltr';

  // Once Zoho SDK resolves, auto-enter survey if inside widget with a valid user
  useEffect(() => {
    if (zohoLoading) return;
    if (isWidget && zohoEmail) {
      console.log('[App] Widget mode — auto-entering survey for', zohoEmail);
      setLang('en');
      setFormData({ email: zohoEmail });
      setStep('survey');
    } else if (isWidget && !zohoEmail) {
      console.warn('[App] Widget mode but no user email found. zohoError:', zohoError);
    }
    // Non-widget: do nothing, proceed through normal language → intro → survey flow
  }, [zohoLoading, isWidget, zohoEmail]);

  // While SDK is polling (widget mode only), show a brief loader
  if (isWidget && zohoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading survey…</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {step === 'language' && (
        <LanguageSelect onSelect={code => { setLang(code); setStep('intro'); }} />
      )}
      {step === 'intro' && (
        <Introduction tr={tr} lang={lang} onStart={() => setStep('survey')} />
      )}
      {step === 'survey' && (
        <SurveyLayout
          tr={tr}
          lang={lang}
          dir={dir}
          isWidget={isWidget}
          initialFormData={formData}
          onSubmit={data => { setFormData(data); setStep('done'); }}
        />
      )}
      {step === 'done' && (
        <ThankYou tr={tr} lang={lang} />
      )}
    </div>
  );
}

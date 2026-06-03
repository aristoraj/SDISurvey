import { useState, useEffect } from 'react';
import { languages, t } from './translations';
import LanguageSelect from './components/LanguageSelect';
import Introduction from './components/Introduction';
import SurveyLayout from './components/SurveyLayout';
import ThankYou from './components/ThankYou';
import './App.css';

// ── Phase 2: Zoho Widget detection ──────────────────────────────────────────
// When running inside Zoho Creator as a widget, ZOHO.CREATOR is available.
// The logged-in user's email is used directly — no OTP needed.
function useZohoWidget() {
  const [widgetUser, setWidgetUser] = useState(null); // { email, name } or null
  const [widgetReady, setWidgetReady] = useState(false);

  useEffect(() => {
    // Not inside a Zoho Widget — proceed as public URL
    if (typeof window.ZOHO === 'undefined' || !window.ZOHO?.CREATOR) {
      setWidgetReady(true);
      return;
    }

    // Use ZOHO.CREATOR.UTIL.getInitParams() — official way to get logged-in user
    window.ZOHO.CREATOR.init()
      .then(() => window.ZOHO.CREATOR.UTIL.getInitParams())
      .then(params => {
        const email = params?.loginUser || params?.loginName || params?.email || null;
        if (email) {
          setWidgetUser({
            email,
            name: params?.displayName || params?.loginName || email,
          });
          console.log('[widget] Zoho Creator user:', email);
        } else {
          console.warn('[widget] getInitParams returned no user email:', params);
        }
        setWidgetReady(true);
      })
      .catch(err => {
        console.warn('[widget] SDK init failed, falling back to public mode:', err?.message || err);
        setWidgetReady(true);
      });
  }, []);

  return { widgetUser, widgetReady, isWidget: typeof window.ZOHO?.CREATOR !== 'undefined' };
}

export default function App() {
  const [lang, setLang]       = useState(null);
  const [step, setStep]       = useState('language');
  const [formData, setFormData] = useState({});

  const { widgetUser, widgetReady, isWidget } = useZohoWidget();

  const langConfig = languages.find(l => l.code === lang) || {};
  const tr  = lang ? t[lang] : t['en'];
  const dir = langConfig.dir || 'ltr';

  // Widget mode: skip language + intro, pre-fill email, go straight to survey
  useEffect(() => {
    if (!widgetReady) return;
    if (isWidget && widgetUser?.email) {
      setLang('en');
      setFormData({ email: widgetUser.email, firstName: widgetUser.name });
      setStep('survey');
    }
  }, [widgetReady, isWidget, widgetUser]);

  // Show loading state while widget SDK initializes
  if (!widgetReady) {
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
          widgetUser={widgetUser}
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

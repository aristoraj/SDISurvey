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
    // Check if Zoho Widget SDK is present
    if (typeof window.ZOHO === 'undefined' || !window.ZOHO?.CREATOR) {
      setWidgetReady(true); // not in widget, proceed as public
      return;
    }

    window.ZOHO.CREATOR.init().then(() => {
      try {
        const user = window.ZOHO.CREATOR.USER?.getAll?.();
        if (user?.Email || user?.email) {
          setWidgetUser({
            email: user.Email || user.email,
            name:  user.Display_Name || user.display_name || '',
          });
          console.log('[widget] Zoho Creator user detected:', user.Email || user.email);
        }
      } catch (e) {
        console.warn('[widget] Could not get Zoho user:', e);
      }
      setWidgetReady(true);
    }).catch(() => setWidgetReady(true));
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

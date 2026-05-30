import { useState } from 'react';
import { validatePage } from '../validation';
import Page1Profile from './pages/Page1Profile';
import Page2Classification from './pages/Page2Classification';
import Page3Revenue from './pages/Page3Revenue';
import Page4Expenses from './pages/Page4Expenses';
import Page5Countries from './pages/Page5Countries';
import Page6Animals from './pages/Page6Animals';
import Page7Interventions from './pages/Page7Interventions';
import Page8Outcomes from './pages/Page8Outcomes';
import Page9Final from './pages/Page9Final';

const TOTAL_PAGES = 9;

export default function SurveyLayout({ tr, lang, dir, onSubmit }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  function updateData(updates) {
    setFormData(prev => ({ ...prev, ...updates }));
  }

  function goNext() {
    const pageErrors = validatePage(currentPage, formData);
    if (Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setCurrentPage(p => Math.min(p + 1, TOTAL_PAGES));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goPrev() {
    setErrors({});
    setCurrentPage(p => Math.max(p - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit() {
    const pageErrors = validatePage(currentPage, formData);
    if (Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSubmit(formData);
  }

  const progress = (currentPage / TOTAL_PAGES) * 100;

  const pageProps = { tr, formData, updateData, errors };

  const pages = [
    <Page1Profile {...pageProps} />,
    <Page2Classification {...pageProps} />,
    <Page3Revenue {...pageProps} />,
    <Page4Expenses {...pageProps} />,
    <Page5Countries {...pageProps} />,
    <Page6Animals {...pageProps} />,
    <Page7Interventions {...pageProps} />,
    <Page8Outcomes {...pageProps} />,
    <Page9Final {...pageProps} onSubmit={handleSubmit} />,
  ];

  const pageTitles = [
    tr.page1Title,
    tr.page2Title,
    tr.page3Title,
    tr.page4Title,
    tr.page5Title,
    tr.page6Title,
    tr.page7Title,
    tr.page8Title,
    tr.page9Title,
  ];

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 leading-none">{tr.appSubtitle}</p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{pageTitles[currentPage - 1]}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              {tr.pageOf(currentPage, TOTAL_PAGES)}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-1.5">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i + 1 < currentPage ? 'bg-green-500' :
                  i + 1 === currentPage ? 'bg-green-600 scale-125' :
                  'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div key={currentPage} className="page-transition">
          {pages[currentPage - 1]}
        </div>
      </main>

      {/* Navigation footer */}
      <footer className="sticky bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 pt-2 pb-3 flex flex-col gap-2">

          {/* Validation error banner */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-300 rounded-xl animate-pulse-once">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-red-700 text-xs font-semibold">Please complete all required fields before continuing.</p>
                <ul className="mt-0.5 space-y-0.5">
                  {Object.values(errors).map((msg, i) => (
                    <li key={i} className="text-red-600 text-xs">• {msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Dots row — centered, always visible, scales to any screen */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i + 1 === currentPage
                    ? 'w-5 h-2 bg-green-600'
                    : i + 1 < currentPage
                    ? 'w-2 h-2 bg-green-400'
                    : 'w-2 h-2 bg-gray-300'
                }`}
              />
            ))}
            {/* Page counter label */}
            <span className="ml-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap">
              {currentPage} / {TOTAL_PAGES}
            </span>
          </div>

          {/* Buttons row — always full-width side by side */}
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="truncate">{tr.previous}</span>
            </button>

            {currentPage < TOTAL_PAGES ? (
              <button
                onClick={goNext}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold text-sm shadow hover:shadow-md transition-all"
              >
                <span className="truncate">{tr.next}</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold text-sm shadow hover:shadow-md transition-all"
              >
                <span className="truncate">{tr.submit}</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>

        </div>
      </footer>
    </div>
  );
}

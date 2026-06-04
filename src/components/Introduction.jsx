const A = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="text-green-700 underline hover:text-green-900 transition-colors">
    {children}
  </a>
);

export default function Introduction({ tr, onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 page-transition">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-5 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tr.introTitle}</h1>
          <p className="text-green-600 font-medium">{tr.appSubtitle}</p>
        </div>

        {/* Main content card — with hyperlinks */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            <A href="https://straydoginstitute.org/">Stray Dog Institute</A>{' '}
            as part of our{' '}
            <A href="https://straydoginstitute.org/state-of-the-movement">State of the Movement</A>{' '}
            initiative, invites you to participate in the 2026 survey of organizations working to benefit
            animals farmed or caught for food. This research builds on the earlier efforts of{' '}
            <A href="https://www.senterrafunders.org/">Senterra Funders</A>{' '}
            (formerly Farmed Animal Funders), whose contributions we gratefully acknowledge.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">{tr.introText2}</p>
          <p className="text-gray-700 leading-relaxed mb-4">{tr.introText3}</p>
          <p className="text-gray-600 italic">{tr.introText4}</p>
        </div>

        {/* Two column info */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Key Details */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {tr.keyDetails}
            </h3>
            <ul className="space-y-2">
              {[tr.detail1, tr.detail2, tr.detail3].map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center text-xs flex-shrink-0">{i+1}</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {tr.instructions}
            </h3>
            <ul className="space-y-2">
              {[tr.instr1, tr.instr2, tr.instr3].map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-900">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {d}
                </li>
              ))}
              {/* Last instruction with email hyperlink */}
              <li className="flex items-start gap-2 text-sm text-blue-900">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  If you need help, please email us at{' '}
                  <a href="mailto:surveys@straydoginstitute.org"
                    className="text-blue-600 underline hover:text-blue-800">
                    surveys@straydoginstitute.org
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            {tr.beginSurvey}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="mt-3 text-sm text-gray-400">{tr.detail1}</p>
        </div>
      </div>
    </div>
  );
}

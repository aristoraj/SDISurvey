export default function ThankYou({ tr }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-transition">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8 shadow-inner">
          <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{tr.thankYou}</h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">{tr.thankYouText}</p>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-left">
          <p className="text-green-800 font-medium text-sm">
            Stray Dog Institute · surveys@straydoginstitute.org
          </p>
          <p className="text-green-700 text-sm mt-1">hub.straydoginstitute.org</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-8 py-3 rounded-xl border-2 border-green-500 text-green-700 font-semibold hover:bg-green-50 transition-all"
        >
          Submit another response
        </button>
      </div>
    </div>
  );
}

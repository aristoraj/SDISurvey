import { languages } from '../translations';

export default function LanguageSelect({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600 mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          2026 State of the Movement Survey
        </h1>
        <p className="text-lg text-gray-500 font-medium">Stray Dog Institute</p>
        <div className="mt-4 w-16 h-1 bg-green-500 rounded mx-auto"></div>
      </div>

      {/* Language grid */}
      <div className="w-full max-w-2xl">
        <p className="text-center text-gray-600 mb-6 text-lg">
          Select your language / Sélectionnez votre langue / Seleccione su idioma
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <span className="text-4xl">{lang.flag}</span>
              <span className="font-semibold text-gray-800 group-hover:text-green-700 text-sm">
                {lang.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-10 text-sm text-gray-400 text-center">
        Stray Dog Institute © 2026 · surveys@straydoginstitute.org
      </p>
    </div>
  );
}

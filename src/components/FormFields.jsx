// Reusable form field components

export function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-2 text-gray-600 leading-relaxed">{subtitle}</p>}
      <div className="mt-3 h-1 w-12 bg-green-500 rounded"></div>
    </div>
  );
}

export function QuestionBlock({ number, label, required, children, error }) {
  return (
    <div className={`bg-white rounded-2xl border-2 p-6 shadow-sm transition-all ${
      error ? 'border-red-400 shadow-red-100' : 'border-gray-200 hover:shadow-md'
    }`}>
      <label className="block mb-3">
        <span className="flex items-start gap-2">
          {number && (
            <span className={`flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${
              error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {number}
            </span>
          )}
          <span className="text-gray-800 font-medium leading-relaxed">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </span>
        </span>
      </label>
      {children}
      {error && (
        <p className="mt-2 flex items-center gap-1 text-red-600 text-xs font-medium">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', error }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-gray-800 placeholder-gray-400 ${
        error
          ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50'
          : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
      }`}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all text-gray-800 placeholder-gray-400 resize-none"
    />
  );
}

export function NumberInput({ value, onChange, placeholder, min = 0 }) {
  return (
    <input
      type="number"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || '0'}
      min={min}
      className="w-full max-w-xs px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all text-gray-800 placeholder-gray-400"
    />
  );
}

export function RadioOption({ name, value, checked, onChange, label, description }) {
  return (
    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
      checked
        ? 'border-green-500 bg-green-50 shadow-sm'
        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
    }`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-0.5 flex-shrink-0"
      />
      <div>
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        {description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{description}</p>}
      </div>
    </label>
  );
}

export function CheckboxOption({ checked, onChange, label }) {
  return (
    <label className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
      checked
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="flex-shrink-0"
      />
      <span className="text-sm text-gray-800 font-medium">{label}</span>
    </label>
  );
}

export function PercentInput({ label, value, onChange, desc, hint, year }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-300 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
        {hint !== undefined && hint !== null && (
          <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
            <span>📅</span>
            <span><strong>{year || 'Last year'}</strong> reported: <strong>{hint}%</strong></span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="number"
          min="0"
          max="100"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          className="w-20 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none text-center text-sm font-medium text-gray-800"
        />
        <span className="text-gray-500 text-sm font-medium">%</span>
      </div>
    </div>
  );
}

// Inline hint shown under any non-% field label
export function FieldHint({ value, year }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
      <span>📅</span>
      <span><strong>{year || 'Last year'}</strong> reported: <strong>{value}</strong></span>
    </p>
  );
}

export function TotalIndicator({ total, tr }) {
  const isValid = Math.abs(total - 100) < 0.01;
  const isEmpty = total === 0;
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 font-semibold ${
      isValid ? 'border-green-500 bg-green-50 text-green-700' :
      isEmpty ? 'border-gray-300 bg-gray-50 text-gray-500' :
      'border-red-400 bg-red-50 text-red-600'
    }`}>
      <span>{tr.currentTotal}: {total.toFixed(0)}%</span>
      {isValid ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span className="text-sm">{tr.totalMustBe100}</span>
      )}
    </div>
  );
}

export function SearchableSelect({ options, value, onChange, placeholder, tr }) {
  const [search, setSearch] = useState('');

  const filtered = options.filter(o =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all text-gray-800 placeholder-gray-400 mb-2"
      />
      {value && (
        <div className="mb-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center justify-between">
          <span>{value}</span>
          <button onClick={() => onChange('')} className="text-green-600 hover:text-green-800">✕</button>
        </div>
      )}
      {search && (
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl shadow-lg bg-white">
          {filtered.slice(0, 50).map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setSearch(''); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0 ${
                value === opt ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-700'
              }`}
            >
              {opt}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-gray-400 text-sm">No results found</p>
          )}
        </div>
      )}
    </div>
  );
}

export function InfoBox({ title, children, variant = 'green' }) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[variant]}`}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// Need to import useState for SearchableSelect
import { useState } from 'react';

import { useState } from 'react';
import { SectionHeader, QuestionBlock, TextInput } from '../FormFields';
import { COUNTRIES, CURRENCIES } from '../../surveyData';

function SearchableList({ options, value, onChange, placeholder, error }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <div
        className={`w-full px-4 py-3 rounded-xl border-2 focus-within:ring-2 flex items-center gap-2 cursor-text bg-white transition-all ${
          error
            ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-100 bg-red-50'
            : 'border-gray-200 focus-within:border-green-500 focus-within:ring-green-100'
        }`}
        onClick={() => setOpen(true)}
      >
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={value || placeholder}
          className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent text-sm"
        />
        {value && (
          <button onClick={e => { e.stopPropagation(); onChange(''); setSearch(''); }} className="text-gray-400 hover:text-gray-600">✕</button>
        )}
      </div>
      {value && !search && (
        <div className="mt-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-800 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {value}
        </div>
      )}
      {open && (search || !value) && (
        <div className="absolute z-20 w-full mt-1 max-h-56 overflow-y-auto border border-gray-200 rounded-xl shadow-xl bg-white">
          {filtered.slice(0, 80).map(opt => (
            <button
              key={opt}
              onMouseDown={() => { onChange(opt); setSearch(''); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0 ${
                value === opt ? 'bg-green-50 text-green-800 font-semibold' : 'text-gray-700'
              }`}
            >
              {opt}
            </button>
          ))}
          {filtered.length === 0 && <p className="px-4 py-3 text-gray-400 text-sm">No results found</p>}
        </div>
      )}
    </div>
  );
}

export default function Page1Profile({ tr, formData, updateData, errors }) {
  const set = key => val => updateData({ [key]: val });
  const e = errors || {};

  return (
    <div>
      <SectionHeader title={tr.page1Title} />
      <div className="space-y-4">

        <div className="grid md:grid-cols-2 gap-4">
          <QuestionBlock number="1a" label={tr.q1a} required error={e.firstName}>
            <TextInput value={formData.firstName} onChange={set('firstName')} placeholder="Jane" error={e.firstName} />
          </QuestionBlock>
          <QuestionBlock number="1b" label={tr.q1b} required error={e.lastName}>
            <TextInput value={formData.lastName} onChange={set('lastName')} placeholder="Doe" error={e.lastName} />
          </QuestionBlock>
        </div>

        <QuestionBlock number="2" label={tr.q2} required error={e.email}>
          <TextInput value={formData.email} onChange={set('email')} type="email" placeholder="jane@organization.org" error={e.email} />
        </QuestionBlock>

        <QuestionBlock number="3" label={tr.q3} required error={e.jobTitle}>
          <TextInput value={formData.jobTitle} onChange={set('jobTitle')} placeholder="Executive Director" error={e.jobTitle} />
        </QuestionBlock>

        <div className="grid md:grid-cols-2 gap-4">
          <QuestionBlock number="4a" label={tr.q4a} required error={e.orgName}>
            <TextInput value={formData.orgName} onChange={set('orgName')} placeholder="Organization Legal Name" error={e.orgName} />
          </QuestionBlock>
          <QuestionBlock number="4b" label={tr.q4b}>
            <TextInput value={formData.orgAliases} onChange={set('orgAliases')} placeholder={tr.leaveBlank} />
          </QuestionBlock>
        </div>

        <QuestionBlock number="5" label={tr.q5}>
          <TextInput value={formData.website} onChange={set('website')} type="url" placeholder="https://example.org" />
        </QuestionBlock>

        <QuestionBlock number="6a" label={tr.q6a} required error={e.country}>
          <SearchableList options={COUNTRIES} value={formData.country} onChange={set('country')} placeholder={tr.searchCountry} error={e.country} />
        </QuestionBlock>

        <QuestionBlock number="6b" label={tr.q6b} required error={e.currency}>
          <SearchableList options={CURRENCIES} value={formData.currency} onChange={set('currency')} placeholder={tr.searchCurrency} error={e.currency} />
        </QuestionBlock>

        <QuestionBlock number="7" label={tr.q7} required error={e.fiscalYearEnd}>
          <div className="flex flex-col gap-1">
            <input
              type="date"
              value={formData.fiscalYearEnd || ''}
              onChange={ev => updateData({ fiscalYearEnd: ev.target.value })}
              className={`w-52 px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-gray-800 ${
                e.fiscalYearEnd ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-500'
              }`}
            />
            <p className="text-xs text-gray-400">Many organizations use December 31</p>
          </div>
        </QuestionBlock>

        <QuestionBlock number="8" label={tr.q8} required error={e.staffCount}>
          <input
            type="number"
            min="0"
            value={formData.staffCount ?? ''}
            onChange={ev => updateData({ staffCount: ev.target.value })}
            placeholder="0"
            className={`w-40 px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-center text-lg font-semibold text-gray-800 ${
              e.staffCount ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-500'
            }`}
          />
        </QuestionBlock>

      </div>
    </div>
  );
}

import { useState } from 'react';
import { SectionHeader, QuestionBlock, InfoBox, PercentInput, TotalIndicator } from '../FormFields';
import { COUNTRY_REGIONS } from '../../surveyData';

export default function Page5Countries({ tr, formData, updateData, errors }) {
  const e = errors || {};
  const [expandedRegions, setExpandedRegions] = useState({});
  const [search, setSearch] = useState('');

  const selected = formData.selectedCountries || [];
  const countryPcts = formData.countryPercentages || {};

  function toggleRegion(region) {
    setExpandedRegions(prev => ({ ...prev, [region]: !prev[region] }));
  }

  function toggleCountry(country) {
    const next = selected.includes(country)
      ? selected.filter(c => c !== country)
      : [...selected, country];
    updateData({ selectedCountries: next });
  }

  function setCountryPct(country, val) {
    updateData({ countryPercentages: { ...countryPcts, [country]: val } });
  }

  const total = selected.reduce((sum, c) => sum + (parseFloat(countryPcts[c]) || 0), 0);

  // Search across all regions
  const searchResults = search.trim()
    ? Object.values(COUNTRY_REGIONS).flat().filter(c => c.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div>
      <SectionHeader title={tr.page5Title} subtitle={tr.page5Intro} />
      <InfoBox variant="blue">{tr.page5Note}</InfoBox>

      <div className="space-y-4 mt-4">
        {/* Q16 */}
        <QuestionBlock number="16" label={tr.q16}>
          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all"
            />
          </div>

          {/* Search results */}
          {search && (
            <div className="mb-4 bg-white rounded-xl border border-gray-200 shadow-sm max-h-48 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="px-4 py-3 text-gray-400 text-sm">No results</p>
              ) : searchResults.map(country => (
                <label key={country} className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0">
                  <input
                    type="checkbox"
                    checked={selected.includes(country)}
                    onChange={() => toggleCountry(country)}
                    className="rounded"
                  />
                  <span className={`text-sm ${selected.includes(country) ? 'text-green-800 font-semibold' : 'text-gray-700'}`}>{country}</span>
                </label>
              ))}
            </div>
          )}

          {/* Regions */}
          {Object.entries(COUNTRY_REGIONS).map(([region, countries]) => (
            <div key={region} className="mb-2 border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleRegion(region)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    countries.some(c => selected.includes(c)) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  <span className="font-semibold text-gray-800">{region}</span>
                  {countries.some(c => selected.includes(c)) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {countries.filter(c => selected.includes(c)).length} selected
                    </span>
                  )}
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedRegions[region] ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedRegions[region] && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {countries.map(country => (
                      <label key={country} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-all text-sm ${
                        selected.includes(country)
                          ? 'border-green-400 bg-green-50 text-green-800 font-medium'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selected.includes(country)}
                          onChange={() => toggleCountry(country)}
                          className="rounded flex-shrink-0"
                        />
                        <span className="truncate">{country}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Selected summary */}
          {selected.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="font-semibold text-green-800 mb-2">{tr.selectedCountries} ({selected.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full">
                    {c}
                    <button onClick={() => toggleCountry(c)} className="hover:text-green-600">✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </QuestionBlock>

        {/* Q17 - Percentages */}
        {selected.length > 0 && (
          <QuestionBlock number="17" label={tr.q17} required error={e.countryPercentages}>
            <div className="space-y-2 mb-3">
              {selected.map(country => (
                <PercentInput
                  key={country}
                  label={country}
                  value={countryPcts[country]}
                  onChange={v => setCountryPct(country, v)}
                />
              ))}
            </div>
            <TotalIndicator total={total} tr={tr} />
          </QuestionBlock>
        )}
      </div>
    </div>
  );
}

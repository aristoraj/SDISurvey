import { SectionHeader, QuestionBlock, PercentInput, TotalIndicator, InfoBox, FieldHint } from '../FormFields';

const REVENUE_SOURCES = ['rev_philanthropy','rev_public','rev_goods','rev_investment','rev_financial','rev_vc'];

export default function Page3Revenue({ tr, formData, updateData, errors, hints, hintYear }) {
  const e = errors || {};
  const h = hints?.revenueSources || {};
  const p = hints?.profile || {};
  const setRev = key => val => updateData({ revenueSources: { ...(formData.revenueSources || {}), [key]: val } });
  const sources = formData.revenueSources || {};
  const total = REVENUE_SOURCES.reduce((sum, k) => sum + (parseFloat(sources[k]) || 0), 0);

  return (
    <div>
      <SectionHeader title={tr.page3Title} subtitle={tr.page3Intro} />
      <InfoBox variant="amber">{tr.page3Note}</InfoBox>
      <div className="space-y-4 mt-4">

        <QuestionBlock number="12" label={tr.q12} required error={e.totalRevenue}>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">{formData.currency ? formData.currency.split(' ')[0] : '$'}</span>
            <input
              type="number" min="0"
              value={formData.totalRevenue || ''}
              onChange={ev => updateData({ totalRevenue: ev.target.value })}
              placeholder="0"
              className={`w-full max-w-xs px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-gray-800 ${
                e.totalRevenue ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-500'
              }`}
            />
          </div>
          <FieldHint value={p.totalRevenue} year={hintYear} />
        </QuestionBlock>

        <QuestionBlock number="13" label={tr.q13} required error={e.revenueSources}>
          <div className="space-y-2 mb-3">
            {REVENUE_SOURCES.map(key => (
              <PercentInput
                key={key}
                label={tr[key]}
                value={sources[key]}
                onChange={setRev(key)}
                hint={h[key] !== undefined ? h[key] : undefined}
                year={hintYear}
              />
            ))}
          </div>
          <TotalIndicator total={total} tr={tr} />
        </QuestionBlock>

      </div>
    </div>
  );
}

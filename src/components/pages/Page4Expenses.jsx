import { SectionHeader, QuestionBlock, PercentInput, TotalIndicator, InfoBox, FieldHint } from '../FormFields';

export default function Page4Expenses({ tr, formData, updateData, errors, hints, hintYear }) {
  const e = errors || {};
  const h = hints?.expenseAllocation || {};
  const p = hints?.profile || {};
  const setAlloc = key => val => updateData({ expenseAllocation: { ...(formData.expenseAllocation || {}), [key]: val } });
  const alloc = formData.expenseAllocation || {};
  const total = ['farmed','other_animals','humans'].reduce((sum, k) => sum + (parseFloat(alloc[k]) || 0), 0);
  const currSymbol = formData.currency ? formData.currency.split(' ')[0] : '$';

  function numInput(field, errKey, hintVal) {
    return (
      <>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 font-medium">{currSymbol}</span>
          <input
            type="number" min="0"
            value={formData[field] ?? ''}
            onChange={ev => updateData({ [field]: ev.target.value })}
            placeholder="0"
            className={`w-full max-w-xs px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-gray-800 ${
              e[errKey] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-500'
            }`}
          />
        </div>
        <FieldHint value={hintVal} year={hintYear} />
      </>
    );
  }

  return (
    <div>
      <SectionHeader title={tr.page4Title} subtitle={tr.page4Intro} />
      <InfoBox variant="amber">{tr.page4Note}</InfoBox>
      <div className="space-y-4 mt-4">

        <QuestionBlock number="14a" label={tr.q14a} required error={e.totalExpenses}>
          {numInput('totalExpenses', 'totalExpenses', p.totalExpenses)}
        </QuestionBlock>

        <QuestionBlock number="14b" label={tr.q14b} required error={e.capitalExpenditure}>
          {numInput('capitalExpenditure', 'capitalExpenditure', null)}
        </QuestionBlock>

        <QuestionBlock number="14c" label={tr.q14c} required error={e.regranted}>
          {numInput('regranted', 'regranted', null)}
        </QuestionBlock>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-bold text-amber-900 mb-2">{tr.inscope_def_title}</p>
          <p className="text-amber-800 text-sm leading-relaxed">{tr.inscope_def}</p>
        </div>

        <QuestionBlock number="15" label={tr.q15} required error={e.expenseAllocation}>
          <div className="space-y-2 mb-3">
            <PercentInput label={tr.exp_farmed}        value={alloc.farmed}        onChange={setAlloc('farmed')}        hint={h.farmed}        year={hintYear} />
            <PercentInput label={tr.exp_other_animals} value={alloc.other_animals} onChange={setAlloc('other_animals')} hint={h.other_animals} year={hintYear} />
            <PercentInput label={tr.exp_humans}        value={alloc.humans}        onChange={setAlloc('humans')}        hint={h.humans}        year={hintYear} />
          </div>
          <TotalIndicator total={total} tr={tr} />
        </QuestionBlock>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <p className="font-bold text-green-900 mb-2">{tr.inscope_title}</p>
          <p className="text-green-800 text-sm leading-relaxed">{tr.inscope_text}</p>
        </div>

      </div>
    </div>
  );
}

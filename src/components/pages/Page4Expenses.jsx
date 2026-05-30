import { SectionHeader, QuestionBlock, NumberInput, PercentInput, TotalIndicator, InfoBox } from '../FormFields';

export default function Page4Expenses({ tr, formData, updateData }) {
  const set = (key) => (val) => updateData({ [key]: val });
  const setAlloc = (key) => (val) => {
    const prev = formData.expenseAllocation || {};
    updateData({ expenseAllocation: { ...prev, [key]: val } });
  };

  const alloc = formData.expenseAllocation || {};
  const total = ['farmed', 'other_animals', 'humans'].reduce(
    (sum, k) => sum + (parseFloat(alloc[k]) || 0), 0
  );

  return (
    <div>
      <SectionHeader title={tr.page4Title} subtitle={tr.page4Intro} />
      <InfoBox variant="amber">{tr.page4Note}</InfoBox>

      <div className="space-y-4 mt-4">
        <QuestionBlock number="14a" label={tr.q14a} required>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">{formData.currency ? formData.currency.split(' ')[0] : '$'}</span>
            <NumberInput value={formData.totalExpenses} onChange={set('totalExpenses')} />
          </div>
        </QuestionBlock>

        <QuestionBlock number="14b" label={tr.q14b} required>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">{formData.currency ? formData.currency.split(' ')[0] : '$'}</span>
            <NumberInput value={formData.capitalExpenditure} onChange={set('capitalExpenditure')} />
          </div>
        </QuestionBlock>

        <QuestionBlock number="14c" label={tr.q14c} required>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">{formData.currency ? formData.currency.split(' ')[0] : '$'}</span>
            <NumberInput value={formData.regranted} onChange={set('regranted')} />
          </div>
        </QuestionBlock>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-bold text-amber-900 mb-2">{tr.inscope_def_title}</p>
          <p className="text-amber-800 text-sm leading-relaxed">{tr.inscope_def}</p>
        </div>

        <QuestionBlock number="15" label={tr.q15} required>
          <div className="space-y-2 mb-3">
            <PercentInput label={tr.exp_farmed} value={alloc.farmed} onChange={setAlloc('farmed')} />
            <PercentInput label={tr.exp_other_animals} value={alloc.other_animals} onChange={setAlloc('other_animals')} />
            <PercentInput label={tr.exp_humans} value={alloc.humans} onChange={setAlloc('humans')} />
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

import { SectionHeader, QuestionBlock, PercentInput, TotalIndicator } from '../FormFields';
import { OUTCOMES } from '../../surveyData';

export default function Page8Outcomes({ tr, formData, updateData, errors, hints, hintYear }) {
  const e = errors || {};
  const h = hints?.outcomePercentages || {};
  const getHint = key => hints ? (h[key] ?? 0) : undefined;
  const pcts = formData.outcomePercentages || {};
  const setPct = key => val => updateData({ outcomePercentages: { ...pcts, [key]: val } });
  const total = OUTCOMES.reduce((sum, o) => sum + (parseFloat(pcts[o.key]) || 0), 0);

  return (
    <div>
      <SectionHeader title={tr.page8Title} subtitle={tr.page8Intro} />
      <div className="space-y-4">
        <QuestionBlock number="20" label={tr.q20} required error={e.outcomePercentages}>
          <div className="space-y-2 mb-4">
            {OUTCOMES.map(outcome => (
              <PercentInput key={outcome.key} label={outcome.label} value={pcts[outcome.key]} onChange={setPct(outcome.key)} hint={getHint(outcome.key)} year={hintYear} />
            ))}
          </div>
          <TotalIndicator total={total} tr={tr} />
        </QuestionBlock>
      </div>
    </div>
  );
}

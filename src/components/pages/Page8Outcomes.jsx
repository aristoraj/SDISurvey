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
        <QuestionBlock
          number="20"
          label={<span>Please estimate the percentage of expenses allocated to each intended outcome. The list is drawn from{' '}
            <a href="https://animalcharityevaluators.org/research/methodology/menu-of-outcomes/"
              target="_blank" rel="noopener noreferrer"
              className="text-green-700 underline hover:text-green-900">
              Animal Charity Evaluators' Menu of Outcomes
            </a>. Your responses should total 100%.</span>}
          required
          error={e.outcomePercentages}
        >
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

import { SectionHeader, QuestionBlock, InfoBox, PercentInput, TotalIndicator, TextInput } from '../FormFields';
import { ANIMALS } from '../../surveyData';

const GROUPS = ['Top-level','Farmed Terrestrial','Wild-caught Terrestrial','Farmed Aquatic','Wild-caught Aquatic','General'];
const GROUP_COLORS = {
  'Top-level': 'bg-purple-50 border-purple-200',
  'Farmed Terrestrial': 'bg-amber-50 border-amber-200',
  'Wild-caught Terrestrial': 'bg-orange-50 border-orange-200',
  'Farmed Aquatic': 'bg-blue-50 border-blue-200',
  'Wild-caught Aquatic': 'bg-cyan-50 border-cyan-200',
  'General': 'bg-gray-50 border-gray-200',
};

export default function Page6Animals({ tr, formData, updateData, errors, hints }) {
  const e = errors || {};
  const h = hints?.animalPercentages || {};
  const pcts = formData.animalPercentages || {};
  const setPct = key => val => updateData({ animalPercentages: { ...pcts, [key]: val } });
  const total = ANIMALS.reduce((sum, a) => sum + (parseFloat(pcts[a.key]) || 0), 0);

  return (
    <div>
      <SectionHeader title={tr.page6Title} subtitle={tr.page6Intro} />
      <div className="space-y-4">
        <QuestionBlock number="18a" label={tr.q18a} required error={e.animalPercentages}>
          <InfoBox variant="blue">{tr.q18a_note}</InfoBox>
          <div className="mt-4 space-y-4">
            {GROUPS.map(group => {
              const animals = ANIMALS.filter(a => a.group === group);
              if (!animals.length) return null;
              return (
                <div key={group} className={`rounded-xl border p-4 ${GROUP_COLORS[group]}`}>
                  <p className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">{group}</p>
                  <div className="space-y-2">
                    {animals.map(a => (
                      <PercentInput key={a.key} label={a.label} value={pcts[a.key]} onChange={setPct(a.key)} hint={h[a.key]} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4"><TotalIndicator total={total} tr={tr} /></div>
        </QuestionBlock>

        <QuestionBlock number="18b" label={tr.q18b}>
          <TextInput value={formData.animalOther} onChange={v => updateData({ animalOther: v })} placeholder={tr.leaveBlank} />
        </QuestionBlock>
      </div>
    </div>
  );
}

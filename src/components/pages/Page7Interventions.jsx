import { SectionHeader, QuestionBlock, InfoBox, PercentInput, TotalIndicator, TextArea } from '../FormFields';
import { INTERVENTIONS } from '../../surveyData';

const GROUP_COLORS = {
  'Government': 'bg-red-50 border-red-200',
  'Business': 'bg-orange-50 border-orange-200',
  'Public': 'bg-blue-50 border-blue-200',
  'Animals': 'bg-green-50 border-green-200',
  'Movement': 'bg-purple-50 border-purple-200',
  'Other': 'bg-gray-50 border-gray-200',
};

const GROUPS = ['Government', 'Business', 'Public', 'Animals', 'Movement', 'Other'];

export default function Page7Interventions({ tr, formData, updateData }) {
  const pcts = formData.interventionPercentages || {};
  const setPct = (key) => (val) => updateData({ interventionPercentages: { ...pcts, [key]: val } });
  const total = INTERVENTIONS.reduce((sum, i) => sum + (parseFloat(pcts[i.key]) || 0), 0);

  return (
    <div>
      <SectionHeader title={tr.page7Title} subtitle={tr.page7Intro} />
      <InfoBox variant="blue">{tr.page7Note}</InfoBox>

      <div className="space-y-4 mt-4">
        <QuestionBlock number="19a" label={tr.q19a} required>
          <div className="space-y-4">
            {GROUPS.map(group => {
              const items = INTERVENTIONS.filter(i => i.group === group);
              if (!items.length) return null;
              return (
                <div key={group} className={`rounded-xl border p-4 ${GROUP_COLORS[group]}`}>
                  <p className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">{group}</p>
                  <div className="space-y-2">
                    {items.map(item => (
                      <PercentInput
                        key={item.key}
                        label={item.label}
                        desc={item.desc}
                        value={pcts[item.key]}
                        onChange={setPct(item.key)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <TotalIndicator total={total} tr={tr} />
          </div>
        </QuestionBlock>

        <QuestionBlock number="19b" label={tr.q19b}>
          <TextArea
            value={formData.interventionOther}
            onChange={v => updateData({ interventionOther: v })}
            placeholder={tr.leaveBlank}
          />
        </QuestionBlock>
      </div>
    </div>
  );
}

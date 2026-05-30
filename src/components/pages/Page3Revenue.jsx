import { SectionHeader, QuestionBlock, NumberInput, PercentInput, TotalIndicator, InfoBox } from '../FormFields';

const REVENUE_SOURCES = ['rev_philanthropy','rev_public','rev_goods','rev_investment','rev_financial','rev_vc'];

export default function Page3Revenue({ tr, formData, updateData }) {
  const setRev = (key) => (val) => {
    const prev = formData.revenueSources || {};
    updateData({ revenueSources: { ...prev, [key]: val } });
  };

  const sources = formData.revenueSources || {};
  const total = REVENUE_SOURCES.reduce((sum, k) => sum + (parseFloat(sources[k]) || 0), 0);

  return (
    <div>
      <SectionHeader title={tr.page3Title} subtitle={tr.page3Intro} />
      <InfoBox variant="amber" title="">
        {tr.page3Note}
      </InfoBox>
      <div className="space-y-4 mt-4">
        <QuestionBlock number="12" label={tr.q12} required>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">{formData.currency ? formData.currency.split(' ')[0] : '$'}</span>
            <NumberInput
              value={formData.totalRevenue}
              onChange={v => updateData({ totalRevenue: v })}
              placeholder="0"
            />
          </div>
        </QuestionBlock>

        <QuestionBlock number="13" label={tr.q13} required>
          <div className="space-y-2 mb-3">
            {REVENUE_SOURCES.map(key => (
              <PercentInput
                key={key}
                label={tr[key]}
                value={sources[key]}
                onChange={setRev(key)}
              />
            ))}
          </div>
          <TotalIndicator total={total} tr={tr} />
        </QuestionBlock>
      </div>
    </div>
  );
}

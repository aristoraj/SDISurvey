import { useState } from 'react';
import { SectionHeader, QuestionBlock, RadioOption, CheckboxOption } from '../FormFields';
import { INSTITUTIONAL_FORMS, DOMAINS, MOVEMENT_IDENTITIES } from '../../surveyData';

export default function Page2Classification({ tr, formData, updateData }) {
  const set = key => val => updateData({ [key]: val });
  const [otherForm, setOtherForm] = useState('');
  const [otherDomain, setOtherDomain] = useState('');
  const [otherMI, setOtherMI] = useState('');

  const toggleDomain = key => {
    const current = formData.domains || [];
    updateData({
      domains: current.includes(key)
        ? current.filter(k => k !== key)
        : [...current, key],
    });
  };

  return (
    <div>
      <SectionHeader title={tr.page2Title} subtitle={tr.page2Intro} />
      <div className="space-y-4">

        {/* Q9 Institutional form */}
        <QuestionBlock number="9" label={tr.q9} required>
          <div className="grid md:grid-cols-2 gap-3">
            {INSTITUTIONAL_FORMS.map(form => (
              <RadioOption
                key={form.key}
                name="institutionalForm"
                value={form.key}
                checked={formData.institutionalForm === form.key}
                onChange={set('institutionalForm')}
                label={tr[form.key]}
                description={tr[`${form.key}_desc`]}
              />
            ))}
            <RadioOption
              name="institutionalForm"
              value="prefer_not"
              checked={formData.institutionalForm === 'prefer_not'}
              onChange={set('institutionalForm')}
              label={tr.preferNotToAnswer}
            />
            <div>
              <RadioOption
                name="institutionalForm"
                value="other"
                checked={formData.institutionalForm === 'other'}
                onChange={set('institutionalForm')}
                label={tr.other}
              />
              {formData.institutionalForm === 'other' && (
                <input
                  type="text"
                  value={otherForm}
                  onChange={e => { setOtherForm(e.target.value); updateData({ institutionalFormOther: e.target.value }); }}
                  placeholder="Please specify..."
                  className="mt-2 w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                />
              )}
            </div>
          </div>
        </QuestionBlock>

        {/* Q10 Domains */}
        <QuestionBlock number="10" label={tr.q10} required>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DOMAINS.map(d => (
              <CheckboxOption
                key={d.key}
                checked={(formData.domains || []).includes(d.key)}
                onChange={() => toggleDomain(d.key)}
                label={tr[d.key]}
              />
            ))}
            <CheckboxOption
              checked={(formData.domains || []).includes('prefer_not')}
              onChange={() => toggleDomain('prefer_not')}
              label={tr.preferNotToAnswer}
            />
          </div>
          <div className="mt-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={(formData.domains || []).includes('other_domain')}
                onChange={() => toggleDomain('other_domain')}
              />
              {tr.other}
            </label>
            {(formData.domains || []).includes('other_domain') && (
              <input
                type="text"
                value={otherDomain}
                onChange={e => { setOtherDomain(e.target.value); updateData({ domainOther: e.target.value }); }}
                placeholder="Please specify..."
                className="mt-2 w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
              />
            )}
          </div>
        </QuestionBlock>

        {/* Q11 Movement identity */}
        <QuestionBlock number="11" label={tr.q11} required>
          <div className="grid md:grid-cols-2 gap-3">
            {MOVEMENT_IDENTITIES.map(mi => (
              <RadioOption
                key={mi.key}
                name="movementIdentity"
                value={mi.key}
                checked={formData.movementIdentity === mi.key}
                onChange={set('movementIdentity')}
                label={tr[mi.key]}
                description={tr[`${mi.key}_desc`]}
              />
            ))}
            <RadioOption
              name="movementIdentity"
              value="prefer_not"
              checked={formData.movementIdentity === 'prefer_not'}
              onChange={set('movementIdentity')}
              label={tr.preferNotToAnswer}
            />
            <div>
              <RadioOption
                name="movementIdentity"
                value="other"
                checked={formData.movementIdentity === 'other'}
                onChange={set('movementIdentity')}
                label={tr.other}
              />
              {formData.movementIdentity === 'other' && (
                <input
                  type="text"
                  value={otherMI}
                  onChange={e => { setOtherMI(e.target.value); updateData({ movementIdentityOther: e.target.value }); }}
                  placeholder="Please specify..."
                  className="mt-2 w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                />
              )}
            </div>
          </div>
        </QuestionBlock>

      </div>
    </div>
  );
}

import { SectionHeader, QuestionBlock, TextArea, RadioOption, InfoBox } from '../FormFields';
import { GRANTEE_ORGS } from '../../surveyData';

export default function Page9Final({ tr, formData, updateData, errors, onSubmit }) {
  const set = key => val => updateData({ [key]: val });
  const e = errors || {};

  return (
    <div>
      <SectionHeader title={tr.page9Title} />
      <div className="space-y-4">

        <QuestionBlock number="21" label={tr.q21}>
          <TextArea value={formData.comments} onChange={set('comments')} placeholder={tr.leaveBlank} rows={4} />
        </QuestionBlock>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {tr.dataSharing}
          </h3>
          <p className="text-gray-600 text-sm mb-3">{tr.dataSharingText}</p>
          <p className="text-gray-500 text-sm">{tr.dataSharingText2}</p>
        </div>

        <QuestionBlock number="22a" label={tr.q22a} required error={e.permission22a}>
          <div className="flex gap-4">
            <RadioOption name="permission22a" value="yes" checked={formData.permission22a === 'yes'} onChange={set('permission22a')} label={tr.yes} />
            <RadioOption name="permission22a" value="no"  checked={formData.permission22a === 'no'}  onChange={set('permission22a')} label={tr.no} />
          </div>
        </QuestionBlock>

        <QuestionBlock number="22b" label={tr.q22b} required error={e.permission22b}>
          <div className="flex gap-4">
            <RadioOption name="permission22b" value="yes" checked={formData.permission22b === 'yes'} onChange={set('permission22b')} label={tr.yes} />
            <RadioOption name="permission22b" value="no"  checked={formData.permission22b === 'no'}  onChange={set('permission22b')} label={tr.no} />
          </div>
        </QuestionBlock>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="font-bold text-green-900 text-lg mb-2">💚 {tr.supportTitle}</h3>
          <p className="text-green-800 text-sm mb-5">{tr.supportText}</p>
          <QuestionBlock number="23" label={tr.q23} required error={e.granteeOrg}>
            <div className="grid md:grid-cols-2 gap-3 mt-2">
              {GRANTEE_ORGS.map(org => (
                <label
                  key={org.key}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.granteeOrg === org.key
                      ? 'border-green-500 bg-white shadow-sm'
                      : e.granteeOrg
                      ? 'border-red-200 bg-white/60 hover:border-red-300'
                      : 'border-green-200 bg-white/60 hover:border-green-400 hover:bg-white'
                  }`}
                >
                  <input type="radio" name="granteeOrg" value={org.key}
                    checked={formData.granteeOrg === org.key}
                    onChange={() => updateData({ granteeOrg: org.key })}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{org.name}</p>
                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">{org.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </QuestionBlock>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
          <h3 className="font-bold text-gray-900 text-xl mb-2">{tr.submitReady}</h3>
          <p className="text-gray-600 mb-4">{tr.submitText}</p>
          <p className="text-gray-400 text-sm">{tr.submitNote}</p>
        </div>

      </div>
    </div>
  );
}

import { ANIMALS, INTERVENTIONS, OUTCOMES } from './surveyData';

export function validatePage(page, formData) {
  const errors = {};

  switch (page) {
    case 1:
      if (!formData.firstName?.trim())  errors.firstName   = 'Required';
      if (!formData.lastName?.trim())   errors.lastName    = 'Required';
      if (!formData.email?.trim())      errors.email       = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                                        errors.email       = 'Enter a valid email address';
      if (!formData.jobTitle?.trim())   errors.jobTitle    = 'Required';
      if (!formData.orgName?.trim())    errors.orgName     = 'Required';
      if (!formData.country)            errors.country     = 'Please select a country';
      if (!formData.currency)           errors.currency    = 'Please select a currency';
      if (!formData.fiscalYearEnd)      errors.fiscalYearEnd = 'Required';
      if (formData.staffCount === undefined || formData.staffCount === '')
                                        errors.staffCount  = 'Required — enter 0 if none';
      break;

    case 2:
      if (!formData.institutionalForm)          errors.institutionalForm = 'Please select one option';
      if (!formData.domains?.length)            errors.domains           = 'Please select at least one domain';
      if (!formData.movementIdentity)           errors.movementIdentity  = 'Please select one option';
      break;

    case 3: {
      if (!formData.totalRevenue)               errors.totalRevenue   = 'Required';
      const rev = formData.revenueSources || {};
      const revTotal = ['rev_philanthropy','rev_public','rev_goods','rev_investment','rev_financial','rev_vc']
        .reduce((s, k) => s + (parseFloat(rev[k]) || 0), 0);
      if (Math.abs(revTotal - 100) > 0.5)
        errors.revenueSources = `Percentages must total 100% (currently ${revTotal.toFixed(0)}%)`;
      break;
    }

    case 4: {
      if (!formData.totalExpenses && formData.totalExpenses !== '0')
        errors.totalExpenses      = 'Required';
      if (formData.capitalExpenditure === undefined || formData.capitalExpenditure === '')
        errors.capitalExpenditure = 'Required — enter 0 if none';
      if (formData.regranted === undefined || formData.regranted === '')
        errors.regranted          = 'Required — enter 0 if none';
      const alloc = formData.expenseAllocation || {};
      const allocTotal = ['farmed','other_animals','humans']
        .reduce((s, k) => s + (parseFloat(alloc[k]) || 0), 0);
      if (Math.abs(allocTotal - 100) > 0.5)
        errors.expenseAllocation = `Percentages must total 100% (currently ${allocTotal.toFixed(0)}%)`;
      break;
    }

    case 5: {
      if ((formData.selectedCountries?.length || 0) > 0) {
        const ctTotal = (formData.selectedCountries || [])
          .reduce((s, c) => s + (parseFloat((formData.countryPercentages || {})[c]) || 0), 0);
        if (Math.abs(ctTotal - 100) > 0.5)
          errors.countryPercentages = `Percentages must total 100% (currently ${ctTotal.toFixed(0)}%)`;
      }
      break;
    }

    case 6: {
      const anTotal = ANIMALS.reduce((s, a) => s + (parseFloat((formData.animalPercentages || {})[a.key]) || 0), 0);
      if (Math.abs(anTotal - 100) > 0.5)
        errors.animalPercentages = `Percentages must total 100% (currently ${anTotal.toFixed(0)}%)`;
      break;
    }

    case 7: {
      const intTotal = INTERVENTIONS.reduce((s, i) => s + (parseFloat((formData.interventionPercentages || {})[i.key]) || 0), 0);
      if (Math.abs(intTotal - 100) > 0.5)
        errors.interventionPercentages = `Percentages must total 100% (currently ${intTotal.toFixed(0)}%)`;
      break;
    }

    case 8: {
      const outTotal = OUTCOMES.reduce((s, o) => s + (parseFloat((formData.outcomePercentages || {})[o.key]) || 0), 0);
      if (Math.abs(outTotal - 100) > 0.5)
        errors.outcomePercentages = `Percentages must total 100% (currently ${outTotal.toFixed(0)}%)`;
      break;
    }

    case 9:
      if (!formData.permission22a) errors.permission22a = 'Please select Yes or No';
      if (!formData.permission22b) errors.permission22b = 'Please select Yes or No';
      if (!formData.granteeOrg)    errors.granteeOrg    = 'Please select one organization';
      break;
  }

  return errors;
}

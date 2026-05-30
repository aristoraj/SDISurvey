// Maps Zoho Creator field link names → our internal survey keys.
// Run GET /api/metadata to see real field names, then fill in below.
//
// Format:
//   zohoFieldLinkName: 'our_internal_key'
//
// Internal key format mirrors formData structure:
//   revenueSources.rev_philanthropy   → revenue source percentage
//   expenseAllocation.farmed          → expense allocation percentage
//   animalPercentages.<animal_key>    → animal breakdown percentage
//   interventionPercentages.<key>     → intervention breakdown percentage
//   outcomePercentages.<key>          → outcome breakdown percentage
//   countryPercentages.<country_name> → country breakdown percentage

export const REVENUE_MAP = {
  // Zoho field name                  : our key
  // e.g. 'Philanthropy_Percentage'   : 'rev_philanthropy',
  // Fill after calling GET /api/metadata
};

export const EXPENSE_ALLOCATION_MAP = {
  // e.g. 'Animals_Farmed_For_Food_Percentage' : 'farmed',
};

export const ANIMAL_MAP = {
  // e.g. 'Broiler_chickens' : 'broiler_chickens',
};

export const INTERVENTION_MAP = {
  // e.g. 'Gov_Food_Policy' : 'gov_food_policy',
};

export const OUTCOME_MAP = {
  // e.g. 'Decreased_availability' : 'decreased_availability',
};

// Country percentages are stored differently — Zoho may use a subform/table.
// We'll handle this after seeing the metadata.
export const COUNTRY_FIELD_PREFIX = '';
// e.g. if Zoho stores 'United_States_of_America_Pct', prefix = '' and suffix = '_Pct'
export const COUNTRY_FIELD_SUFFIX = '';

// ─── Utility: extract hints from a raw Zoho record ──────────────────────────
// Returns { revenueSources: {rev_philanthropy: 45, ...}, animalPercentages: {...}, ... }
export function extractHints(record) {
  if (!record) return null;

  const hints = {
    revenueSources:          {},
    expenseAllocation:       {},
    animalPercentages:       {},
    interventionPercentages: {},
    outcomePercentages:      {},
    countryPercentages:      {},
  };

  for (const [zohoField, ourKey] of Object.entries(REVENUE_MAP)) {
    const val = parseFloat(record[zohoField]);
    if (!isNaN(val)) hints.revenueSources[ourKey] = val;
  }

  for (const [zohoField, ourKey] of Object.entries(EXPENSE_ALLOCATION_MAP)) {
    const val = parseFloat(record[zohoField]);
    if (!isNaN(val)) hints.expenseAllocation[ourKey] = val;
  }

  for (const [zohoField, ourKey] of Object.entries(ANIMAL_MAP)) {
    const val = parseFloat(record[zohoField]);
    if (!isNaN(val)) hints.animalPercentages[ourKey] = val;
  }

  for (const [zohoField, ourKey] of Object.entries(INTERVENTION_MAP)) {
    const val = parseFloat(record[zohoField]);
    if (!isNaN(val)) hints.interventionPercentages[ourKey] = val;
  }

  for (const [zohoField, ourKey] of Object.entries(OUTCOME_MAP)) {
    const val = parseFloat(record[zohoField]);
    if (!isNaN(val)) hints.outcomePercentages[ourKey] = val;
  }

  return hints;
}

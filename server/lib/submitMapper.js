/**
 * Maps our frontend formData structure to Zoho Creator field link names.
 * All field names confirmed from GET /api/metadata response.
 */

// Internal key → Zoho display value for institutional form choices
const INSTITUTIONAL_FORM_VALUES = {
  civil_incorporated:      'Civil Sector — Incorporated',
  civil_unincorporated:    'Civil Sector — Unincorporated',
  private_forprofit:       'Private Sector — For-Profit',
  private_social:          'Private Sector — Social Enterprise',
  public_intergovernmental:'Public Sector — Intergovernmental',
  public_national:         'Public Sector — National',
  public_subnational:      'Public Sector — Subnational',
  public_local:            'Public Sector — Local',
  academic_university:     'Academic Sector — University',
  academic_research:       'Academic Sector — Independent Research Institute',
  prefer_not:              'Prefer not to answer',
};

// Internal key → Zoho display value for domain choices
const DOMAIN_VALUES = {
  domain_animals:     'Animals and Habitat',
  domain_food:        'Food and Agriculture',
  domain_environment: 'Environment and Climate',
  domain_justice:     'Justice and Equity',
  domain_health:      'Health and Nutrition',
  domain_industry:    'Industry and Trade',
  domain_law:         'Law and Policy',
  domain_research:    'Research and Education',
  prefer_not:         'Prefer not to answer',
};

// Internal key → Zoho display value for movement identity choices
const MOVEMENT_ID_VALUES = {
  mi_animal_vegan:      'Animal and Vegan Advocacy',
  mi_alt_protein:       'Alternative Protein',
  mi_law_policy:        'Law and Policy',
  mi_sanctuary:         'Sanctuary and Direct Care',
  mi_movement_support:  'Movement Support',
  mi_comprehensive:     'Comprehensive Animal Advocacy',
  mi_adjacent:          'Adjacent Movement',
  prefer_not:           'Prefer not to answer',
};

// Internal key → Zoho display value for grantee org choices
const GRANTEE_VALUES = {
  well_fed:    'A Well-Fed World',
  ace:         'Animal Charity Evaluators',
  ea_funds:    'EA Funds, Animal Welfare Fund',
  proveg:      'ProVeg Grants, ProVeg International',
  thl:         'The Humane League, Open Wing Alliance and Animal Policy Alliance',
  pollination: 'The Pollination Project',
  thrive:      'Thrive Philanthropy',
};

// Format a date string (YYYY-MM-DD) to Zoho format DD-MMM-YYYY e.g. 31-Mar-2026
// Zoho Creator org date format: dd-MM-yyyy  e.g. 31-03-2026
function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T12:00:00');
  if (isNaN(d.getTime())) return null;
  const day   = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year  = d.getUTCFullYear();
  return `${day}-${month}-${year}`; // e.g. "31-03-2026"
}

function num(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

/**
 * Builds the Zoho Creator record payload from our formData.
 * @param {object} formData - frontend form state
 * @param {string|null} cycleId - Grant_Cycle record ID for current survey year
 */
export function buildSubmitPayload(formData, cycleId) {
  const data = {};

  // ── Profile ──────────────────────────────────────────────────────────────
  // Name field (compound type 29)
  if (formData.firstName || formData.lastName) {
    data['What_is_your_first_name'] = {
      first_name: formData.firstName || '',
      last_name:  formData.lastName  || '',
    };
  }

  if (formData.email)    data['What_is_your_work_email_address']              = formData.email;
  if (formData.jobTitle) data['What_is_your_job_title']                       = formData.jobTitle;
  if (formData.orgName)  data['a_What_is_your_organization_s_legal_name_If_your_organization_is_not_registered_please_provide_the'] = formData.orgName;
  if (formData.orgAliases) data['b_Does_your_organization_use_any_other_name_s_If_so_please_list_them_here_If_not_leave_this_questi'] = formData.orgAliases;
  // URL field (type 17) requires object format {url: "https://..."} not plain string
  if (formData.website)  data['What_is_your_organization_s_full_website_URL'] = { url: formData.website };

  // Country (type 14 = multi-select lookup) — pass as array of record IDs
  if (formData._countryId) {
    data['In_what_country_is_your_organization_s_headquarters_located'] = [formData._countryId];
  }
  // Currency (type 12 = single-select lookup) — pass as record ID string
  if (formData._currencyId) {
    data['In_what_currency_would_you_like_to_report_your_financial_data_Your_selected_currency_will_apply_to'] = formData._currencyId;
  }

  const fiscalFormatted = formatDate(formData.fiscalYearEnd);
  // eslint-disable-next-line no-console
  console.log(`[submitMapper] date raw="${formData.fiscalYearEnd}" formatted="${fiscalFormatted}"`);
  if (fiscalFormatted)   data['When_did_your_organization_s_last_fiscal_year_end_For_many_organizations_the_fiscal_year_ends_in_D'] = fiscalFormatted;

  if (formData.staffCount != null) data['At_the_end_of_your_organization_s_last_fiscal_year_how_many_paid_staff_members_including_employees'] = String(formData.staffCount);

  // Survey year lookup
  if (cycleId) data['Current_Year'] = cycleId;

  // ── Classification ───────────────────────────────────────────────────────
  if (formData.institutionalForm) {
    const val = INSTITUTIONAL_FORM_VALUES[formData.institutionalForm] || formData.institutionalFormOther || formData.institutionalForm;
    data['Which_institutional_form_best_describes_your_organization'] = val;
  }

  if (formData.domains?.length) {
    const vals = formData.domains
      .map(k => k === 'other_domain' ? formData.domainOther : DOMAIN_VALUES[k])
      .filter(Boolean);
    data['In_which_domains_does_your_organization_typically_operate'] = vals;
  }

  if (formData.movementIdentity) {
    const val = MOVEMENT_ID_VALUES[formData.movementIdentity] || formData.movementIdentityOther || formData.movementIdentity;
    data['Which_movement_identity_best_describes_your_organization_s_role_in_relation_to_animals_farmed_or_c'] = val;
  }

  // ── Revenue ──────────────────────────────────────────────────────────────
  if (formData.totalRevenue) data['a_For_your_last_fiscal_year_what_was_your_organization_s_total_revenue_from_all_sources_Please_ent1'] = num(formData.totalRevenue);

  const rev = formData.revenueSources || {};
  if (rev.rev_philanthropy) data['Philanthropy_foundations_individuals']                      = num(rev.rev_philanthropy);
  if (rev.rev_public)       data['Public_institutional_support_government_grants_or_programs'] = num(rev.rev_public);
  if (rev.rev_goods)        data['Goods_or_services_provided_consulting_fees_sales_dues_etc'] = num(rev.rev_goods);
  if (rev.rev_investment)   data['Investment_revenue_stocks_bonds_real_estate_etc']           = num(rev.rev_investment);
  if (rev.rev_financial)    data['Private_financial_institutions_loans_financing']            = num(rev.rev_financial);
  if (rev.rev_vc)           data['Private_investment_venture_capital']                        = num(rev.rev_vc);

  // ── Expenses ─────────────────────────────────────────────────────────────
  if (formData.totalExpenses)      data['a_For_your_last_fiscal_year_what_were_your_organization_s_total_expenses_Please_write_your_answer'] = num(formData.totalExpenses);
  if (formData.capitalExpenditure) data['b_Of_the_total_expenses_you_reported_in_14a_how_much_was_capital_expenditure'] = num(formData.capitalExpenditure);
  if (formData.regranted)          data['c_During_the_fiscal_year_ending_DATE_how_much_funding_did_you_grant_to_other_organizations_which_i'] = num(formData.regranted);

  const alloc = formData.expenseAllocation || {};
  if (alloc.farmed)        data['Work_directly_or_indirectly_benefiting_animals_farmed_or_caught_for_food'] = num(alloc.farmed);
  if (alloc.other_animals) data['Work_directly_or_indirectly_benefiting_other_non_human_animals_0']         = num(alloc.other_animals);
  if (alloc.humans)        data['Work_directly_or_indirectly_benefiting_humans_or_other_concerns']          = num(alloc.humans);

  // ── Animals (Q18) ────────────────────────────────────────────────────────
  const ANIMAL_FIELDS = {
    all_farmed_terrestrial: 'ALL_FARMED_TERRESTRIAL_animals',
    all_wild_terrestrial:   'ALL_WILD_CAUGHT_TERRESTRIAL_animals',
    all_farmed_aquatic:     'ALL_FARMED_AQUATIC_animals',
    all_wild_aquatic:       'ALL_WILD_CAUGHT_AQUATIC_animals',
    broiler_chickens:       'Broiler_chickens',
    egg_laying_chickens:    'Egg_laying_chickens',
    ducks:                  'Ducks',
    geese:                  'Geese',
    turkeys:                'Turkeys',
    buffalo:                'Buffalo',
    cattle:                 'Cattle',
    hogs_pigs:              'Hogs_and_or_pigs',
    horses_asses_camelids:  'Horses_asses_and_or_camelids',
    sheep:                  'Sheep',
    goats:                  'Goats',
    rabbits_hares:          'Rabbits_hares_and_or_other_rodents',
    farmed_insects:         'Farmed_insects',
    other_farmed_terrestrial:'Other_farmed_terrestrial_animals',
    other_wild_terrestrial: 'Other_wild_caught_terrestrial_animals',
    farmed_fish:            'Farmed_fish',
    farmed_crustaceans:     'Farmed_crustaceans_bivalves_and_or_gastropods',
    farmed_cephalopods:     'Farmed_cephalopods',
    other_farmed_aquatic:   'Other_farmed_aquatic_animals',
    wild_fish:              'Wild_caught_fish',
    wild_crustaceans:       'Wild_caught_crustaceans_bivalves_and_or_gastropods',
    wild_cephalopods:       'Wild_caught_cephalopods',
    wild_aquatic_mammals:   'Wild_caught_aquatic_mammals',
    other_wild_aquatic:     'Other_wild_caught_aquatic_animals',
    unspecified_all:        'Unknown_or_cannot_estimate',
  };
  const animalPcts = formData.animalPercentages || {};
  for (const [ourKey, zohoField] of Object.entries(ANIMAL_FIELDS)) {
    if (animalPcts[ourKey] != null) data[zohoField] = num(animalPcts[ourKey]);
  }
  if (formData.animalOther) data['b_If_you_assigned_a_percentage_to_any_category_marked_other_please_specify_in_15b_please_use_this'] = formData.animalOther;

  // ── Interventions (Q19) ──────────────────────────────────────────────────
  const INTERVENTION_FIELDS = {
    gov_food_policy:       'GOVERNMENT_Food_policy_advocacy',
    gov_ag_policy:         'GOVERNMENT_Agricultural_policy_advocacy',
    gov_env_policy:        'GOVERNMENT_Environmental_policy_advocacy',
    gov_animal_policy:     'GOVERNMENT_Animal_policy_advocacy',
    gov_electioneering:    'GOVERNMENT_Electioneering',
    biz_producer_outreach: 'BUSINESS_Producer_outreach',
    biz_litigation:        'BUSINESS_Corporate_litigation',
    biz_vegan_outreach:    'BUSINESS_Corporate_and_institutional_engagement_Veg_n_outreach',
    biz_welfare:           'BUSINESS_Corporate_and_institutional_engagement_Welfare_improvements',
    biz_influence_invest:  'BUSINESS_Finance_Influencing_investment',
    biz_provide_invest:    'BUSINESS_Finance_Providing_investment',
    biz_labeling:          'BUSINESS_Product_labeling_and_certification',
    pub_books_docs:        'PUBLIC_Books_documentaries_and_other_films_podcasts',
    pub_celebrity:         'PUBLIC_Celebrity_and_influencer_outreach',
    pub_education:         'PUBLIC_School_or_university_classes_academic_programs_university_partnerships',
    pub_investigations:    'PUBLIC_Investigations',
    pub_journalism:        'PUBLIC_Journalism_outreach_to_mainstream_media_and_journalists1',
    pub_physical_ads:      'PUBLIC_Physical_advertising_billboards_print_ads_stickers_leaflets',
    pub_mobilizations:     'PUBLIC_Mass_mobilizations_and_protests',
    pub_digital:           'PUBLIC_Digital_outreach_social_media_campaigns_online_ads_apps_veg_n_pledges',
    pub_events:            'PUBLIC_Conferences_and_public_events',
    animals_sanctuary:     'ANIMALS_Sanctuaries_veterinary_care_and_rehabilitation',
    animals_rescue:        'ANIMALS_Rescue_and_direct_action',
    mov_influence_funding: 'MOVEMENT_Funding_Influencing_funding',
    mov_provide_funding:   'MOVEMENT_Funding_Providing_funding',
    mov_network:           'MOVEMENT_Network_building_collaboration_opportunities_building_or_strengthening_networks_and_coali',
    mov_research:          'MOVEMENT_Research_surveys_data_driven_analyses_peer_reviewed_articles_data_presentation_tools',
    mov_skill_building:    'MOVEMENT_Skill_building_training_programs_staff_education',
    mov_monitoring:        'MOVEMENT_Monitoring_and_evaluation',
    mov_professional:      'MOVEMENT_Professional_services_legal_representation_and_advice_technical_services',
    other:                 'OTHER_please_specify_in_16b_below',
  };
  const intPcts = formData.interventionPercentages || {};
  for (const [ourKey, zohoField] of Object.entries(INTERVENTION_FIELDS)) {
    if (intPcts[ourKey] != null) data[zohoField] = num(intPcts[ourKey]);
  }
  if (formData.interventionOther) data['b_If_you_assigned_a_percentage_to_OTHER_using_the_slider_above_please_specify_here_Leave_blank_if1'] = formData.interventionOther;

  // ── Outcomes (Q20) ───────────────────────────────────────────────────────
  const outPcts = formData.outcomePercentages || {};
  if (outPcts.decreased_availability) data['Decreased_availability_of_animal_products']      = num(outPcts.decreased_availability);
  if (outPcts.decreased_consumption)  data['Decreased_consumption_of_animal_products']        = num(outPcts.decreased_consumption);
  if (outPcts.direct_help)            data['Direct_help']                                     = num(outPcts.direct_help);
  if (outPcts.welfare_standards)      data['Improvement_of_welfare_standards1']               = num(outPcts.welfare_standards);
  if (outPcts.increased_availability) data['Increased_availability_of_animal_free_products'] = num(outPcts.increased_availability);
  if (outPcts.increased_engagement)   data['Increased_engagement_in_animal_advocacy']         = num(outPcts.increased_engagement);
  if (outPcts.increased_knowledge)    data['Increased_knowledge_or_skills_for_animal_advocacy'] = num(outPcts.increased_knowledge);
  if (outPcts.anti_speciesist)        data['Increased_prevalence_of_anti_speciesist_values']  = num(outPcts.anti_speciesist);

  // ── Section totals — always 100 when form validation passes ─────────────
  data['Total_Revenue']         = 100; // sum of revenue source %
  data['Total_Expense']         = 100; // sum of expense allocation %
  data['Total_Expenses_Country']= 100; // sum of country %
  data['Total_Animal']          = 100; // sum of animal %
  data['Intervation_Total']     = 100; // sum of intervention % (note: typo in Zoho field)
  data['overall_intendedTotal'] = 100; // sum of outcome %

  // ── Final (Q21-23) ───────────────────────────────────────────────────────
  if (formData.comments) data['Do_you_need_to_clarify_any_of_your_responses_If_not_leave_blank'] = formData.comments;

  if (formData.permission22a) data['Do_you_give_us_permission_to_share_your_exact_financial_staffing_and_allocation_data_with_trusted'] = formData.permission22a === 'yes' ? 'Yes' : 'No';
  if (formData.permission22b) data['Do_you_give_us_permission_to_report_your_financial_staffing_and_allocation_data_within_broad_range'] = formData.permission22b === 'yes' ? 'Yes' : 'No';

  if (formData.granteeOrg) {
    data['Please_select_one_organization_The_list_below_is_shown_in_randomized_order_so_the_order_you_see_ma'] = GRANTEE_VALUES[formData.granteeOrg] || formData.granteeOrg;
  }

  // Zoho Creator API v2.1 expects data as an array
  return { data: [data] };
}

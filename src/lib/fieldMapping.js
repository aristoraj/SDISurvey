// Complete Zoho Creator field link name → internal survey key mapping
// Built from GET /api/metadata response.

// ── Revenue Sources (Q13) ────────────────────────────────────────────────────
export const REVENUE_MAP = {
  Philanthropy_foundations_individuals:                      'rev_philanthropy',
  Public_institutional_support_government_grants_or_programs:'rev_public',
  Goods_or_services_provided_consulting_fees_sales_dues_etc: 'rev_goods',
  Investment_revenue_stocks_bonds_real_estate_etc:           'rev_investment',
  Private_financial_institutions_loans_financing:            'rev_financial',
  Private_investment_venture_capital:                        'rev_vc',
};

// ── Expense Allocation (Q15) ─────────────────────────────────────────────────
export const EXPENSE_ALLOCATION_MAP = {
  Work_directly_or_indirectly_benefiting_animals_farmed_or_caught_for_food: 'farmed',
  Work_directly_or_indirectly_benefiting_other_non_human_animals_0:         'other_animals',
  Work_directly_or_indirectly_benefiting_humans_or_other_concerns:          'humans',
};

// ── Animal Percentages (Q18) ─────────────────────────────────────────────────
export const ANIMAL_MAP = {
  ALL_FARMED_TERRESTRIAL_animals:                   'all_farmed_terrestrial',
  ALL_WILD_CAUGHT_TERRESTRIAL_animals:              'all_wild_terrestrial',
  ALL_FARMED_AQUATIC_animals:                       'all_farmed_aquatic',
  ALL_WILD_CAUGHT_AQUATIC_animals:                  'all_wild_aquatic',
  Broiler_chickens:                                 'broiler_chickens',
  Egg_laying_chickens:                              'egg_laying_chickens',
  Ducks:                                            'ducks',
  Geese:                                            'geese',
  Turkeys:                                          'turkeys',
  Buffalo:                                          'buffalo',
  Cattle:                                           'cattle',
  Hogs_and_or_pigs:                                 'hogs_pigs',
  Horses_asses_and_or_camelids:                     'horses_asses_camelids',
  Sheep:                                            'sheep',
  Goats:                                            'goats',
  Rabbits_hares_and_or_other_rodents:               'rabbits_hares',
  Farmed_insects:                                   'farmed_insects',
  Other_farmed_terrestrial_animals:                 'other_farmed_terrestrial',
  Other_wild_caught_terrestrial_animals:            'other_wild_terrestrial',
  Farmed_fish:                                      'farmed_fish',
  Farmed_crustaceans_bivalves_and_or_gastropods:    'farmed_crustaceans',
  Farmed_cephalopods:                               'farmed_cephalopods',
  Other_farmed_aquatic_animals:                     'other_farmed_aquatic',
  Wild_caught_fish:                                 'wild_fish',
  Wild_caught_crustaceans_bivalves_and_or_gastropods:'wild_crustaceans',
  Wild_caught_cephalopods:                          'wild_cephalopods',
  Wild_caught_aquatic_mammals:                      'wild_aquatic_mammals',
  Other_wild_caught_aquatic_animals:                'other_wild_aquatic',
  Unknown_or_cannot_estimate:                       'unspecified_all',
};

// ── Intervention Percentages (Q19) ───────────────────────────────────────────
export const INTERVENTION_MAP = {
  // Government
  GOVERNMENT_Food_policy_advocacy:                                                    'gov_food_policy',
  GOVERNMENT_Agricultural_policy_advocacy:                                            'gov_ag_policy',
  GOVERNMENT_Environmental_policy_advocacy:                                           'gov_env_policy',
  GOVERNMENT_Animal_policy_advocacy:                                                  'gov_animal_policy',
  GOVERNMENT_Electioneering:                                                          'gov_electioneering',
  // Business
  BUSINESS_Producer_outreach:                                                         'biz_producer_outreach',
  BUSINESS_Corporate_litigation:                                                      'biz_litigation',
  BUSINESS_Corporate_and_institutional_engagement_Veg_n_outreach:                    'biz_vegan_outreach',
  BUSINESS_Corporate_and_institutional_engagement_Welfare_improvements:              'biz_welfare',
  BUSINESS_Finance_Influencing_investment:                                            'biz_influence_invest',
  BUSINESS_Finance_Providing_investment:                                              'biz_provide_invest',
  BUSINESS_Product_labeling_and_certification:                                        'biz_labeling',
  // Public
  PUBLIC_Books_documentaries_and_other_films_podcasts:                               'pub_books_docs',
  PUBLIC_Celebrity_and_influencer_outreach:                                           'pub_celebrity',
  PUBLIC_School_or_university_classes_academic_programs_university_partnerships:     'pub_education',
  PUBLIC_Investigations:                                                              'pub_investigations',
  PUBLIC_Journalism_outreach_to_mainstream_media_and_journalists1:                   'pub_journalism',
  PUBLIC_Physical_advertising_billboards_print_ads_stickers_leaflets:               'pub_physical_ads',
  PUBLIC_Mass_mobilizations_and_protests:                                             'pub_mobilizations',
  PUBLIC_Digital_outreach_social_media_campaigns_online_ads_apps_veg_n_pledges:     'pub_digital',
  PUBLIC_Conferences_and_public_events:                                               'pub_events',
  // Animals
  ANIMALS_Sanctuaries_veterinary_care_and_rehabilitation:                            'animals_sanctuary',
  ANIMALS_Rescue_and_direct_action:                                                   'animals_rescue',
  // Movement
  MOVEMENT_Funding_Influencing_funding:                                               'mov_influence_funding',
  MOVEMENT_Funding_Providing_funding:                                                 'mov_provide_funding',
  MOVEMENT_Network_building_collaboration_opportunities_building_or_strengthening_networks_and_coali: 'mov_network',
  MOVEMENT_Research_surveys_data_driven_analyses_peer_reviewed_articles_data_presentation_tools:      'mov_research',
  MOVEMENT_Skill_building_training_programs_staff_education:                         'mov_skill_building',
  MOVEMENT_Monitoring_and_evaluation:                                                 'mov_monitoring',
  MOVEMENT_Professional_services_legal_representation_and_advice_technical_services: 'mov_professional',
  // Other
  OTHER_please_specify_in_16b_below:                                                  'other',
};

// ── Outcome Percentages (Q20) ────────────────────────────────────────────────
export const OUTCOME_MAP = {
  Decreased_availability_of_animal_products:      'decreased_availability',
  Decreased_consumption_of_animal_products:       'decreased_consumption',
  Direct_help:                                    'direct_help',
  Improvement_of_welfare_standards1:              'welfare_standards',
  Increased_availability_of_animal_free_products: 'increased_availability',
  Increased_engagement_in_animal_advocacy:        'increased_engagement',
  Increased_knowledge_or_skills_for_animal_advocacy: 'increased_knowledge',
  Increased_prevalence_of_anti_speciesist_values: 'anti_speciesist',
};

// ── Country Percentages (Q17 — stored in Country_Expenses subform) ───────────
// The subform row structure: { Country: {display_value: "United States"}, Current_Percentage1: 45 }
// We extract these separately in extractHints below.

// ─── Master extractor ────────────────────────────────────────────────────────
// Converts a raw Zoho record into our internal hints structure.
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

  // Revenue sources
  for (const [zohoField, ourKey] of Object.entries(REVENUE_MAP)) {
    const val = parseFloat(record[zohoField]);
    if (!isNaN(val) && val > 0) hints.revenueSources[ourKey] = val;
  }

  // Expense allocation
  for (const [zohoField, ourKey] of Object.entries(EXPENSE_ALLOCATION_MAP)) {
    const val = parseFloat(record[zohoField]);
    if (!isNaN(val) && val > 0) hints.expenseAllocation[ourKey] = val;
  }

  // Animals
  for (const [zohoField, ourKey] of Object.entries(ANIMAL_MAP)) {
    const val = parseFloat(record[zohoField]);
    if (!isNaN(val) && val > 0) hints.animalPercentages[ourKey] = val;
  }

  // Interventions
  for (const [zohoField, ourKey] of Object.entries(INTERVENTION_MAP)) {
    const val = parseFloat(record[zohoField]);
    if (!isNaN(val) && val > 0) hints.interventionPercentages[ourKey] = val;
  }

  // Outcomes
  for (const [zohoField, ourKey] of Object.entries(OUTCOME_MAP)) {
    const val = parseFloat(record[zohoField]);
    if (!isNaN(val) && val > 0) hints.outcomePercentages[ourKey] = val;
  }

  // Country percentages — stored in Country_Expenses subform rows
  // Each row: { Country: { display_value: "United States of America" }, Current_Percentage1: 45 }
  const subformRows = record.Country_Expenses || [];
  for (const row of subformRows) {
    const countryName = row.Country?.display_value || row.Country;
    const pct = parseFloat(row.Current_Percentage1);
    if (countryName && !isNaN(pct) && pct > 0) {
      hints.countryPercentages[countryName] = pct;
    }
  }

  return hints;
}

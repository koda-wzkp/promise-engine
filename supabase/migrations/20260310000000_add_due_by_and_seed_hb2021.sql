-- Add due_by column to promise_events (corresponds to Alembic revision a3d7f1e2b4c5)
ALTER TABLE promise_events ADD COLUMN IF NOT EXISTS due_by TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_events_due_by ON promise_events (due_by);
CREATE INDEX IF NOT EXISTS idx_events_overdue ON promise_events (promiser_id, result, due_by);

-- Seed HB 2021 agents
INSERT INTO agents (type, id, agent_metadata, created_at)
VALUES
  ('business', 'pge', '{"name":"Portland General Electric","short":"PGE","role":"investor_owned_utility","hb2021_role":"promiser","service_territory":"Portland metro, Salem, northern Oregon coast","customers":930000,"baseline_emissions_mtco2e_per_mwh":0.428,"latest_reduction_pct":27,"latest_reduction_year":2022}', NOW()),
  ('business', 'pacificorp', '{"name":"PacifiCorp / Pacific Power","short":"PAC","role":"investor_owned_utility","hb2021_role":"promiser","service_territory":"Southern, central, and eastern Oregon (multi-state: 6 states)","customers":620000,"baseline_emissions_mtco2e_per_mwh":0.428,"latest_reduction_pct":13,"latest_reduction_year":2022}', NOW()),
  ('business', 'ess', '{"name":"Electricity Service Suppliers","short":"ESS","role":"electricity_service_supplier","hb2021_role":"promiser"}', NOW()),
  ('platform', 'oregon_puc', '{"name":"Oregon Public Utility Commission","short":"PUC","role":"regulator","hb2021_role":"verifier"}', NOW()),
  ('platform', 'oregon_deq', '{"name":"Oregon Department of Environmental Quality","short":"DEQ","role":"regulator","hb2021_role":"verifier"}', NOW()),
  ('community', 'ratepayers', '{"name":"Oregon Ratepayers","short":"RP","hb2021_role":"promisee"}', NOW()),
  ('community', 'ej_communities', '{"name":"Environmental Justice Communities","short":"EJ","hb2021_role":"promisee"}', NOW()),
  ('community', 'tribes', '{"name":"Federally Recognized Tribes","short":"TRB","hb2021_role":"promisee"}', NOW()),
  ('community', 'workers', '{"name":"Clean Energy Workforce","short":"WRK","hb2021_role":"promisee"}', NOW()),
  ('platform', 'or_legislature', '{"name":"Oregon Legislature","short":"LEG","hb2021_role":"legislator"}', NOW()),
  ('platform', 'cub', '{"name":"Citizens'' Utility Board","short":"CUB","role":"consumer_advocate","hb2021_role":"auditor"}', NOW())
ON CONFLICT (type, id) DO UPDATE SET agent_metadata = EXCLUDED.agent_metadata;

-- Seed HB 2021 schemas
INSERT INTO promise_schemas (id, version, vertical, name, description, commitment_type, stakes, schema_json, verification_type, verification_rules, training_eligible, domain_tags, created_at)
VALUES
  ('hb2021.emissions_target', 1, 'hb2021', 'GHG Emissions Reduction Target',
   'Utility promises to reduce greenhouse gas emissions from retail electricity to 80% below baseline by 2030, 90% by 2035, and 100% by 2040.',
   'emissions_reduction', 'high',
   '{"type":"object","properties":{"utility_id":{"type":"string","enum":["pge","pacificorp","ess"]},"reporting_year":{"type":"integer","minimum":2022},"actual_reduction_pct":{"type":"number"},"target_year":{"type":"integer","enum":[2030,2035,2040]},"required_reduction_pct":{"type":"number","enum":[80,90,100]}},"required":["utility_id","reporting_year","actual_reduction_pct","target_year","required_reduction_pct"]}',
   'automatic',
   '{"type":"trajectory","baseline_year":2012,"baseline_value":0.428,"targets":[{"year":2030,"reduction_pct":80},{"year":2035,"reduction_pct":90},{"year":2040,"reduction_pct":100}],"interpolation":"linear","tolerance_pct":5}',
   true, '["climate","energy","emissions","decarbonization","regulatory"]', NOW()),

  ('hb2021.clean_energy_plan', 1, 'hb2021', 'Clean Energy Plan Submission',
   'Utility promises to submit a Clean Energy Plan concurrent with each IRP.',
   'regulatory_filing', 'high',
   '{"type":"object","properties":{"utility_id":{"type":"string","enum":["pge","pacificorp"]},"irp_cycle_year":{"type":"integer"},"puc_disposition":{"type":"string","enum":["accepted","accepted_with_conditions","rejected","pending"]}},"required":["utility_id","irp_cycle_year","puc_disposition"]}',
   'reported',
   '{"rules":[{"if":{"puc_disposition":"accepted"},"result":"kept"},{"if":{"puc_disposition":"accepted_with_conditions"},"result":"renegotiated"},{"if":{"puc_disposition":"rejected"},"result":"broken"},{"if":{"puc_disposition":"pending"},"result":"pending"}]}',
   true, '["climate","energy","planning","regulatory","puc"]', NOW()),

  ('hb2021.community_benefits', 1, 'hb2021', 'Community Benefits & Environmental Justice',
   'Utility promises to convene a Community Benefits and Impacts Advisory Group.',
   'community_obligation', 'high',
   '{"type":"object","properties":{"utility_id":{"type":"string","enum":["pge","pacificorp"]},"advisory_group_convened":{"type":"boolean"}},"required":["utility_id","advisory_group_convened"]}',
   'reported',
   '{"rules":[{"if":{"advisory_group_convened":true},"result":"kept"},{"if":{"advisory_group_convened":false},"result":"broken"}]}',
   true, '["climate","energy","equity","environmental_justice","community"]', NOW()),

  ('hb2021.labor_standards', 1, 'hb2021', 'Responsible Contractor & Labor Standards',
   'For renewable energy projects > 10 MW, utility promises to require PLAs or prevailing wage.',
   'labor_compliance', 'medium',
   '{"type":"object","properties":{"project_id":{"type":"string"},"utility_id":{"type":"string","enum":["pge","pacificorp","ess"]},"capacity_mw":{"type":"number","minimum":0}},"required":["project_id","utility_id","capacity_mw"]}',
   'reported',
   '{"rules":[{"condition":"capacity_mw <= 10","result":"blocked"},{"condition":"capacity_mw > 10 and (project_labor_agreement or prevailing_wage_paid)","result":"kept"},{"condition":"capacity_mw > 10 and not project_labor_agreement and not prevailing_wage_paid","result":"broken"}]}',
   true, '["climate","energy","labor","workforce","construction"]', NOW()),

  ('hb2021.rate_impact', 1, 'hb2021', 'Rate Impact & Affordability Safeguard',
   'Compliance costs must not cause annual rate impacts exceeding 6% of revenue requirement.',
   'affordability', 'high',
   '{"type":"object","properties":{"utility_id":{"type":"string","enum":["pge","pacificorp"]},"rate_year":{"type":"integer"},"rate_impact_pct":{"type":"number"}},"required":["utility_id","rate_year","rate_impact_pct"]}',
   'reported',
   '{"rules":[{"condition":"rate_impact_pct <= 6.0","result":"kept"},{"condition":"rate_impact_pct > 6.0 and exemption_granted","result":"renegotiated"},{"condition":"rate_impact_pct > 6.0 and not exemption_granted","result":"broken"}]}',
   true, '["climate","energy","affordability","rates","regulatory"]', NOW()),

  ('hb2021.fossil_fuel_ban', 1, 'hb2021', 'Fossil Fuel Plant Prohibition',
   'Permanent ban on siting new gas-fired power plants in Oregon.',
   'prohibition', 'high',
   '{"type":"object","properties":{"utility_id":{"type":"string","enum":["pge","pacificorp","ess"]},"review_period_start":{"type":"string","format":"date"},"review_period_end":{"type":"string","format":"date"}},"required":["utility_id","review_period_start","review_period_end"]}',
   'automatic',
   '{"rules":[{"condition":"new_gas_plants_permitted == 0 and existing_gas_expansions_permitted == 0","result":"kept"},{"condition":"new_gas_plants_permitted > 0 or existing_gas_expansions_permitted > 0","result":"broken"}]}',
   true, '["climate","energy","fossil_fuel","prohibition","siting"]', NOW())
ON CONFLICT (id) DO UPDATE SET
  version = EXCLUDED.version,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  schema_json = EXCLUDED.schema_json,
  verification_rules = EXCLUDED.verification_rules;

-- Seed initial promise events: PGE emissions filings
INSERT INTO promise_events (id, timestamp, vertical, promise_schema_id, promise_version, promiser_type, promiser_id, promisee_type, promisee_id, input_context, output, result, signal_strength, due_by, training_eligible)
VALUES
  (gen_random_uuid(), '2020-12-31', 'hb2021', 'hb2021.emissions_target', 1, 'business', 'pge', 'community', 'ratepayers',
   '{"utility_id":"pge","reporting_year":2020,"actual_reduction_pct":22.0,"baseline_emissions_mtco2e_per_mwh":0.428,"target_year":2030,"required_reduction_pct":80}',
   '{"actual_reduction_pct":22.0}', 'pending', 'implicit', '2030-12-31', true),
  (gen_random_uuid(), '2021-12-31', 'hb2021', 'hb2021.emissions_target', 1, 'business', 'pge', 'community', 'ratepayers',
   '{"utility_id":"pge","reporting_year":2021,"actual_reduction_pct":24.0,"baseline_emissions_mtco2e_per_mwh":0.428,"target_year":2030,"required_reduction_pct":80}',
   '{"actual_reduction_pct":24.0}', 'pending', 'implicit', '2030-12-31', true),
  (gen_random_uuid(), '2022-12-31', 'hb2021', 'hb2021.emissions_target', 1, 'business', 'pge', 'community', 'ratepayers',
   '{"utility_id":"pge","reporting_year":2022,"actual_reduction_pct":27.0,"baseline_emissions_mtco2e_per_mwh":0.428,"target_year":2030,"required_reduction_pct":80}',
   '{"actual_reduction_pct":27.0}', 'pending', 'implicit', '2030-12-31', true),

  -- PacifiCorp emissions filings
  (gen_random_uuid(), '2020-12-31', 'hb2021', 'hb2021.emissions_target', 1, 'business', 'pacificorp', 'community', 'ratepayers',
   '{"utility_id":"pacificorp","reporting_year":2020,"actual_reduction_pct":10.0,"baseline_emissions_mtco2e_per_mwh":0.428,"target_year":2030,"required_reduction_pct":80}',
   '{"actual_reduction_pct":10.0}', 'pending', 'implicit', '2030-12-31', true),
  (gen_random_uuid(), '2021-12-31', 'hb2021', 'hb2021.emissions_target', 1, 'business', 'pacificorp', 'community', 'ratepayers',
   '{"utility_id":"pacificorp","reporting_year":2021,"actual_reduction_pct":11.0,"baseline_emissions_mtco2e_per_mwh":0.428,"target_year":2030,"required_reduction_pct":80}',
   '{"actual_reduction_pct":11.0}', 'pending', 'implicit', '2030-12-31', true),
  (gen_random_uuid(), '2022-12-31', 'hb2021', 'hb2021.emissions_target', 1, 'business', 'pacificorp', 'community', 'ratepayers',
   '{"utility_id":"pacificorp","reporting_year":2022,"actual_reduction_pct":13.0,"baseline_emissions_mtco2e_per_mwh":0.428,"target_year":2030,"required_reduction_pct":80}',
   '{"actual_reduction_pct":13.0}', 'pending', 'implicit', '2030-12-31', true),

  -- CEP filings (both renegotiated = accepted_with_conditions)
  (gen_random_uuid(), '2023-06-30', 'hb2021', 'hb2021.clean_energy_plan', 1, 'business', 'pge', 'platform', 'oregon_puc',
   '{"utility_id":"pge","irp_cycle_year":2023,"cep_filing_date":"2023-03-31","cep_docket_number":"LC 80","puc_disposition":"accepted_with_conditions","cbre_targets_included":true,"annual_action_roadmap_included":true,"ej_assessment_included":true}',
   '{"puc_disposition":"accepted_with_conditions"}', 'renegotiated', 'implicit', NULL, true),
  (gen_random_uuid(), '2023-06-30', 'hb2021', 'hb2021.clean_energy_plan', 1, 'business', 'pacificorp', 'platform', 'oregon_puc',
   '{"utility_id":"pacificorp","irp_cycle_year":2023,"cep_filing_date":"2023-05-31","cep_docket_number":"LC 82","puc_disposition":"accepted_with_conditions","cbre_targets_included":true,"annual_action_roadmap_included":true,"ej_assessment_included":false}',
   '{"puc_disposition":"accepted_with_conditions"}', 'renegotiated', 'implicit', NULL, true),

  -- Community benefits (both kept)
  (gen_random_uuid(), '2024-06-30', 'hb2021', 'hb2021.community_benefits', 1, 'business', 'pge', 'community', 'ej_communities',
   '{"utility_id":"pge","advisory_group_convened":true,"assessment_period_start":"2023-01-01","assessment_period_end":"2024-12-31"}',
   '{"advisory_group_convened":true}', 'kept', 'implicit', NULL, true),
  (gen_random_uuid(), '2024-06-30', 'hb2021', 'hb2021.community_benefits', 1, 'business', 'pacificorp', 'community', 'ej_communities',
   '{"utility_id":"pacificorp","advisory_group_convened":true,"assessment_period_start":"2023-01-01","assessment_period_end":"2024-12-31"}',
   '{"advisory_group_convened":true}', 'kept', 'implicit', NULL, true),

  -- Fossil fuel ban (both kept)
  (gen_random_uuid(), '2023-03-31', 'hb2021', 'hb2021.fossil_fuel_ban', 1, 'business', 'pge', 'community', 'ratepayers',
   '{"utility_id":"pge","review_period_start":"2022-01-01","review_period_end":"2022-12-31","new_gas_plants_permitted":0,"existing_gas_expansions_permitted":0}',
   '{"compliant":true}', 'kept', 'implicit', NULL, true),
  (gen_random_uuid(), '2023-03-31', 'hb2021', 'hb2021.fossil_fuel_ban', 1, 'business', 'pacificorp', 'community', 'ratepayers',
   '{"utility_id":"pacificorp","review_period_start":"2022-01-01","review_period_end":"2022-12-31","new_gas_plants_permitted":0,"existing_gas_expansions_permitted":0}',
   '{"compliant":true}', 'kept', 'implicit', NULL, true);

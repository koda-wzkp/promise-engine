// ─── BILL CONFIGS ───
// Static metadata for each extracted bill, not derivable from DashboardData.

import type { BillConfig } from "./export-training";

export const HB2021_CONFIG: BillConfig = {
  id: "OR-HB2021-2021",
  jurisdiction: "Oregon",
  level: "state",
  year_enacted: 2021,
  year_effective: 2021,
  domain_primary: "Energy",
  text_url: "https://olis.oregonlegislature.gov/liz/2021R1/Measures/Overview/HB2021",
  source_urls: [
    "https://olis.oregonlegislature.gov/liz/2021R1/Measures/Overview/HB2021",
    "https://www.oregon.gov/puc/utilities/Pages/Energy-Planning.aspx",
    "https://www.oregon.gov/deq/ghgp/Pages/default.aspx",
  ],
};

export const CAA_CONFIG: BillConfig = {
  id: "US-CAA-1990",
  jurisdiction: "United States",
  level: "federal",
  year_enacted: 1990,
  year_effective: 1990,
  domain_primary: "Environment",
  text_url: "https://www.congress.gov/bill/101st-congress/senate-bill/1630",
  source_urls: [
    "https://www.congress.gov/bill/101st-congress/senate-bill/1630",
    "https://www.epa.gov/clean-air-act-overview",
    "https://ampd.epa.gov/ampd/",
    "https://www.epa.gov/green-book",
  ],
};

export const DF_CONFIG: BillConfig = {
  id: "US-DODD-FRANK-2010",
  jurisdiction: "United States",
  level: "federal",
  year_enacted: 2010,
  year_effective: 2010,
  domain_primary: "Financial Regulation",
  text_url: "https://www.congress.gov/bill/111th-congress/house-bill/4173",
  source_urls: [
    "https://www.congress.gov/bill/111th-congress/house-bill/4173",
    "https://www.consumerfinance.gov/",
    "https://www.sec.gov/whistleblower",
    "https://www.federalreserve.gov/supervisionreg/stress-tests-capital-planning.htm",
  ],
};

export const NCLB_CONFIG: BillConfig = {
  id: "US-NCLB-ESSA-2001",
  jurisdiction: "United States",
  level: "federal",
  year_enacted: 2001,
  year_effective: 2002,
  domain_primary: "Education",
  text_url: "https://www.congress.gov/bill/107th-congress/house-bill/1",
  source_urls: [
    "https://www.congress.gov/bill/107th-congress/house-bill/1",
    "https://www.congress.gov/bill/114th-congress/senate-bill/1177",
    "https://nces.ed.gov/nationsreportcard/",
    "https://nces.ed.gov/",
  ],
};

export const ACA_CONFIG: BillConfig = {
  id: "US-ACA-2010",
  jurisdiction: "United States",
  level: "federal",
  year_enacted: 2010,
  year_effective: 2010,
  domain_primary: "Health",
  text_url: "https://www.congress.gov/bill/111th-congress/house-bill/3590",
  source_urls: [
    "https://www.congress.gov/bill/111th-congress/house-bill/3590",
    "https://www.cms.gov/marketplace",
    "https://www.kff.org/health-reform/",
    "https://www.scotusblog.com/case-files/cases/national-federation-of-independent-business-v-sebelius/",
  ],
};

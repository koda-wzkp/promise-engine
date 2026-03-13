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

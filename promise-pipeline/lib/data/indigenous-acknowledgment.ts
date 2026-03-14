export interface AcknowledgedNation {
  /** Display name — use the tribe's preferred name */
  name: string;
  /** The tribe's own name for themselves, if different and documented */
  endonym?: string;
  /** URL to the tribe's official website */
  url: string;
  /** Which of Conor's locations this tribe is associated with */
  locations: string[];
  /** Brief context (not displayed in footer, used in standalone variant) */
  note?: string;
}

export const locations = [
  "Portland, OR",
  "Madison County, NY",
  "Nevada City, CA",
  "Nashua, NH",
  "Saint Paul, MN",
  "Brookings, SD",
] as const;

export type Location = (typeof locations)[number];

export const acknowledgedNations: AcknowledgedNation[] = [
  // ─── PORTLAND, OR ───
  {
    name: "Multnomah",
    url: "https://www.grandronde.org/",
    locations: ["Portland, OR"],
    note: "Chinookan people of the Portland basin. Descendants are citizens of the Confederated Tribes of Grand Ronde.",
  },
  {
    name: "Clackamas",
    url: "https://www.grandronde.org/",
    locations: ["Portland, OR"],
    note: "Chinookan people of the Clackamas River area. Descendants are citizens of the Confederated Tribes of Grand Ronde.",
  },
  {
    name: "Kathlamet",
    url: "https://www.grandronde.org/",
    locations: ["Portland, OR"],
    note: "Chinookan people of the lower Columbia. Descendants are citizens of the Confederated Tribes of Grand Ronde.",
  },
  {
    name: "Bands of Chinook",
    url: "https://www.chinooknation.org/",
    locations: ["Portland, OR"],
    note: "The Chinook Indian Nation is a confederation of Lower Chinook tribes. They have been fighting for federal recognition since 2001.",
  },
  {
    name: "Tualatin Kalapuya",
    url: "https://www.grandronde.org/",
    locations: ["Portland, OR"],
    note: "Kalapuyan people of the Tualatin Valley, also known as the Atfalati. Descendants are citizens of the Confederated Tribes of Grand Ronde.",
  },
  {
    name: "Molalla",
    url: "https://www.grandronde.org/",
    locations: ["Portland, OR"],
    note: "People of the northeast Willamette Valley and Cascade Range. Descendants are citizens of the Confederated Tribes of Grand Ronde, Siletz, and Warm Springs.",
  },
  {
    name: "Confederated Tribes of Siletz Indians",
    url: "https://www.ctsi.nsn.us/",
    locations: ["Portland, OR"],
    note: "A confederation of over 27 tribes and bands originally from the Oregon coast, Willamette Valley, and southern Oregon. The Siletz Reservation was established in 1855, diminished, restored by Congress in 1977, and now encompasses roughly 3,600 acres on the central Oregon coast.",
  },
  {
    name: "Wasco",
    url: "https://warmsprings-nsn.gov/",
    locations: ["Portland, OR"],
    note: "Chinookan people of the Columbia River. Today part of the Confederated Tribes of Warm Springs.",
  },
  {
    name: "Cowlitz",
    url: "https://www.cowlitz.org/",
    locations: ["Portland, OR"],
    note: "Coast Salish and Sahaptan people of southwestern Washington. Federally recognized tribe headquartered in Longview, WA.",
  },

  // ─── MADISON COUNTY, NY ───
  {
    name: "Oneida",
    endonym: "Onyota'a:ká",
    url: "https://www.oneidaindiannation.com/",
    locations: ["Madison County, NY"],
    note: "People of the Standing Stone. One of the Five Nations of the Haudenosaunee (Iroquois) Confederacy. The Oneida Indian Nation maintains sovereignty over roughly 18,000 acres in Madison and Oneida Counties. They were the first Iroquois nation to ally with the American Revolution.",
  },

  // ─── NEVADA CITY, CA ───
  {
    name: "Nisenan",
    url: "https://www.nisenan.org/",
    locations: ["Nevada City, CA"],
    note: "Indigenous people of the Sierra Nevada foothills. The Nevada City Rancheria was federally recognized in 1913 and illegally terminated in 1964. The Nisenan are NOT 'Maidu' or 'Southern Maidu' — they are a separate tribe with their own language, territory, and cultural identity. They are actively seeking restoration of federal recognition.",
  },

  // ─── NASHUA, NH ───
  {
    name: "Pennacook",
    url: "https://www.cowasuck.org/",
    locations: ["Nashua, NH"],
    note: "Algonquian-speaking people of the Merrimack River Valley. The Nashaway (Nashua) band occupied lands along the Nashua and Merrimack rivers. 'Nashaway' means 'river with a pebbled bottom.' The Pennacook never ceded their land by treaty. Today represented by the Cowasuck Band of the Pennacook-Abenaki People.",
  },
  {
    name: "Abenaki",
    endonym: "Alnôbak",
    url: "https://indigenousnh.com/",
    locations: ["Nashua, NH"],
    note: "People of the Dawn Land (Wôbanakiak). Western Abenaki peoples have inhabited N'dakinna (homeland) — what is now New Hampshire — for over 12,000 years. This land was never ceded. New Hampshire has no federally recognized tribes. The Indigenous NH Collaborative Collective works to preserve Abenaki and Pennacook heritage.",
  },

  // ─── SAINT PAUL, MN ───
  {
    name: "Mdewakanton Dakota",
    endonym: "Bdewakantunwan",
    url: "https://shakopeedakota.org/",
    locations: ["Saint Paul, MN"],
    note: "The Dakota village of Kaposia was located where downtown Saint Paul now stands. The Mdewakanton are one of the four eastern Dakota bands. Mni Sota Makoce — 'the land where the waters reflect the skies' — is the Dakota homeland. The Dakota were exiled from Minnesota after the U.S.–Dakota War of 1862.",
  },
  {
    name: "Wahpeton Dakota",
    endonym: "Waȟpéthuŋwaŋ",
    url: "https://www.swo-nsn.gov/",
    locations: ["Saint Paul, MN"],
    note: "One of the four bands of the eastern Dakota (Santee). 'Wahpeton' means 'Dwellers Among the Leaves.' Today represented by the Sisseton-Wahpeton Oyate.",
  },
  {
    name: "Anishinaabe (Ojibwe)",
    endonym: "Anishinaabeg",
    url: "https://millelacsband.com/",
    locations: ["Saint Paul, MN"],
    note: "The Ojibwe homelands extend northward from the Twin Cities. The Ojibwe and Dakota both used corridors through the Saint Paul area. The Mille Lacs Band of Ojibwe is one of the six bands of the Minnesota Chippewa Tribe.",
  },

  // ─── BROOKINGS, SD ───
  {
    name: "Očhéthi Šakówiŋ",
    url: "https://www.ocetisakowincamp.org/",
    locations: ["Brookings, SD"],
    note: "The Seven Council Fires — the proper collective name for the people commonly called 'Sioux.' The alliance is based on kinship, location, and dialects: Santee-Dakota, Yankton-Dakota, and Teton-Lakota.",
  },
  {
    name: "Yankton Dakota",
    endonym: "Iháŋktȟuŋwaŋ",
    url: "https://www.yanktonsiouxtribe.net/",
    locations: ["Brookings, SD"],
    note: "The Yankton actively contested the Brookings area. In 1858, Yankton and Yanktonai drove settlers from what became Brookings County. The Yankton Sioux Tribe is headquartered on the Yankton Reservation in southeastern South Dakota.",
  },
  {
    name: "Yanktonai Dakota",
    endonym: "Iháŋktȟuŋwaŋna",
    url: "https://www.standingrock.org/",
    locations: ["Brookings, SD"],
    note: "'Little Village at the End.' The Yanktonai are part of the Standing Rock Sioux Tribe, among other tribal nations.",
  },
  {
    name: "Lakota",
    endonym: "Thítȟuŋwaŋ",
    url: "https://www.oglalalakotanation.info/",
    locations: ["Brookings, SD"],
    note: "The Teton Lakota are the largest and westernmost group of the Očhéthi Šakówiŋ. The Oglala Lakota Nation is the largest tribe in South Dakota.",
  },
  {
    name: "Sisseton Dakota",
    endonym: "Sisítȟuŋwaŋ",
    url: "https://www.swo-nsn.gov/",
    locations: ["Brookings, SD"],
    note: "The Sisseton-Wahpeton Oyate's Lake Traverse Reservation is in northeastern South Dakota, near the Brookings area.",
  },
];

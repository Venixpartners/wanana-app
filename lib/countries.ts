// ISO 3166 alpha 2 codes. Nigeria and the main diaspora markets are listed first.
const PRIORITY = ["NG", "GB", "US", "CA", "IE", "GH", "ZA", "KE", "AE", "DE", "FR", "NL", "IT", "ES", "AU"];

const ALL =
  "AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW".split(" ");

const names = new Intl.DisplayNames(["en"], { type: "region" });

export type Country = { code: string; name: string };

// Plain names where the built in list uses awkward forms.
const OVERRIDES: Record<string, string> = { CG: "Republic of the Congo", CD: "DR Congo", HK: "Hong Kong", PS: "Palestine", MM: "Myanmar" };

const nameOf = (code: string) => OVERRIDES[code] ?? names.of(code) ?? code;
const toCountry = (code: string): Country => ({ code, name: nameOf(code) });

export const priorityCountries: Country[] = PRIORITY.map(toCountry);
export const otherCountries: Country[] = ALL.filter((c) => !PRIORITY.includes(c))
  .map(toCountry)
  .sort((a, b) => a.name.localeCompare(b.name));

export const isCountryCode = (code: string) => ALL.includes(code);
export const countryName = nameOf;

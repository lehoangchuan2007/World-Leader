/**
 * ISO 3166-1 alpha-2 mapping for country flags
 * Used to fetch national flags from flagcdn and generate Unicode emojis
 */

// Mapping by ISO numeric string ID
export const COUNTRY_ISO_MAP: Record<string, string> = {
  // Asia
  '704': 'vn', // Vietnam
  'vn-hoangsa': 'vn', // Hoàng Sa
  'vn-truongsa': 'vn', // Trường Sa
  '156': 'cn', // China
  '392': 'jp', // Japan
  '410': 'kr', // South Korea
  '408': 'kp', // North Korea
  '418': 'la', // Laos
  '116': 'kh', // Cambodia
  '764': 'th', // Thailand
  '104': 'mm', // Myanmar
  '458': 'my', // Malaysia
  '702': 'sg', // Singapore
  '360': 'id', // Indonesia
  '608': 'ph', // Philippines
  '096': 'bn', // Brunei
  '626': 'tl', // East Timor
  '356': 'in', // India
  '586': 'pk', // Pakistan
  '050': 'bd', // Bangladesh
  '144': 'lk', // Sri Lanka
  '524': 'np', // Nepal
  '064': 'bt', // Bhutan
  '496': 'mn', // Mongolia
  '398': 'kz', // Kazakhstan
  '860': 'uz', // Uzbekistan
  '795': 'tm', // Turkmenistan
  '417': 'kg', // Kyrgyzstan
  '762': 'tj', // Tajikistan
  '004': 'af', // Afghanistan
  '364': 'ir', // Iran
  '368': 'iq', // Iraq
  '792': 'tr', // Turkey
  '760': 'sy', // Syria
  '422': 'lb', // Lebanon
  '400': 'jo', // Jordan
  '376': 'il', // Israel
  '275': 'ps', // Palestine
  '682': 'sa', // Saudi Arabia
  '887': 'ye', // Yemen
  '512': 'om', // Oman
  '784': 'ae', // United Arab Emirates
  '634': 'qa', // Qatar
  '414': 'kw', // Kuwait
  '048': 'bh', // Bahrain

  // Europe
  '643': 'ru', // Russia
  '250': 'fr', // France
  '276': 'de', // Germany
  '826': 'gb', // United Kingdom
  '380': 'it', // Italy
  '724': 'es', // Spain
  '620': 'pt', // Portugal
  '616': 'pl', // Poland
  '804': 'ua', // Ukraine
  '112': 'by', // Belarus
  '528': 'nl', // Netherlands
  '056': 'be', // Belgium
  '756': 'ch', // Switzerland
  '040': 'at', // Austria
  '752': 'se', // Sweden
  '578': 'no', // Norway
  '246': 'fi', // Finland
  '208': 'dk', // Denmark
  '300': 'gr', // Greece
  '203': 'cz', // Czechia
  '703': 'sk', // Slovakia
  '348': 'hu', // Hungary
  '642': 'ro', // Romania
  '100': 'bg', // Bulgaria
  '688': 'rs', // Serbia
  '191': 'hr', // Croatia
  '372': 'ie', // Ireland
  '352': 'is', // Iceland
  '233': 'ee', // Estonia
  '428': 'lv', // Latvia
  '440': 'lt', // Lithuania
  '008': 'al', // Albania
  '807': 'mk', // North Macedonia
  '705': 'si', // Slovenia
  '070': 'ba', // Bosnia and Herzegovina
  '499': 'me', // Montenegro
  '498': 'md', // Moldova
  '196': 'cy', // Cyprus

  // Americas
  '840': 'us', // United States of America
  '124': 'ca', // Canada
  '484': 'mx', // Mexico
  '076': 'br', // Brazil
  '032': 'ar', // Argentina
  '152': 'cl', // Chile
  '170': 'co', // Colombia
  '604': 'pe', // Peru
  '862': 've', // Venezuela
  '218': 'ec', // Ecuador
  '068': 'bo', // Bolivia
  '600': 'py', // Paraguay
  '858': 'uy', // Uruguay
  '192': 'cu', // Cuba
  '591': 'pa', // Panama
  '188': 'cr', // Costa Rica
  '558': 'ni', // Nicaragua
  '340': 'hn', // Honduras
  '320': 'gt', // Guatemala
  '222': 'sv', // El Salvador
  '084': 'bz', // Belize
  '332': 'ht', // Haiti
  '214': 'do', // Dominican Republic
  '388': 'jm', // Jamaica

  // Africa
  '818': 'eg', // Egypt
  '710': 'za', // South Africa
  '566': 'ng', // Nigeria
  '231': 'et', // Ethiopia
  '404': 'ke', // Kenya
  '012': 'dz', // Algeria
  '504': 'ma', // Morocco
  '729': 'sd', // Sudan
  '728': 'ss', // South Sudan
  '434': 'ly', // Libya
  '788': 'tn', // Tunisia
  '288': 'gh', // Ghana
  '024': 'ao', // Angola
  '508': 'mz', // Mozambique
  '450': 'mg', // Madagascar
  '834': 'tz', // Tanzania
  '800': 'ug', // Uganda
  '180': 'cd', // DR Congo
  '178': 'cg', // Congo
  '120': 'cm', // Cameroon
  '384': 'ci', // Ivory Coast
  '686': 'sn', // Senegal
  '716': 'zw', // Zimbabwe
  '894': 'zm', // Zambia
  '516': 'na', // Namibia
  '072': 'bw', // Botswana
  '466': 'ml', // Mali
  '562': 'ne', // Niger
  '148': 'td', // Chad
  '706': 'so', // Somalia

  // Oceania
  '036': 'au', // Australia
  '554': 'nz', // New Zealand
  '598': 'pg', // Papua New Guinea
  '242': 'fj', // Fiji
  '304': 'gl', // Greenland
};

// Fallback mapping by country name
export const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  vietnam: 'vn',
  'viet nam': 'vn',
  'quần đảo hoàng sa': 'vn',
  'quần đảo trường sa': 'vn',
  'united states of america': 'us',
  'united states': 'us',
  russia: 'ru',
  china: 'cn',
  france: 'fr',
  germany: 'de',
  'united kingdom': 'gb',
  japan: 'jp',
  india: 'in',
  brazil: 'br',
  australia: 'au',
  canada: 'ca',
  laos: 'la',
  cambodia: 'kh',
  thailand: 'th',
  myanmar: 'mm',
  malaysia: 'my',
  singapore: 'sg',
  indonesia: 'id',
  philippines: 'ph',
  'south korea': 'kr',
  'north korea': 'kp',
  italy: 'it',
  spain: 'es',
  mexico: 'mx',
  argentina: 'ar',
  egypt: 'eg',
  'south africa': 'za',
};

/**
 * Returns 2-letter ISO country code (lowercase)
 */
export function getCountryCode(id: string | number, name?: string): string {
  const idStr = String(id).padStart(3, '0');
  if (COUNTRY_ISO_MAP[String(id)]) {
    return COUNTRY_ISO_MAP[String(id)];
  }
  if (COUNTRY_ISO_MAP[idStr]) {
    return COUNTRY_ISO_MAP[idStr];
  }
  if (name) {
    const key = name.toLowerCase().trim();
    if (COUNTRY_NAME_TO_CODE[key]) {
      return COUNTRY_NAME_TO_CODE[key];
    }
  }
  return 'un'; // United Nations / Generic flag fallback
}

/**
 * Convert ISO code to Unicode Flag Emoji
 */
export function getFlagEmoji(code: string): string {
  if (!code || code === 'un' || code.length !== 2) return '🌐';
  const codeUpper = code.toUpperCase();
  return String.fromCodePoint(
    codeUpper.charCodeAt(0) + 127397,
    codeUpper.charCodeAt(1) + 127397
  );
}

/**
 * URL to high resolution SVG flag
 */
export function getFlagUrl(code: string): string {
  if (!code || code === 'un') {
    return 'https://flagcdn.com/un.svg';
  }
  return `https://flagcdn.com/${code.toLowerCase()}.svg`;
}

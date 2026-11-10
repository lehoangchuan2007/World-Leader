/**
 * WORLD LEADER - Giai đoạn 3: Dữ liệu dân số thế giới (Dân số hiện đại)
 * Nguồn dữ liệu: Thống kê Liên Hợp Quốc (UN Population Division) & Ngân hàng Thế giới (World Bank 2024–2026).
 * Quy định G3: Dữ liệu dân số hiện đại, không có tăng trưởng tự nhiên, chỉ giảm do di cư khi thuế > 3 USD/người/tháng.
 */

export const MODERN_POPULATION_DATA: Record<string, number> = {
  // Châu Á
  '704': 98858000,       // Việt Nam
  Vietnam: 98858000,
  '156': 1411750000,     // Trung Quốc
  China: 1411750000,
  '356': 1428627000,     // Ấn Độ
  India: 1428627000,
  '360': 277534000,      // Indonesia
  Indonesia: 277534000,
  '586': 240485000,      // Pakistan
  Pakistan: 240485000,
  '050': 172954000,      // Bangladesh
  Bangladesh: 172954000,
  '392': 124516000,      // Nhật Bản
  Japan: 124516000,
  '608': 117337000,      // Philippines
  Philippines: 117337000,
  '764': 71801000,       // Thái Lan
  Thailand: 71801000,
  '410': 51784000,       // Hàn Quốc
  'South Korea': 51784000,
  '408': 26069000,       // Triều Tiên
  'North Korea': 26069000,
  '458': 34308000,       // Malaysia
  Malaysia: 34308000,
  '702': 5917000,        // Singapore
  Singapore: 5917000,
  '116': 16944000,       // Campuchia
  Cambodia: 16944000,
  '418': 7633000,        // Lào
  Laos: 7633000,
  '104': 54578000,       // Myanmar
  Myanmar: 54578000,
  '398': 20014000,       // Kazakhstan
  Kazakhstan: 20014000,
  '860': 36362000,       // Uzbekistan
  Uzbekistan: 36362000,
  '682': 36947000,       // Ả Rập Xê Út
  'Saudi Arabia': 36947000,
  '364': 89172000,       // Iran
  Iran: 89172000,
  '368': 45504000,       // Iraq
  Iraq: 45504000,
  '792': 85816000,       // Thổ Nhĩ Kỳ
  Turkey: 85816000,
  '376': 9756000,        // Israel
  Israel: 9756000,
  '784': 10170000,       // UAE
  'United Arab Emirates': 10170000,

  // Châu Âu
  '643': 144236000,      // Nga
  Russia: 144236000,
  '276': 84482000,       // Đức
  Germany: 84482000,
  '826': 67736000,       // Vương quốc Anh
  'United Kingdom': 67736000,
  '250': 68070000,       // Pháp
  France: 68070000,
  '380': 58870000,       // Ý
  Italy: 58870000,
  '724': 48085000,       // Tây Ban Nha
  Spain: 48085000,
  '616': 37749000,       // Ba Lan
  Poland: 37749000,
  '804': 38000000,       // Ukraine
  Ukraine: 38000000,
  '528': 17879000,       // Hà Lan
  Netherlands: 17879000,
  '056': 11686000,       // Bỉ
  Belgium: 11686000,
  '756': 8849000,        // Thụy Sĩ
  Switzerland: 8849000,
  '752': 10549000,       // Thụy Điển
  Sweden: 10549000,
  '578': 5474000,        // Na Uy
  Norway: 5474000,
  '208': 5939000,        // Đan Mạch
  Denmark: 5939000,
  '246': 5565000,        // Phần Lan
  Finland: 5565000,
  '372': 5127000,        // Ireland
  Ireland: 5127000,
  '620': 10467000,       // Bồ Đào Nha
  Portugal: 10467000,
  '300': 10394000,       // Hy Lạp
  Greece: 10394000,
  '040': 9104000,        // Áo
  Austria: 9104000,
  '203': 10827000,       // Séc
  Czechia: 10827000,
  'Czech Republic': 10827000,
  '642': 19051000,       // Romania
  Romania: 19051000,
  '348': 9597000,        // Hungary
  Hungary: 9597000,

  // Châu Mỹ
  '840': 339996000,      // Hoa Kỳ
  'United States of America': 339996000,
  '076': 216422000,      // Brazil
  Brazil: 216422000,
  '484': 128455000,      // Mexico
  Mexico: 128455000,
  '170': 52085000,       // Colombia
  Colombia: 52085000,
  '032': 46044000,       // Argentina
  Argentina: 46044000,
  '124': 40097000,       // Canada
  Canada: 40097000,
  '604': 34352000,       // Peru
  Peru: 34352000,
  '862': 28838000,       // Venezuela
  Venezuela: 28838000,
  '152': 19603000,       // Chile
  Chile: 19603000,
  '218': 18197000,       // Ecuador
  Ecuador: 18197000,
  '192': 11212000,       // Cuba
  Cuba: 11212000,

  // Châu Phi & Đại Dương
  '566': 223804000,      // Nigeria
  Nigeria: 223804000,
  '818': 112716000,      // Ai Cập
  Egypt: 112716000,
  '710': 60414000,       // Nam Phi
  'South Africa': 60414000,
  '231': 126527000,      // Ethiopia
  Ethiopia: 126527000,
  '404': 55100000,       // Kenya
  Kenya: 55100000,
  '516': 2604000,        // Namibia
  Namibia: 2604000,
  '562': 27202000,       // Niger
  Niger: 27202000,
  '036': 26638000,       // Úc
  Australia: 26638000,
  '554': 5228000,        // New Zealand
  'New Zealand': 5228000,
};

/**
 * Lấy dân số hiện đại của một quốc gia theo ID hoặc tên
 */
export function getModernPopulation(countryId: string, countryName?: string): number {
  if (countryId && MODERN_POPULATION_DATA[countryId]) {
    return MODERN_POPULATION_DATA[countryId];
  }
  if (countryName && MODERN_POPULATION_DATA[countryName]) {
    return MODERN_POPULATION_DATA[countryName];
  }

  // Dự phòng hợp lý cho các quốc gia chưa có trong danh mục riêng: 15 triệu dân
  return 15000000;
}

/**
 * WORLD LEADER - Giai đoạn 2: Dữ liệu thể chế chính trị thế giới (Mốc lịch sử 1925)
 * Tuân thủ đúng 5 loại thể chế: Dân chủ, Cộng hòa, Quân chủ, Độc tài, Cộng sản.
 * Có căn cứ lịch sử và ghi nhận rõ ràng tình trạng xác minh.
 */

import { PoliticalRegime } from '../types/politics';

export interface RegimeMetadata {
  regime: PoliticalRegime;
  historicalBasis: string;
  isVerified: boolean;
}

// Bảng dữ liệu thể chế năm 1925 cho các quốc gia trên thế giới
export const HISTORICAL_REGIMES_1925: Record<string, RegimeMetadata> = {
  // Châu Á
  '704': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Triều đình nhà Nguyễn (Vua Khải Định / Bảo Đại, chính quyền quân chủ dưới chế độ bảo hộ của Pháp)',
    isVerified: true,
  },
  Vietnam: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Triều đình nhà Nguyễn (Vua Khải Định / Bảo Đại, chính quyền quân chủ dưới chế độ bảo hộ của Pháp)',
    isVerified: true,
  },
  '156': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Trung Hoa Dân Quốc (Chính phủ Bắc Dương thời kỳ Dân Quốc)',
    isVerified: true,
  },
  China: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Trung Hoa Dân Quốc (Chính phủ Bắc Dương thời kỳ Dân Quốc)',
    isVerified: true,
  },
  '392': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Đế quốc Nhật Bản (Thời kỳ Đại Chính - Taisho, Thiên hoàng Yoshihito)',
    isVerified: true,
  },
  Japan: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Đế quốc Nhật Bản (Thời kỳ Đại Chính - Taisho, Thiên hoàng Yoshihito)',
    isVerified: true,
  },
  '496': {
    regime: 'Cộng sản',
    historicalBasis: 'Năm 1925: Cộng hòa Nhân dân Mông Cổ (Thành lập tháng 11/1924, nhà nước cộng sản thứ hai sau Liên Xô)',
    isVerified: true,
  },
  Mongolia: {
    regime: 'Cộng sản',
    historicalBasis: 'Năm 1925: Cộng hòa Nhân dân Mông Cổ (Thành lập tháng 11/1924, nhà nước cộng sản thứ hai sau Liên Xô)',
    isVerified: true,
  },
  '764': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Xiêm La (Vương triều Chakri, quân chủ chuyên chế dưới thời Vua Rama VI/VII)',
    isVerified: true,
  },
  Thailand: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Xiêm La (Vương triều Chakri, quân chủ chuyên chế dưới thời Vua Rama VI/VII)',
    isVerified: true,
  },
  '004': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Tiểu vương quốc / Vương quốc Afghanistan (Vua Amanullah Khan)',
    isVerified: true,
  },
  Afghanistan: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Tiểu vương quốc / Vương quốc Afghanistan (Vua Amanullah Khan)',
    isVerified: true,
  },
  '364': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Đế chế Ba Tư / Vương triều Pahlavi (Reza Shah Pahlavi lên ngôi vua cuối năm 1925)',
    isVerified: true,
  },
  Iran: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Đế chế Ba Tư / Vương triều Pahlavi (Reza Shah Pahlavi lên ngôi vua cuối năm 1925)',
    isVerified: true,
  },
  '368': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Iraq dưới sự ủy trị của Anh (Vua Faisal I)',
    isVerified: true,
  },
  Iraq: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Iraq dưới sự ủy trị của Anh (Vua Faisal I)',
    isVerified: true,
  },
  '792': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Thổ Nhĩ Kỳ (Mustafa Kemal Atatürk lãnh đạo cải cách cộng hòa)',
    isVerified: true,
  },
  Turkey: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Thổ Nhĩ Kỳ (Mustafa Kemal Atatürk lãnh đạo cải cách cộng hòa)',
    isVerified: true,
  },
  '682': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Nejd & Hejaz (Ibn Saud thống nhất các vương triều bán đảo Ả Rập)',
    isVerified: true,
  },
  'Saudi Arabia': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Nejd & Hejaz (Ibn Saud thống nhất các vương triều bán đảo Ả Rập)',
    isVerified: true,
  },
  '887': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Mutawakkilite Yemen (Imam Yahya Muhammad Hamid ed-Din)',
    isVerified: true,
  },
  Yemen: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Mutawakkilite Yemen (Imam Yahya Muhammad Hamid ed-Din)',
    isVerified: true,
  },
  '512': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Hồi giáo Muscat và Oman',
    isVerified: true,
  },
  Oman: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Hồi giáo Muscat và Oman',
    isVerified: true,
  },
  '524': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Nepal (Vương triều Shah và các thủ tướng Rana)',
    isVerified: true,
  },
  Nepal: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Nepal (Vương triều Shah và các thủ tướng Rana)',
    isVerified: true,
  },
  '064': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Bhutan (Vương triều Wangchuck)',
    isVerified: true,
  },
  Bhutan: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Bhutan (Vương triều Wangchuck)',
    isVerified: true,
  },
  '356': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Thuộc địa Ấn Độ thuộc Anh (British Raj, dưới quyền quân vương Vương quốc Anh)',
    isVerified: true,
  },
  India: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Thuộc địa Ấn Độ thuộc Anh (British Raj, dưới quyền quân vương Vương quốc Anh)',
    isVerified: true,
  },

  // Châu Âu
  '643': {
    regime: 'Cộng sản',
    historicalBasis: 'Năm 1925: Liên bang Cộng hòa Xã hội Chủ nghĩa Xô viết (Liên Xô / USSR)',
    isVerified: true,
  },
  Russia: {
    regime: 'Cộng sản',
    historicalBasis: 'Năm 1925: Liên bang Cộng hòa Xã hội Chủ nghĩa Xô viết (Liên Xô / USSR)',
    isVerified: true,
  },
  '826': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Liên hiệp Anh và Bắc Ireland (Vua George V)',
    isVerified: true,
  },
  'United Kingdom': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Liên hiệp Anh và Bắc Ireland (Vua George V)',
    isVerified: true,
  },
  '250': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ tam Cộng hòa Pháp (Troisième République)',
    isVerified: true,
  },
  France: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ tam Cộng hòa Pháp (Troisième République)',
    isVerified: true,
  },
  '276': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Weimar (Đức thời kỳ cộng hòa dân chủ lập hiến)',
    isVerified: true,
  },
  Germany: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Weimar (Đức thời kỳ cộng hòa dân chủ lập hiến)',
    isVerified: true,
  },
  '380': {
    regime: 'Độc tài',
    historicalBasis: 'Năm 1925: Vương quốc Ý dưới chế độ độc tài phát xít của Benito Mussolini (Ban hành các đạo luật phát xít toàn trị 1925)',
    isVerified: true,
  },
  Italy: {
    regime: 'Độc tài',
    historicalBasis: 'Năm 1925: Vương quốc Ý dưới chế độ độc tài phát xít của Benito Mussolini (Ban hành các đạo luật phát xít toàn trị 1925)',
    isVerified: true,
  },
  '724': {
    regime: 'Độc tài',
    historicalBasis: 'Năm 1925: Tây Ban Nha dưới chế độ độc tài quân sự Miguel Primo de Rivera (1923-1930)',
    isVerified: true,
  },
  Spain: {
    regime: 'Độc tài',
    historicalBasis: 'Năm 1925: Tây Ban Nha dưới chế độ độc tài quân sự Miguel Primo de Rivera (1923-1930)',
    isVerified: true,
  },
  '620': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhất Cộng hòa Bồ Đào Nha (Trước cuộc đảo chính quân sự 1926)',
    isVerified: true,
  },
  Portugal: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhất Cộng hòa Bồ Đào Nha (Trước cuộc đảo chính quân sự 1926)',
    isVerified: true,
  },
  '616': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhị Cộng hòa Ba Lan (Trước cuộc đảo chính tháng Năm 1926)',
    isVerified: true,
  },
  Poland: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhị Cộng hòa Ba Lan (Trước cuộc đảo chính tháng Năm 1926)',
    isVerified: true,
  },
  '756': {
    regime: 'Dân chủ',
    historicalBasis: 'Năm 1925: Liên bang Thụy Sĩ (Chế độ dân chủ trực tiếp lâu đời)',
    isVerified: true,
  },
  Switzerland: {
    regime: 'Dân chủ',
    historicalBasis: 'Năm 1925: Liên bang Thụy Sĩ (Chế độ dân chủ trực tiếp lâu đời)',
    isVerified: true,
  },
  '752': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Thụy Điển (Vua Gustaf V)',
    isVerified: true,
  },
  Sweden: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Thụy Điển (Vua Gustaf V)',
    isVerified: true,
  },
  '578': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Na Uy (Vua Haakon VII)',
    isVerified: true,
  },
  Norway: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Na Uy (Vua Haakon VII)',
    isVerified: true,
  },
  '208': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Đan Mạch (Vua Christian X)',
    isVerified: true,
  },
  Denmark: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Đan Mạch (Vua Christian X)',
    isVerified: true,
  },
  '528': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Hà Lan (Nữ hoàng Wilhelmina)',
    isVerified: true,
  },
  Netherlands: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Hà Lan (Nữ hoàng Wilhelmina)',
    isVerified: true,
  },
  '056': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Bỉ (Vua Albert I)',
    isVerified: true,
  },
  Belgium: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Bỉ (Vua Albert I)',
    isVerified: true,
  },
  '040': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhất Cộng hòa Áo (Republik Österreich)',
    isVerified: true,
  },
  Austria: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhất Cộng hòa Áo (Republik Österreich)',
    isVerified: true,
  },
  '348': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Hungary (Chế độ vương quốc không vua dưới quyền Nhiếp chính Miklós Horthy)',
    isVerified: true,
  },
  Hungary: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Hungary (Chế độ vương quốc không vua dưới quyền Nhiếp chính Miklós Horthy)',
    isVerified: true,
  },
  '203': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhất Cộng hòa Tiệp Khắc (Tổng thống Tomáš Garrigue Masaryk)',
    isVerified: true,
  },
  Czechia: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhất Cộng hòa Tiệp Khắc (Tổng thống Tomáš Garrigue Masaryk)',
    isVerified: true,
  },
  'Czech Republic': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhất Cộng hòa Tiệp Khắc (Tổng thống Tomáš Garrigue Masaryk)',
    isVerified: true,
  },
  '642': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Romania (Vua Ferdinand I)',
    isVerified: true,
  },
  Romania: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Romania (Vua Ferdinand I)',
    isVerified: true,
  },
  '100': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Bulgaria (Sa hoàng Boris III)',
    isVerified: true,
  },
  Bulgaria: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Bulgaria (Sa hoàng Boris III)',
    isVerified: true,
  },
  '688': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Serb, Croat và Slovene (Sau này là Nam Tư, Vua Alexander I)',
    isVerified: true,
  },
  Serbia: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Serb, Croat và Slovene (Vua Alexander I)',
    isVerified: true,
  },
  '300': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhị Cộng hòa Hy Lạp (Tuyên bố sau khi bãi bỏ chế độ quân chủ năm 1924)',
    isVerified: true,
  },
  Greece: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhị Cộng hòa Hy Lạp (Tuyên bố sau khi bãi bỏ chế độ quân chủ năm 1924)',
    isVerified: true,
  },
  '246': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Phần Lan (Tổng thống Lauri Kristian Relander)',
    isVerified: true,
  },
  Finland: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Phần Lan (Tổng thống Lauri Kristian Relander)',
    isVerified: true,
  },
  '372': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Nhà nước Tự do Ireland (Dominion trong Khối Thịnh vượng chung, nguyên thủ là Quân vương Anh)',
    isVerified: true,
  },
  Ireland: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Nhà nước Tự do Ireland (Dominion trong Khối Thịnh vượng chung, nguyên thủ là Quân vương Anh)',
    isVerified: true,
  },
  '008': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Albania (Thành lập đầu năm 1925, Tổng thống Ahmet Zogu)',
    isVerified: true,
  },
  Albania: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Albania (Thành lập đầu năm 1925, Tổng thống Ahmet Zogu)',
    isVerified: true,
  },

  // Châu Mỹ
  '840': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Hợp chúng quốc Hoa Kỳ (Cộng hòa lập hiến liên bang, Tổng thống Calvin Coolidge)',
    isVerified: true,
  },
  'United States of America': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Hợp chúng quốc Hoa Kỳ (Cộng hòa lập hiến liên bang, Tổng thống Calvin Coolidge)',
    isVerified: true,
  },
  '124': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Dominion Canada (Quân chủ lập hiến thuộc Khối Thịnh vượng chung Anh)',
    isVerified: true,
  },
  Canada: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Dominion Canada (Quân chủ lập hiến thuộc Khối Thịnh vượng chung Anh)',
    isVerified: true,
  },
  '484': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Hợp chúng quốc Mexico (Thời kỳ hậu Cách mạng Mexico, Tổng thống Plutarco Elías Calles)',
    isVerified: true,
  },
  Mexico: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Hợp chúng quốc Mexico (Thời kỳ hậu Cách mạng Mexico, Tổng thống Plutarco Elías Calles)',
    isVerified: true,
  },
  '076': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhất Cộng hòa Brasil (República Velha)',
    isVerified: true,
  },
  Brazil: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Đệ nhất Cộng hòa Brasil (República Velha)',
    isVerified: true,
  },
  '032': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Argentina (Tổng thống Marcelo Torcuato de Alvear)',
    isVerified: true,
  },
  Argentina: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Argentina (Tổng thống Marcelo Torcuato de Alvear)',
    isVerified: true,
  },
  '152': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Chile (Thời kỳ ban hành Hiến pháp 1925)',
    isVerified: true,
  },
  Chile: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Chile (Thời kỳ ban hành Hiến pháp 1925)',
    isVerified: true,
  },
  '170': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Colombia (Tổng thống Pedro Nel Ospina)',
    isVerified: true,
  },
  Colombia: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Colombia (Tổng thống Pedro Nel Ospina)',
    isVerified: true,
  },
  '604': {
    regime: 'Độc tài',
    historicalBasis: 'Năm 1925: Peru thời kỳ độc tài Oncenio của Augusto B. Leguía (1919-1930)',
    isVerified: true,
  },
  Peru: {
    regime: 'Độc tài',
    historicalBasis: 'Năm 1925: Peru thời kỳ độc tài Oncenio của Augusto B. Leguía (1919-1930)',
    isVerified: true,
  },
  '862': {
    regime: 'Độc tài',
    historicalBasis: 'Năm 1925: Venezuela dưới chế độ độc tài quân sự của Juan Vicente Gómez',
    isVerified: true,
  },
  Venezuela: {
    regime: 'Độc tài',
    historicalBasis: 'Năm 1925: Venezuela dưới chế độ độc tài quân sự của Juan Vicente Gómez',
    isVerified: true,
  },
  '192': {
    regime: 'Độc tài',
    historicalBasis: 'Năm 1925: Cuba dưới thời Tổng thống Gerardo Machado (Bắt đầu thiết lập cai trị độc tài năm 1925)',
    isVerified: true,
  },
  Cuba: {
    regime: 'Độc tài',
    historicalBasis: 'Năm 1925: Cuba dưới thời Tổng thống Gerardo Machado (Bắt đầu thiết lập cai trị độc tài năm 1925)',
    isVerified: true,
  },
  '068': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Bolivia (Kỷ niệm 100 năm độc lập)',
    isVerified: true,
  },
  Bolivia: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Bolivia (Kỷ niệm 100 năm độc lập)',
    isVerified: true,
  },
  '600': {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Paraguay (Tổng thống Eligio Ayala)',
    isVerified: true,
  },
  Paraguay: {
    regime: 'Cộng hòa',
    historicalBasis: 'Năm 1925: Cộng hòa Paraguay (Tổng thống Eligio Ayala)',
    isVerified: true,
  },
  '858': {
    regime: 'Dân chủ',
    historicalBasis: 'Năm 1925: Cộng hòa Uruguay (Nền dân chủ tiến bộ thời kỳ Batllismo)',
    isVerified: true,
  },
  Uruguay: {
    regime: 'Dân chủ',
    historicalBasis: 'Năm 1925: Cộng hòa Uruguay (Nền dân chủ tiến bộ thời kỳ Batllismo)',
    isVerified: true,
  },

  // Châu Phi & Châu Đại Dương
  '818': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Ai Cập (Vua Fuad I)',
    isVerified: true,
  },
  Egypt: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Vương quốc Ai Cập (Vua Fuad I)',
    isVerified: true,
  },
  '231': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Đế quốc Ethiopia (Nữ hoàng Zewditu và Nhiếp chính Tafari Makonnen / Haile Selassie)',
    isVerified: true,
  },
  Ethiopia: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Đế quốc Ethiopia (Nữ hoàng Zewditu và Nhiếp chính Tafari Makonnen / Haile Selassie)',
    isVerified: true,
  },
  '710': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Liên hiệp Nam Phi (Dominion thuộc Khối Thịnh vượng chung Anh)',
    isVerified: true,
  },
  'South Africa': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Liên hiệp Nam Phi (Dominion thuộc Khối Thịnh vượng chung Anh)',
    isVerified: true,
  },
  '036': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Thịnh vượng chung Úc (Dominion thuộc Khối Thịnh vượng chung Anh)',
    isVerified: true,
  },
  Australia: {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Thịnh vượng chung Úc (Dominion thuộc Khối Thịnh vượng chung Anh)',
    isVerified: true,
  },
  '554': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Dominion New Zealand (Dominion thuộc Khối Thịnh vượng chung Anh)',
    isVerified: true,
  },
  'New Zealand': {
    regime: 'Quân chủ',
    historicalBasis: 'Năm 1925: Dominion New Zealand (Dominion thuộc Khối Thịnh vượng chung Anh)',
    isVerified: true,
  },
};

/**
 * Lấy thể chế chính trị và thông tin xác minh của một quốc gia năm 1925
 */
export function getCountryPoliticalRegime(countryId: string, countryName: string): RegimeMetadata {
  if (countryId && HISTORICAL_REGIMES_1925[countryId]) {
    return HISTORICAL_REGIMES_1925[countryId];
  }
  if (countryName && HISTORICAL_REGIMES_1925[countryName]) {
    return HISTORICAL_REGIMES_1925[countryName];
  }

  // Trường hợp chưa có tư liệu xác thực mốc lịch sử 1925, ghi nhận rõ ràng
  return {
    regime: 'Cộng hòa', // Thể chế mặc định phân loại
    historicalBasis: 'Chưa có dữ liệu lịch sử xác minh cho năm 1925 (lưu trữ theo trạng thái phân loại mặc định)',
    isVerified: false,
  };
}

/**
 * WORLD LEADER - Giai đoạn 2: Candidate Generator
 * Tự động tạo danh sách ứng viên hư cấu cho các chức vụ trong bộ máy nhà nước.
 * Quy định nghiêm ngặt: Nhân vật phải là nhân vật hư cấu, không dùng danh tính người thật.
 * Năng lực quản lý thống nhất thang điểm 0 - 100, cố định sau khi sinh ra.
 */

import { Candidate, GovernmentPosition } from '../types/politics';

// Kho họ và tên đệm/tên hư cấu theo các vùng văn hóa
const NAME_PATTERNS: Record<
  string,
  { firstNames: string[]; middleNames: string[]; lastNames: string[] }
> = {
  vi: {
    firstNames: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Phan', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'],
    middleNames: ['Văn', 'Đình', 'Quang', 'Hữu', 'Minh', 'Thanh', 'Gia', 'Đức', 'Trọng', 'Bảo', 'Xuân', 'Khắc'],
    lastNames: ['Khánh', 'Tùng', 'Hải', 'Phong', 'Lâm', 'Sơn', 'Dũng', 'Kiên', 'Hưng', 'Thành', 'Bình', 'Triết', 'Việt', 'An'],
  },
  en: {
    firstNames: ['Arthur', 'Edward', 'Henry', 'George', 'William', 'Charles', 'Thomas', 'Richard', 'Walter', 'Julian', 'Frederick', 'Raymond', 'Harold'],
    middleNames: ['James', 'Robert', 'Alexander', 'Francis', 'David', 'Stanley', 'Phillip', 'Lawrence', 'Albert'],
    lastNames: ['Sterling', 'Harrington', 'Bradford', 'Kensington', 'Thornton', 'Blackwood', 'Montgomery', 'Wellington', 'Langley', 'Sinclair', 'Fairfax', 'Ashford'],
  },
  fr: {
    firstNames: ['Jean', 'Pierre', 'Henri', 'Louis', 'Marcel', 'Paul', 'Georges', 'François', 'André', 'Jacques', 'Émile', 'René'],
    middleNames: ['Luc', 'Michel', 'Claude', 'Bernard', 'Laurent', 'Yves', 'Philippe'],
    lastNames: ['Delaunay', 'Fontaine', 'Beaumont', 'Lefebvre', 'Mercier', 'Garnier', 'Moreau', 'Rousseau', 'Chastain', 'Vincennes', 'Duval'],
  },
  de: {
    firstNames: ['Heinrich', 'Wilhelm', 'Otto', 'Friedrich', 'Erich', 'Karl', 'Konrad', 'Ludwig', 'Werner', 'Albrecht', 'Hans'],
    middleNames: ['Ernst', 'Gustav', 'Josef', 'Theodor', 'Maximilian', 'Franz'],
    lastNames: ['Lindemann', 'Kaufmann', 'Vogel', 'Richter', 'Schubert', 'Keller', 'Bauer', 'Hartmann', 'Hoffmann', 'Eberhardt', 'Zimmermann'],
  },
  ru: {
    firstNames: ['Alexei', 'Dmitri', 'Mikhail', 'Nikolai', 'Sergei', 'Vladimir', 'Ivan', 'Pavel', 'Viktor', 'Boris', 'Andrei'],
    middleNames: ['Alexandrovich', 'Nikolaevich', 'Sergeevich', 'Ivanovich', 'Petrovich', 'Dmitrievich', 'Mikhailovich'],
    lastNames: ['Volkov', 'Sokolov', 'Morozov', 'Kuznetsov', 'Vasiliev', 'Popov', 'Novikov', 'Fedorov', 'Smirnov', 'Lebedev', 'Kozlov'],
  },
  zh: {
    firstNames: ['Trần', 'Lý', 'Vương', 'Trương', 'Lưu', 'Chu', 'Hoàng', 'Triệu', 'Tôn', 'Dương', 'Hồ'],
    middleNames: ['Văn', 'Bá', 'Chính', 'Khải', 'Thiên', 'Trọng', 'Quốc', 'Thành', 'Chấn'],
    lastNames: ['Huy', 'Vĩ', 'Hào', 'Hiên', 'Khang', 'Nguyên', 'Bân', 'Tường', 'Hạo', 'Long'],
  },
  ja: {
    firstNames: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato', 'Yoshida'],
    middleNames: [],
    lastNames: ['Kazuki', 'Daiki', 'Ren', 'Souta', 'Kaito', 'Hiroshi', 'Kenji', 'Shinji', 'Takashi', 'Makoto'],
  },
  es: {
    firstNames: ['Carlos', 'Manuel', 'Alfonso', 'Eduardo', 'Fernando', 'Rodrigo', 'Joaquin', 'Rafael', 'Emilio', 'Santiago', 'Guillermo'],
    middleNames: ['Alberto', 'Javier', 'Ignacio', 'Enrique', 'Vicente', 'Andres'],
    lastNames: ['Navarro', 'Castillo', 'Cordoba', 'Mendoza', 'Santoro', 'Valenzuela', 'Salazar', 'Montoya', 'Carvajal', 'Paredes'],
  },
  generic: {
    firstNames: ['Alex', 'Morgan', 'Taylor', 'Jordan', 'Adrian', 'Julian', 'Robin', 'Dominic', 'Gabriel', 'Vincent'],
    middleNames: ['Val', 'Dan', 'Lee', 'Ray', 'Noel'],
    lastNames: ['Vance', 'Mercer', 'Davenport', 'Sterling', 'Corbett', 'Barrett', 'Kingsley', 'Sinclair', 'Ellington'],
  },
};

/**
 * Chọn bảng tên phù hợp với quốc gia/quốc tịch
 */
function getNameSetForCountry(countryName: string, nationality: string) {
  const c = (countryName + ' ' + nationality).toLowerCase();
  if (c.includes('việt nam') || c.includes('vietnam')) return NAME_PATTERNS.vi;
  if (c.includes('anh') || c.includes('united kingdom') || c.includes('hoa kỳ') || c.includes('united states') || c.includes('úc') || c.includes('australia') || c.includes('canada') || c.includes('new zealand')) return NAME_PATTERNS.en;
  if (c.includes('pháp') || c.includes('france') || c.includes('bỉ') || c.includes('belgium')) return NAME_PATTERNS.fr;
  if (c.includes('đức') || c.includes('germany') || c.includes('áo') || c.includes('austria') || c.includes('thụy sĩ') || c.includes('switzerland')) return NAME_PATTERNS.de;
  if (c.includes('nga') || c.includes('russia') || c.includes('ukraine') || c.includes('belarus') || c.includes('ba lan') || c.includes('poland')) return NAME_PATTERNS.ru;
  if (c.includes('trung quốc') || c.includes('china') || c.includes('đài loan')) return NAME_PATTERNS.zh;
  if (c.includes('nhật') || c.includes('japan')) return NAME_PATTERNS.ja;
  if (c.includes('tây ban nha') || c.includes('spain') || c.includes('mexico') || c.includes('argentina') || c.includes('chile') || c.includes('cuba') || c.includes('colombia')) return NAME_PATTERNS.es;

  return NAME_PATTERNS.generic;
}

/**
 * Tạo một tên nhân vật hư cấu ngẫu nhiên
 */
export function generateFictionalName(countryName: string, nationality: string): string {
  const set = getNameSetForCountry(countryName, nationality);
  const firstName = set.firstNames[Math.floor(Math.random() * set.firstNames.length)];
  const lastName = set.lastNames[Math.floor(Math.random() * set.lastNames.length)];

  if (set.middleNames.length > 0 && Math.random() > 0.3) {
    const middleName = set.middleNames[Math.floor(Math.random() * set.middleNames.length)];
    return `${firstName} ${middleName} ${lastName}`;
  }
  return `${firstName} ${lastName}`;
}

/**
 * Sinh chỉ số năng lực quản lý ngẫu nhiên từ 0 đến 100
 * Phân bổ hợp lý (chủ yếu từ 40 - 92, có thiểu số rất xuất sắc hoặc thấp)
 */
export function generateManagementAbility(): number {
  // Gaussian-like distribution around mean 65, bounded strictly [0, 100]
  const u1 = Math.random();
  const u2 = Math.random();
  const randStdNormal = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
  const score = Math.round(62 + randStdNormal * 16);
  return Math.min(100, Math.max(15, score));
}

/**
 * Sinh danh sách ứng viên hư cấu cho một chức vụ cụ thể
 * @param count Số lượng ứng viên muốn tạo (mặc định 6 ứng viên)
 */
export function generateCandidateList(
  countryName: string,
  nationality: string,
  position: GovernmentPosition,
  count: number = 6
): Candidate[] {
  const candidates: Candidate[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name = generateFictionalName(countryName, nationality);
    let attempts = 0;
    while (usedNames.has(name) && attempts < 10) {
      name = generateFictionalName(countryName, nationality);
      attempts++;
    }
    usedNames.add(name);

    // Tuổi ứng viên từ 35 đến 75
    const age = Math.floor(Math.random() * 41) + 35;
    const ability = generateManagementAbility();

    candidates.push({
      id: `cand_${position}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      fullName: name,
      nationality: nationality || countryName,
      age,
      position,
      managementAbility: ability,
    });
  }

  return candidates;
}

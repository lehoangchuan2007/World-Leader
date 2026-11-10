/**
 * WORLD LEADER - Giai đoạn 2: Political System
 * Quản lý thể chế chính trị của các quốc gia.
 * Đảm bảo tính cố định tuyệt đối của thể chế: không cho phép người chơi hoặc AI thay đổi.
 * Không cung cấp bất kỳ API hoặc phương thức nào để thay đổi hoặc chuyển đổi thể chế.
 */

import { PoliticalRegime } from '../types/politics';
import { getCountryPoliticalRegime } from '../data/politicalData';

export const VALID_POLITICAL_REGIMES: readonly PoliticalRegime[] = [
  'Dân chủ',
  'Cộng hòa',
  'Quân chủ',
  'Độc tài',
  'Cộng sản',
] as const;

export const REGIME_DESCRIPTIONS: Record<
  PoliticalRegime,
  { label: string; description: string; historical1925Note: string }
> = {
  'Dân chủ': {
    label: 'Dân chủ',
    description: 'Chính thể dân chủ, quyền lực nhà nước thuộc về nhân dân thông qua các quyền dân sự.',
    historical1925Note: 'Các nền dân chủ phát triển như Thụy Sĩ, Uruguay thời kỳ 1925.',
  },
  'Cộng hòa': {
    label: 'Cộng hòa',
    description: 'Chính thể cộng hòa, nguyên thủ quốc gia do bầu cử hoặc bổ nhiệm theo hiến pháp.',
    historical1925Note: 'Tiêu biểu như Đệ tam Cộng hòa Pháp, Cộng hòa Weimar (Đức), Hoa Kỳ, Thổ Nhĩ Kỳ thời kỳ 1925.',
  },
  'Quân chủ': {
    label: 'Quân chủ',
    description: 'Chính thể có nguyên thủ quốc gia là quân vương (vua, hoàng đế, sultan).',
    historical1925Note: 'Tiêu biểu như Vương quốc Anh, Đế quốc Nhật Bản, Xiêm La (Thái Lan), Triều Nguyễn (Việt Nam 1925).',
  },
  'Độc tài': {
    label: 'Độc tài',
    description: 'Chính thể tập trung quyền lực cao độ vào một cá nhân hoặc nhóm lãnh đạo tối cao.',
    historical1925Note: 'Chế độ phát xít tại Ý (Mussolini 1925), độc tài quân sự Primo de Rivera tại Tây Ban Nha.',
  },
  'Cộng sản': {
    label: 'Cộng sản',
    description: 'Chính thể nhà nước xã hội chủ nghĩa theo học thuyết Mác - Lênin.',
    historical1925Note: 'Liên bang Xô viết (Liên Xô / USSR) và Cộng hòa Nhân dân Mông Cổ năm 1925.',
  },
};

/**
 * Kiểm tra xem một chuỗi có phải là 1 trong 5 thể chế hợp lệ không
 */
export function isValidRegime(regime: string): regime is PoliticalRegime {
  return VALID_POLITICAL_REGIMES.includes(regime as PoliticalRegime);
}

/**
 * Lấy thể chế chính trị cố định của một quốc gia
 */
export function getFixedCountryRegime(countryId: string, countryName: string): PoliticalRegime {
  const metadata = getCountryPoliticalRegime(countryId, countryName);
  return metadata.regime;
}

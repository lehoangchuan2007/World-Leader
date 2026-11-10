/**
 * WORLD LEADER - Giai đoạn 2: Hệ thống chính trị và bộ máy nhà nước
 * Type definitions strictly adhering to Phase 2 specifications.
 */

// Có đúng 5 loại thể chế chính trị, không bổ sung loại thứ sáu.
export type PoliticalRegime =
  | 'Dân chủ'
  | 'Cộng hòa'
  | 'Quân chủ'
  | 'Độc tài'
  | 'Cộng sản';

// Đúng 3 chức vụ trong bộ máy nhà nước, không tạo thêm chức vụ khác.
export type GovernmentPosition =
  | 'primeMinister'
  | 'financeMinister'
  | 'defenseMinister';

export const POSITION_LABELS: Record<GovernmentPosition, string> = {
  primeMinister: 'Thủ tướng',
  financeMinister: 'Bộ trưởng Bộ Tài chính',
  defenseMinister: 'Bộ trưởng Bộ Quốc phòng',
};

export const POSITION_DESCRIPTIONS: Record<GovernmentPosition, string> = {
  primeMinister: 'Người đứng đầu chính phủ, điều hành các hoạt động của bộ máy nhà nước.',
  financeMinister: 'Phụ trách vị trí nhân sự đứng đầu quản lý tài chính quốc gia (chức năng quản lý kinh tế sẽ được mở ở giai đoạn sau).',
  defenseMinister: 'Phụ trách vị trí nhân sự đứng đầu quốc phòng (chức năng chỉ huy quân sự sẽ được mở ở giai đoạn sau).',
};

// Personnel: Nhân sự đang đảm nhiệm chức vụ
export interface Personnel {
  id: string;
  fullName: string;
  nationality: string;
  age: number;
  position: GovernmentPosition;
  managementAbility: number; // Thang điểm thống nhất 0 - 100
}

// Candidate: Ứng viên ứng tuyển cho một chức vụ
export interface Candidate {
  id: string;
  fullName: string;
  nationality: string;
  age: number;
  position: GovernmentPosition;
  managementAbility: number; // Thang điểm thống nhất 0 - 100
}

// Government: Bộ máy nhà nước gồm 3 chức vụ
export interface Government {
  primeMinister: Personnel | null;
  financeMinister: Personnel | null;
  defenseMinister: Personnel | null;
}

// Country: Dữ liệu chính trị quốc gia
export interface CountryPoliticalData {
  countryId: string;
  countryName: string;
  politicalRegime: PoliticalRegime;
  historicalBasis?: string; // Căn cứ lịch sử mốc 1925
  isVerified: boolean; // Ghi nhận rõ ràng trạng thái xác minh dữ liệu 1925
  government: Government;
}

// Sort options for candidate list
export type CandidateSortField =
  | 'fullName'
  | 'nationality'
  | 'age'
  | 'managementAbility';

export type SortOrder = 'asc' | 'desc';

/**
 * WORLD LEADER - Giai đoạn 2: Personnel System
 * Quản lý đối tượng nhân sự, chuẩn hóa chỉ số năng lực quản lý (0 - 100),
 * đảm bảo tính bất biến của chỉ số nhân vật sau khi được tuyển dụng.
 */

import { Candidate, Personnel, GovernmentPosition } from '../types/politics';

/**
 * Tạo một nhân sự mới từ ứng viên được tuyển chọn
 */
export function createPersonnelFromCandidate(candidate: Candidate): Personnel {
  // Đảm bảo chỉ số năng lực nằm chính xác trong khoảng 0 - 100
  const clampedAbility = Math.min(100, Math.max(0, Math.round(candidate.managementAbility)));

  return {
    id: candidate.id || `pers_${candidate.position}_${Date.now()}`,
    fullName: candidate.fullName.trim(),
    nationality: candidate.nationality.trim(),
    age: candidate.age,
    position: candidate.position,
    managementAbility: clampedAbility,
  };
}

/**
 * Tạo nhân sự hư cấu ban đầu cho một chức vụ (dùng khi khởi tạo game)
 */
export function createInitialPersonnel(
  fullName: string,
  nationality: string,
  age: number,
  position: GovernmentPosition,
  managementAbility: number
): Personnel {
  return {
    id: `pers_init_${position}_${Math.random().toString(36).substring(2, 9)}`,
    fullName,
    nationality,
    age,
    position,
    managementAbility: Math.min(100, Math.max(0, Math.round(managementAbility))),
  };
}

/**
 * Kiểm tra tính hợp lệ của đối tượng nhân sự
 */
export function isValidPersonnel(personnel: Personnel | null): boolean {
  if (!personnel) return false;
  return (
    typeof personnel.fullName === 'string' &&
    personnel.fullName.length > 0 &&
    typeof personnel.nationality === 'string' &&
    typeof personnel.age === 'number' &&
    personnel.age >= 18 &&
    typeof personnel.managementAbility === 'number' &&
    personnel.managementAbility >= 0 &&
    personnel.managementAbility <= 100
  );
}
